// @ts-nocheck
import assert from 'node:assert/strict';
import test from 'node:test';

import { resolveGroceryListExport } from '../../utils/shoppingListAggregation';

const LARGE_MEAL_COUNT = 128;

function buildLargeExportFixture({ reverse = false } = {}) {
    let notesReads = 0;
    const meals = Array.from({ length: LARGE_MEAL_COUNT }, (_, index) => {
        const suffix = String(index + 1).padStart(3, '0');
        const meal = {
            id: `meal-${suffix}`,
            mealName: `Meal ${suffix}`,
            servings: 1,
            ingredients: [
                'olive oil',
                {
                    canonicalName: ' tomato ',
                    quantity: 1,
                    unit: 'cups',
                    category: 'Produce',
                    notes: 'Use local',
                },
            ],
        };

        Object.defineProperty(meal, 'notes', {
            enumerable: true,
            get() {
                notesReads += 1;
                return 'Serve chilled';
            },
        });

        return meal;
    });

    if (reverse) {
        meals.reverse();
    }

    return { meals, notesReadsRef: () => notesReads };
}

test('resolveGroceryListExport keeps large reversible export fixtures deterministic without rereading meal notes per ingredient', () => {
    const forwardFixture = buildLargeExportFixture();
    const reverseFixture = buildLargeExportFixture({ reverse: true });

    const forwardExport = resolveGroceryListExport(forwardFixture.meals);
    const reverseExport = resolveGroceryListExport(reverseFixture.meals);

    assert.equal(forwardExport.status, 'resolved');
    assert.equal(forwardExport.error, null);
    assert.deepEqual(forwardExport, reverseExport);
    assert.deepEqual(forwardExport.items, [
        {
            name: 'Olive Oil',
            normalizedName: 'olive oil',
            unit: 'each',
            quantity: LARGE_MEAL_COUNT,
            sourceCount: LARGE_MEAL_COUNT,
            category: '',
            notes: 'Serve chilled',
        },
        {
            name: 'Tomato',
            normalizedName: 'tomato',
            unit: 'cup',
            quantity: LARGE_MEAL_COUNT,
            sourceCount: LARGE_MEAL_COUNT,
            category: 'Produce',
            notes: 'Use local',
        },
    ]);
    assert.equal(forwardFixture.notesReadsRef(), LARGE_MEAL_COUNT);
    assert.equal(reverseFixture.notesReadsRef(), LARGE_MEAL_COUNT);
});
