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

test('buildMealPlanOptimizerFeedbackState exposes a loading state with stable height', () => {
    const loading = buildMealPlanOptimizerFeedbackState({ isLoading: true });

    assert.equal(loading.kind, 'loading');
    assert.equal(loading.role, 'status');
    assert.equal(loading.ariaLive, 'polite');
    assert.equal(loading.ariaBusy, true);
    assert.equal(loading.minHeight, 72);
    assert.equal(loading.showSpinner, true);
    assert.equal(loading.title, 'Generating optimized meal plan...');
    assert.equal(
        loading.message,
        'We are still preparing your result. This panel will update when the optimizer finishes.',
    );
});

test('buildMealPlanOptimizerFeedbackState keeps the empty optimizer state actionable', () => {
    const empty = buildMealPlanOptimizerFeedbackState({ selectedMeals: [] });

    assert.equal(empty.kind, 'empty');
    assert.equal(empty.role, 'status');
    assert.equal(empty.ariaLive, 'polite');
    assert.equal(empty.ariaBusy, false);
    assert.equal(empty.minHeight, 72);
    assert.equal(empty.showSpinner, false);
    assert.equal(empty.title, 'No optimized meal plan yet.');
    assert.equal(
        empty.message,
        'Select meals in the catalog, then generate an optimized meal plan to see results.',
    );
    assert.equal(empty.actionLabel, 'Open Meal Catalog');
    assert.equal(empty.actionKind, 'open-catalog');
});

test('buildMealPlanOptimizerFeedbackState keeps resolved plans stable across refreshes', () => {
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

test('buildMealPlanOptimizerFeedbackState surfaces recoverable error and invalid states', () => {
    const error = buildMealPlanOptimizerFeedbackState({
        selectedMeals: ['meal-1'],
        optimizedMealPlan: validOptimizedMealPlan,
        optimizationError: new Error('Optimization failed. Please try again.'),
    });

    assert.equal(error.kind, 'error');
    assert.equal(error.role, 'alert');
    assert.equal(error.ariaLive, 'assertive');
    assert.equal(error.ariaBusy, false);
    assert.equal(error.minHeight, 72);
    assert.equal(error.showSpinner, false);
    assert.equal(error.message, 'Optimization failed. Please try again.');

    const fallbackError = buildMealPlanOptimizerFeedbackState({
        optimizationError: new Error(''),
    });
    assert.equal(fallbackError.message, 'Failed to generate meal plan.');

    const invalid = buildMealPlanOptimizerFeedbackState({
        selectedMeals: ['meal-1'],
        optimizedMealPlan: {
            meals: validOptimizedMealPlan.meals,
            totalCost: 12.5,
            totalNutrition: null,
        },
    });

    assert.equal(invalid.kind, 'invalid');
    assert.equal(invalid.role, 'alert');
    assert.equal(invalid.ariaLive, 'assertive');
    assert.equal(invalid.ariaBusy, false);
    assert.equal(invalid.minHeight, 72);
    assert.equal(invalid.showSpinner, false);
    assert.equal(
        invalid.message,
        'We could not read this meal planning empty state. Please refresh the planner.',
    );
});
