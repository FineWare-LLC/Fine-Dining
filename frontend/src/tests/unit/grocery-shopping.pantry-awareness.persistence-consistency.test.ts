// @ts-nocheck
import assert from 'node:assert/strict';
import test from 'node:test';
import {
    DEFAULT_PANTRY_ITEMS,
    PANTRY_STORAGE_KEY,
    loadPantryItems,
    savePantryItems,
} from '../../utils/pantryStorage';
import { resolvePantryAwareGroceryList } from '../../utils/pantryAwareness';

const clone = (value) => JSON.parse(JSON.stringify(value));

const createStorageAdapter = (initialState = {}) => {
    const state = { ...initialState };

    return {
        state,
        getItem(key) {
            return Object.prototype.hasOwnProperty.call(state, key) ? state[key] : null;
        },
        setItem(key, value) {
            state[key] = String(value);
            return true;
        },
        removeItem(key) {
            delete state[key];
            return true;
        },
    };
};

test('savePantryItems and loadPantryItems keep the canonical pantry snapshot stable across refresh', () => {
    const storageAdapter = createStorageAdapter();
    const pantryDraft = ['  Greek yogurt  ', 'Chicken breast', 'Brown rice', 'Spinach'];

    const canonicalPantry = savePantryItems(pantryDraft, storageAdapter);

    assert.deepEqual(canonicalPantry, ['Greek yogurt', 'Chicken breast', 'Brown rice', 'Spinach']);
    assert.equal(storageAdapter.state[PANTRY_STORAGE_KEY], JSON.stringify(canonicalPantry));

    const refreshedPantry = loadPantryItems(storageAdapter, ['Fallback pantry']);

    assert.deepEqual(refreshedPantry, canonicalPantry);

    const groceryItems = [
        { name: 'Eggs', quantity: 4 },
        { canonicalName: 'Greek yogurt', quantity: 2 },
        { name: 'Olive Oil', quantity: 1, unit: 'tbsp' },
        { name: 'Spinach', quantity: 1 },
    ];

    const firstResolution = resolvePantryAwareGroceryList(groceryItems, canonicalPantry);
    const refreshedResolution = resolvePantryAwareGroceryList(clone(groceryItems), refreshedPantry);

    assert.deepEqual(firstResolution, refreshedResolution);
    assert.deepEqual(firstResolution, {
        status: 'resolved',
        items: [
            {
                name: 'Egg',
                normalizedName: 'egg',
                unit: 'each',
                quantity: 4,
                sourceCount: 1,
            },
            {
                name: 'Greek Yogurt',
                normalizedName: 'greek yogurt',
                unit: 'each',
                quantity: 1,
                sourceCount: 1,
            },
            {
                name: 'Olive Oil',
                normalizedName: 'olive oil',
                unit: 'tbsp',
                quantity: 1,
                sourceCount: 1,
            },
        ],
        error: null,
    });
});

test('loadPantryItems falls back to the default pantry snapshot when persisted state is malformed', () => {
    const storageAdapter = createStorageAdapter({
        [PANTRY_STORAGE_KEY]: '{not valid json}',
    });

    assert.deepEqual(loadPantryItems(storageAdapter, DEFAULT_PANTRY_ITEMS), DEFAULT_PANTRY_ITEMS);
});
