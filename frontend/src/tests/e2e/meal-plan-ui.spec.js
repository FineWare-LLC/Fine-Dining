import { faker } from '@faker-js/faker';
import { test, expect } from '@playwright/test';

async function gqlPost(request, query, variables = {}) {
    const response = await request.post('/api/graphql', {
        headers: { 'Content-Type': 'application/json' },
        data: { query, variables },
    });
    return response.json();
}

test.describe('Meal Plan UI Flow', () => {
    let userEmail;
    let userPassword;
    let userId;

    test.beforeAll(async ({ request }) => {
        userEmail = faker.internet.email();
        userPassword = faker.internet.password();
        const mutation = `
      mutation ($input: CreateUserInput!) {
        createUser(input: $input) {
          id
        }
      }
    `;
        const variables = {
            input: {
                name: 'Playwright User',
                email: userEmail,
                password: userPassword,
                gender: 'OTHER',
                measurementSystem: 'METRIC',
            },
        };
        const { data, errors } = await gqlPost(request, mutation, variables);
        expect(errors).toBeUndefined();
        userId = data.createUser.id;
    });

    test.afterAll(async ({ request }) => {
        if (userId) {
            const mutation = 'mutation ($id: ID!) { deleteUser(id: $id) }';
            await gqlPost(request, mutation, { id: userId });
        }
    });

    test('create optimized meal plan from catalog', async ({ page }) => {
        await page.goto('/signin');
        await page.fill('input[name="email"]', userEmail);
        await page.fill('input[name="password"]', userPassword);
        await page.click('button[type="submit"]');

        await page.waitForURL('**/dashboard');
        // Reload dashboard with active meal plan ID to exercise query logic
        const testPlanId = 'test-plan';
        await page.goto(`/dashboard?mealPlanId=${testPlanId}`);
        await expect(page).toHaveURL(new RegExp(`mealPlanId=${testPlanId}`));
        await page.waitForSelector('text=Meal Catalog');

        const rows = page.locator('table tbody tr');
        const firstRow = rows.nth(0);
        const secondRow = rows.nth(1);

        const meal1 = (await firstRow.locator('td').nth(1).textContent()).trim();
        const meal2 = (await secondRow.locator('td').nth(1).textContent()).trim();

        await firstRow.locator('input[type=checkbox]').check();
        await secondRow.locator('input[type=checkbox]').check();

        await page.click('text=Generate Optimized Meal Plan');
        await page.waitForSelector('text=Optimized Meal Plan');

        await expect(page.locator(`text=${meal1}`)).toBeVisible();
        await expect(page.locator(`text=${meal2}`)).toBeVisible();
    });
});
