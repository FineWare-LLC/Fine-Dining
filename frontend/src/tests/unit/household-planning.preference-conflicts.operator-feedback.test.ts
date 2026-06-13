// @ts-nocheck
import assert from 'node:assert/strict';
import test from 'node:test';

import { buildHouseholdPlanningPreferencesFeedbackState } from '../../utils/householdPlanningPreferencesFeedback';

const buildValidPlanningDefaults = () => ({
    mealsPerDay: 3,
    planDurationDays: 7,
    budgetPerDay: 20,
    budgetPerWeek: 140,
    mealSlots: ['BREAKFAST', 'LUNCH', 'DINNER'],
});

test('buildHouseholdPlanningPreferencesFeedbackState reports loading feedback with stable layout spacing', () => {
    assert.deepEqual(buildHouseholdPlanningPreferencesFeedbackState({
        isLoading: true,
        loadingMessage: 'Checking household planning preferences...',
    }), {
        state: 'loading',
        message: 'Checking household planning preferences...',
        role: 'status',
        ariaLive: 'polite',
        minHeight: 56,
        showSpinner: true,
    });
});

test('buildHouseholdPlanningPreferencesFeedbackState reports empty, success, and error states accessibly', () => {
    assert.deepEqual(buildHouseholdPlanningPreferencesFeedbackState({}), {
        state: 'empty',
        message: 'Set household planning preferences to compare conflicts.',
        role: 'status',
        ariaLive: 'polite',
        minHeight: 56,
        showSpinner: false,
    });

    assert.deepEqual(buildHouseholdPlanningPreferencesFeedbackState({
        planningDefaults: buildValidPlanningDefaults(),
    }), {
        state: 'success',
        message: 'Household planning preferences are ready to review.',
        role: 'status',
        ariaLive: 'polite',
        minHeight: 56,
        showSpinner: false,
    });

    assert.deepEqual(buildHouseholdPlanningPreferencesFeedbackState({
        planningDefaults: {
            budgetPerDay: 20,
            budgetPerWeek: 100,
        },
    }), {
        state: 'error',
        message: 'Daily and weekly household budget preferences must agree.',
        role: 'alert',
        ariaLive: 'assertive',
        minHeight: 56,
        showSpinner: false,
    });
});
