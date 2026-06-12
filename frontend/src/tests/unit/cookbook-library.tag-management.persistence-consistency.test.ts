// @ts-nocheck
import assert from 'node:assert/strict';
import test from 'node:test';

import { RecipeModel, validateRecipeTagsInput } from '../../models/Recipe';

const buildRecipeDocument = (overrides = {}) => ({
    recipeName: 'Tag Refresh Test',
    ingredients: [
        {
            name: 'Rice',
            quantity: 1,
            unit: 'cup',
        },
    ],
    instructions: 'Cook the rice.',
    prepTime: 15,
    difficulty: 'EASY',
    servings: 2,
    tags: ['  Quick   Meals  ', 'quick meals', 'Comfort Food', 'comfort food'],
    ...overrides,
});

test('RecipeModel keeps canonical tags stable across validation and refresh snapshots', async () => {
    const source = buildRecipeDocument();
    const expectedTags = validateRecipeTagsInput(source.tags).input;
    const recipe = new RecipeModel(source);

    await recipe.validate();

    const persisted = recipe.toObject({ depopulate: true, versionKey: false });
    const refreshed = new RecipeModel(persisted).toObject({
        depopulate: true,
        versionKey: false,
    });

    assert.deepEqual(expectedTags, ['Quick Meals', 'Comfort Food']);
    assert.deepEqual(recipe.tags, expectedTags);
    assert.deepEqual(persisted.tags, expectedTags);
    assert.deepEqual(refreshed.tags, expectedTags);
});
