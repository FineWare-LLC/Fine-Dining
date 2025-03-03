/**
 * @file create-account.spec.ts
 * Standalone Playwright tests for the Next.js Create Account page.
 */

import { test, expect } from '@playwright/test';

/**
 * Fills and submits the create account form.
 * @param {import('@playwright/test').Page} page - The Playwright page object.
 * @param {string} username - The username to fill into the form.
 * @param {string} email - The email to fill into the form.
 * @param {string} password - The password to fill into the form.
 * @param {string} confirmPassword - The password confirmation to fill into the form.
 */
async function fillAndSubmitCreateAccountForm(
    page,
    username,
    email,
    password,
    confirmPassword
) {
    await page.fill('input[name="username"]', username);
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
    await page.fill('input[name="confirmPassword"]', confirmPassword);
    await page.click('text=CREATE ACCOUNT');
}

test.describe('Create Account Page - Comprehensive Tests', () => {

    test.beforeEach(async ({ page }) => {
        // Navigate to the create-account page before each test
        await page.goto('http://localhost:3000/create-account');
    });

    /**
     * 1. Verify page loads with correct title & placeholders
     */
    test('should load Create Account page with correct title & placeholders', async ({ page }) => {
        await expect(page).toHaveTitle(/Create Account/i);
        await expect(page.locator('input[name="username"]')).toHaveAttribute('placeholder', /username/i);
        await expect(page.locator('input[name="email"]')).toHaveAttribute('placeholder', /email/i);
        await expect(page.locator('input[name="password"]')).toHaveAttribute('placeholder', /password/i);
        await expect(page.locator('input[name="confirmPassword"]')).toHaveAttribute('placeholder', /confirm password/i);
    });

    /**
     * 2. Check presence of "CREATE ACCOUNT" button
     */
    test('should display CREATE ACCOUNT button', async ({ page }) => {
        await expect(page.locator('text=CREATE ACCOUNT')).toBeVisible();
    });

    /**
     * 3. Attempt account creation with all fields empty
     */
    test('should show errors if all fields are empty', async ({ page }) => {
        await page.click('text=CREATE ACCOUNT');
        await expect(page.locator('.error-message')).toContainText(/required/i);
    });

    /**
     * 4. Attempt account creation with only username
     */
    test('should show errors if other fields are missing', async ({ page }) => {
        await fillAndSubmitCreateAccountForm(page, 'testUser', '', '', '');
        await expect(page.locator('.error-message')).toContainText(/required/i);
    });

    /**
     * 5. Attempt account creation with invalid email format
     */
    test('should show error for invalid email format', async ({ page }) => {
        await fillAndSubmitCreateAccountForm(page, 'someUser', 'notAnEmail', 'testPass', 'testPass');
        await expect(page.locator('.error-message')).toContainText(/invalid email/i);
    });

    /**
     * 6. Check password vs. confirm password mismatch
     */
    test('should show mismatch error if passwords do not match', async ({ page }) => {
        await fillAndSubmitCreateAccountForm(page, 'mismatchUser', 'test@example.com', 'passOne', 'passTwo');
        await expect(page.locator('.error-message')).toContainText(/do not match/i);
    });

    /**
     * 7. Verify password fields are masked
     */
    test('should mask both password and confirm password fields', async ({ page }) => {
        await expect(page.locator('input[name="password"]')).toHaveAttribute('type', 'password');
        await expect(page.locator('input[name="confirmPassword"]')).toHaveAttribute('type', 'password');
    });

    /**
     * 8. Successful account creation with valid credentials
     */
    test('should successfully create an account with valid inputs', async ({ page }) => {
        await fillAndSubmitCreateAccountForm(page, 'validUser', 'validUser@example.com', 'validPass', 'validPass');
        await expect(page).toHaveURL(/welcome/i); // or whichever page you navigate to
    });

    /**
     * 9. Check CREATE ACCOUNT button state before entering data
     */
    test('should verify CREATE ACCOUNT button is initially disabled/enabled', async ({ page }) => {
        // If it's disabled by default:
        await expect(page.locator('text=CREATE ACCOUNT')).toBeDisabled();
        // Adjust if your implementation differs
    });

    /**
     * 10. Verify email uniqueness error (if applicable)
     */
    test('should show error if email is already taken', async ({ page }) => {
        await fillAndSubmitCreateAccountForm(page, 'newUser', 'taken@example.com', 'test123', 'test123');
        await expect(page.locator('.error-message')).toContainText(/already in use/i);
    });

    /**
     * 11. Check error styling for mandatory fields
     */
    test('should apply error styling when fields are invalid', async ({ page }) => {
        await fillAndSubmitCreateAccountForm(page, '', '', '', '');
        await expect(page.locator('input[name="username"].error-border')).toBeVisible();
        await expect(page.locator('input[name="email"].error-border')).toBeVisible();
        await expect(page.locator('input[name="password"].error-border')).toBeVisible();
        await expect(page.locator('input[name="confirmPassword"].error-border')).toBeVisible();
    });

    /**
     * 12. Ensure typed values persist if submission fails
     */
    test('should preserve user entries on submission failure', async ({ page }) => {
        await fillAndSubmitCreateAccountForm(page, 'preserveUser', 'wrongFormat', 'testPass', 'testPass');
        await expect(page.locator('input[name="username"]')).toHaveValue('preserveUser');
        await expect(page.locator('input[name="email"]')).toHaveValue('wrongFormat');
    });

    /**
     * 13. Check that pressing Enter key submits the form
     */
    test('should submit form on Enter key press', async ({ page }) => {
        await page.fill('input[name="username"]', 'enterKeyUser');
        await page.fill('input[name="email"]', 'enterKeyUser@example.com');
        await page.fill('input[name="password"]', 'enterKeyPass');
        await page.fill('input[name="confirmPassword"]', 'enterKeyPass');
        await page.press('input[name="confirmPassword"]', 'Enter');
        await expect(page).toHaveURL(/welcome/i);
    });

    /**
     * 14. Test responsiveness on a small screen (mobile simulation)
     */
    test('should be responsive on a mobile viewport', async ({ browser }) => {
        const context = await browser.newContext({
            viewport: { width: 375, height: 812 } // iPhone X-ish
        });
        const page = await context.newPage();
        await page.goto('http://localhost:3000/create-account');
        // Check if elements are visible or stacked properly
        await expect(page.locator('input[name="username"]')).toBeVisible();
        await context.close();
    });

    /**
     * 15. Check for password complexity rules (if any)
     */
    test('should show error if password does not meet complexity requirements', async ({ page }) => {
        // Example rule: must include a number, uppercase, 8+ chars, etc.
        await fillAndSubmitCreateAccountForm(page, 'compUser', 'compUser@example.com', 'short', 'short');
        await expect(page.locator('.error-message')).toContainText(/complexity requirement/i);
    });

    /**
     * 16. Validate special characters in username if allowed or not
     */
    test('should handle special characters in username properly', async ({ page }) => {
        await fillAndSubmitCreateAccountForm(page, 'special!@#', 'test@example.com', 'test1234', 'test1234');
        // Expect success or error based on your validation rules
        await expect(page.locator('.error-message')).not.toBeVisible();
    });

    /**
     * 17. Verify password confirmation field can be toggled to show/hide (if feature exists)
     */
    test('should allow toggling password visibility if feature is present', async ({ page }) => {
        // If there's a button or icon to toggle
        await page.click('button[data-testid="toggle-confirm-password-visibility"]');
        await expect(page.locator('input[name="confirmPassword"]')).toHaveAttribute('type', 'text');
    });

    /**
     * 18. Check accessibility attributes (aria-labels, roles, etc.)
     */
    test('should have proper accessibility attributes for form elements', async ({ page }) => {
        await expect(page.locator('form[role="form"]')).toBeVisible();
        await expect(page.locator('input[name="email"]')).toHaveAttribute('aria-required', 'true');
        await expect(page.locator('input[name="username"]')).toHaveAttribute('aria-required', 'true');
    });

    /**
     * 19. Confirm error message disappears after correction
     */
    test('should remove error message once invalid fields are corrected', async ({ page }) => {
        await fillAndSubmitCreateAccountForm(page, '', '', '', '');
        await expect(page.locator('.error-message')).toBeVisible();
        await fillAndSubmitCreateAccountForm(page, 'correctUser', 'correct@example.com', 'validPass', 'validPass');
        await expect(page.locator('.error-message')).toBeHidden();
    });

    /**
     * 20. Confirm that reloading the page clears any form data
     */
    test('should reset form fields on page reload', async ({ page }) => {
        await fillAndSubmitCreateAccountForm(page, 'reloadUser', 'reload@example.com', 'reloadPass', 'reloadPass');
        await page.reload();
        await expect(page.locator('input[name="username"]')).toHaveValue('');
        await expect(page.locator('input[name="email"]')).toHaveValue('');
        await expect(page.locator('input[name="password"]')).toHaveValue('');
        await expect(page.locator('input[name="confirmPassword"]')).toHaveValue('');
    });

});
