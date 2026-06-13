// @ts-nocheck
import assert from 'node:assert/strict';
import test from 'node:test';

import {
    applyRecipeSwiperDecision,
    resolveRecipeSwiperWindow,
    rollbackRecipeSwiperDecision,
} from '../../utils/recipeSwiperState';

const LARGE_RECIPE_COUNT = 600;
const START_INDEX = 249;
const SWIPED_RECIPE_COUNT = 249;

const buildRecipe = (index) => {
    const paddedIndex = String(index + 1).padStart(4, '0');

    return {
        id: `recipe-${paddedIndex}`,
        recipeName: `Recipe ${index + 1}`,
    };
};

const buildLargeRecipeFixture = () => (
    Array.from({ length: LARGE_RECIPE_COUNT }, (_, index) => buildRecipe(index))
);

const buildInitialSwipeState = () => ({
    currentIndex: START_INDEX,
    swipedRecipeIds: new Set(
        Array.from({ length: SWIPED_RECIPE_COUNT }, (_, index) => buildRecipe(index).id),
    ),
});

test('swipe decisions stay idempotent and deterministic at the scale boundary', () => {
    const recipes = buildLargeRecipeFixture();
    const originalRecipes = structuredClone(recipes);
    const originalState = buildInitialSwipeState();
    const originalSwipedRecipeIds = [...originalState.swipedRecipeIds];

    const firstApply = applyRecipeSwiperDecision(originalState, 'recipe-0250');
    const repeatedApply = applyRecipeSwiperDecision(firstApply, 'recipe-0250');

    const visibleRecipes = resolveRecipeSwiperWindow({
        recipes,
        currentIndex: repeatedApply.currentIndex,
        swipedRecipeIds: repeatedApply.swipedRecipeIds,
        windowSize: 3,
    });

    const firstRollback = rollbackRecipeSwiperDecision(repeatedApply, 'recipe-0250');
    const repeatedRollback = rollbackRecipeSwiperDecision(firstRollback, 'recipe-0250');

    assert.deepEqual(recipes, originalRecipes);
    assert.deepEqual([...originalState.swipedRecipeIds], originalSwipedRecipeIds);
    assert.equal(firstApply.currentIndex, START_INDEX + 1);
    assert.deepEqual([...firstApply.swipedRecipeIds].slice(-1), ['recipe-0250']);
    assert.equal(repeatedApply.currentIndex, START_INDEX + 1);
    assert.deepEqual([...repeatedApply.swipedRecipeIds], [...firstApply.swipedRecipeIds]);
    assert.deepEqual(visibleRecipes.map((recipe) => recipe.id), [
        'recipe-0251',
        'recipe-0252',
        'recipe-0253',
    ]);
    assert.equal(firstRollback.currentIndex, START_INDEX);
    assert.deepEqual([...firstRollback.swipedRecipeIds], originalSwipedRecipeIds);
    assert.equal(repeatedRollback.currentIndex, START_INDEX);
    assert.deepEqual([...repeatedRollback.swipedRecipeIds], originalSwipedRecipeIds);
});
