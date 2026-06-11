import { test, expect } from '@playwright/test';

const dismissTour = async (page) => {
    const skipButton = page.getByRole('button', { name: /^Skip$/i });
    if (await skipButton.count()) {
        await skipButton.first().click();
        await expect(skipButton).toBeHidden();
    }
};

const waitForOverlays = async (page) => {
    await page.waitForTimeout(200);
    await expect(page.locator('.MuiBackdrop-root:visible')).toHaveCount(0);
    await expect(page.locator('.MuiPopover-root:visible')).toHaveCount(0);
};

test.describe('Optimizer Page', () => {
    test('loads without client errors', async ({ page }) => {
        const errors = [];
        page.on('pageerror', (err) => errors.push(err.message));
        page.on('console', (msg) => {
            if (msg.type() === 'error') {
                errors.push(msg.text());
            }
        });

        await page.goto('/optimizer');
        await dismissTour(page);
        await waitForOverlays(page);
        await expect(page.getByRole('heading', { name: /Meal Optimizer/i })).toBeVisible();

        expect(errors).toEqual([]);
    });

    test('loads sample meals into the dataset', async ({ page }) => {
        await page.goto('/optimizer');
        await dismissTour(page);
        await waitForOverlays(page);

        await page.getByRole('button', { name: /Load sample meals/i }).click();
        await expect(page.getByRole('heading', { name: /Meal dataset/i })).toContainText('400', { timeout: 15000 });
    });

    test('renders optimization results after running solver', async ({ page }) => {
        await page.route('/api/optimize-meals', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    status: 'optimal',
                    mealPlan: [
                        {
                            mealId: 'test-meal',
                            mealName: 'Test Meal',
                            servings: 2,
                            totalCalories: 1000,
                            totalProtein: 60,
                            totalCarbs: 80,
                            totalFat: 30,
                            totalSodium: 900,
                            totalCost: 20,
                        },
                    ],
                    totalNutrition: {
                        calories: 1000,
                        protein: 60,
                        carbohydrates: 80,
                        fat: 30,
                        sodium: 900,
                        cost: 20,
                    },
                }),
            });
        });

        await page.goto('/optimizer');
        await dismissTour(page);
        await waitForOverlays(page);
        await page.getByRole('button', { name: /Load sample meals/i }).click();
        await expect(page.getByRole('heading', { name: /Meal dataset/i })).toContainText('400', { timeout: 15000 });
        await page.getByRole('button', { name: /Maintain/i }).click();
        await expect(page.getByTestId('generate-plan')).toBeEnabled();
        await page.getByTestId('generate-plan').click();

        await expect(page.getByText('Plan results')).toBeVisible();
        await expect(page.getByText('Plan ready!')).toBeVisible();

        const resultsTable = page.locator('table').filter({ hasText: 'Calories' });
        await expect(resultsTable.getByRole('cell', { name: 'Test Meal' })).toBeVisible();
    });

    test('adjusts servings in the results table', async ({ page }) => {
        await page.route('/api/optimize-meals', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    status: 'optimal',
                    mealPlan: [
                        {
                            mealId: 'test-meal',
                            mealName: 'Test Meal',
                            servings: 2,
                            totalCalories: 1000,
                            totalProtein: 60,
                            totalCarbs: 80,
                            totalFat: 30,
                            totalSodium: 900,
                            totalCost: 20,
                        },
                    ],
                    totalNutrition: {
                        calories: 1000,
                        protein: 60,
                        carbohydrates: 80,
                        fat: 30,
                        sodium: 900,
                        cost: 20,
                    },
                }),
            });
        });

        await page.goto('/optimizer');
        await dismissTour(page);
        await waitForOverlays(page);
        await page.getByRole('button', { name: /Load sample meals/i }).click();
        await expect(page.getByRole('heading', { name: /Meal dataset/i })).toContainText('400', { timeout: 15000 });
        await page.getByRole('button', { name: /Maintain/i }).click();
        await expect(page.getByTestId('generate-plan')).toBeEnabled();
        await page.getByTestId('generate-plan').click();
        await expect(page.getByText('Plan results')).toBeVisible();

        const row = page.getByRole('row', { name: /Test Meal/ });
        const servingsCell = row.locator('td').nth(1);
        await expect(servingsCell).toContainText('2');
        await row.getByRole('button', { name: 'Increase servings' }).click();
        await expect(servingsCell).toContainText('3');
    });

    test('warns when constraint minimum exceeds maximum', async ({ page }) => {
        await page.goto('/optimizer');
        await dismissTour(page);
        await waitForOverlays(page);
        await page.getByRole('button', { name: /Load sample meals/i }).click();
        await expect(page.getByRole('heading', { name: /Meal dataset/i })).toContainText('400', { timeout: 15000 });

        await page.getByRole('button', { name: /Nutrition limits/i }).click();
        await page.getByTestId('calories-min').fill('3000');
        await page.getByTestId('calories-max').fill('2000');

        await expect(page.getByText('Daily calories min cannot exceed max.')).toBeVisible();
    });

    test('supports quick edit in the dataset', async ({ page }) => {
        await page.goto('/optimizer');
        await dismissTour(page);
        await waitForOverlays(page);
        await page.getByRole('button', { name: /^Add meal$/i }).first().click();
        await page.getByLabel('Meal name', { exact: true }).fill('Inline Edit Meal');
        await page.getByLabel('Calories', { exact: true }).fill('500');
        await page.getByRole('button', { name: /Add to dataset/i }).click();
        await expect(page.getByRole('heading', { name: /^Add meal$/i })).toBeHidden();
        await waitForOverlays(page);
        await page.getByRole('button', { name: /^Table$/i }).click();

        const row = page.getByRole('row', { name: /Inline Edit Meal/ });
        await row.getByRole('button', { name: /Quick edit/i }).click({ force: true });
        await row.getByTestId('inline-calories').fill('650');
        await row.getByRole('button', { name: /Save edit/i }).click();

        await expect(row).toContainText('650');
    });

    test('does not continuously reload', async ({ page }) => {
        await page.goto('/optimizer');
        await dismissTour(page);
        await waitForOverlays(page);
        await page.waitForLoadState('networkidle');

        let reloads = 0;
        page.on('framenavigated', (frame) => {
            if (frame === page.mainFrame()) {
                reloads += 1;
            }
        });

        await page.waitForTimeout(4000);
        expect(reloads).toBe(0);
    });
});
