// @ts-nocheck
import assert from 'node:assert/strict';
import test from 'node:test';
import { buildMealPlanOptimizerFeedbackState } from '../../utils/mealPlanningEmptyStates';

const optimizedMealPlan = {
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
};

test('buildMealPlanOptimizerFeedbackState keeps success warnings canonical across refresh variants', () => {
    const first = buildMealPlanOptimizerFeedbackState({
        selectedMeals: ['meal-1'],
        optimizedMealPlan: {
            ...optimizedMealPlan,
            warnings: [
                'Using fallback recipe catalog due to unavailable database connection',
                'Solver ended with status TIMELIMIT_FEASIBLE',
            ],
        },
    });

    const second = buildMealPlanOptimizerFeedbackState({
        selectedMeals: ['meal-1'],
        optimizedMealPlan: {
            ...optimizedMealPlan,
            warnings: [
                'Solver ended with status TIMELIMIT_FEASIBLE',
                'Using fallback recipe catalog due to unavailable database connection',
            ],
        },
    });

    assert.equal(first.kind, 'success');
    assert.equal(second.kind, 'success');
    assert.deepEqual(first, second);
    assert.deepEqual(first.warnings, [
        'Solver ended with status TIMELIMIT_FEASIBLE',
        'Using fallback recipe catalog due to unavailable database connection',
    ]);
    assert.equal(first.displayState.shouldRenderOptimizedMealPlan, true);
    assert.equal(first.displayState.emptyState.status, 'resolved');
});
