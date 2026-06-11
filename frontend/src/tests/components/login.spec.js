/**
 * @file login.spec.js
 * Standalone Playwright tests for the Next.js Sign In page.
 */

import { test, expect } from '@playwright/test';

/**
 * Fills in and submits the login form.
 *
 * @param {import('@playwright/test').Page} page - The Playwright page object.
 * @param {string} email - The email to fill into the email field.
 * @param {string} password - The password to fill into the Password field.
 */
async function fillAndSubmitLoginForm(page, email, password) {
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
    await page.click('button:text("Log In")');
}

test.describe('Sign In Page - Comprehensive Tests', () => {
    test.beforeEach(async ({ page }) => {
        // Navigate to the sign-in page before each test
        await page.goto('http://localhost:3000/signin');
    });

    test('should load sign-in page with correct title & placeholders', async ({ page }) => {
        await expect(page).toHaveTitle(/Fine Dining/i);
        await expect(page.locator('input[name="email"]')).toHaveAttribute('placeholder', /Enter your email address/i);
        await expect(page.locator('input[name="password"]')).toHaveAttribute('placeholder', /Enter your password/i);
    });

    test('should display Forgot Password link', async ({ page }) => {
        await expect(page.locator('a[href="/forgot-password"]:text("Forgot Password?")')).toBeVisible();
    });

    test('should show errors if trying to login with empty fields', async ({ page }) => {
        await page.click('button:text("Log In")');
        await expect(page.locator('p[role="alert"]')).toBeVisible();
        await expect(page.locator('input[name="email"]')).toHaveAttribute('aria-invalid', 'true');
        await expect(page.locator('input[name="password"]')).toHaveAttribute('aria-invalid', 'true');
    });

    test('should show errors if password is missing', async ({ page }) => {
        await fillAndSubmitLoginForm(page, 'test@example.com', '');
        await expect(page.locator('p[role="alert"]')).toContainText(/enter your password/i);
    });

    test('should show errors if email is missing', async ({ page }) => {
        await fillAndSubmitLoginForm(page, '', 'testPass');
        await expect(page.locator('p[role="alert"]')).toContainText(/enter a valid email/i);
    });

    test('should display error with invalid credentials', async ({ page }) => {
        await fillAndSubmitLoginForm(page, 'notAUser@example.com', 'wrongPassword');
        await expect(page.locator('p[role="alert"]')).toContainText(/invalid credentials/i);
    });

    test('should mask password input by default', async ({ page }) => {
        const passwordField = page.locator('input[name="password"]');
        await expect(passwordField).toHaveAttribute('type', 'password');
    });

    test('should toggle password visibility when eye icon is clicked', async ({ page }) => {
        const passwordField = page.locator('input[name="password"]');
        const toggleButton = page.locator('button[aria-label*="password"]');
        
        // Password should be masked by default
        await expect(passwordField).toHaveAttribute('type', 'password');
        
        // Fill password to make toggle more meaningful
        await passwordField.fill('testPassword123');
        
        // Click the toggle button to show password
        await toggleButton.click();
        await expect(passwordField).toHaveAttribute('type', 'text');
        
        // Click again to hide password
        await toggleButton.click();
        await expect(passwordField).toHaveAttribute('type', 'password');
    });

    test('should successfully login with valid credentials', async ({ page }) => {
        // NOTE: Replace with actual valid test credentials if needed
        await fillAndSubmitLoginForm(page, 'validUser@example.com', 'validPass');
        await expect(page).toHaveURL(/dashboard/i);
    });

    test('should verify LOG IN button state before entering credentials', async ({ page }) => {
        // The button should be enabled initially (only disabled when loading).
        await expect(page.locator('button:text("Log In")')).toBeEnabled();
    });

    test('should navigate to forgot password page when link is clicked', async ({ page }) => {
        await page.click('a[href="/forgot-password"]:text("Forgot Password?")');
        await expect(page).toHaveURL(/forgot-password/i);
    });

    test('should have error styling for invalid inputs', async ({ page }) => {
        await fillAndSubmitLoginForm(page, 'invalidUser@example.com', '');
        const errorField = page.locator('input[name="password"][aria-invalid="true"]');
        await expect(errorField).toBeVisible();
    });

    test('should persist typed email if login fails', async ({ page }) => {
        const testEmail = 'someUser@example.com';
        await fillAndSubmitLoginForm(page, testEmail, 'wrongPass');
        await expect(page.locator('input[name="email"]')).toHaveValue(testEmail);
    });

    test('should submit form on Enter key press', async ({ page }) => {
        await page.fill('input[name="email"]', 'enterKeyUser@example.com');
        await page.fill('input[name="password"]', 'enterKeyPass');
        await page.press('input[name="password"]', 'Enter');
        await expect(page).toHaveURL(/dashboard/i);
    });

    test('should display appropriately on a mobile viewport', async ({ browser }) => {
        const context = await browser.newContext({
            viewport: { width: 375, height: 812 }, // iPhone X dimensions
        });
        const page = await context.newPage();
        await page.goto('http://localhost:3000/signin');
        await expect(page.locator('input[name="email"]')).toBeVisible();
        await context.close();
    });

    test('should handle trailing spaces in password if that is the requirement', async ({ page }) => {
        // This test assumes that trailing spaces are trimmed.
        await fillAndSubmitLoginForm(page, 'testUser@example.com', 'passWithSpace ');
        // Depending on backend logic, verify either a success or error.
        // Example (if spaces cause failure):
        // await expect(page.locator('p[role="alert"]')).toContainText(/invalid credentials/i);
    });

    test('should lock user after multiple failed attempts (if feature exists)', async ({ page }) => {
        for (let i = 0; i < 3; i++) {
            await fillAndSubmitLoginForm(page, 'lockedUser@example.com', 'wrongPassword');
            await page.waitForTimeout(100);
        }
        await expect(page.locator('p[role="alert"]')).toContainText(/account locked/i);
    });

    test('should have correct label for the Email and Password fields', async ({ page }) => {
        const emailLabel = await page.locator('label[for="email"]').innerText();
        const passwordLabel = await page.locator('label[for="password"]').innerText();
        expect(emailLabel).toMatch(/email/i);
        expect(passwordLabel).toMatch(/password/i);
    });

    test('should have proper accessibility attributes', async ({ page }) => {
        await expect(page.locator('form')).toBeVisible();
        await expect(page.locator('input[name="email"]')).toHaveAttribute('aria-required', 'true');
        await expect(page.locator('input[name="password"]')).toHaveAttribute('aria-required', 'true');
    });

    test('should clear error message once the input is corrected', async ({ page }) => {
        // Trigger an error.
        await fillAndSubmitLoginForm(page, '', '');
        await expect(page.locator('p[role="alert"]')).toBeVisible();
        // Correct the inputs.
        await page.fill('input[name="email"]', 'correctedUser@example.com');
        await page.fill('input[name="password"]', 'correctedPass');
        // The error message should clear as the onChange handlers update the state.
        await expect(page.locator('p[role="alert"]')).toBeHidden();
    });

    test('should reset form inputs upon page refresh', async ({ page }) => {
        await fillAndSubmitLoginForm(page, 'reloadTestUser@example.com', 'reloadTestPass');
        await page.reload();
        await expect(page.locator('input[name="email"]')).toHaveValue('');
        await expect(page.locator('input[name="password"]')).toHaveValue('');
    });
});
