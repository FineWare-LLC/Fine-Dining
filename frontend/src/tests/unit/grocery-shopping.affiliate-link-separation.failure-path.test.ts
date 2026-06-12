import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { RecipeAffiliateLinkValidationError } from '../../../scripts/validate-recipe-seed.mjs';
import { seedRecipes } from '../../../scripts/seed-recipes.mjs';

const fixturePath = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    '../../../data/recipe_seed/full_meal_recipes_100.json',
);

test('seedRecipes aborts before persistence when merchant links leak into recipe instructions', async () => {
    const fixture = JSON.parse(await fs.readFile(fixturePath, 'utf8'));
    const mutated = JSON.parse(JSON.stringify(fixture));
    mutated.recipes[0].instructions = `${mutated.recipes[0].instructions}\nShop here: https://merchant.example/buy`;

    const events = [];
    const dbConnectImpl = async () => {
        events.push('dbConnect');
    };
    const recipeModel = {
        bulkWrite: async () => {
            events.push('bulkWrite');
            throw new Error('bulkWrite should not be called');
        },
    };
    const session = {
        startTransaction: async () => {
            events.push('startTransaction');
        },
        commitTransaction: async () => {
            events.push('commitTransaction');
        },
        abortTransaction: async () => {
            events.push('abortTransaction');
        },
        endSession: async () => {
            events.push('endSession');
        },
    };
    const mongooseClient = {
        startSession: async () => {
            events.push('startSession');
            return session;
        },
        disconnect: async () => {
            events.push('disconnect');
        },
    };

    await assert.rejects(
        () => seedRecipes('affiliate-link-separation-seed.json', {
            readFile: async () => JSON.stringify(mutated),
            dbConnectImpl,
            recipeModel,
            mongooseClient,
        }),
        (error) => {
            assert.ok(error instanceof RecipeAffiliateLinkValidationError);
            assert.equal(error.code, 'invalidAffiliateLinkData');
            assert.equal(error.reason, 'instructions');
            assert.equal(error.recipeName, fixture.recipes[0].recipeName);
            assert.equal(error.isUserSafe, true);
            assert.equal(
                error.message,
                'We found merchant links in recipe text. Please keep shopping links in purchaseOptions.',
            );
            return true;
        },
    );

    assert.deepEqual(events, []);
});
