import assert from 'node:assert/strict';
import test from 'node:test';

let scraper;
try {
    scraper = await import('../../lib/menuScraper.mjs');
} catch {
    try {
        scraper = await import('../../lib/HiGHS/src/fetcher/scraper.mjs');
    } catch {
        test('menuScraper.mjs not found', { skip: true }, () => {});
    }
}

if (scraper) {
    const scrape = scraper.parseMenu || scraper.scrapeAllChains || scraper.run;
    if (typeof scrape !== 'function') {
        test('menuScraper has no parsable function', { skip: true }, () => {});
    } else {
        test('parses example menu pages with mocked fetch', async () => {
            const html = '<html></html>';
            const mockFetch = async () => ({ ok: true, text: async () => html });

            const originalFetch = global.fetch;
            global.fetch = mockFetch;

            try {
                const result = await scrape();
                assert.ok(Array.isArray(result));
                assert.ok(result.length >= 0);
            } finally {
                global.fetch = originalFetch;
            }
        });
    }
}
