// @ts-nocheck
import assert from 'node:assert/strict';
import test from 'node:test';
import { buildMealPlanOptimizerFeedbackState } from '../../utils/mealPlanningEmptyStates';

const fallbackOptimizedMealPlan = {
    meals: [
        {
            mealId: 'meal-1',
            mealName: 'Fallback Bowl',
            servings: 1,
            pricePerServing: 11.5,
            totalPrice: 11.5,
        },
    ],
    totalCost: 11.5,
    totalNutrition: {
        carbohydrates: 42,
        protein: 28,
        fat: 12,
        sodium: 390,
    },
    warnings: [
        'Using fallback recipe catalog due to unavailable database connection',
    ],
};

test('buildMealPlanOptimizerFeedbackState keeps fallback warnings visible on the success surface', () => {
    const feedback = buildMealPlanOptimizerFeedbackState({
        selectedMeals: ['meal-1'],
        optimizedMealPlan: fallbackOptimizedMealPlan,
    });

    assert.equal(feedback.kind, 'success');
    assert.equal(feedback.role, 'status');
    assert.equal(feedback.ariaLive, 'polite');
    assert.equal(feedback.ariaBusy, false);
    assert.equal(feedback.minHeight, 72);
    assert.equal(feedback.showSpinner, false);
    assert.equal(feedback.displayState.shouldRenderOptimizedMealPlan, true);
    assert.deepEqual(feedback.warnings, [
        'Using fallback recipe catalog due to unavailable database connection',
    ]);
});
