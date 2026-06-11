import { test, expect } from '@playwright/test';
import lighthouse from 'lighthouse';
import { chromium } from 'playwright';

// Basic Lighthouse check for CLS
// This test assumes the Next.js dev server is running via Playwright config.

test('profile page CLS below 0.1', async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto('http://localhost:3000/profile');

    const {port} = new URL(browser.wsEndpoint());
    const { lhr } = await lighthouse('http://localhost:3000/profile', {
        port,
        output: 'json',
        logLevel: 'error',
        onlyCategories: ['performance'],
    });
    const cls = lhr.audits['cumulative-layout-shift'].numericValue;
    await browser.close();
    expect(cls).toBeLessThan(0.1);
});
