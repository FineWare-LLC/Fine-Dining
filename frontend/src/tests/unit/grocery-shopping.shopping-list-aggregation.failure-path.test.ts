// @ts-nocheck
import assert from 'node:assert/strict';
import test from 'node:test';
import { GroceryListAggregationValidationError } from '../../utils/shoppingListAggregation';
import { buildGroceryListExportFeedbackState } from '../../utils/shoppingListFeedback';

test('buildGroceryListExportFeedbackState collapses unexpected grocery export failures into a recoverable alert', () => {
    const feedbackState = buildGroceryListExportFeedbackState({
        error: new Error('Planner cache unavailable'),
    });

    assert.deepEqual(feedbackState, {
        state: 'error',
        title: 'Export unavailable.',
        message: 'We could not build your grocery list. Please refresh the planner.',
        role: 'alert',
        ariaLive: 'assertive',
        ariaBusy: 'false',
        minHeight: 56,
        showSpinner: false,
        severity: 'error',
    });
});

test('buildGroceryListExportFeedbackState preserves user-safe grocery aggregation errors', () => {
    const feedbackState = buildGroceryListExportFeedbackState({
        error: new GroceryListAggregationValidationError(
            'invalidPayload',
            'We could not read your grocery list. Please refresh the planner.',
        ),
    });

    assert.deepEqual(feedbackState, {
        state: 'error',
        title: 'Export unavailable.',
        message: 'We could not read your grocery list. Please refresh the planner.',
        role: 'alert',
        ariaLive: 'assertive',
        ariaBusy: 'false',
        minHeight: 56,
        showSpinner: false,
        severity: 'error',
    });
});
