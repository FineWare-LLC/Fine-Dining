// @ts-nocheck
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { validateRecipeSeedPayload } from '../../../scripts/validate-recipe-seed.mjs';

const seedPath = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    '../../../data/recipe_seed/full_meal_recipes_100.json',
);

const fixture = JSON.parse(fs.readFileSync(seedPath, 'utf8'));
const LARGE_RECIPE_COUNT = 128;

const clone = (value) => JSON.parse(JSON.stringify(value));

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function buildSyntheticRecipe(sourceRecipe, index) {
    const recipe = clone(sourceRecipe);
    const suffix = String(index + 1).padStart(3, '0');
    const sourceUrl = `https://example.test/ingredient-normalization-scale-boundary/${suffix}`;

    recipe.recipeName = `${sourceRecipe.recipeName} Scale ${suffix}`;
    recipe.source = sourceUrl;
    recipe.sourceDetails.originalUrl = sourceUrl;
    recipe.sourceDetails.canonicalUrl = sourceUrl;
    recipe.sourceDetails.transformationNotes = `${sourceRecipe.sourceDetails.transformationNotes} Scale-boundary clone ${suffix}.`;

    return recipe;
}

function buildLargeFixture() {
    const sourceRecipes = fixture.recipes;
    const recipes = Array.from({ length: LARGE_RECIPE_COUNT }, (_, index) => (
        buildSyntheticRecipe(sourceRecipes[index % sourceRecipes.length], index)
    ));

    return {
        ...clone(fixture),
        recipeCount: recipes.length,
        ingredientLineCount: recipes.reduce((sum, recipe) => sum + recipe.ingredients.length, 0),
        recipes,
    };
}

test('validateRecipeSeedPayload keeps a large ingredient normalization fixture deterministic at the scale boundary', async () => {
    const forwardFixture = buildLargeFixture();
    const reverseFixture = clone(forwardFixture);
    reverseFixture.recipes.reverse();
    const forwardSnapshot = clone(forwardFixture);
    const reverseSnapshot = clone(reverseFixture);

    const forward = await validateRecipeSeedPayload(forwardFixture);
    const reverse = await validateRecipeSeedPayload(reverseFixture);

    assert.deepEqual(forward, {
        recipeCount: LARGE_RECIPE_COUNT,
        ingredientLines: forwardFixture.ingredientLineCount,
    });
    assert.deepEqual(reverse, forward);
    assert.deepEqual(forwardFixture, forwardSnapshot);
    assert.deepEqual(reverseFixture, reverseSnapshot);
});

test('validateRecipeSeedPayload rejects a large fixture row when ingredient unit disappears at the scale boundary', async () => {
    const mutated = buildLargeFixture();
    const recipeName = mutated.recipes[LARGE_RECIPE_COUNT - 1].recipeName;
    delete mutated.recipes[LARGE_RECIPE_COUNT - 1].ingredients[0].unit;

    await assert.rejects(
        () => validateRecipeSeedPayload(mutated),
        new RegExp(`${escapeRegExp(recipeName)}: missing ingredients\\[0\\]\\.unit`),
    );
});
