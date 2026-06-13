// @ts-nocheck
import assert from 'node:assert/strict';
import test from 'node:test';

import {
    HouseholdPlanningPreferencesValidationError,
    validateHouseholdPlanningPreferences,
} from '../../utils/householdPlanningPreferences';

const buildValidPlanningDefaults = () => ({
    mealsPerDay: 3,
    planDurationDays: 7,
    budgetPerDay: 20,
    budgetPerWeek: 140,
    mealSlots: ['BREAKFAST', 'LUNCH', 'DINNER'],
});

test('validateHouseholdPlanningPreferences accepts matching household budget preferences', () => {
    const planningDefaults = buildValidPlanningDefaults();

    const result = validateHouseholdPlanningPreferences(planningDefaults);

    assert.equal(result.valid, true);
    assert.deepEqual(result.planningDefaults, planningDefaults);
    assert.equal(result.error, null);
});

test('validateHouseholdPlanningPreferences rejects conflicting budget preferences with a typed, user-safe error', () => {
    const result = validateHouseholdPlanningPreferences({
        budgetPerDay: 20,
        budgetPerWeek: 100,
    });

    assert.equal(result.valid, false);
    assert.ok(result.error instanceof HouseholdPlanningPreferencesValidationError);
    assert.equal(result.error.code, 'conflictingBudgetPreferences');
    assert.equal(result.error.message, 'Daily and weekly household budget preferences must agree.');
    assert.equal(result.error.isUserSafe, true);
});

test('validateHouseholdPlanningPreferences rejects malformed payloads with a typed, user-safe error', () => {
    const result = validateHouseholdPlanningPreferences(null);

    assert.equal(result.valid, false);
    assert.ok(result.error instanceof HouseholdPlanningPreferencesValidationError);
    assert.equal(result.error.code, 'invalidPayload');
    assert.equal(
        result.error.message,
        'We could not read your household planning preferences. Please refresh the planner.',
    );
    assert.equal(result.error.isUserSafe, true);
});
