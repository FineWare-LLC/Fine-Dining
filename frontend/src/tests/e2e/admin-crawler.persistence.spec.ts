// @ts-nocheck
import { expect, test } from '@playwright/test';

import { createMockAdmin } from '../utils/fixtures';
import { persistLoginInfo } from '../../context/authUtils.ts';
import { RESTAURANT_CRAWLER_RUN_DRAFT_STORAGE_KEY } from '../../utils/restaurantCrawlerRun.ts';

const encodePayload = (payload) => {
    const json = JSON.stringify(payload);
    const base64 = Buffer.from(json, 'utf8').toString('base64');
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
};

const buildToken = (payload) => `header.${encodePayload(payload)}.signature`;

const createStorageAdapter = (initialState = {}) => {
    const state = { ...initialState };

    return {
        state,
        setItem(key, value) {
            state[key] = String(value);
            return true;
        },
        removeItem(key) {
            delete state[key];
            return true;
        },
    };
};

test.describe('Admin crawler persistence', () => {
    test('keeps crawler draft state canonical across a page refresh', async ({ page }) => {
        const nowSeconds = Math.floor(Date.now() / 1000);
        const storageAdapter = createStorageAdapter();
        const authToken = buildToken({
            exp: nowSeconds + 3_600,
            userId: 'admin-1',
            email: 'admin@example.com',
            role: 'ADMIN',
            subscriptionPlan: 'PRO',
            subscriptionStatus: 'active',
        });
        const loginResult = persistLoginInfo(
            authToken,
            createMockAdmin({
                id: 'admin-1',
                email: 'admin@example.com',
                subscriptionPlan: 'PRO',
                subscriptionStatus: 'active',
            }),
            storageAdapter,
            nowSeconds,
        );

        expect(loginResult.ok).toBe(true);

        const recipeStatus = {
            running: false,
            current_url: '',
            pages_crawled: 1,
            recipes_found: 0,
            searches_done: 0,
            errors: 0,
            last_error: '',
            started_at: null,
            llm_available: true,
            llm_model: 'test-model',
            total_recipes: 0,
            queue_pending: 0,
            queue_processing: 0,
            queue_done: 0,
            queue_failed: 0,
        };
        const restaurantStatus = {
            running: false,
            lastRunStartedAt: null,
            lastRunFinishedAt: null,
            lastRunDryRun: true,
            sourcesProcessed: 0,
            itemsFound: 0,
            itemsImported: 0,
            itemsSkipped: 0,
            errors: 0,
            currentSource: '',
            priceMarket: '10001',
            aggregatorsEnabled: true,
        };
        const sources = [
            {
                id: 'wendys',
                restaurant: "Wendy's",
                source_type: 'official',
                supports_price: true,
            },
            {
                id: 'chipotle',
                restaurant: 'Chipotle',
                source_type: 'official',
                supports_price: false,
            },
            {
                id: 'doordash',
                restaurant: 'DoorDash',
                source_type: 'aggregator',
                supports_price: true,
            },
        ];
        const runBodies = [];

        await page.addInitScript(
            ({ authToken: token, userInfo, storageKey, draft }) => {
                localStorage.setItem('authToken', token);
                localStorage.setItem('userInfo', userInfo);
                localStorage.setItem(storageKey, JSON.stringify(draft));
            },
            {
                authToken: storageAdapter.state.authToken,
                userInfo: storageAdapter.state.userInfo,
                storageKey: RESTAURANT_CRAWLER_RUN_DRAFT_STORAGE_KEY,
                draft: {
                    selectedSourceIds: ['doordash'],
                    dryRun: false,
                    includeAggregators: true,
                    limitPerSource: 25,
                },
            },
        );

        await page.route('**/crawler/status', async route => {
            await route.fulfill({ json: recipeStatus });
        });
        await page.route('**/restaurant-crawler/status', async route => {
            await route.fulfill({ json: restaurantStatus });
        });
        await page.route('**/restaurant-crawler/sources*', async route => {
            const url = new URL(route.request().url());
            const includeAggregators = url.searchParams.get('include_aggregators') === 'true';

            await route.fulfill({
                json: {
                    sources: includeAggregators
                        ? sources
                        : sources.filter(source => source.source_type === 'official'),
                },
            });
        });
        await page.route('**/restaurant-crawler/run', async route => {
            const body = JSON.parse(route.request().postData() || '{}');
            runBodies.push(body);

            await route.fulfill({
                json: {
                    dryRun: body.dry_run,
                    itemsFound: 1,
                    itemsImported: body.dry_run ? 0 : 1,
                    preview: [],
                    sourceResults: [],
                    priceMarket: '10001',
                },
            });
        });

        await page.goto('/admin/crawler');

        const wendys = page.getByRole('checkbox', { name: /Wendy's/i });
        const chipotle = page.getByRole('checkbox', { name: /Chipotle/i });
        const doordash = page.getByRole('checkbox', { name: /DoorDash/i });
        const dryRunToggle = page.getByLabel('Dry run');
        const limitInput = page.getByLabel('Limit/source');

        await expect(page.getByRole('heading', { name: /Crawler Admin/i })).toBeVisible();
        await expect(wendys).toBeVisible();
        await expect(chipotle).toBeVisible();
        await expect(doordash).toBeVisible();

        await expect(page.getByRole('checkbox', { name: /Wendy's/i })).not.toBeChecked();
        await expect(page.getByRole('checkbox', { name: /Chipotle/i })).not.toBeChecked();
        await expect(page.getByRole('checkbox', { name: /DoorDash/i })).toBeChecked();
        await expect(page.getByLabel('Dry run')).not.toBeChecked();
        await expect(page.getByLabel('Limit/source')).toHaveValue('25');

        await page.getByRole('button', { name: /Import Menu Items/i }).click();
        await expect(page.getByText(/Imported 1 restaurant items\./i)).toBeVisible();

        expect(runBodies).toHaveLength(1);
        expect(runBodies[0]).toMatchObject({
            source_ids: ['doordash'],
            dry_run: false,
            limit_per_source: 25,
            include_aggregators: true,
        });

        await page.reload();

        await expect(page.getByRole('heading', { name: /Crawler Admin/i })).toBeVisible();
        await expect(page.getByRole('checkbox', { name: /Wendy's/i })).not.toBeChecked();
        await expect(page.getByRole('checkbox', { name: /Chipotle/i })).not.toBeChecked();
        await expect(page.getByRole('checkbox', { name: /DoorDash/i })).toBeChecked();
        await expect(page.getByLabel('Dry run')).not.toBeChecked();
        await expect(page.getByLabel('Limit/source')).toHaveValue('25');
    });
});
