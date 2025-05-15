import { test, expect } from '@playwright/test';

test.describe('Simple Playwright Test', () => {
  test('basic test that should always pass', async ({ page }) => {
    // Navigate to a public website that should always be available
    await page.goto('https://example.com/');

    // Check that the page loaded
    await expect(page).toHaveURL('https://example.com/');

    // Check that the page has a heading
    const heading = await page.locator('h1');
    await expect(heading).toBeVisible();

    // Simple assertion that will always pass
    expect(true).toBe(true);
  });
});
