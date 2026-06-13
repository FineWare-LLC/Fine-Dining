// @ts-nocheck
import assert from 'node:assert/strict';
import test from 'node:test';

import {
    buildCrawlerQueueFeedbackContainerStyles,
    buildCrawlerQueueFeedbackState,
} from '../../utils/crawlerQueueFeedback.ts';

function makeRecipeStatus(overrides = {}) {
    return {
        running: false,
        queue_pending: 0,
        queue_processing: 0,
        queue_done: 0,
        queue_failed: 0,
        errors: 0,
        last_error: '',
        ...overrides,
    };
}

test('buildCrawlerQueueFeedbackState reports loading feedback with stable layout spacing', () => {
    assert.deepEqual(buildCrawlerQueueFeedbackState({ isLoading: true }), {
        state: 'loading',
        message: 'Loading recipe queue status...',
        role: 'status',
        ariaLive: 'polite',
        minHeight: 56,
        showSpinner: true,
    });
});

test('buildCrawlerQueueFeedbackState reports the empty crawler queue with stable layout spacing', () => {
    assert.deepEqual(
        buildCrawlerQueueFeedbackState({
            recipeStatus: makeRecipeStatus(),
        }),
        {
            state: 'empty',
            message: 'No recipe crawl jobs are queued yet.',
            role: 'status',
            ariaLive: 'polite',
            minHeight: 56,
            showSpinner: false,
        },
    );
});

test('buildCrawlerQueueFeedbackState reports active crawler work as a readable success handoff', () => {
    assert.deepEqual(
        buildCrawlerQueueFeedbackState({
            recipeStatus: makeRecipeStatus({
                running: true,
                queue_pending: 3,
                queue_processing: 1,
                queue_done: 5,
            }),
        }),
        {
            state: 'success',
            message: 'Recipe crawler is running with 3 queued, 1 processing, 5 complete, and 0 failed.',
            role: 'status',
            ariaLive: 'polite',
            minHeight: 56,
            showSpinner: false,
        },
    );
});

test('buildCrawlerQueueFeedbackState reports full-meal completeness failures as alerts', () => {
    assert.deepEqual(
        buildCrawlerQueueFeedbackState({
            recipeStatus: makeRecipeStatus({
                queue_done: 14,
                queue_failed: 2,
                errors: 2,
                last_error: 'Invalid recipe payload: expected at least 6 ingredients for a full meal.',
            }),
        }),
        {
            state: 'error',
            message: 'Recipe crawler reported 2 failed recipes. Review full-meal completeness and extraction details.',
            role: 'alert',
            ariaLive: 'assertive',
            minHeight: 56,
            showSpinner: false,
        },
    );
});

test('buildCrawlerQueueFeedbackContainerStyles keeps recipe ingestion feedback visually distinct without layout shift', () => {
    assert.deepEqual(buildCrawlerQueueFeedbackContainerStyles('loading'), {
        backgroundColor: 'transparent',
        border: '1px solid transparent',
    });

    assert.deepEqual(buildCrawlerQueueFeedbackContainerStyles('empty'), {
        backgroundColor: 'transparent',
        border: '1px solid transparent',
    });

    assert.deepEqual(buildCrawlerQueueFeedbackContainerStyles('success'), {
        backgroundColor: 'rgba(76, 175, 80, 0.08)',
        border: '1px solid rgba(76, 175, 80, 0.2)',
    });

    assert.deepEqual(buildCrawlerQueueFeedbackContainerStyles('error'), {
        backgroundColor: 'rgba(244, 67, 54, 0.08)',
        border: '1px solid rgba(244, 67, 54, 0.2)',
    });
});
