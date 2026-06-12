import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

const { seedRecipes } = await import('../../../scripts/seed-recipes.mjs');

function makeRecipe(recipeName, source) {
    return {
        recipeName,
        source,
        sourceDetails: {
            siteName: 'Fine Dining Seed Generator',
            extractionMethod: 'seed_generator',
            copyrightReviewStatus: 'ORIGINAL',
            transformationNotes: 'Original recipe concept generated for seed data.',
            nutritionSource: 'USDA FoodData Central',
            pricingSource: 'retailer search',
        },
        ingredients: [
            {
                name: 'Rice',
                canonicalName: 'rice',
                affiliateSearchTerm: 'rice',
                purchaseOptions: [],
            },
        ],
    };
}

function makeSeedPayload() {
    return {
        recipes: [
            makeRecipe('Seedy Bowl One', 'fine-dining-original-seed:seedy-bowl-one'),
            makeRecipe('Seedy Bowl Two', 'fine-dining-original-seed:seedy-bowl-two'),
        ],
    };
}

test('seedRecipes aborts the transaction and surfaces a batched write failure without leaving a partial import behind', async () => {
    assert.equal(typeof seedRecipes, 'function');

    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'fine-dining-seed-import-'));
    const seedPath = path.join(tempDir, 'seed.json');
    await fs.writeFile(seedPath, JSON.stringify(makeSeedPayload()), 'utf8');

    const events = [];
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

    const dbConnectImpl = async () => {
        events.push('dbConnect');
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

    const bulkWriteCalls = [];
    const recipeModel = {
        bulkWrite: async (operations, options) => {
            bulkWriteCalls.push({ operations, options });
            events.push('bulkWrite');
            throw new Error('Mongo unavailable');
        },
    };

    try {
        await assert.rejects(
            () => seedRecipes(seedPath, { dbConnectImpl, recipeModel, mongooseClient }),
            /Mongo unavailable/,
        );

        assert.deepEqual(events, [
            'dbConnect',
            'startSession',
            'startTransaction',
            'bulkWrite',
            'abortTransaction',
            'endSession',
            'disconnect',
        ]);
        assert.equal(bulkWriteCalls.length, 1);
        assert.equal(bulkWriteCalls[0].operations.length, 2);
        assert.deepEqual(
            bulkWriteCalls[0].operations.map((operation) => operation.updateOne.filter.source),
            [
                'fine-dining-original-seed:seedy-bowl-one',
                'fine-dining-original-seed:seedy-bowl-two',
            ],
        );
        assert.equal(bulkWriteCalls[0].options.session, session);
        assert.equal(bulkWriteCalls[0].options.ordered, true);
        assert.equal(events.includes('commitTransaction'), false);
    } finally {
        await fs.rm(tempDir, { recursive: true, force: true });
    }
});
