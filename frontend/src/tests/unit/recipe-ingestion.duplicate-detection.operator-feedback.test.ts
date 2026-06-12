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

test('buildCrawlerQueueFeedbackState reports duplicate-detection failures as alerts', () => {
    assert.deepEqual(
        buildCrawlerQueueFeedbackState({
            recipeStatus: makeRecipeStatus({
                queue_done: 14,
                queue_failed: 2,
                errors: 2,
                last_error: 'Duplicate recipe source: fine-dining-original-seed:lemon-herb-chicken-quinoa-bowls',
            }),
        }),
        {
            state: 'error',
            message: 'Recipe crawler reported 2 failed recipes. Review duplicate title, ingredient, and source checks.',
            role: 'alert',
            ariaLive: 'assertive',
            minHeight: 56,
            showSpinner: false,
        },
    );
});

test('buildCrawlerQueueFeedbackContainerStyles keeps duplicate-detection error state visually distinct without layout shift', () => {
    assert.deepEqual(buildCrawlerQueueFeedbackContainerStyles('error'), {
        backgroundColor: 'rgba(244, 67, 54, 0.08)',
        border: '1px solid rgba(244, 67, 54, 0.2)',
    });
});
