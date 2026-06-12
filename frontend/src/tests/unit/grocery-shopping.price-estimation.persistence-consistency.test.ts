// @ts-nocheck
import assert from 'node:assert/strict';
import test from 'node:test';

import { RecipeModel } from '../../models/Recipe/index.ts';

test('RecipeModel keeps recipe cost fields canonical across a persisted refresh snapshot', () => {
    const persistedRecipe = {
        recipeName: 'Budget Pasta',
        ingredients: [
            {
                name: 'Pasta',
                quantity: 1,
                unit: 'lb',
            },
        ],
        instructions: 'Boil the pasta and serve with sauce.',
        servings: 4,
        prepTime: 8,
        cookTime: 12,
        estimatedCost: 10,
        costPerServing: 99,
        totalTime: 99,
    };

    const refreshedRecipe = RecipeModel.hydrate(persistedRecipe);
    const roundTrippedRecipe = RecipeModel.hydrate(refreshedRecipe.toObject({
        depopulate: true,
        versionKey: false,
    }));

    assert.equal(refreshedRecipe.totalTime, 20);
    assert.equal(refreshedRecipe.costPerServing, 2.5);
    assert.equal(roundTrippedRecipe.totalTime, 20);
    assert.equal(roundTrippedRecipe.costPerServing, 2.5);
});
