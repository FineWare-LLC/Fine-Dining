// @ts-nocheck
import assert from 'node:assert/strict';
import test from 'node:test';
import {
    ActiveMealPlanSelectionError,
    getPlanIdFromQuery,
    resolveActiveMealPlanSelection,
} from '../../utils/activeMealPlan';

test('resolveActiveMealPlanSelection rejects array-valued meal plan query params before choosing a plan', () => {
    const selection = resolveActiveMealPlanSelection({
        mealPlanId: ['alpha', 'beta'],
    });

    assert.equal(selection.status, 'invalid');
    assert.equal(selection.planId, null);
    assert.ok(selection.error instanceof ActiveMealPlanSelectionError);
    assert.equal(selection.error.code, 'invalid');
    assert.equal(
        selection.error.message,
        'We could not identify the selected meal plan. Please open the planner again.',
    );
    assert.equal(selection.error.isUserSafe, true);
    assert.equal(getPlanIdFromQuery({ mealPlanId: ['alpha', 'beta'] }), null);
});

test('resolveActiveMealPlanSelection rejects conflicting plan query values instead of guessing', () => {
    const selection = resolveActiveMealPlanSelection({
        mealPlanId: 'alpha',
        planId: 'beta',
    });

    assert.equal(selection.status, 'conflict');
    assert.equal(selection.planId, null);
    assert.ok(selection.error instanceof ActiveMealPlanSelectionError);
    assert.equal(selection.error.code, 'conflict');
    assert.equal(
        selection.error.message,
        'Open only one meal plan link at a time.',
    );
    assert.equal(selection.error.isUserSafe, true);
    assert.equal(getPlanIdFromQuery({ mealPlanId: 'alpha', planId: 'beta' }), null);
});
