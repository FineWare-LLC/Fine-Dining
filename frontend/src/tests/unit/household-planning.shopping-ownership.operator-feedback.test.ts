// @ts-nocheck
import assert from 'node:assert/strict';
import test from 'node:test';

import {
    buildHouseholdShoppingOwnershipFeedbackContainerStyles,
    buildHouseholdShoppingOwnershipFeedbackState,
} from '../../utils/householdShoppingOwnershipFeedback';

test('buildHouseholdShoppingOwnershipFeedbackState reports loading feedback with stable layout spacing', () => {
    assert.deepEqual(buildHouseholdShoppingOwnershipFeedbackState({
        isLoading: true,
        loadingMessage: 'Checking shopping ownership...',
    }), {
        state: 'loading',
        message: 'Checking shopping ownership...',
        role: 'status',
        ariaLive: 'polite',
        minHeight: 56,
        showSpinner: true,
    });
});

test('buildHouseholdShoppingOwnershipFeedbackState reports empty, success, and error states accessibly', () => {
    assert.deepEqual(buildHouseholdShoppingOwnershipFeedbackState({}), {
        state: 'empty',
        message: 'Open a household to review shopping ownership.',
        role: 'status',
        ariaLive: 'polite',
        minHeight: 56,
        showSpinner: false,
    });

    assert.deepEqual(buildHouseholdShoppingOwnershipFeedbackState({
        household: {
            shoppingOwnership: {
                userId: 'member-42',
                assignedAt: '2026-06-13T19:00:00.000Z',
            },
        },
    }), {
        state: 'success',
        message: 'Your shopping ownership assignment is ready to review.',
        role: 'status',
        ariaLive: 'polite',
        minHeight: 56,
        showSpinner: false,
    });

    assert.deepEqual(buildHouseholdShoppingOwnershipFeedbackState({
        household: {
            shoppingOwnership: {
                userId: 'member-42',
                assignedAt: 'not-a-date',
            },
        },
    }), {
        state: 'error',
        message: 'We could not read your shopping ownership assignment. Please refresh the planner.',
        role: 'alert',
        ariaLive: 'assertive',
        minHeight: 56,
        showSpinner: false,
    });
});

test('buildHouseholdShoppingOwnershipFeedbackContainerStyles keeps shopping ownership feedback visually distinct without layout shift', () => {
    assert.deepEqual(buildHouseholdShoppingOwnershipFeedbackContainerStyles('loading'), {
        backgroundColor: 'transparent',
        border: '1px solid transparent',
    });

    assert.deepEqual(buildHouseholdShoppingOwnershipFeedbackContainerStyles('empty'), {
        backgroundColor: 'transparent',
        border: '1px solid transparent',
    });

    assert.deepEqual(buildHouseholdShoppingOwnershipFeedbackContainerStyles('success'), {
        backgroundColor: 'rgba(76, 175, 80, 0.08)',
        border: '1px solid rgba(76, 175, 80, 0.2)',
    });

    assert.deepEqual(buildHouseholdShoppingOwnershipFeedbackContainerStyles('error'), {
        backgroundColor: 'rgba(244, 67, 54, 0.08)',
        border: '1px solid rgba(244, 67, 54, 0.2)',
    });
});
