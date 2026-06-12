// @ts-nocheck
import assert from 'node:assert/strict';
import test from 'node:test';
import { usePlannerStore } from '../../components/legacy/PlannerCanvas/store/plannerStore';
import { resolveGroceryListAggregation } from '../../utils/shoppingListAggregation';

const clone = (value) => JSON.parse(JSON.stringify(value));

test('resolveGroceryListAggregation keeps the canonical grocery list stable across a persisted refresh snapshot', () => {
    const originalState = usePlannerStore.getState();
    const persistedMeals = [
        {
            id: 'meal-a',
            servings: 1,
            ingredients: [
                {
                    name: 'Roma Tomatoes',
                    canonicalName: ' tomato ',
                    quantity: 2,
                    unit: 'cups',
                },
            ],
        },
        {
            id: 'meal-b',
            servings: 1,
            ingredients: [
                {
                    name: 'Heirloom Tomatoes',
                    canonicalName: 'tomato',
                    quantity: 3,
                    unit: 'cup',
                },
            ],
        },
    ];
    const refreshedMeals = clone([...persistedMeals].reverse());

    try {
        const firstPass = resolveGroceryListAggregation(persistedMeals);
        const refreshedPass = resolveGroceryListAggregation(refreshedMeals);

        assert.deepEqual(firstPass, refreshedPass);
        assert.deepEqual(firstPass, {
            status: 'resolved',
            items: [
                {
                    name: 'Tomato',
                    normalizedName: 'tomato',
                    unit: 'cup',
                    quantity: 5,
                    sourceCount: 2,
                },
            ],
            error: null,
        });

        usePlannerStore.setState({ selectedMeals: clone(persistedMeals) });
        assert.deepEqual(usePlannerStore.getState().exportGroceryList(), firstPass.items);

        usePlannerStore.setState({ selectedMeals: clone(refreshedMeals) });
        assert.deepEqual(usePlannerStore.getState().exportGroceryList(), refreshedPass.items);
    } finally {
        usePlannerStore.setState(originalState, true);
    }
});
