// @ts-nocheck
import assert from 'node:assert/strict';
import test from 'node:test';

import {
    buildHouseholdMemberServingsFeedbackContainerStyles,
    buildHouseholdMemberServingsFeedbackState,
} from '../../utils/householdMemberServingsFeedback';

test('buildHouseholdMemberServingsFeedbackState reports loading feedback with stable layout spacing', () => {
    assert.deepEqual(buildHouseholdMemberServingsFeedbackState({
        isLoading: true,
        loadingMessage: 'Checking per-member servings...',
    }), {
        state: 'loading',
        message: 'Checking per-member servings...',
        role: 'status',
        ariaLive: 'polite',
        minHeight: 56,
        showSpinner: true,
    });
});

test('buildHouseholdMemberServingsFeedbackState reports empty, success, and error states accessibly', () => {
    assert.deepEqual(buildHouseholdMemberServingsFeedbackState({}), {
        state: 'empty',
        message: 'Open a household to review per-member servings.',
        role: 'status',
        ariaLive: 'polite',
        minHeight: 56,
        showSpinner: false,
    });

    assert.deepEqual(buildHouseholdMemberServingsFeedbackState({
        household: {
            members: [
                {
                    user: { id: 'owner-1' },
                    role: 'OWNER',
                    servingMultiplier: 1,
                    includeInPlanning: true,
                },
                {
                    user: { id: 'member-2' },
                    role: 'MEMBER',
                    servingMultiplier: 0.5,
                    includeInPlanning: true,
                },
            ],
            guests: [
                {
                    name: 'Guest One',
                    servingMultiplier: 2,
                },
            ],
        },
    }), {
        state: 'success',
        message: 'Per-member serving counts are ready to review.',
        role: 'status',
        ariaLive: 'polite',
        minHeight: 56,
        showSpinner: false,
    });

    assert.deepEqual(buildHouseholdMemberServingsFeedbackState({
        household: {
            members: 'invalid',
            guests: [],
        },
    }), {
        state: 'error',
        message: 'We could not read your per-member servings. Please refresh the household.',
        role: 'alert',
        ariaLive: 'assertive',
        minHeight: 56,
        showSpinner: false,
    });
});

test('buildHouseholdMemberServingsFeedbackContainerStyles keeps per-member servings feedback visually distinct without layout shift', () => {
    assert.deepEqual(buildHouseholdMemberServingsFeedbackContainerStyles('loading'), {
        backgroundColor: 'transparent',
        border: '1px solid transparent',
    });

    assert.deepEqual(buildHouseholdMemberServingsFeedbackContainerStyles('empty'), {
        backgroundColor: 'transparent',
        border: '1px solid transparent',
    });

    assert.deepEqual(buildHouseholdMemberServingsFeedbackContainerStyles('success'), {
        backgroundColor: 'rgba(76, 175, 80, 0.08)',
        border: '1px solid rgba(76, 175, 80, 0.2)',
    });

    assert.deepEqual(buildHouseholdMemberServingsFeedbackContainerStyles('error'), {
        backgroundColor: 'rgba(244, 67, 54, 0.08)',
        border: '1px solid rgba(244, 67, 54, 0.2)',
    });
});
