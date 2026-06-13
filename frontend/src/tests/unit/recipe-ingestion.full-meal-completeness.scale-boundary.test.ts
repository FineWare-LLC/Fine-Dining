// @ts-nocheck
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test, { mock } from 'node:test';
import { fileURLToPath } from 'node:url';

import { RecipeModel } from '../../models/Recipe/index.ts';
import { validateRecipeSeedPayload } from '../../../scripts/validate-recipe-seed.mjs';

const seedPath = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    '../../../data/recipe_seed/full_meal_recipes_100.json',
);

const fixture = JSON.parse(fs.readFileSync(seedPath, 'utf8'));
const LARGE_RECIPE_COUNT = 128;

const clone = (value) => JSON.parse(JSON.stringify(value));

function buildSyntheticRecipe(sourceRecipe, index) {
    const recipe = clone(sourceRecipe);
    const suffix = String(index + 1).padStart(3, '0');
    const sourceUrl = `https://example.test/full-meal-scale-boundary/${suffix}`;

    recipe.recipeName = `${sourceRecipe.recipeName} Scale ${suffix}`;
    recipe.source = sourceUrl;
    recipe.sourceDetails.originalUrl = sourceUrl;
    recipe.sourceDetails.canonicalUrl = sourceUrl;
    recipe.sourceDetails.transformationNotes = `${sourceRecipe.sourceDetails.transformationNotes} Scale-boundary clone ${suffix}.`;

    return recipe;
}

function buildLargeFixture() {
    const recipes = Array.from({ length: LARGE_RECIPE_COUNT }, (_, index) => (
        buildSyntheticRecipe(fixture.recipes[index % fixture.recipes.length], index)
    ));

    return {
        ...clone(fixture),
        recipeCount: recipes.length,
        ingredientLineCount: recipes.reduce((sum, recipe) => sum + recipe.ingredients.length, 0),
        recipes,
    };
}

test('validateRecipeSeedPayload keeps a large full-meal fixture deterministic while hydrating each recipe once at the scale boundary', async () => {
    const forwardFixture = buildLargeFixture();
    const reverseFixture = clone(forwardFixture);
    reverseFixture.recipes.reverse();
    const forwardSnapshot = clone(forwardFixture);
    const reverseSnapshot = clone(reverseFixture);

    const originalToObject = RecipeModel.prototype.toObject;
    let toObjectCalls = 0;

    const validateMock = mock.method(RecipeModel.prototype, 'validate', async function validateProxy() {});
    const toObjectMock = mock.method(RecipeModel.prototype, 'toObject', function toObjectProxy(...args) {
        toObjectCalls += 1;
        return originalToObject.apply(this, args);
    });

    try {
        const forward = await validateRecipeSeedPayload(forwardFixture, {
            expectedRecipeCount: LARGE_RECIPE_COUNT,
        });
        const reverse = await validateRecipeSeedPayload(reverseFixture, {
            expectedRecipeCount: LARGE_RECIPE_COUNT,
        });

        assert.deepEqual(forward, {
            recipeCount: LARGE_RECIPE_COUNT,
            ingredientLines: forwardFixture.ingredientLineCount,
        });
        assert.deepEqual(reverse, forward);
        assert.deepEqual(forwardFixture, forwardSnapshot);
        assert.deepEqual(reverseFixture, reverseSnapshot);
        assert.equal(toObjectCalls, LARGE_RECIPE_COUNT * 2);
    } finally {
        validateMock.mock.restore();
        toObjectMock.mock.restore();
    }
});
