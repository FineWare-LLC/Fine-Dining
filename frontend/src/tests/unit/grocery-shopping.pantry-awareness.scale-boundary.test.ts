// @ts-nocheck
import assert from 'node:assert/strict';
import test from 'node:test';
import { resolvePantryAwareGroceryList } from '../../utils/pantryAwareness';

const LARGE_ENTRY_COUNT = 512;
const PANTRY_BLUEPRINTS = [
    { canonicalName: 'Tomatoes', name: 'Roma Tomatoes', unit: 'cups' },
    { canonicalName: 'Olive Oils', name: 'Extra Virgin Olive Oil', unit: 'tablespoons' },
    { canonicalName: 'Yellow Onions', name: 'Yellow Onions', unit: 'teaspoons' },
    { canonicalName: 'Green Beans', name: 'Fresh Green Beans', unit: 'ounces' },
    { canonicalName: 'Bell Peppers', name: 'Bell Peppers', unit: 'pounds' },
    { canonicalName: 'Baby Carrots', name: 'Baby Carrots', unit: 'grams' },
    { canonicalName: 'Limes', name: 'Limes', unit: 'kilograms' },
    { canonicalName: 'Whole Eggs', name: 'Whole Eggs', unit: 'pieces' },
];

const clone = (value) => JSON.parse(JSON.stringify(value));

const buildLargeGroceryFixture = () => (
    Array.from({ length: LARGE_ENTRY_COUNT }, (_, index) => {
        const blueprint = PANTRY_BLUEPRINTS[index % PANTRY_BLUEPRINTS.length];

        return {
            canonicalName: index % 2 === 0 ? ` ${blueprint.canonicalName} ` : blueprint.canonicalName.toUpperCase(),
            name: blueprint.name,
            quantity: 1,
            unit: blueprint.unit,
        };
    })
);

const buildLargePantryFixture = () => (
    Array.from({ length: LARGE_ENTRY_COUNT / 2 }, (_, index) => {
        const blueprint = PANTRY_BLUEPRINTS[index % PANTRY_BLUEPRINTS.length];

        return {
            label: index % 2 === 0 ? blueprint.canonicalName.toLowerCase() : ` ${blueprint.canonicalName} `,
            quantity: 1,
            unit: blueprint.unit,
        };
    })
);

test('resolvePantryAwareGroceryList keeps a large pantry fixture deterministic at the scale boundary', () => {
    const groceryItems = buildLargeGroceryFixture();
    const pantryItems = buildLargePantryFixture();
    const grocerySnapshot = clone(groceryItems);
    const pantrySnapshot = clone(pantryItems);

    const firstPass = resolvePantryAwareGroceryList(groceryItems, pantryItems);
    const secondPass = resolvePantryAwareGroceryList(clone(groceryItems), clone(pantryItems));

    assert.equal(firstPass.status, 'resolved');
    assert.equal(firstPass.error, null);
    assert.equal(firstPass.items.length, PANTRY_BLUEPRINTS.length);
    assert.deepEqual(
        firstPass.items.map(({ normalizedName, unit, quantity, sourceCount }) => ({
            normalizedName,
            unit,
            quantity,
            sourceCount,
        })),
        [
            { normalizedName: 'tomato', unit: 'cup', quantity: 32, sourceCount: 64 },
            { normalizedName: 'olive oil', unit: 'tbsp', quantity: 32, sourceCount: 64 },
            { normalizedName: 'yellow onion', unit: 'tsp', quantity: 32, sourceCount: 64 },
            { normalizedName: 'green bean', unit: 'oz', quantity: 32, sourceCount: 64 },
            { normalizedName: 'bell pepper', unit: 'lb', quantity: 32, sourceCount: 64 },
            { normalizedName: 'baby carrot', unit: 'g', quantity: 32, sourceCount: 64 },
            { normalizedName: 'lime', unit: 'kg', quantity: 32, sourceCount: 64 },
            { normalizedName: 'whole egg', unit: 'each', quantity: 32, sourceCount: 64 },
        ],
    );
    assert.deepEqual(secondPass, firstPass);
    assert.deepEqual(groceryItems, grocerySnapshot);
    assert.deepEqual(pantryItems, pantrySnapshot);
});
