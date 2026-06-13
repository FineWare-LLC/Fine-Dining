// @ts-nocheck
import assert from 'node:assert/strict';
import test from 'node:test';

import {
    applyRecipeSwiperDecision,
    resolveRecipeSwiperWindow,
    validateRecipeSwiperWindowInput,
} from '../../utils/recipeSwiperState';

const buildRecipe = (index) => ({
    id: `recipe-${index}`,
    recipeName: `Recipe ${index}`,
});

test('swipe decisions stay canonical after a JSON refresh hydrates persisted arrays', () => {
    const recipes = [buildRecipe(1), buildRecipe(2), buildRecipe(3), buildRecipe(4)];
    const refreshedSnapshot = JSON.parse(JSON.stringify({
        currentIndex: 1,
        swipedRecipeIds: ['recipe-1', 'recipe-1'],
    }));

    const validation = validateRecipeSwiperWindowInput({
        recipes,
        currentIndex: refreshedSnapshot.currentIndex,
        swipedRecipeIds: refreshedSnapshot.swipedRecipeIds,
        windowSize: 3,
    });

    assert.equal(validation.valid, true);
    assert.equal(validation.error, null);
    assert.ok(validation.input.swipedRecipeIds instanceof Set);
    assert.deepEqual([...validation.input.swipedRecipeIds], ['recipe-1']);

    const optimisticState = applyRecipeSwiperDecision(refreshedSnapshot, 'recipe-2');
    assert.equal(optimisticState.currentIndex, 2);
    assert.deepEqual([...optimisticState.swipedRecipeIds], ['recipe-1', 'recipe-2']);

    const refreshedWindow = resolveRecipeSwiperWindow({
        recipes,
        currentIndex: optimisticState.currentIndex,
        swipedRecipeIds: optimisticState.swipedRecipeIds,
        windowSize: 3,
    });

    assert.deepEqual(refreshedWindow.map((recipe) => recipe.id), ['recipe-3', 'recipe-4']);
});
