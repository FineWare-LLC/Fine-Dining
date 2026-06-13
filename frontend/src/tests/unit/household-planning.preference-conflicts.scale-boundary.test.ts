// @ts-nocheck
import assert from 'node:assert/strict';
import test from 'node:test';

import {
    HouseholdPlanningPreferencesValidationError,
    validateHouseholdPlanningPreferences,
} from '../../utils/householdPlanningPreferences';

const LARGE_MEAL_SLOT_COUNT = 4096;

const buildPoisonedMealSlots = () => {
    const mealSlots = Array.from({ length: LARGE_MEAL_SLOT_COUNT }, (_, index) => (
        `MEAL-${String(index + 1).padStart(4, '0')}`
    ));
    let tailReads = 0;

    Object.defineProperty(mealSlots, LARGE_MEAL_SLOT_COUNT - 1, {
        configurable: true,
        get() {
            tailReads += 1;
            return 'DESSERT';
        },
    });

    return {
        mealSlots,
        getTailReads: () => tailReads,
    };
};

test('validateHouseholdPlanningPreferences short-circuits huge conflicting meal slot payloads before reading the tail', () => {
    const { mealSlots, getTailReads } = buildPoisonedMealSlots();
    const planningDefaults = {
        mealsPerDay: 3,
        planDurationDays: 7,
        budgetPerDay: 20,
        budgetPerWeek: 100,
        mealSlots,
    };

    const result = validateHouseholdPlanningPreferences(planningDefaults);

    assert.equal(result.valid, false);
    assert.ok(result.error instanceof HouseholdPlanningPreferencesValidationError);
    assert.equal(result.error.code, 'conflictingBudgetPreferences');
    assert.equal(result.error.message, 'Daily and weekly household budget preferences must agree.');
    assert.equal(result.error.isUserSafe, true);
    assert.equal(getTailReads(), 0);
    assert.equal(planningDefaults.mealSlots.length, LARGE_MEAL_SLOT_COUNT);
});
