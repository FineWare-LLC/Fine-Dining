// @ts-nocheck
import assert from 'node:assert/strict';
import test, { mock } from 'node:test';

import { RecipeModel } from '../../models/Recipe';
import { searchRecipes } from '../../graphql/resolvers/queries/recipeQueries';
import {
    RecipeSearchValidationError,
    validateRecipeSearchInput,
} from '../../utils/recipeSearch';

const restoreMock = (tracker) => {
    tracker?.mock?.restore?.();
};

const getClauseFieldNames = (filter) => (
    Array.isArray(filter?.$or)
        ? filter.$or.map((clause) => Object.keys(clause)[0])
        : []
);

test('validateRecipeSearchInput builds a multi-field search filter for textual keywords', () => {
    const result = validateRecipeSearchInput('lentil');

    assert.equal(result.valid, true);
    assert.equal(result.error, null);
    assert.deepEqual(getClauseFieldNames(result.input.filter), [
        'recipeName',
        'cuisine',
        'tags',
        'dietaryTags',
        'ingredients.name',
        'ingredients.canonicalName',
    ]);

    const recipeNameClause = result.input.filter.$or[0].recipeName;
    assert.ok(recipeNameClause instanceof RegExp);
    assert.equal(recipeNameClause.source, 'lentil');
    assert.equal(recipeNameClause.flags, 'i');
});

test('validateRecipeSearchInput includes prep-time clauses when the keyword is numeric', () => {
    const result = validateRecipeSearchInput('30');

    assert.equal(result.valid, true);
    assert.equal(result.input.keyword, '30');
    assert.ok(result.input.filter.$or.some((clause) => clause.prepTime?.$lte === 30));
    assert.ok(result.input.filter.$or.some((clause) => clause.totalTime?.$lte === 30));
});

test('validateRecipeSearchInput keeps blank keywords as an empty search filter', () => {
    const result = validateRecipeSearchInput('   ');

    assert.equal(result.valid, true);
    assert.equal(result.error, null);
    assert.deepEqual(result.input, {
        keyword: '',
        filter: {},
    });
});

test('validateRecipeSearchInput rejects malformed search payloads with a typed, user-safe error', () => {
    const result = validateRecipeSearchInput(null);

    assert.equal(result.valid, false);
    assert.equal(result.input, null);
    assert.ok(result.error instanceof RecipeSearchValidationError);
    assert.equal(result.error.code, 'invalidPayload');
    assert.equal(
        result.error.message,
        'We could not read this recipe search. Please refresh the recipes page.',
    );
    assert.equal(result.error.isUserSafe, true);
});

test('searchRecipes forwards the normalized recipe search filter to RecipeModel.find', async () => {
    let capturedFilter = null;
    const findMock = mock.method(RecipeModel, 'find', (filter) => {
        capturedFilter = filter;
        return [];
    });

    try {
        const recipes = await searchRecipes(null, { keyword: 'lentil' }, {});

        assert.deepEqual(recipes, []);
        assert.deepEqual(capturedFilter, validateRecipeSearchInput('lentil').input.filter);
    } finally {
        restoreMock(findMock);
    }
});
