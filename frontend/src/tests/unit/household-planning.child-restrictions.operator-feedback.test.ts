// @ts-nocheck
import assert from 'node:assert/strict';
import test from 'node:test';

import {
    buildHouseholdChildRestrictionsFeedbackContainerStyles,
    buildHouseholdChildRestrictionsFeedbackState,
} from '../../utils/householdChildRestrictionsFeedback';

const buildValidChildRestrictionUser = () => ({
    dietaryRestrictions: [' Vegetarian ', ' gluten_free '],
    questionnaire: {
        dietaryPattern: ' mediterranean ',
    },
    dietaryProfile: {
        diets: [' vegan '],
        preferredCuisines: [' Italian '],
    },
    foodGoals: ['High protein'],
});

test('buildHouseholdChildRestrictionsFeedbackState reports loading feedback with stable layout spacing', () => {
    assert.deepEqual(buildHouseholdChildRestrictionsFeedbackState({
        isLoading: true,
        loadingMessage: 'Checking child restriction settings...',
    }), {
        state: 'loading',
        message: 'Checking child restriction settings...',
        role: 'status',
        ariaLive: 'polite',
        minHeight: 56,
        showSpinner: true,
    });
});

test('buildHouseholdChildRestrictionsFeedbackState reports empty, success, and error states accessibly', () => {
    assert.deepEqual(buildHouseholdChildRestrictionsFeedbackState({}), {
        state: 'empty',
        message: 'Open a household to review child restrictions.',
        role: 'status',
        ariaLive: 'polite',
        minHeight: 56,
        showSpinner: false,
    });

    assert.deepEqual(buildHouseholdChildRestrictionsFeedbackState({
        user: buildValidChildRestrictionUser(),
    }), {
        state: 'success',
        message: 'Child restriction settings are ready to review.',
        role: 'status',
        ariaLive: 'polite',
        minHeight: 56,
        showSpinner: false,
    });

    assert.deepEqual(buildHouseholdChildRestrictionsFeedbackState({
        user: {
            dietaryRestrictions: ['vegetarian', 42],
        },
    }), {
        state: 'error',
        message: 'We could not read your child restriction settings. Please refresh the planner.',
        role: 'alert',
        ariaLive: 'assertive',
        minHeight: 56,
        showSpinner: false,
    });
});

test('buildHouseholdChildRestrictionsFeedbackContainerStyles keeps child restriction feedback visually distinct without layout shift', () => {
    assert.deepEqual(buildHouseholdChildRestrictionsFeedbackContainerStyles('loading'), {
        backgroundColor: 'transparent',
        border: '1px solid transparent',
    });

    assert.deepEqual(buildHouseholdChildRestrictionsFeedbackContainerStyles('empty'), {
        backgroundColor: 'transparent',
        border: '1px solid transparent',
    });

    assert.deepEqual(buildHouseholdChildRestrictionsFeedbackContainerStyles('success'), {
        backgroundColor: 'rgba(76, 175, 80, 0.08)',
        border: '1px solid rgba(76, 175, 80, 0.2)',
    });

    assert.deepEqual(buildHouseholdChildRestrictionsFeedbackContainerStyles('error'), {
        backgroundColor: 'rgba(244, 67, 54, 0.08)',
        border: '1px solid rgba(244, 67, 54, 0.2)',
    });
});
