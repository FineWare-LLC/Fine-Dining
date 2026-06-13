// @ts-nocheck
import assert from 'node:assert/strict';
import test, { mock } from 'node:test';

import Recipe from '../../models/Recipe';
import { searchRecipesByDiet } from '../../graphql/resolvers/queries/dietaryQueries';

test('searchRecipesByDiet fails shut when the recipe catalog lookup rejects', async () => {
    const findMock = mock.method(Recipe, 'find', () => ({
        sort: () => ({
            skip: () => ({
                limit: () => ({
                    populate: async () => {
                        throw new Error('database unavailable while searching recipes');
                    },
                }),
            }),
        }),
    }));

    try {
        await assert.rejects(
            searchRecipesByDiet(
                null,
                {
                    diets: ['VEGAN'],
                    allergenExclusions: [],
                    cuisines: [],
                    mealTypes: [],
                    maxPrepTime: 30,
                    maxDifficulty: 'EASY',
                    page: 1,
                    limit: 10,
                },
                {},
            ),
            (error) => {
                assert.equal(error.message, 'We could not read your recipes right now. Please refresh the page.');
                assert.equal(error.code, 'recipeSearchUnavailable');
                assert.equal(error.isUserSafe, true);
                return true;
            },
        );
    } finally {
        findMock.mock.restore();
    }
});
