// @ts-nocheck
import assert from 'node:assert/strict';
import test from 'node:test';
import {
    PantryAwareGroceryListValidationError,
    resolvePantryAwareGroceryList,
} from '../../utils/pantryAwareness';

test('resolvePantryAwareGroceryList subtracts pantry quantities from matching grocery items', () => {
    const aggregation = resolvePantryAwareGroceryList(
        [
            { name: 'Eggs', quantity: 4 },
            { name: 'Eggs', quantity: 2 },
            { canonicalName: 'Brown Rice', quantity: 3, unit: 'cups' },
            'Avocados',
        ],
        [
            { name: 'egg', quantity: 3 },
            { label: 'brown rice', quantity: 1, unit: 'cup' },
        ],
    );

    assert.equal(aggregation.status, 'resolved');
    assert.equal(aggregation.error, null);
    assert.deepEqual(aggregation.items, [
        {
            name: 'Egg',
            normalizedName: 'egg',
            unit: 'each',
            quantity: 3,
            sourceCount: 2,
        },
        {
            name: 'Brown Rice',
            normalizedName: 'brown rice',
            unit: 'cup',
            quantity: 2,
            sourceCount: 1,
        },
        {
            name: 'Avocado',
            normalizedName: 'avocado',
            unit: 'each',
            quantity: 1,
            sourceCount: 1,
        },
    ]);
});

test('resolvePantryAwareGroceryList returns an empty state when pantry coverage removes every grocery item', () => {
    const aggregation = resolvePantryAwareGroceryList(
        [{ name: 'Eggs', quantity: 2 }],
        [{ name: 'egg', quantity: 2 }],
    );

    assert.equal(aggregation.status, 'empty');
    assert.deepEqual(aggregation.items, []);
    assert.equal(aggregation.error, null);
});

test('resolvePantryAwareGroceryList rejects malformed pantry payloads with a typed user-safe error', () => {
    const aggregation = resolvePantryAwareGroceryList([{ name: 'Eggs', quantity: 1 }], 'bad');

    assert.equal(aggregation.status, 'invalid');
    assert.equal(aggregation.items, null);
    assert.ok(aggregation.error instanceof PantryAwareGroceryListValidationError);
    assert.equal(aggregation.error.code, 'invalidPayload');
    assert.equal(
        aggregation.error.message,
        'We could not read your pantry-aware grocery list. Please refresh the planner.',
    );
    assert.equal(aggregation.error.isUserSafe, true);
});
