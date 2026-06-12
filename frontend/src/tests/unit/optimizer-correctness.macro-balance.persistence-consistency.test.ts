// @ts-nocheck
import assert from 'node:assert/strict';
import test from 'node:test';
import { MODEL_STATUS } from '../../optimizer2/constants';
import { interpretOptimization } from '../../optimizer2/interpreter';
import { MealPlanResponseSchema } from '../../optimizer2/schema';

const request = {
    horizonDays: 1,
    binary: {
        integerServings: false,
    },
};

const catalog = {
    recipes: [
        {
            id: 'recipe-balanced',
            mealName: 'Macro Bowl',
            macros: {
                kcal: 410,
                protein_g: 24,
                carb_g: 42,
                fat_g: 14,
            },
            costUsd: 3.5,
        },
    ],
    metadata: {
        versionToken: 'catalog-v1',
    },
};

const buildResult = {
    warnings: ['Using sample catalog data'],
    variableMeta: [
        {
            kind: 'x',
            day: 0,
            recipeId: 'recipe-balanced',
            index: 0,
        },
    ],
    constraints: [],
};

function buildResponse(servings) {
    return interpretOptimization({
        request,
        catalog,
        buildResult,
        solverResult: {
            status: MODEL_STATUS.OPTIMAL,
            info: {
                objective_function_value: 3.5,
                simplex_iteration_count: 2,
            },
            solverVersion: 'test-solver',
            solution: {
                columnValues: [servings],
                rowDualValues: [],
            },
        },
        modelHash: 'model-hash',
        timings: {
            solveMs: 12.5,
        },
    });
}

test('interpretOptimization keeps macro-balanced responses canonical across refresh variants', () => {
    const responseA = buildResponse(0.995);
    const responseB = buildResponse(0.999);

    assert.equal(responseA.daily[0].meals[0].items[0].servings, 1);
    assert.equal(responseB.daily[0].meals[0].items[0].servings, 1);
    assert.equal(responseA.daily[0].totals.kcal, 410);
    assert.equal(responseA.daily[0].totals.cost_usd, 3.5);
    assert.deepEqual(responseA, responseB);
    assert.doesNotThrow(() => MealPlanResponseSchema.parse(responseA));
});
