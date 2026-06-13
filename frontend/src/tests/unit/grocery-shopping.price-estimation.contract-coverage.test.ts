// @ts-nocheck
import assert from 'node:assert/strict';
import test from 'node:test';

import { recipeSchema } from '../../models/Recipe/index.ts';
import menuItemSchema from '../../models/MenuItem/menuItem.schema';
import {
    SubstitutionSuggestionsValidationError,
    resolveSubstitutionSuggestions,
} from '../../utils/substitutionSuggestions';

function getRecipePriceHook() {
    const saveHooks = recipeSchema.s.hooks._pres.get('save') || [];
    const hook = saveHooks.find(({ fn }) => fn?.name === '');

    assert.ok(hook?.fn, 'Expected the recipe price hook to be registered');

    return hook.fn;
}

async function runRecipePriceHook(doc) {
    const hook = getRecipePriceHook();

    await new Promise((resolve, reject) => {
        hook.call(doc, (error) => (error ? reject(error) : resolve()));
    });
}

test('price estimation contract keeps recipe and menu item price fields wired to persistence', async () => {
    for (const path of [
        'estimatedCost',
        'costPerServing',
        'ingredients.purchaseOptions.estimatedPrice',
        'ingredients.purchaseOptions.currency',
        'ingredients.purchaseOptions.packageSize',
    ]) {
        assert.ok(recipeSchema.path(path), `Expected recipe schema path ${path}`);
    }

    for (const path of [
        'price',
        'priceCurrency',
        'priceConfidence',
        'priceFetchedAt',
    ]) {
        assert.ok(menuItemSchema.path(path), `Expected menu item schema path ${path}`);
    }

    const pricedRecipe = {
        prepTime: 8,
        cookTime: 12,
        servings: 4,
        estimatedCost: 10,
        totalTime: 99,
        costPerServing: 99,
    };
    await runRecipePriceHook(pricedRecipe);

    assert.equal(pricedRecipe.totalTime, 20);
    assert.equal(pricedRecipe.costPerServing, 2.5);

    const freeRecipe = {
        prepTime: 8,
        cookTime: 12,
        servings: 4,
        estimatedCost: 0,
        totalTime: 99,
        costPerServing: 7.99,
    };
    await runRecipePriceHook(freeRecipe);

    assert.equal(freeRecipe.totalTime, 20);
    assert.equal(freeRecipe.costPerServing, 0);
});

test('price estimation contract prefers estimatedPrice over broader cost fields for substitutions', () => {
    const result = resolveSubstitutionSuggestions({
        missingIngredient: 'Milk',
        user: {
            allergies: [],
            questionnaire: {
                disallowedIngredients: [],
                dietaryPattern: '',
            },
        },
        candidates: [
            {
                id: 'recipe-silken-tofu',
                recipeName: 'Silken tofu',
                estimatedPrice: 4.29,
                estimatedCost: 12.99,
                costPerServing: 1.25,
                priceCurrency: 'usd',
                allergens: [],
                dietaryTags: ['vegan'],
                recipe: {
                    ingredients: [{ name: 'Soybeans' }, { name: 'Water' }],
                },
            },
        ],
    });

    assert.equal(result.status, 'resolved');
    assert.equal(result.error, null);
    assert.equal(result.items.length, 1);
    assert.equal(result.items[0].price, 4.29);
    assert.equal(result.items[0].currency, 'USD');
});

test('price estimation contract rejects malformed substitution payloads with a typed user-safe error', () => {
    const result = resolveSubstitutionSuggestions({
        missingIngredient: 'Milk',
        user: {
            allergies: [],
            questionnaire: {
                disallowedIngredients: [],
                dietaryPattern: '',
            },
        },
        candidates: 'not-an-array',
    });

    assert.equal(result.status, 'invalid');
    assert.equal(result.items, null);
    assert.ok(result.error instanceof SubstitutionSuggestionsValidationError);
    assert.equal(result.error.code, 'invalidPayload');
    assert.equal(result.error.isUserSafe, true);
});
