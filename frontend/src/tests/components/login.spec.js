/**
 * @file login.spec.ts
 * Standalone Playwright tests for the Next.js Sign In page.
 */

import { test, expect } from '@playwright/test';

/**
 * Fills in and submits the login form.
 * @param {import('@playwright/test').Page} page - The Playwright page object.
 * @param {string} username - The username to fill into the Name field.
 * @param {string} password - The password to fill into the Password field.
 */
async function fillAndSubmitLoginForm(page, username, password) {
    await page.fill('input[name="name"]', username);
    await page.fill('input[name="password"]', password);
    await page.click('text=LOG IN');
}

test.describe('Sign In Page - Comprehensive Tests', () => {

    test.beforeEach(async ({ page }) => {
        // Navigate to the sign-in page before each test
        await page.goto('http://localhost:3000/signin');
    });

    /**
     * 1. Verify page loads with correct title & placeholders
     */
    test('should load sign-in page with correct title & placeholders', async ({ page }) => {
        await expect(page).toHaveTitle(/Fine Dining/i);
        await expect(page.locator('input[name="name"]')).toHaveAttribute('placeholder', /Name/i);
        await expect(page.locator('input[name="password"]')).toHaveAttribute('placeholder', /Password/i);
    });

    /**
     * 2. Check the presence of Forgot Password link
     */
    test('should display Forgot Password link', async ({ page }) => {
        await expect(page.locator('text=Forgot Password')).toBeVisible();
    });

    /**
     * 3. Attempt log in with empty fields
     */
    test('should show errors if trying to login with empty fields', async ({ page }) => {
        await page.click('text=LOG IN');
        // Check for an error or disabled button feedback
        // This will depend on your actual error mechanism
        // Example:
        await expect(page.locator('.error-message')).toContainText(/required/i);
    });

    /**
     * 4. Attempt login with only username
     */
    test('should show errors if password is missing', async ({ page }) => {
        await fillAndSubmitLoginForm(page, 'testUser', '');
        await expect(page.locator('.error-message')).toContainText(/password required/i);
    });

    /**
     * 5. Attempt login with only password
     */
    test('should show errors if username is missing', async ({ page }) => {
        await fillAndSubmitLoginForm(page, '', 'testPass');
        await expect(page.locator('.error-message')).toContainText(/username required/i);
    });

    /**
     * 6. Attempt login with invalid credentials
     */
    test('should display error with invalid credentials', async ({ page }) => {
        await fillAndSubmitLoginForm(page, 'notAUser', 'wrongPassword');
        await expect(page.locator('.error-message')).toContainText(/invalid credentials/i);
    });

    /**
     * 7. Verify password input is type="password"
     */
    test('should mask password input', async ({ page }) => {
        const passwordField = page.locator('input[name="password"]');
        await expect(passwordField).toHaveAttribute('type', 'password');
    });

    /**
     * 8. Successful login with correct credentials
     */
    test('should successfully login with valid credentials', async ({ page }) => {
        await fillAndSubmitLoginForm(page, 'validUser', 'validPass');
        // Check for a successful navigation or success message
        await expect(page).toHaveURL(/dashboard/i);
    });

    /**
     * 9. Check the LOGIN button is initially enabled/disabled as expected
     */
    test('should verify LOG IN button state before entering credentials', async ({ page }) => {
        // If the button is disabled by default:
        await expect(page.locator('text=LOG IN')).toBeDisabled();
        // If it’s enabled, remove the line above and verify differently
    });

    /**
     * 10. Verify that user can navigate to Forgot Password page
     */
    test('should navigate to forgot password page when link is clicked', async ({ page }) => {
        await page.click('text=Forgot Password');
        await expect(page).toHaveURL(/forgot-password/i);
    });

    /**
     * 11. Check error styling is applied when invalid input is provided
     */
    test('should have error styling for invalid inputs', async ({ page }) => {
        await fillAndSubmitLoginForm(page, 'invalidUser', '');
        const errorField = page.locator('input[name="password"].error-border');
        await expect(errorField).toBeVisible();
    });

    /**
     * 12. Ensure form persists typed values when login fails
     */
    test('should persist typed username if login fails', async ({ page }) => {
        const testUsername = 'someUser';
        await fillAndSubmitLoginForm(page, testUsername, 'wrongPass');
        await expect(page.locator('input[name="name"]')).toHaveValue(testUsername);
    });

    /**
     * 13. Check that pressing Enter key submits the form
     */
    test('should submit form on Enter key press', async ({ page }) => {
        await page.fill('input[name="name"]', 'enterKeyUser');
        await page.fill('input[name="password"]', 'enterKeyPass');
        await page.press('input[name="password"]', 'Enter');
        await expect(page).toHaveURL(/dashboard/i);
    });

    /**
     * 14. Test UI responsiveness on small screen (mobile simulation)
     */
    test('should display appropriately on a mobile viewport', async ({ browser }) => {
        const context = await browser.newContext({
            viewport: { width: 375, height: 812 } // iPhone X-ish
        });
        const page = await context.newPage();
        await page.goto('http://localhost:3000/signin');
        // Validate certain mobile-specific layout or classes
        await expect(page.locator('input[name="name"]')).toBeVisible();
        await context.close();
    });

    /**
     * 15. Verify that password is trimmed or not (depending on requirement)
     */
    test('should keep trailing spaces in password if that is the requirement', async ({ page }) => {
        // Example: If trailing spaces are allowed:
        await fillAndSubmitLoginForm(page, 'testUser', 'passWithSpace ');
        // Check a response or error message that indicates acceptance or trimming
    });

    /**
     * 16. Attempt multiple failed logins to trigger potential lockout
     */
    test('should lock user after multiple failed attempts (if feature exists)', async ({ page }) => {
        for (let i = 0; i < 3; i++) {
            await fillAndSubmitLoginForm(page, 'lockedUser', 'wrongPassword');
        }
        // Expect a lockout message or disabled login
        await expect(page.locator('.error-message')).toContainText(/account locked/i);
    });

    /**
     * 17. Verify that the sign-in form labels are correctly associated
     */
    test('should have correct label for the Name and Password fields', async ({ page }) => {
        const nameLabel = await page.locator('label[for="name"]').innerText();
        const passwordLabel = await page.locator('label[for="password"]').innerText();
        expect(nameLabel).toMatch(/name/i);
        expect(passwordLabel).toMatch(/password/i);
    });

    /**
     * 18. Check accessibility attributes (aria-label, role, etc.)
     */
    test('should have proper accessibility attributes', async ({ page }) => {
        await expect(page.locator('form[role="form"]')).toBeVisible();
        await expect(page.locator('input[name="name"]')).toHaveAttribute('aria-required', 'true');
        await expect(page.locator('input[name="password"]')).toHaveAttribute('aria-required', 'true');
    });

    /**
     * 19. Validate that an error message disappears after correction
     */
    test('should clear error message once the input is corrected', async ({ page }) => {
        await fillAndSubmitLoginForm(page, '', '');
        await expect(page.locator('.error-message')).toBeVisible();
        await page.fill('input[name="name"]', 'correctedUser');
        await page.fill('input[name="password"]', 'correctedPass');
        // Assume error clears automatically or upon new attempt
        await expect(page.locator('.error-message')).toBeHidden();
    });

    /**
     * 20. Confirm that reloading the page clears form state
     */
    test('should reset form inputs upon page refresh', async ({ page }) => {
        await fillAndSubmitLoginForm(page, 'reloadTestUser', 'reloadTestPass');
        await page.reload();
        await expect(page.locator('input[name="name"]')).toHaveValue('');
        await expect(page.locator('input[name="password"]')).toHaveValue('');
    });

});
