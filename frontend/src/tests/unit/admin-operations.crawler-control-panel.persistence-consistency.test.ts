// @ts-nocheck
import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import {
    DEFAULT_RESTAURANT_CRAWLER_RUN_DRAFT,
    RESTAURANT_CRAWLER_RUN_DRAFT_STORAGE_KEY,
    loadRestaurantCrawlerRunDraft,
    persistRestaurantCrawlerRunDraft,
} from '../../utils/restaurantCrawlerRun.ts';

const pagePath = fileURLToPath(new URL('../../pages/admin/crawler.tsx', import.meta.url));
const componentPath = fileURLToPath(
    new URL('../../components/legacy/Dashboard/CrawlerControlPanel.tsx', import.meta.url),
);
const pageSource = fs.readFileSync(pagePath, 'utf8');
const componentSource = fs.readFileSync(componentPath, 'utf8');

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

test('persistRestaurantCrawlerRunDraft and loadRestaurantCrawlerRunDraft keep the canonical crawler draft aligned with the current source catalog', () => {
    const storageAdapter = createStorageAdapter();
    const sourceCatalog = [
        { id: 'wendys', source_type: 'official' },
        { id: 'chipotle', source_type: 'official' },
        { id: 'doordash', source_type: 'aggregator' },
    ];

    const canonicalDraft = persistRestaurantCrawlerRunDraft(
        storageAdapter,
        {
            selectedSourceIds: ['ghost-source', 'wendys', 'ghost-source'],
            dryRun: false,
            includeAggregators: false,
            limitPerSource: '25',
        },
        sourceCatalog,
    );

    assert.deepEqual(canonicalDraft, {
        selectedSourceIds: ['wendys'],
        dryRun: false,
        includeAggregators: false,
        limitPerSource: 25,
    });
    assert.equal(
        storageAdapter.state[RESTAURANT_CRAWLER_RUN_DRAFT_STORAGE_KEY],
        JSON.stringify(canonicalDraft),
    );

    const refreshedDraft = loadRestaurantCrawlerRunDraft(storageAdapter, sourceCatalog);

    assert.deepEqual(refreshedDraft, canonicalDraft);
    assert.notDeepEqual(refreshedDraft, DEFAULT_RESTAURANT_CRAWLER_RUN_DRAFT);
});

test('Crawler control panel re-persist the canonical crawler draft against the live source catalog after refresh', () => {
    assert.match(
        pageSource,
        /persistRestaurantCrawlerRunDraft\(\s*storage\.localStorage,\s*\{\s*selectedSourceIds,\s*dryRun,\s*includeAggregators,\s*limitPerSource,\s*\},\s*sources\s*\)/s,
    );
    assert.match(
        pageSource,
        /\[\s*draftHydrated,\s*dryRun,\s*includeAggregators,\s*limitPerSource,\s*selectedSourceIds,\s*sources\s*\]/s,
    );
    assert.match(
        componentSource,
        /persistRestaurantCrawlerRunDraft\(\s*storage\.localStorage,\s*\{\s*selectedSourceIds,\s*dryRun,\s*includeAggregators,\s*limitPerSource,\s*\},\s*sources\s*\)/s,
    );
    assert.match(
        componentSource,
        /\[\s*draftHydrated,\s*dryRun,\s*includeAggregators,\s*limitPerSource,\s*selectedSourceIds,\s*sources\s*\]/s,
    );
});
