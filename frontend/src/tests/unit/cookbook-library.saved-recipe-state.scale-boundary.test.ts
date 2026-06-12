// @ts-nocheck
import assert from 'node:assert/strict';
import test from 'node:test';

import { resolveRecipeSwiperWindow } from '../../utils/recipeSwiperState';

const LARGE_RECIPE_COUNT = 200;

const buildLargeRecipeFixture = () => (
    Array.from({ length: LARGE_RECIPE_COUNT }, (_, index) => ({
        id: `recipe-${String(index + 1).padStart(4, '0')}`,
        recipeName: `Recipe ${index + 1}`,
    }))
);

test('resolveRecipeSwiperWindow keeps a large saved-recipe fixture deterministic at the scale boundary', () => {
    const recipes = buildLargeRecipeFixture();
    const originalSnapshot = structuredClone(recipes);
    const firstWindow = resolveRecipeSwiperWindow({
        recipes,
        currentIndex: 0,
        swipedRecipeIds: new Set(),
    });
    const afterSaveWindow = resolveRecipeSwiperWindow({
        recipes,
        currentIndex: 1,
        swipedRecipeIds: new Set(['recipe-0001']),
    });

    assert.deepEqual(recipes, originalSnapshot);
    assert.deepEqual(firstWindow.map((recipe) => recipe.id), [
        'recipe-0001',
        'recipe-0002',
        'recipe-0003',
    ]);
    assert.deepEqual(afterSaveWindow.map((recipe) => recipe.id), [
        'recipe-0002',
        'recipe-0003',
        'recipe-0004',
    ]);
    assert.equal(afterSaveWindow.length, 3);
    assert.equal(afterSaveWindow[0].recipeName, 'Recipe 2');
});
