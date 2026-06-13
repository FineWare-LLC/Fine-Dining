// @ts-nocheck
import assert from 'node:assert/strict';
import test from 'node:test';

import { validateHouseholdPlanningPreferences } from '../../utils/householdPlanningPreferences';

const buildPlanningDefaults = () => ({
    mealsPerDay: 3,
    planDurationDays: 7,
    budgetPerDay: 20,
    budgetPerWeek: 140,
    mealSlots: ['BREAKFAST', 'LUNCH', 'DINNER'],
});

test('validateHouseholdPlanningPreferences keeps planning defaults stable across refresh', () => {
    const planningDefaults = buildPlanningDefaults();
    const persistedSnapshot = validateHouseholdPlanningPreferences(planningDefaults);

    planningDefaults.mealSlots.push('SNACK');

    const refreshedSnapshot = validateHouseholdPlanningPreferences(buildPlanningDefaults());

    assert.equal(persistedSnapshot.valid, true);
    assert.equal(refreshedSnapshot.valid, true);
    assert.deepEqual(persistedSnapshot.planningDefaults, refreshedSnapshot.planningDefaults);
    assert.deepEqual(persistedSnapshot.planningDefaults.mealSlots, ['BREAKFAST', 'LUNCH', 'DINNER']);
});
