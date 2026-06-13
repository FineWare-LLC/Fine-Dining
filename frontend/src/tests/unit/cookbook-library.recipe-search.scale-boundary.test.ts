// @ts-nocheck
import assert from 'node:assert/strict';
import test, { mock } from 'node:test';

import RecipeModel, { recipeSchema } from '../../models/Recipe';
import { searchRecipes } from '../../graphql/resolvers/queries/recipeQueries';
import { validateRecipeSearchInput } from '../../utils/recipeSearch';

const LARGE_RECIPE_COUNT = 1024;

const buildLargeRecipeFixture = () => (
    Array.from({ length: LARGE_RECIPE_COUNT }, (_, index) => ({
        id: `recipe-${String(index + 1).padStart(4, '0')}`,
        recipeName: `Recipe ${index + 1}`,
        difficulty: index % 3 === 0 ? 'EASY' : 'INTERMEDIATE',
    }))
);

const restoreMock = (tracker) => {
    tracker?.mock?.restore?.();
};

test('recipe schema keeps the expanded search fields on the text index at the scale boundary', () => {
    const textIndex = recipeSchema.indexes().find(([keys]) => keys.recipeName === 'text');

    assert.ok(textIndex, 'expected a recipe text index');
    assert.deepEqual(textIndex[0], {
        recipeName: 'text',
        cuisine: 'text',
        tags: 'text',
        dietaryTags: 'text',
        'ingredients.name': 'text',
        'ingredients.canonicalName': 'text',
    });
});

test('searchRecipes keeps a large recipe fixture deterministic by requesting a stable sort', async () => {
    const recipes = buildLargeRecipeFixture();
    let capturedFilter = null;
    let capturedSort = null;

    const findMock = mock.method(RecipeModel, 'find', (filter) => {
        capturedFilter = filter;

        return {
            sort: (sortSpec) => {
                capturedSort = sortSpec;
                return recipes;
            },
        };
    });

    try {
        const result = await searchRecipes(null, { keyword: 'lentil' }, {});

        assert.equal(result.length, LARGE_RECIPE_COUNT);
        assert.deepEqual(result, recipes);
        assert.deepEqual(capturedFilter, validateRecipeSearchInput('lentil').input.filter);
        assert.deepEqual(capturedSort, { recipeName: 1, _id: 1 });
    } finally {
        restoreMock(findMock);
    }
});
