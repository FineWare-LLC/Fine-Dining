// @ts-nocheck
import assert from 'node:assert/strict';
import test from 'node:test';

import {
    RecipeSwiperWindowValidationError,
    resolveRecipeSwiperWindow,
    validateRecipeSwiperWindowInput,
} from '../../utils/recipeSwiperState';

const buildRecipe = (index) => ({
    id: `recipe-${index}`,
    recipeName: `Recipe ${index}`,
});

test('validateRecipeSwiperWindowInput accepts a canonical swipe payload', () => {
    const recipes = [buildRecipe(1), buildRecipe(2), buildRecipe(3)];
    const result = validateRecipeSwiperWindowInput({
        recipes,
        currentIndex: 1,
        swipedRecipeIds: new Set(['recipe-1']),
        windowSize: 2,
    });

    assert.equal(result.valid, true);
    assert.equal(result.error, null);
    assert.deepEqual(result.input.recipes, recipes);
    assert.equal(result.input.currentIndex, 1);
    assert.equal(result.input.windowSize, 2);
    assert.equal(result.input.swipedRecipeIds.has('recipe-1'), true);
});

test('validateRecipeSwiperWindowInput rejects malformed swipe payloads with a typed, user-safe error', () => {
    const result = validateRecipeSwiperWindowInput({
        recipes: 'not-an-array',
        currentIndex: 0,
        swipedRecipeIds: new Set(),
        windowSize: 3,
    });

    assert.equal(result.valid, false);
    assert.equal(result.input, null);
    assert.ok(result.error instanceof RecipeSwiperWindowValidationError);
    assert.equal(result.error.code, 'invalidPayload');
    assert.equal(
        result.error.message,
        'We could not read this recipe swipe state. Please refresh the recipes page.',
    );
    assert.equal(result.error.isUserSafe, true);
});

test('resolveRecipeSwiperWindow returns the next visible recipes after canonical swipe decisions are applied', () => {
    const result = resolveRecipeSwiperWindow({
        recipes: [buildRecipe(1), buildRecipe(2), buildRecipe(3), buildRecipe(4)],
        currentIndex: 0,
        swipedRecipeIds: new Set(['recipe-1']),
        windowSize: 3,
    });

    assert.deepEqual(result.map((recipe) => recipe.id), ['recipe-2', 'recipe-3', 'recipe-4']);
});

test('resolveRecipeSwiperWindow fails shut on malformed swipe payloads', () => {
    const result = resolveRecipeSwiperWindow({
        recipes: 'not-an-array',
        currentIndex: 0,
        swipedRecipeIds: new Set(),
        windowSize: 3,
    });

    assert.deepEqual(result, []);
});
