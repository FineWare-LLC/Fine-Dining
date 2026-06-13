// @ts-nocheck
import assert from 'node:assert/strict';
import test from 'node:test';

import {
    DEFAULT_RESTAURANT_CRAWLER_RUN_DRAFT,
    RESTAURANT_CRAWLER_RUN_DRAFT_STORAGE_KEY,
    loadRestaurantCrawlerRunDraft,
    persistRestaurantCrawlerRunDraft,
    resolveRestaurantCrawlerRunDraft,
} from '../../utils/restaurantCrawlerRun.ts';

const createStorageAdapter = (initialState = {}) => {
    const state = { ...initialState };
    const writes = [];
    const removals = [];

    return {
        state,
        writes,
        removals,
        getItem(key) {
            return Object.prototype.hasOwnProperty.call(state, key) ? state[key] : null;
        },
        setItem(key, value) {
            writes.push([key, value]);
            state[key] = String(value);
            return true;
        },
        removeItem(key) {
            removals.push(key);
            delete state[key];
            return true;
        },
    };
};

test('persistRestaurantCrawlerRunDraft and loadRestaurantCrawlerRunDraft keep the canonical crawler draft stable across refresh', () => {
    const storageAdapter = createStorageAdapter();

    const canonicalDraft = persistRestaurantCrawlerRunDraft(storageAdapter, {
        selectedSourceIds: [' wendys ', 'chipotle', 'wendys', '', null],
        dryRun: false,
        includeAggregators: false,
        limitPerSource: '40',
    });

    assert.deepEqual(canonicalDraft, {
        selectedSourceIds: ['wendys', 'chipotle'],
        dryRun: false,
        includeAggregators: false,
        limitPerSource: 40,
    });
    assert.equal(
        storageAdapter.state[RESTAURANT_CRAWLER_RUN_DRAFT_STORAGE_KEY],
        JSON.stringify(canonicalDraft),
    );
    assert.deepEqual(storageAdapter.writes, [
        [
            RESTAURANT_CRAWLER_RUN_DRAFT_STORAGE_KEY,
            JSON.stringify(canonicalDraft),
        ],
    ]);

    const refreshedDraft = loadRestaurantCrawlerRunDraft(storageAdapter);

    assert.deepEqual(refreshedDraft, canonicalDraft);
});

test('resolveRestaurantCrawlerRunDraft keeps persisted crawler selections aligned with the available source catalog', () => {
    const sourceCatalog = [
        { id: 'wendys', source_type: 'official' },
        { id: 'chipotle', source_type: 'official' },
        { id: 'doordash', source_type: 'aggregator' },
    ];

    const resolvedWithValidSelection = resolveRestaurantCrawlerRunDraft({
        selectedSourceIds: [' wendys ', 'ghost-source', 'chipotle', 'wendys'],
        dryRun: false,
        includeAggregators: true,
        limitPerSource: ' 25 ',
    }, sourceCatalog);

    assert.deepEqual(resolvedWithValidSelection, {
        selectedSourceIds: ['wendys', 'chipotle'],
        dryRun: false,
        includeAggregators: true,
        limitPerSource: 25,
    });

    const resolvedWithStaleSelection = resolveRestaurantCrawlerRunDraft({
        selectedSourceIds: ['ghost-source'],
        dryRun: true,
        includeAggregators: false,
        limitPerSource: 10,
    }, sourceCatalog);

    assert.deepEqual(resolvedWithStaleSelection, {
        selectedSourceIds: ['wendys', 'chipotle'],
        dryRun: true,
        includeAggregators: false,
        limitPerSource: 10,
    });
});

test('loadRestaurantCrawlerRunDraft falls back to the default crawler draft when persisted state is malformed', () => {
    const storageAdapter = createStorageAdapter({
        [RESTAURANT_CRAWLER_RUN_DRAFT_STORAGE_KEY]: '{not valid json}',
    });

    assert.deepEqual(loadRestaurantCrawlerRunDraft(storageAdapter), DEFAULT_RESTAURANT_CRAWLER_RUN_DRAFT);
});
