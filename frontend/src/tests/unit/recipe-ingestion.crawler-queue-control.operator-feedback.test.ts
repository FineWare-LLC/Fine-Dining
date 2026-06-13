// @ts-nocheck
import assert from 'node:assert/strict';
import test from 'node:test';
import {
    buildCrawlerQueueFeedbackContainerStyles,
    buildCrawlerQueueFeedbackState,
} from '../../utils/crawlerQueueFeedback.ts';

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
            recipeStatus: {
                running: false,
                queue_pending: 0,
                queue_processing: 0,
                queue_done: 0,
                queue_failed: 0,
            },
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
            recipeStatus: {
                running: true,
                queue_pending: 3,
                queue_processing: 1,
                queue_done: 5,
                queue_failed: 0,
            },
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

test('buildCrawlerQueueFeedbackState reports crawl queue failures as alerts', () => {
    assert.deepEqual(
        buildCrawlerQueueFeedbackState({
            errorMessage: 'Crawler API is temporarily unavailable. Please try again.',
        }),
        {
            state: 'error',
            message: 'Crawler API is temporarily unavailable. Please try again.',
            role: 'alert',
            ariaLive: 'assertive',
            minHeight: 56,
            showSpinner: false,
        },
    );
});

test('buildCrawlerQueueFeedbackContainerStyles keeps crawler feedback visually distinct without layout shift', () => {
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
