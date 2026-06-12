// @ts-nocheck
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { RecipeModel } from '../../models/Recipe/index.ts';
import {
    validateRecipeIngredientPersistenceConsistency,
    validateRecipeSeedPayload,
} from '../../../scripts/validate-recipe-seed.mjs';

const seedPath = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    '../../../data/recipe_seed/full_meal_recipes_100.json',
);

const fixture = JSON.parse(fs.readFileSync(seedPath, 'utf8'));

test('validateRecipeSeedPayload keeps the full ingredient normalization fixture deterministic across a persisted RecipeModel refresh', async () => {
    const firstPass = await validateRecipeSeedPayload(fixture);
    const secondPass = await validateRecipeSeedPayload(JSON.parse(JSON.stringify(fixture)));
    const hydrated = new RecipeModel(fixture.recipes[0]).toObject({ depopulate: true, versionKey: false });

    assert.deepEqual(firstPass, {
        recipeCount: 100,
        ingredientLines: 911,
    });
    assert.deepEqual(secondPass, firstPass);
    assert.deepEqual(
        hydrated.ingredients.map(({ quantity, unit, gramWeight }) => ({ quantity, unit, gramWeight })),
        fixture.recipes[0].ingredients.map(({ quantity, unit, gramWeight }) => ({ quantity, unit, gramWeight })),
    );
});

test('validateRecipeIngredientPersistenceConsistency rejects a recipe row when hydrated ingredient unit changes', () => {
    const mutated = JSON.parse(JSON.stringify(fixture.recipes[0]));
    const fakeModel = {
        toObject() {
            return {
                ...mutated,
                ingredients: mutated.ingredients.map((ingredient, index) => (
                    index === 0
                        ? { ...ingredient, unit: `${ingredient.unit} ` }
                        : ingredient
                )),
            };
        },
    };

    assert.throws(
        () => validateRecipeIngredientPersistenceConsistency(mutated, fakeModel),
        /Lemon Herb Chicken Quinoa Bowls: ingredients\[0\]\.unit changed during model hydration/,
    );
});
