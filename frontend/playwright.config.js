// playwright.config.js
import { defineConfig } from '@playwright/experimental-ct-react';

export default defineConfig({
    testDir: 'src/tests',
    // Base URL if you're running `npm run dev` at localhost:3000
    use: {
        baseURL: 'http://localhost:3000',
    },
    ct: {
      devServer: {
        command: 'npm run dev',
        port: 3000,
        reuseExistingServer: true,
        env: { NODE_ENV: 'test-ct' },
        timeout: 120000
      }
    },
    // Optional settings for slowMo, headless mode, etc.
});
