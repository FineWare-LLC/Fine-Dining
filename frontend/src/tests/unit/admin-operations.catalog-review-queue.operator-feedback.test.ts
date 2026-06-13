// @ts-nocheck
import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import {
    buildCatalogReviewQueueFeedbackContainerStyles,
    buildCatalogReviewQueueFeedbackState,
} from '../../utils/catalogReviewQueueFeedback.ts';

const crawlerControlPanelPath = fileURLToPath(
    new URL('../../components/legacy/Dashboard/CrawlerControlPanel.tsx', import.meta.url),
);
const crawlerControlPanelSource = fs.readFileSync(crawlerControlPanelPath, 'utf8');

test('buildCatalogReviewQueueFeedbackState keeps catalog review queue feedback accessible and layout-stable', () => {
    assert.deepEqual(buildCatalogReviewQueueFeedbackState({
        isLoading: true,
    }), {
        state: 'loading',
        message: 'Loading catalog review queue status...',
        role: 'status',
        ariaLive: 'polite',
        ariaBusy: 'true',
        minHeight: 56,
        showSpinner: true,
    });

    assert.deepEqual(buildCatalogReviewQueueFeedbackState({
        sources: [],
    }), {
        state: 'empty',
        message: 'No restaurant catalog review queue items are waiting yet.',
        role: 'status',
        ariaLive: 'polite',
        ariaBusy: 'false',
        minHeight: 56,
        showSpinner: false,
    });

    assert.deepEqual(buildCatalogReviewQueueFeedbackState({
        sources: [
            { id: 'wendys', restaurant: "Wendy's" },
            { id: 'chipotle', restaurant: 'Chipotle' },
        ],
    }), {
        state: 'success',
        message: 'Catalog review queue is ready with 2 sources.',
        role: 'status',
        ariaLive: 'polite',
        ariaBusy: 'false',
        minHeight: 56,
        showSpinner: false,
    });

    assert.deepEqual(buildCatalogReviewQueueFeedbackState({
        sources: [{ id: 'wendys', restaurant: "Wendy's" }],
        errorMessage: 'Crawler API is not reachable at https://crawler.example.test.',
    }), {
        state: 'error',
        message: 'Crawler API is not reachable at https://crawler.example.test.',
        role: 'alert',
        ariaLive: 'assertive',
        ariaBusy: 'false',
        minHeight: 56,
        showSpinner: false,
    });

    assert.deepEqual(buildCatalogReviewQueueFeedbackContainerStyles('loading'), {
        bgcolor: 'transparent',
        border: '1px solid transparent',
    });

    assert.deepEqual(buildCatalogReviewQueueFeedbackContainerStyles('empty'), {
        bgcolor: 'transparent',
        border: '1px solid transparent',
    });

    assert.deepEqual(buildCatalogReviewQueueFeedbackContainerStyles('success'), {
        bgcolor: 'rgba(76, 175, 80, 0.08)',
        border: '1px solid rgba(76, 175, 80, 0.2)',
    });

    assert.deepEqual(buildCatalogReviewQueueFeedbackContainerStyles('error'), {
        bgcolor: 'rgba(244, 67, 54, 0.08)',
        border: '1px solid rgba(244, 67, 54, 0.2)',
    });
});

test('CrawlerControlPanel wires catalog review queue feedback into the restaurant review surface', () => {
    assert.match(crawlerControlPanelSource, /buildCatalogReviewQueueFeedbackState/);
    assert.match(crawlerControlPanelSource, /buildCatalogReviewQueueFeedbackContainerStyles/);
    assert.match(crawlerControlPanelSource, /catalog-review-queue-feedback/);
    assert.match(crawlerControlPanelSource, /catalogReviewQueueFeedback\.role/);
    assert.match(crawlerControlPanelSource, /catalogReviewQueueFeedback\.ariaLive/);
    assert.match(crawlerControlPanelSource, /catalogReviewQueueFeedback\.ariaBusy/);
    assert.match(crawlerControlPanelSource, /catalogReviewQueueFeedback\.showSpinner/);
});
