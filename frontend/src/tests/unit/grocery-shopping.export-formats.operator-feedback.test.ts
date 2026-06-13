// @ts-nocheck
import assert from 'node:assert/strict';
import test from 'node:test';

import {
    buildGroceryListExportFeedbackContainerStyles,
    buildGroceryListExportFeedbackState,
} from '../../utils/shoppingListFeedback';

test('buildGroceryListExportFeedbackState exposes loading, empty, success, and error export states without layout shift', () => {
    assert.deepEqual(buildGroceryListExportFeedbackState({ isLoading: true }), {
        state: 'loading',
        title: 'Preparing your grocery list export...',
        message: 'Checking selected meals and export formats.',
        role: 'status',
        ariaLive: 'polite',
        ariaBusy: 'true',
        minHeight: 56,
        showSpinner: true,
        severity: 'info',
    });

    assert.deepEqual(buildGroceryListExportFeedbackState({ selectedMealCount: 0 }), {
        state: 'empty',
        title: 'No meals selected yet.',
        message: 'Add meals to your plan before exporting a grocery list.',
        role: 'status',
        ariaLive: 'polite',
        ariaBusy: 'false',
        minHeight: 56,
        showSpinner: false,
        severity: 'info',
    });

    assert.deepEqual(buildGroceryListExportFeedbackState({ selectedMealCount: 3 }), {
        state: 'success',
        title: 'Export ready.',
        message: 'Ready to export 3 planned meals.',
        role: 'status',
        ariaLive: 'polite',
        ariaBusy: 'false',
        minHeight: 56,
        showSpinner: false,
        severity: 'success',
    });

    assert.deepEqual(buildGroceryListExportFeedbackState({ exportedItemCount: 5 }), {
        state: 'success',
        title: 'Export complete.',
        message: 'Your grocery list includes 5 ingredients.',
        role: 'status',
        ariaLive: 'polite',
        ariaBusy: 'false',
        minHeight: 56,
        showSpinner: false,
        severity: 'success',
    });

    assert.deepEqual(buildGroceryListExportFeedbackState({
        error: new Error('Planner cache unavailable'),
    }), {
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

test('buildGroceryListExportFeedbackContainerStyles keeps the export surface visually distinct by state', () => {
    assert.deepEqual(buildGroceryListExportFeedbackContainerStyles('loading'), {
        backgroundColor: 'rgba(255, 255, 255, 0.04)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
    });

    assert.deepEqual(buildGroceryListExportFeedbackContainerStyles('empty'), {
        backgroundColor: 'transparent',
        border: '1px solid transparent',
    });

    assert.deepEqual(buildGroceryListExportFeedbackContainerStyles('success'), {
        backgroundColor: 'rgba(76, 175, 80, 0.08)',
        border: '1px solid rgba(76, 175, 80, 0.2)',
    });

    assert.deepEqual(buildGroceryListExportFeedbackContainerStyles('error'), {
        backgroundColor: 'rgba(244, 67, 54, 0.08)',
        border: '1px solid rgba(244, 67, 54, 0.2)',
    });
});
