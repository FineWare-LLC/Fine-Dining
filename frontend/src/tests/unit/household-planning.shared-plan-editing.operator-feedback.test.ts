// @ts-nocheck
import assert from 'node:assert/strict';
import test from 'node:test';

import {
    buildHouseholdSharedPlanEditingFeedbackContainerStyles,
    buildHouseholdSharedPlanEditingFeedbackState,
} from '../../utils/householdSharedPlanEditingFeedback';

test('buildHouseholdSharedPlanEditingFeedbackState reports loading feedback with stable layout spacing', () => {
    assert.deepEqual(buildHouseholdSharedPlanEditingFeedbackState({
        isLoading: true,
        loadingMessage: 'Checking your shared plan...',
    }), {
        state: 'loading',
        message: 'Checking your shared plan...',
        role: 'status',
        ariaLive: 'polite',
        minHeight: 56,
        showSpinner: true,
    });
});

test('buildHouseholdSharedPlanEditingFeedbackState reports empty, success, and error states accessibly', () => {
    assert.deepEqual(buildHouseholdSharedPlanEditingFeedbackState({}), {
        state: 'empty',
        message: 'Open a household to edit the shared plan.',
        role: 'status',
        ariaLive: 'polite',
        minHeight: 56,
        showSpinner: false,
    });

    assert.deepEqual(buildHouseholdSharedPlanEditingFeedbackState({
        hasSharedPlan: true,
    }), {
        state: 'success',
        message: 'Your shared plan is ready to edit.',
        role: 'status',
        ariaLive: 'polite',
        minHeight: 56,
        showSpinner: false,
    });

    assert.deepEqual(buildHouseholdSharedPlanEditingFeedbackState({
        errorMessage: 'Could not load your shared plan. Please try again.',
    }), {
        state: 'error',
        message: 'Could not load your shared plan. Please try again.',
        role: 'alert',
        ariaLive: 'assertive',
        minHeight: 56,
        showSpinner: false,
    });
});

test('buildHouseholdSharedPlanEditingFeedbackContainerStyles keeps shared plan feedback visually distinct without layout shift', () => {
    assert.deepEqual(buildHouseholdSharedPlanEditingFeedbackContainerStyles('loading'), {
        backgroundColor: 'transparent',
        border: '1px solid transparent',
    });

    assert.deepEqual(buildHouseholdSharedPlanEditingFeedbackContainerStyles('empty'), {
        backgroundColor: 'transparent',
        border: '1px solid transparent',
    });

    assert.deepEqual(buildHouseholdSharedPlanEditingFeedbackContainerStyles('success'), {
        backgroundColor: 'rgba(76, 175, 80, 0.08)',
        border: '1px solid rgba(76, 175, 80, 0.2)',
    });

    assert.deepEqual(buildHouseholdSharedPlanEditingFeedbackContainerStyles('error'), {
        backgroundColor: 'rgba(244, 67, 54, 0.08)',
        border: '1px solid rgba(244, 67, 54, 0.2)',
    });
});
