// @ts-nocheck
import assert from 'node:assert/strict';
import test from 'node:test';
import { buildMealPlanOptimizerFeedbackState } from '../../utils/mealPlanningEmptyStates';

const LARGE_COUNT = 512;

function buildLargeOptimizedMealPlan() {
    return {
        meals: Array.from({ length: LARGE_COUNT }, (_, index) => ({
            mealId: `meal-${index}`,
            mealName: `Meal ${index}`,
            servings: 1,
            pricePerServing: 1.25,
            totalPrice: 1.25,
        })),
        totalCost: 640,
        totalNutrition: {
            carbohydrates: 180,
            protein: 140,
            fat: 48,
            sodium: 960,
        },
    };
}

function buildSelectedMeals(variant = 'base') {
    const selectedMeals = Array.from({ length: LARGE_COUNT }, (_, index) => `meal-${index}`);
    return variant === 'base' ? selectedMeals : [...selectedMeals].reverse();
}

function buildWarnings(variant = 'base') {
    const warnings = Array.from({ length: LARGE_COUNT }, (_, index) => {
        switch (index % 6) {
        case 0:
            return ' Warning Alpha ';
        case 1:
            return 'warning beta';
        case 2:
            return 'Warning Gamma';
        case 3:
            return 'warning alpha';
        case 4:
            return ' WARNING BETA ';
        default:
            return 'warning gamma';
        }
    });

    if (variant === 'base') {
        return warnings;
    }

    return warnings
        .slice()
        .reverse()
        .map((warning) => warning.trim().split('').map((character) => (
            character === character.toUpperCase()
                ? character.toLowerCase()
                : character.toUpperCase()
        )).join(''));
}

test('buildMealPlanOptimizerFeedbackState keeps large deterministic feedback canonical across refresh variants', () => {
    const first = buildMealPlanOptimizerFeedbackState({
        selectedMeals: buildSelectedMeals('base'),
        optimizedMealPlan: buildLargeOptimizedMealPlan(),
        optimizationWarnings: buildWarnings('base'),
    });

    const second = buildMealPlanOptimizerFeedbackState({
        selectedMeals: buildSelectedMeals('refresh'),
        optimizedMealPlan: buildLargeOptimizedMealPlan(),
        optimizationWarnings: buildWarnings('refresh'),
    });

    assert.equal(first.kind, 'success');
    assert.equal(first.role, 'status');
    assert.equal(first.ariaLive, 'polite');
    assert.equal(first.ariaBusy, false);
    assert.equal(first.minHeight, 72);
    assert.equal(first.showSpinner, false);
    assert.equal(first.displayState.shouldRenderOptimizedMealPlan, true);
    assert.equal(first.displayState.emptyState.status, 'resolved');
    assert.deepEqual(first, second);
});
