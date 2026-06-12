// @ts-nocheck
import assert from 'node:assert/strict';
import test from 'node:test';
import {
    PantryAwareGroceryListValidationError,
    resolvePantryAwareGroceryList,
} from '../../utils/pantryAwareness';

test('resolvePantryAwareGroceryList rejects a missing pantry snapshot with a typed user-safe error', () => {
    const aggregation = resolvePantryAwareGroceryList(
        [
            { name: 'Eggs', quantity: 4 },
        ],
        null,
    );

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
