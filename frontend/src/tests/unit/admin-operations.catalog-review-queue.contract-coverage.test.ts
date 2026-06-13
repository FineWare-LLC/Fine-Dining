// @ts-nocheck
import assert from 'node:assert/strict';
import test from 'node:test';

import {
    RestaurantCrawlerRunValidationError,
    validateRestaurantCrawlerRunRequest,
} from '../../utils/restaurantCrawlerRun.ts';

test('validateRestaurantCrawlerRunRequest accepts a valid crawler run payload and normalizes the request body', () => {
    const result = validateRestaurantCrawlerRunRequest({
        sourceIds: ['wendys', 'chipotle'],
        dryRun: false,
        limitPerSource: '40',
        includeAggregators: true,
    });

    assert.equal(result.valid, true);
    assert.deepEqual(result.payload, {
        source_ids: ['wendys', 'chipotle'],
        dry_run: false,
        limit_per_source: 40,
        include_aggregators: true,
    });
});

test('validateRestaurantCrawlerRunRequest accepts an empty source selection and keeps it explicit', () => {
    const result = validateRestaurantCrawlerRunRequest({
        sourceIds: [],
        dryRun: true,
        limitPerSource: 1,
        includeAggregators: false,
    });

    assert.equal(result.valid, true);
    assert.deepEqual(result.payload, {
        source_ids: [],
        dry_run: true,
        limit_per_source: 1,
        include_aggregators: false,
    });
});

test('validateRestaurantCrawlerRunRequest rejects invalid crawler run payloads with a typed, user-safe error', () => {
    const result = validateRestaurantCrawlerRunRequest({
        sourceIds: ['wendys'],
        dryRun: true,
        limitPerSource: 0,
        includeAggregators: false,
    });

    assert.equal(result.valid, false);
    assert.ok(result.error instanceof RestaurantCrawlerRunValidationError);
    assert.equal(result.error.code, 'invalidPayload');
    assert.equal(result.error.message, 'Restaurant crawler run request is invalid. Please refresh.');
    assert.equal(result.error.isUserSafe, true);
});
