// @ts-nocheck
import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import {
    RestaurantCrawlerRunResponseError,
    RestaurantCrawlerRunValidationError,
    readRestaurantCrawlerRunResponse,
    validateRestaurantCrawlerRunRequest,
} from '../../utils/restaurantCrawlerRun.ts';

const crawlerControlPanelPath = fileURLToPath(
    new URL('../../components/legacy/Dashboard/CrawlerControlPanel.tsx', import.meta.url),
);
const crawlerControlPanelSource = fs.readFileSync(crawlerControlPanelPath, 'utf8');

test('validateRestaurantCrawlerRunRequest accepts crawler control payloads and rejects invalid ones with a typed error', () => {
    const validResult = validateRestaurantCrawlerRunRequest({
        sourceIds: ['wendys', 'chipotle'],
        dryRun: false,
        limitPerSource: '40',
        includeAggregators: true,
    });

    assert.equal(validResult.valid, true);
    assert.deepEqual(validResult.payload, {
        source_ids: ['wendys', 'chipotle'],
        dry_run: false,
        limit_per_source: 40,
        include_aggregators: true,
    });

    const invalidResult = validateRestaurantCrawlerRunRequest({
        sourceIds: ['wendys'],
        dryRun: true,
        limitPerSource: 0,
        includeAggregators: false,
    });

    assert.equal(invalidResult.valid, false);
    assert.ok(invalidResult.error instanceof RestaurantCrawlerRunValidationError);
    assert.equal(invalidResult.error.code, 'invalidPayload');
    assert.equal(invalidResult.error.message, 'Restaurant crawler run request is invalid. Please refresh.');
    assert.equal(invalidResult.error.isUserSafe, true);
});

test('readRestaurantCrawlerRunResponse keeps crawler control failures user-safe', async () => {
    const validBody = await readRestaurantCrawlerRunResponse({
        ok: true,
        json: async () => ({
            itemsFound: 3,
            itemsImported: 1,
        }),
    });

    assert.deepEqual(validBody, {
        itemsFound: 3,
        itemsImported: 1,
    });

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

test('CrawlerControlPanel wires the typed crawler control request and response helpers into the live panel', () => {
    assert.match(crawlerControlPanelSource, /validateRestaurantCrawlerRunRequest/);
    assert.match(crawlerControlPanelSource, /readRestaurantCrawlerRunResponse/);
    assert.match(crawlerControlPanelSource, /RestaurantCrawlerRunResponseError/);
});
