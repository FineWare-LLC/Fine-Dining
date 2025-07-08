// playwright.config.js
import { defineConfig } from '@playwright/test';

export default defineConfig({
    testDir: 'src/tests',
    // Base URL if you're running `npm run dev` at localhost:3000
    use: {
        baseURL: 'http://localhost:3000',
    },
    webServer: {
        command: 'npm run dev',
        port: 3000,
        reuseExistingServer: !process.env.CI,
        timeout: 120000
    },
    ct: {
      devServer: {
        command: 'npm run dev:memory',
        port: 3000,
        reuseExistingServer: true,
        env: { NODE_ENV: 'test-ct' },
        timeout: 120000
      }
    },
    // Optional settings for slowMo, headless mode, etc.
});
