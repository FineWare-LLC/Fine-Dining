// @ts-nocheck
import assert from 'node:assert/strict';
import test from 'node:test';
import {
    buildGroceryListAggregationFeedbackState,
    buildPantryAwareGroceryListFeedbackState,
} from '../../utils/shoppingListFeedback';
import { resolveGroceryListAggregation } from '../../utils/shoppingListAggregation';
import { resolvePantryAwareGroceryList } from '../../utils/pantryAwareness';

const BASE_SUCCESS_AGGREGATION = resolveGroceryListAggregation([
    {
        id: 'meal-pantry-awareness',
        servings: 1,
        recipe: {
            ingredients: [
                { name: 'Eggs', quantity: 4 },
                { name: 'Brown rice', quantity: 3, unit: 'cups' },
                { name: 'Avocados', quantity: 1 },
            ],
        },
    },
]);

test('buildPantryAwareGroceryListFeedbackState preserves loading and empty grocery feedback states', () => {
    const loadingState = buildGroceryListAggregationFeedbackState({ isLoading: true });
    assert.deepEqual(
        buildPantryAwareGroceryListFeedbackState({ baseFeedbackState: loadingState }),
        loadingState,
    );

    const emptyState = buildGroceryListAggregationFeedbackState({
        aggregationState: resolveGroceryListAggregation([]),
    });
    assert.deepEqual(
        buildPantryAwareGroceryListFeedbackState({ baseFeedbackState: emptyState }),
        emptyState,
    );
});

test('buildPantryAwareGroceryListFeedbackState refines pantry-aware success, empty, and error states', () => {
    const successState = buildGroceryListAggregationFeedbackState({
        aggregationState: BASE_SUCCESS_AGGREGATION,
    });

    const pantryAwareSuccess = resolvePantryAwareGroceryList(
        BASE_SUCCESS_AGGREGATION.items,
        [
            { name: 'egg', quantity: 2 },
            { label: 'brown rice', quantity: 3, unit: 'cup' },
        ],
    );

    assert.deepEqual(buildPantryAwareGroceryListFeedbackState({
        baseFeedbackState: successState,
        pantryAwareGroceryList: pantryAwareSuccess,
        groceryItems: BASE_SUCCESS_AGGREGATION.items,
    }), {
        state: 'success',
        title: 'Pantry applied.',
        message: 'Pantry removed 1 item from the list.',
        actionLabel: null,
        actionKind: null,
        role: 'status',
        ariaLive: 'polite',
        ariaBusy: 'false',
        minHeight: 56,
        showSpinner: false,
        error: null,
    });

    const pantryAwareEmpty = resolvePantryAwareGroceryList(
        BASE_SUCCESS_AGGREGATION.items,
        [
            { name: 'egg', quantity: 4 },
            { label: 'brown rice', quantity: 3, unit: 'cup' },
            { name: 'avocado', quantity: 1 },
        ],
    );

    assert.deepEqual(buildPantryAwareGroceryListFeedbackState({
        baseFeedbackState: successState,
        pantryAwareGroceryList: pantryAwareEmpty,
        groceryItems: BASE_SUCCESS_AGGREGATION.items,
    }), {
        state: 'empty',
        title: 'Pantry already covers this list.',
        message: 'No additional groceries are needed.',
        actionLabel: 'Open planner',
        actionKind: 'open-planner',
        role: 'status',
        ariaLive: 'polite',
        ariaBusy: 'false',
        minHeight: 56,
        showSpinner: false,
        error: null,
    });

    const pantryAwareInvalid = resolvePantryAwareGroceryList(BASE_SUCCESS_AGGREGATION.items, 'bad');

    assert.deepEqual(buildPantryAwareGroceryListFeedbackState({
        baseFeedbackState: successState,
        pantryAwareGroceryList: pantryAwareInvalid,
        groceryItems: BASE_SUCCESS_AGGREGATION.items,
    }), {
        state: 'error',
        title: 'Pantry data unavailable',
        message: 'We could not read your pantry-aware grocery list. Please refresh the planner.',
        actionLabel: 'Refresh planner',
        actionKind: 'refresh-planner',
        role: 'alert',
        ariaLive: 'assertive',
        ariaBusy: 'false',
        minHeight: 56,
        showSpinner: false,
        error: pantryAwareInvalid.error,
    });
});
