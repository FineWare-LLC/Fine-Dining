// @ts-nocheck
import assert from 'node:assert/strict';
import test from 'node:test';

import {
    buildHouseholdGuestMealsFeedbackContainerStyles,
    buildHouseholdGuestMealsFeedbackState,
} from '../../utils/householdGuestMealsFeedback';

const canonicalGuest = {
    name: 'Visiting Cousin',
    email: 'cousin@example.test',
    allergens: ['peanut', 'dairy'],
    dietaryTags: ['vegan', 'late night'],
    servingMultiplier: 2.5,
    startDate: new Date('2026-06-13T18:00:00.000Z'),
    endDate: new Date('2026-06-14T18:00:00.000Z'),
    notes: 'Needs quiet seating',
};

test('buildHouseholdGuestMealsFeedbackState reports loading feedback with stable layout spacing', () => {
    assert.deepEqual(buildHouseholdGuestMealsFeedbackState({
        isLoading: true,
        loadingMessage: 'Checking temporary guest meals...',
    }), {
        state: 'loading',
        message: 'Checking temporary guest meals...',
        role: 'status',
        ariaLive: 'polite',
        minHeight: 56,
        showSpinner: true,
    });
});

test('buildHouseholdGuestMealsFeedbackState reports empty, success, and error states accessibly', () => {
    assert.deepEqual(buildHouseholdGuestMealsFeedbackState({}), {
        state: 'empty',
        message: 'Open a household to review temporary guest meals.',
        role: 'status',
        ariaLive: 'polite',
        minHeight: 56,
        showSpinner: false,
    });

    assert.deepEqual(buildHouseholdGuestMealsFeedbackState({
        household: {
            guests: [canonicalGuest],
        },
    }), {
        state: 'success',
        message: 'Temporary guest meals are ready to review.',
        role: 'status',
        ariaLive: 'polite',
        minHeight: 56,
        showSpinner: false,
    });

    assert.deepEqual(buildHouseholdGuestMealsFeedbackState({
        household: {
            guests: [
                {
                    name: '',
                    email: 'cousin@example.test',
                },
            ],
        },
    }), {
        state: 'error',
        message: 'We could not read your temporary guest meals. Please refresh the planner.',
        role: 'alert',
        ariaLive: 'assertive',
        minHeight: 56,
        showSpinner: false,
    });
});

test('buildHouseholdGuestMealsFeedbackContainerStyles keeps temporary guest feedback visually distinct without layout shift', () => {
    assert.deepEqual(buildHouseholdGuestMealsFeedbackContainerStyles('loading'), {
        backgroundColor: 'transparent',
        border: '1px solid transparent',
    });

    assert.deepEqual(buildHouseholdGuestMealsFeedbackContainerStyles('empty'), {
        backgroundColor: 'transparent',
        border: '1px solid transparent',
    });

    assert.deepEqual(buildHouseholdGuestMealsFeedbackContainerStyles('success'), {
        backgroundColor: 'rgba(76, 175, 80, 0.08)',
        border: '1px solid rgba(76, 175, 80, 0.2)',
    });

    assert.deepEqual(buildHouseholdGuestMealsFeedbackContainerStyles('error'), {
        backgroundColor: 'rgba(244, 67, 54, 0.08)',
        border: '1px solid rgba(244, 67, 54, 0.2)',
    });
});
