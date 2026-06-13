// @ts-nocheck
import assert from 'node:assert/strict';
import test from 'node:test';
import {
    ActiveMealPlanSelectionError,
    getPlanIdFromQuery,
    resolveActiveMealPlanSelection,
} from '../../utils/activeMealPlan';

test('resolveActiveMealPlanSelection rejects repeated query arrays as invalid payloads', () => {
    const resolved = resolveActiveMealPlanSelection({
        mealPlanId: [' ', 'meal-plan-42'],
        planId: ['meal-plan-42'],
    });

    assert.equal(resolved.status, 'invalid');
    assert.equal(resolved.planId, null);
    assert.equal(resolved.error instanceof ActiveMealPlanSelectionError, true);
    assert.equal(resolved.error.code, 'invalid');
    assert.equal(
        resolved.error.message,
        'We could not identify the selected meal plan. Please open the planner again.',
    );
    assert.equal(getPlanIdFromQuery({
        mealPlanId: [' ', 'meal-plan-42'],
        planId: ['meal-plan-42'],
    }), null);
});

test('resolveActiveMealPlanSelection rejects conflicting aliases with a typed, user-safe error', () => {
    const resolved = resolveActiveMealPlanSelection({
        mealPlanId: 'meal-plan-42',
        planId: 'meal-plan-43',
    });

    assert.equal(resolved.status, 'conflict');
    assert.equal(resolved.planId, null);
    assert.ok(resolved.error instanceof ActiveMealPlanSelectionError);
    assert.equal(resolved.error.code, 'conflict');
    assert.equal(resolved.error.message, 'Open only one meal plan link at a time.');
    assert.equal(resolved.error.isUserSafe, true);
    assert.equal(getPlanIdFromQuery({
        mealPlanId: 'meal-plan-42',
        planId: 'meal-plan-43',
    }), null);
});
