// @ts-nocheck
import assert from 'node:assert/strict';
import test from 'node:test';

import {
    DEFAULT_RECIPE_SEARCH_FILTERS,
    loadRecipeSearchFilters,
    persistRecipeSearchFilters,
} from '../../utils/recipeSearchState';

const createStorageAdapter = (initialState = {}) => {
    const state = { ...initialState };

    return {
        state,
        getItem(key) {
            return Object.prototype.hasOwnProperty.call(state, key) ? state[key] : null;
        },
        setItem(key, value) {
            state[key] = value;
            return true;
        },
        removeItem(key) {
            delete state[key];
            return true;
        },
    };
};

test('persistRecipeSearchFilters keeps the canonical search snapshot stable across a persisted refresh', () => {
    const storage = createStorageAdapter();
    const firstPass = persistRecipeSearchFilters(storage, {
        diets: ['VEGAN', 'VEGAN', 'VEGETARIAN'],
        allergenExclusions: ['GLUTEN', ' gluten ', 'DAIRY'],
        cuisines: ['Italian', 'Italian'],
        mealTypes: ['DINNER', 'DINNER', 'SNACK'],
        maxPrepTime: '30',
        maxDifficulty: 'hard',
    });
    const refreshedPass = loadRecipeSearchFilters(storage);

    assert.deepEqual(firstPass, {
        diets: ['VEGAN', 'VEGETARIAN'],
        allergenExclusions: ['GLUTEN', 'DAIRY'],
        cuisines: ['Italian'],
        mealTypes: ['DINNER', 'SNACK'],
        maxPrepTime: 30,
        maxDifficulty: 'HARD',
    });
    assert.deepEqual(refreshedPass, firstPass);
    assert.equal(
        storage.state['fineDining.recipeSearchFilters'],
        JSON.stringify(firstPass),
    );
});

test('loadRecipeSearchFilters falls back to the default search state when storage is malformed', () => {
    const storage = createStorageAdapter({
        'fineDining.recipeSearchFilters': '{"diets":["VEGAN"],',
    });

    assert.deepEqual(loadRecipeSearchFilters(storage), DEFAULT_RECIPE_SEARCH_FILTERS);
});

test('persistRecipeSearchFilters keeps zero prep time stable across refresh snapshots', () => {
    const storage = createStorageAdapter();
    const firstPass = persistRecipeSearchFilters(storage, {
        maxPrepTime: '0',
    });
    const refreshedPass = loadRecipeSearchFilters(storage);

    assert.deepEqual(firstPass, {
        diets: [],
        allergenExclusions: [],
        cuisines: [],
        mealTypes: [],
        maxPrepTime: 0,
        maxDifficulty: null,
    });
    assert.deepEqual(refreshedPass, firstPass);
    assert.equal(
        storage.state['fineDining.recipeSearchFilters'],
        JSON.stringify(firstPass),
    );
});
