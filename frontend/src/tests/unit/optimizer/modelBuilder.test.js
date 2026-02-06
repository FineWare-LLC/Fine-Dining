import test from 'node:test';
import assert from 'node:assert/strict';
import { buildOptimizationModel } from '../../../server/optimizer/modelBuilder.js';

const request = {
    userId: 'user123',
    horizonDays: 1,
    mealsPerDay: 3,
    diet: {
        kcal: 2000,
        protein_g: 130,
        carb_g: 220,
        fat_g: 60,
    },
    micros: {},
    allergens: [],
    bannedIngredients: [],
    inventory: [],
    budget: null,
    binary: {
        useRecipeLevel: false,
        integerServings: false,
    },
    allowLeftovers: true,
};

const catalog = {
    recipes: [
        {
            id: 'rec1',
            mealName: 'Recipe One',
            macros: {
                kcal: 500,
                protein_g: 30,
                carb_g: 50,
                fat_g: 15,
                fiber_g: 5,
                sodium_mg: 400,
            },
            costUsd: 3,
        },
        {
            id: 'rec2',
            mealName: 'Recipe Two',
            macros: {
                kcal: 700,
                protein_g: 45,
                carb_g: 70,
                fat_g: 20,
                fiber_g: 8,
                sodium_mg: 500,
            },
            costUsd: 4,
        },
    ],
};

catalog.metadata = { versionToken: 'test' };

const result = buildOptimizationModel(request, catalog);

test('buildOptimizationModel returns typed arrays', () => {
    assert.equal(result.model.columnCount, result.variableMeta.length);
    assert.equal(result.model.rowCount, result.constraints.length);
    assert.ok(result.model.weights.offsets instanceof Int32Array);
    assert.ok(result.model.objectiveLinearWeights instanceof Float64Array);
});
