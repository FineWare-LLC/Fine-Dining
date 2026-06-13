// @ts-nocheck
import assert from 'node:assert/strict';
import test, { mock } from 'node:test';

import { RecipeModel } from '../../models/Recipe';
import { getRecipes } from '../../graphql/resolvers/queries/recipeQueries';

const buildPaginatedQuery = (documents) => {
    const state = {
        sortSpec: null,
        skipValue: null,
        limitValue: null,
    };

    const query = {
        sort(sortSpec) {
            state.sortSpec = sortSpec;
            return query;
        },
        skip(skipValue) {
            state.skipValue = skipValue;
            return query;
        },
        limit(limitValue) {
            state.limitValue = limitValue;
            return query;
        },
        exec: async () => documents,
    };

    return { query, state };
};

const restoreMock = (tracker) => {
    tracker?.mock?.restore?.();
};

test('getRecipes pages the admin recipe list through a sorted query object', async () => {
    const recipes = [
        { id: 'recipe-101', recipeName: 'Lentil Soup' },
        { id: 'recipe-102', recipeName: 'Herb Pasta' },
    ];
    const { query, state } = buildPaginatedQuery(recipes);
    const findMock = mock.method(RecipeModel, 'find', () => query);

    try {
        const result = await getRecipes(null, { page: 3, limit: 25 }, {});

        assert.deepEqual(result, recipes);
        assert.equal(findMock.mock.callCount(), 1);
        assert.deepEqual(state.sortSpec, { createdAt: -1, _id: -1 });
        assert.equal(state.skipValue, 50);
        assert.equal(state.limitValue, 25);
    } finally {
        restoreMock(findMock);
    }
});

test('getRecipes clamps malformed pagination inputs before querying the recipe collection', async () => {
    const recipes = [{ id: 'recipe-201', recipeName: 'Invalid input fallback' }];
    const { query, state } = buildPaginatedQuery(recipes);
    const findMock = mock.method(RecipeModel, 'find', () => query);

    try {
        const result = await getRecipes(null, { page: 0, limit: 0 }, {});

        assert.deepEqual(result, recipes);
        assert.equal(findMock.mock.callCount(), 1);
        assert.deepEqual(state.sortSpec, { createdAt: -1, _id: -1 });
        assert.equal(state.skipValue, 0);
        assert.equal(state.limitValue, 1);
    } finally {
        restoreMock(findMock);
    }
});
