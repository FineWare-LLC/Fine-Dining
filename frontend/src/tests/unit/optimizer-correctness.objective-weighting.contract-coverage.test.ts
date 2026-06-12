// @ts-nocheck
import assert from 'node:assert/strict';
import test from 'node:test';
import {
    SLACK_PENALTY,
    MICRO_SLACK_PENALTY,
    RECIPE_SELECTION_PENALTY,
} from '../../optimizer2/constants';
import { buildOptimizationModel } from '../../optimizer2/modelBuilder';
import {
    OptimizationRequestValidationError,
    normalizeMealPlanRequest,
} from '../../optimizer2/normalizer';

const baseRequest = {
    user_id: 'user-objective-weights',
    horizon_days: 1,
    meals_per_day: 2,
    diet: {
        kcal: 2000,
        protein_g: 100,
        carb_g: 200,
        fat_g: 70,
    },
    micros: {
        fiber_g: {
            min: 20,
        },
    },
    allergens: ['Milk'],
    banned_ingredients: ['Onion'],
    preferences: {
        cuisine: ['Mediterranean', 'vegetarian'],
        vegetarian: true,
    },
    inventory: [],
    budget: {
        max_usd_per_day: 20,
    },
    time_per_meal_min: 30,
    binary_vars: {
        use_recipe_level: true,
        integer_servings: false,
    },
    allow_leftovers: false,
};

const catalog = {
    recipes: [
        {
            id: 'recipe-a',
            mealName: 'Recipe A',
            macros: {
                kcal: 480,
                protein_g: 28,
                carb_g: 52,
                fat_g: 16,
                fiber_g: 6,
                sodium_mg: 380,
            },
            costUsd: 3.25,
        },
        {
            id: 'recipe-b',
            mealName: 'Recipe B',
            macros: {
                kcal: 620,
                protein_g: 34,
                carb_g: 66,
                fat_g: 18,
                fiber_g: 8,
                sodium_mg: 420,
            },
            costUsd: 4.5,
        },
    ],
};

function findObjectiveWeight(result, matcher) {
    const meta = result.variableMeta.find(entry =>
        Object.entries(matcher).every(([key, value]) => entry[key] === value),
    );

    assert.ok(meta, `Missing variable metadata for ${JSON.stringify(matcher)}`);
    return result.model.objectiveLinearWeights[meta.index];
}

test('normalizeMealPlanRequest accepts valid optimizer payloads and rejects invalid ones with typed user-safe errors', () => {
    const normalized = normalizeMealPlanRequest(baseRequest);

    assert.equal(normalized.userId, 'user-objective-weights');
    assert.equal(normalized.horizonDays, 1);
    assert.equal(normalized.mealsPerDay, 2);
    assert.equal(normalized.allowLeftovers, false);
    assert.deepEqual(normalized.diet, baseRequest.diet);

    assert.throws(
        () => normalizeMealPlanRequest({
            ...baseRequest,
            user_id: '',
        }),
        (error) => {
            assert.ok(error instanceof OptimizationRequestValidationError);
            assert.equal(error.code, 'invalidPayload');
            assert.equal(error.isUserSafe, true);
            assert.equal(
                error.message,
                'We could not read this meal plan request. Please refresh the planner.',
            );
            return true;
        },
    );

    assert.throws(
        () => normalizeMealPlanRequest({
            ...baseRequest,
            diet: {
                ...baseRequest.diet,
                kcal: 1500,
            },
        }),
        (error) => {
            assert.ok(error instanceof OptimizationRequestValidationError);
            assert.equal(error.code, 'energyMismatch');
            assert.equal(error.isUserSafe, true);
            assert.match(error.message, /^Energy balance mismatch\./);
            return true;
        },
    );
});

test('buildOptimizationModel keeps objective weights explicit for cost, selection, and slack penalties', () => {
    const normalized = normalizeMealPlanRequest(baseRequest);
    const result = buildOptimizationModel(normalized, catalog);

    assert.equal(result.model.columnCount, result.variableMeta.length);
    assert.ok(result.model.objectiveLinearWeights instanceof Float64Array);

    assert.equal(findObjectiveWeight(result, { kind: 'x', day: 0, recipeId: 'recipe-a' }), 3.25);
    assert.equal(findObjectiveWeight(result, { kind: 'x', day: 0, recipeId: 'recipe-b' }), 4.5);
    assert.equal(findObjectiveWeight(result, { kind: 'y', day: 0, recipeId: 'recipe-a' }), RECIPE_SELECTION_PENALTY);
    assert.equal(findObjectiveWeight(result, { kind: 'y', day: 0, recipeId: 'recipe-b' }), RECIPE_SELECTION_PENALTY);
    assert.equal(findObjectiveWeight(result, { kind: 'slack', day: 0, nutrient: 'kcal', bound: 'min' }), SLACK_PENALTY);
    assert.equal(findObjectiveWeight(result, { kind: 'slack', day: 0, nutrient: 'fiber_g', bound: 'min' }), MICRO_SLACK_PENALTY);
});
