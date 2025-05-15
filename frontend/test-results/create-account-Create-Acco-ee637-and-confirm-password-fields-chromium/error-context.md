# Test info

- Name: Create Account Page - Comprehensive Tests >> should mask both password and confirm password fields
- Location: /Users/tt/IdeaProjects/Fine-Dining/frontend/src/tests/components/create-account.spec.js:90:5

# Error details

```
Error: page.goto: Target page, context or browser has been closed
Call log:
  - navigating to "http://localhost:3000/create-account", waiting until "load"

    at /Users/tt/IdeaProjects/Fine-Dining/frontend/src/tests/components/create-account.spec.js:34:20
```

# Test source

```ts
   1 | /**
   2 |  * @file create-account.spec.ts
   3 |  * Standalone Playwright tests for the Next.js Create Account page.
   4 |  */
   5 |
   6 | import { test, expect } from '@playwright/test';
   7 |
   8 | /**
   9 |  * Fills and submits the create account form.
   10 |  * @param {import('@playwright/test').Page} page - The Playwright page object.
   11 |  * @param {string} username - The username to fill into the form.
   12 |  * @param {string} email - The email to fill into the form.
   13 |  * @param {string} password - The password to fill into the form.
   14 |  * @param {string} confirmPassword - The password confirmation to fill into the form.
   15 |  */
   16 | async function fillAndSubmitCreateAccountForm(
   17 |     page,
   18 |     username,
   19 |     email,
   20 |     password,
   21 |     confirmPassword
   22 | ) {
   23 |     await page.fill('input[name="username"]', username);
   24 |     await page.fill('input[name="email"]', email);
   25 |     await page.fill('input[name="password"]', password);
   26 |     await page.fill('input[name="confirmPassword"]', confirmPassword);
   27 |     await page.click('text=CREATE ACCOUNT');
   28 | }
   29 |
   30 | test.describe('Create Account Page - Comprehensive Tests', () => {
   31 |
   32 |     test.beforeEach(async ({ page }) => {
   33 |         // Navigate to the create-account page before each test
>  34 |         await page.goto('http://localhost:3000/create-account');
      |                    ^ Error: page.goto: Target page, context or browser has been closed
   35 |     });
   36 |
   37 |     /**
   38 |      * 1. Verify page loads with correct title & placeholders
   39 |      */
   40 |     test('should load Create Account page with correct title & placeholders', async ({ page }) => {
   41 |         await expect(page).toHaveTitle(/Create Account/i);
   42 |         await expect(page.locator('input[name="username"]')).toHaveAttribute('placeholder', /username/i);
   43 |         await expect(page.locator('input[name="email"]')).toHaveAttribute('placeholder', /email/i);
   44 |         await expect(page.locator('input[name="password"]')).toHaveAttribute('placeholder', /password/i);
   45 |         await expect(page.locator('input[name="confirmPassword"]')).toHaveAttribute('placeholder', /confirm password/i);
   46 |     });
   47 |
   48 |     /**
   49 |      * 2. Check presence of "CREATE ACCOUNT" button
   50 |      */
   51 |     test('should display CREATE ACCOUNT button', async ({ page }) => {
   52 |         await expect(page.locator('text=CREATE ACCOUNT')).toBeVisible();
   53 |     });
   54 |
   55 |     /**
   56 |      * 3. Attempt account creation with all fields empty
   57 |      */
   58 |     test('should show errors if all fields are empty', async ({ page }) => {
   59 |         await page.click('text=CREATE ACCOUNT');
   60 |         await expect(page.locator('.error-message')).toContainText(/required/i);
   61 |     });
   62 |
   63 |     /**
   64 |      * 4. Attempt account creation with only username
   65 |      */
   66 |     test('should show errors if other fields are missing', async ({ page }) => {
   67 |         await fillAndSubmitCreateAccountForm(page, 'testUser', '', '', '');
   68 |         await expect(page.locator('.error-message')).toContainText(/required/i);
   69 |     });
   70 |
   71 |     /**
   72 |      * 5. Attempt account creation with invalid email format
   73 |      */
   74 |     test('should show error for invalid email format', async ({ page }) => {
   75 |         await fillAndSubmitCreateAccountForm(page, 'someUser', 'notAnEmail', 'testPass', 'testPass');
   76 |         await expect(page.locator('.error-message')).toContainText(/invalid email/i);
   77 |     });
   78 |
   79 |     /**
   80 |      * 6. Check password vs. confirm password mismatch
   81 |      */
   82 |     test('should show mismatch error if passwords do not match', async ({ page }) => {
   83 |         await fillAndSubmitCreateAccountForm(page, 'mismatchUser', 'test@example.com', 'passOne', 'passTwo');
   84 |         await expect(page.locator('.error-message')).toContainText(/do not match/i);
   85 |     });
   86 |
   87 |     /**
   88 |      * 7. Verify password fields are masked
   89 |      */
   90 |     test('should mask both password and confirm password fields', async ({ page }) => {
   91 |         await expect(page.locator('input[name="password"]')).toHaveAttribute('type', 'password');
   92 |         await expect(page.locator('input[name="confirmPassword"]')).toHaveAttribute('type', 'password');
   93 |     });
   94 |
   95 |     /**
   96 |      * 8. Successful account creation with valid credentials
   97 |      */
   98 |     test('should successfully create an account with valid inputs', async ({ page }) => {
   99 |         await fillAndSubmitCreateAccountForm(page, 'validUser', 'validUser@example.com', 'validPass', 'validPass');
  100 |         await expect(page).toHaveURL(/welcome/i); // or whichever page you navigate to
  101 |     });
  102 |
  103 |     /**
  104 |      * 9. Check CREATE ACCOUNT button state before entering data
  105 |      */
  106 |     test('should verify CREATE ACCOUNT button is initially disabled/enabled', async ({ page }) => {
  107 |         // If it's disabled by default:
  108 |         await expect(page.locator('text=CREATE ACCOUNT')).toBeDisabled();
  109 |         // Adjust if your implementation differs
  110 |     });
  111 |
  112 |     /**
  113 |      * 10. Verify email uniqueness error (if applicable)
  114 |      */
  115 |     test('should show error if email is already taken', async ({ page }) => {
  116 |         await fillAndSubmitCreateAccountForm(page, 'newUser', 'taken@example.com', 'test123', 'test123');
  117 |         await expect(page.locator('.error-message')).toContainText(/already in use/i);
  118 |     });
  119 |
  120 |     /**
  121 |      * 11. Check error styling for mandatory fields
  122 |      */
  123 |     test('should apply error styling when fields are invalid', async ({ page }) => {
  124 |         await fillAndSubmitCreateAccountForm(page, '', '', '', '');
  125 |         await expect(page.locator('input[name="username"].error-border')).toBeVisible();
  126 |         await expect(page.locator('input[name="email"].error-border')).toBeVisible();
  127 |         await expect(page.locator('input[name="password"].error-border')).toBeVisible();
  128 |         await expect(page.locator('input[name="confirmPassword"].error-border')).toBeVisible();
  129 |     });
  130 |
  131 |     /**
  132 |      * 12. Ensure typed values persist if submission fails
  133 |      */
  134 |     test('should preserve user entries on submission failure', async ({ page }) => {
```