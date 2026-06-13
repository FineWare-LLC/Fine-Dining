// @ts-nocheck
import assert from 'node:assert/strict';
import test from 'node:test';

import {
    RestaurantCrawlerRunResponseError,
    readRestaurantCrawlerRunResponse,
} from '../../utils/restaurantCrawlerRun.ts';

test('readRestaurantCrawlerRunResponse throws a user-safe fallback error when the crawler response body is malformed', async () => {
    await assert.rejects(
        () => readRestaurantCrawlerRunResponse({
            ok: false,
            json: async () => {
                throw new SyntaxError('Unexpected token < in JSON at position 0');
            },
        }),
        error => {
            assert.ok(error instanceof RestaurantCrawlerRunResponseError);
            assert.equal(error.code, 'invalidResponse');
            assert.equal(error.message, 'Restaurant crawler failed. Please refresh.');
            assert.equal(error.isUserSafe, true);
            return true;
        },
    );
});

test('readRestaurantCrawlerRunResponse preserves actionable server detail on crawler failures', async () => {
    await assert.rejects(
        () => readRestaurantCrawlerRunResponse({
            ok: false,
            json: async () => ({
                detail: 'Crawler API timed out. Retry after the service recovers.',
            }),
        }),
        error => {
            assert.ok(error instanceof RestaurantCrawlerRunResponseError);
            assert.equal(error.code, 'invalidResponse');
            assert.equal(error.message, 'Crawler API timed out. Retry after the service recovers.');
            assert.equal(error.isUserSafe, true);
            return true;
        },
    );
});
