// @ts-nocheck
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { RecipeModel } from '../../models/Recipe/index.ts';
import {
    validateRecipeDuplicatePersistenceConsistency,
    validateRecipeSeedPayload,
} from '../../../scripts/validate-recipe-seed.mjs';

const seedPath = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    '../../../data/recipe_seed/full_meal_recipes_100.json',
);

const fixture = JSON.parse(fs.readFileSync(seedPath, 'utf8'));

test('validateRecipeSeedPayload keeps the duplicate-detection fixture deterministic across a persisted RecipeModel refresh', async () => {
    const firstPass = await validateRecipeSeedPayload(fixture);
    const paddedRecipe = JSON.parse(JSON.stringify(fixture.recipes[0]));
    paddedRecipe.recipeName = `  ${paddedRecipe.recipeName}  `;
    paddedRecipe.source = `  ${paddedRecipe.source}  `;
    paddedRecipe.ingredients[1] = JSON.parse(JSON.stringify(paddedRecipe.ingredients[0]));
    const hydrated = new RecipeModel(paddedRecipe).toObject({ depopulate: true, versionKey: false });

    assert.deepEqual(firstPass, {
        recipeCount: 100,
        ingredientLines: 911,
    });
    assert.doesNotThrow(() => validateRecipeDuplicatePersistenceConsistency(
        paddedRecipe,
        new RecipeModel(paddedRecipe),
        hydrated,
    ));
});

test('validateRecipeDuplicatePersistenceConsistency rejects a hydrated recipe when a duplicate ingredient row changes', () => {
    const recipe = JSON.parse(JSON.stringify(fixture.recipes[0]));
    const fakeModel = {
        toObject() {
            return {
                ...recipe,
                ingredients: recipe.ingredients.map((ingredient, index) => (
                    index === 1
                        ? { ...ingredient, quantity: ingredient.quantity + 1 }
                        : ingredient
                )),
            };
        },
    };

    assert.throws(
        () => validateRecipeDuplicatePersistenceConsistency(recipe, fakeModel),
        /Lemon Herb Chicken Quinoa Bowls: duplicate row signature changed during model hydration\./,
    );
});

test('validateRecipeSeedPayload rejects a recipe row when duplicate ingredient rows survive refresh', async () => {
    const mutated = JSON.parse(JSON.stringify(fixture));
    mutated.recipes[0].ingredients[1] = JSON.parse(JSON.stringify(mutated.recipes[0].ingredients[0]));

    await assert.rejects(
        () => validateRecipeSeedPayload(mutated),
        /Lemon Herb Chicken Quinoa Bowls: duplicate ingredient row at ingredients\[0\] and ingredients\[1\]\./,
    );
});
