// @ts-nocheck
import assert from 'node:assert/strict';
import test from 'node:test';
import { buildMealPlanOptimizerFeedbackState } from '../../utils/mealPlanningEmptyStates';

const validOptimizedMealPlan = {
    meals: [
        {
            mealId: 'meal-1',
            mealName: 'Balanced Bowl',
            servings: 1,
            pricePerServing: 12.5,
            totalPrice: 12.5,
        },
    ],
    totalCost: 12.5,
    totalNutrition: {
        carbohydrates: 45,
        protein: 30,
        fat: 14,
        sodium: 420,
    },
};

test('buildMealPlanOptimizerFeedbackState keeps the success optimizer state accessible and stable', () => {
    const success = buildMealPlanOptimizerFeedbackState({
        selectedMeals: ['meal-1'],
        optimizedMealPlan: validOptimizedMealPlan,
    });

    assert.equal(success.kind, 'success');
    assert.equal(success.role, 'status');
    assert.equal(success.ariaLive, 'polite');
    assert.equal(success.ariaBusy, false);
    assert.equal(success.minHeight, 72);
    assert.equal(success.showSpinner, false);
    assert.equal(success.displayState.shouldRenderOptimizedMealPlan, true);
    assert.equal(success.displayState.emptyState.status, 'resolved');
});
