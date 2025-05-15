// @ts-check
import { defineConfig, devices } from '@playwright/experimental-ct-react';

// Ensure NODE_ENV is set to 'test-ct' for component testing
process.env.NODE_ENV = 'test-ct';

/**
 * @see https://playwright.dev/docs/test-components
 */
export default defineConfig({
  testDir: './src/tests/components',
  /* The base directory, relative to the config file, for snapshot files created with toMatchSnapshot and toHaveScreenshot. */
  snapshotDir: './__snapshots__',
  /* Maximum time one test can run for. */
  timeout: 10 * 1000,
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    /* Port to use for Playwright component endpoint. */
    ctPort: 3100, // This is the port for Playwright's own endpoint for CT
    /* Base URL to use in actions like `await page.goto('/')`. */
    // baseURL: 'http://localhost:3000', // Not typically needed for CT if devServer is correctly configured
  },

  // Add this block for the component development server
  ctDevServer: {
    command: 'npm run dev', // Uses 'next dev' from your package.json
    port: 3000,             // The port your Next.js app runs on
    reuseExistingServer: !process.env.CI, // Reuse dev server locally, but not on CI
    env: { NODE_ENV: 'test-ct' },
    timeout: 120 * 1000,    // 2-minute timeout for the server to start
},

/* Configure projects for major browsers */
projects: [
  {
    name: 'chromium',
    use: { ...devices['Desktop Chrome'] },
  },
  {
    name: 'firefox',
    use: { ...devices['Desktop Firefox'] },
  },
  {
    name: 'webkit',
    use: { ...devices['Desktop Safari'] },
  },
],
/* Vite configuration for component testing (if you were using Vite) */
// ctViteConfig: // This block is for Vite specific settings, ensure it doesn't conflict if you are NOT using Vite directly for bundling these specific components.
// server: {
// host: 'localhost',
// port: 3100 // Note: This port might conflict with ctPort. ctPort is for Playwright's internal use.
//
// }
});