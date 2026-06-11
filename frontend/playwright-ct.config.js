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

  /* Test timeout for expect() calls */
  expect: {
    timeout: 3000,
  },

  /* Run tests in files in parallel */
  fullyParallel: true,

  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,

  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,

  /* Opt out of parallel tests on CI for component tests to avoid resource conflicts */
  workers: process.env.CI ? 1 : undefined,

  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['html', { outputFolder: 'playwright-report/component-tests' }],
    ['json', { outputFile: 'test-results/component-results.json' }],
    ...(process.env.CI ? [['github']] : [['list']])
  ],

  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',

    /* Take screenshot only when test fails. */
    screenshot: 'only-on-failure',

    /* Record video only when retrying. */
    video: 'retain-on-failure',

    /* Port to use for Playwright component endpoint. */
    ctPort: 3100,

    /* Action timeout for component interactions */
    actionTimeout: 5000,
  },

  /* Component development server configuration */
  ctDevServer: {
    command: 'npm run dev:memory',
    port: 3000,
    reuseExistingServer: !process.env.CI,
    env: { NODE_ENV: 'test-ct' },
    timeout: 120 * 1000,
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 }
      },
    },
    {
      name: 'firefox',
      use: { 
        ...devices['Desktop Firefox'],
        viewport: { width: 1280, height: 720 }
      },
    },
    {
      name: 'webkit',
      use: { 
        ...devices['Desktop Safari'],
        viewport: { width: 1280, height: 720 }
      },
    },
    /* Mobile component testing */
    {
      name: 'Mobile Chrome',
      use: { 
        ...devices['Pixel 5'],
      },
    },
  ],

  /* Folder for test artifacts such as screenshots, videos, traces, etc. */
  outputDir: 'test-results/component-tests/',
});
