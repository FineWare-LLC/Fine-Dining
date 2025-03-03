// playwright.config.js
import { defineConfig } from '@playwright/test';

export default defineConfig({
    testDir: 'src/tests',
    // Base URL if you're running `npm run dev` at localhost:3000
    use: {
        baseURL: 'http://localhost:3000',
    },
    // Optional settings for slowMo, headless mode, etc.
});
