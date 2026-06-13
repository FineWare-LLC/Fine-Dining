// @ts-nocheck
import { expect, test } from '@playwright/test';

import { createMockAdmin } from '../utils/fixtures';
import { persistLoginInfo } from '../../context/authUtils.ts';

const encodePayload = (payload) => {
    const json = JSON.stringify(payload);
    const base64 = Buffer.from(json, 'utf8').toString('base64');
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
};

const buildToken = payload => `header.${encodePayload(payload)}.signature`;

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

test.describe('Admin crawler failure path', () => {
    test('keeps successful crawler data visible when one dependency fails', async ({ page }) => {
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
            running: true,
            current_url: 'https://example.com/recipe',
            pages_crawled: 11,
            recipes_found: 9,
            searches_done: 4,
            errors: 0,
            last_error: '',
            started_at: new Date(Date.now() - 60_000).toISOString(),
            llm_available: true,
            llm_model: 'test-model',
            total_recipes: 9,
            queue_pending: 2,
            queue_processing: 1,
            queue_done: 6,
            queue_failed: 0,
        };
        const sources = [
            {
                id: 'wendys',
                restaurant: "Wendy's",
                source_type: 'official',
                supports_price: true,
            },
        ];

        await page.addInitScript(
            ({ authToken: token, userInfo }) => {
                localStorage.setItem('authToken', token);
                localStorage.setItem('userInfo', userInfo);
            },
            {
                authToken: storageAdapter.state.authToken,
                userInfo: storageAdapter.state.userInfo,
            },
        );

        await page.route('**/crawler/status', async route => {
            await route.fulfill({ json: recipeStatus });
        });
        await page.route('**/restaurant-crawler/status', async route => {
            await route.fulfill({
                status: 500,
                json: {
                    detail: 'Restaurant crawler backend unavailable.',
                },
            });
        });
        await page.route('**/restaurant-crawler/sources*', async route => {
            await route.fulfill({
                json: {
                    sources,
                },
            });
        });

        await page.goto('/admin/crawler');

        await expect(page.locator('#recipe-crawler-feedback')).toContainText(/Crawler data refresh failed/i);
        await expect(page.getByRole('heading', { name: /Recipe Queue/i })).toBeVisible();
        await expect(page.getByRole('checkbox', { name: /Wendy's/i })).toBeVisible();
    });
});
