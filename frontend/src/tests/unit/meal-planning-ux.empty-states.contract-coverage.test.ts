// @ts-nocheck
import assert from 'node:assert/strict';
import test from 'node:test';
import {
    MealPlanningEmptyStateValidationError,
    resolveMealPlanningEmptyState,
} from '../../utils/mealPlanningEmptyStates';

test('resolveMealPlanningEmptyState returns actionable catalog and optimizer empty states', () => {
    assert.deepEqual(resolveMealPlanningEmptyState({
        surface: 'catalog',
        meals: [{ id: 'meal-1', mealName: 'Soup' }],
        visibleMeals: [{ id: 'meal-1', mealName: 'Soup' }],
        searchTerm: '',
        restaurantFilter: null,
    }), {
        status: 'resolved',
        title: null,
        message: null,
        actionLabel: null,
        actionKind: null,
        role: 'status',
        ariaLive: 'polite',
        minHeight: 72,
        showSpinner: false,
        error: null,
    });

    assert.deepEqual(resolveMealPlanningEmptyState({
        surface: 'catalog',
        meals: [],
    }), {
        status: 'empty',
        title: 'No meals found yet.',
        message: 'Browse recipes to add meals to the catalog.',
        actionLabel: 'Browse recipes',
        actionKind: 'browse-recipes',
        role: 'status',
        ariaLive: 'polite',
        minHeight: 72,
        showSpinner: false,
        error: null,
    });

    assert.deepEqual(resolveMealPlanningEmptyState({
        surface: 'catalog',
        meals: [
            {
                id: 'meal-1',
                mealName: 'Soup',
            },
        ],
        visibleMeals: [],
        searchTerm: 'sushi',
    }), {
        status: 'empty',
        title: 'No meals match your search or filters.',
        message: 'Try clearing your search or filters to see more meals.',
        actionLabel: 'Reset search',
        actionKind: 'reset-filters',
        role: 'status',
        ariaLive: 'polite',
        minHeight: 72,
        showSpinner: false,
        error: null,
    });

    assert.deepEqual(resolveMealPlanningEmptyState({
        surface: 'optimizer',
        selectedMeals: [],
        optimizedMealPlan: null,
    }), {
        status: 'empty',
        title: 'No optimized meal plan yet.',
        message: 'Select meals in the catalog, then generate an optimized meal plan to see results.',
        actionLabel: 'Open Meal Catalog',
        actionKind: 'open-catalog',
        role: 'status',
        ariaLive: 'polite',
        minHeight: 72,
        showSpinner: false,
        error: null,
    });

    assert.deepEqual(resolveMealPlanningEmptyState({
        surface: 'optimizer',
        selectedMeals: ['meal-1'],
        optimizedMealPlan: { id: 'meal-plan-1' },
    }), {
        status: 'resolved',
        title: null,
        message: null,
        actionLabel: null,
        actionKind: null,
        role: 'status',
        ariaLive: 'polite',
        minHeight: 72,
        showSpinner: false,
        error: null,
    });

    assert.deepEqual(resolveMealPlanningEmptyState({
        surface: 'optimizer',
        selectedMeals: ['meal-1'],
        optimizedMealPlan: null,
    }), {
        status: 'empty',
        title: 'No optimized meal plan generated yet.',
        message: 'Click Generate Optimized Meal Plan to see results for the meals you chose.',
        actionLabel: 'Generate Optimized Meal Plan',
        actionKind: 'generate-plan',
        role: 'status',
        ariaLive: 'polite',
        minHeight: 72,
        showSpinner: false,
        error: null,
    });
});

test('resolveMealPlanningEmptyState rejects malformed payloads with a typed, user-safe error', () => {
    const invalid = resolveMealPlanningEmptyState({
        surface: 'optimizer',
        selectedMeals: 'bad',
    });

    assert.equal(invalid.status, 'invalid');
    assert.equal(invalid.title, 'Meal planning state unavailable');
    assert.equal(invalid.message, 'We could not read this meal planning empty state. Please refresh the planner.');
    assert.equal(invalid.role, 'alert');
    assert.equal(invalid.ariaLive, 'assertive');
    assert.equal(invalid.minHeight, 72);
    assert.equal(invalid.showSpinner, false);
    assert.ok(invalid.error instanceof MealPlanningEmptyStateValidationError);
    assert.equal(invalid.error.code, 'invalidPayload');
    assert.equal(invalid.error.message, 'We could not read this meal planning empty state. Please refresh the planner.');
    assert.equal(invalid.error.isUserSafe, true);
});
