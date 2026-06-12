// @ts-nocheck
import assert from 'node:assert/strict';
import test from 'node:test';

import { recipeSchema } from '../../models/Recipe/index.ts';

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

test('recipe price estimation pre-save hook fail-shuts on malformed estimatedCost values', async () => {
    for (const recipe of [
        {
            prepTime: 8,
            cookTime: 12,
            servings: 4,
            estimatedCost: Number.NaN,
            totalTime: 99,
            costPerServing: 99,
        },
        {
            prepTime: 8,
            cookTime: 12,
            servings: 4,
            estimatedCost: -1,
            totalTime: 99,
            costPerServing: 99,
        },
    ]) {
        await assert.rejects(runRecipePriceHook(recipe), (error) => {
            assert.equal(error.message, 'FAIL-SHUT: Invalid recipe price estimation data (estimatedCost).');
            assert.equal(error.code, 'invalidRecipePriceEstimation');
            assert.equal(error.reason, 'estimatedCost');
            assert.equal(error.isUserSafe, true);
            return true;
        });

        assert.equal(recipe.totalTime, 99, 'The hook should not mutate totalTime when it fails');
        assert.equal(recipe.costPerServing, 99, 'The hook should not mutate costPerServing when it fails');
    }
});
