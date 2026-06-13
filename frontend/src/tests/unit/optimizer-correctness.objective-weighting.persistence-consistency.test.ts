// @ts-nocheck
import assert from 'node:assert/strict';
import test from 'node:test';
import { hashModelInput } from '../../optimizer2/hash';
import {
    buildMealPlanRequestSignature,
    normalizeMealPlanRequest,
} from '../../optimizer2/normalizer';

const baseRequest = {
    user_id: 'user-objective-weights',
    horizon_days: 2,
    meals_per_day: 3,
    diet: {
        kcal: 2100,
        protein_g: 120,
        carb_g: 230,
        fat_g: 70,
    },
    micros: {
        Zinc: { max: 11 },
        Calcium: { min: 900 },
    },
    allergens: ['Milk', 'egg', 'Milk'],
    banned_ingredients: ['Onion', 'Garlic'],
    objective_weights: {
        nutrition: 0.35,
        cost: 0.45,
        preference: 0.15,
        variety: 0.05,
    },
    preferences: {
        cuisine: ['Mediterranean', 'italian'],
        vegetarian: true,
    },
    inventory: [
        { ingredient_id: 'Rice', grams: 200 },
        { ingredient_id: 'apple', grams: 100 },
        { ingredient_id: 'rice', grams: 150 },
    ],
    budget: {
        max_usd_per_day: 12.5,
    },
    time_per_meal_min: 45,
    binary_vars: {
        use_recipe_level: false,
        integer_servings: true,
    },
    allow_leftovers: false,
};

const equivalentRequest = {
    ...baseRequest,
    micros: {
        calcium: { min: 900 },
        ZINC: { max: 11 },
    },
    allergens: ['egg', 'Milk'],
    banned_ingredients: [' garlic ', 'onion'],
    objective_weights: {
        variety: 0.05,
        preference: 0.15,
        cost: 0.45,
        nutrition: 0.35,
    },
    preferences: {
        vegetarian: true,
        cuisine: ['italian', 'MEDITERRANEAN', 'italian'],
    },
    inventory: [
        { ingredient_id: 'rice', grams: 150 },
        { ingredient_id: 'Apple', grams: 100 },
        { ingredient_id: 'RICE', grams: 200 },
    ],
    binary_vars: {
        integer_servings: true,
        use_recipe_level: false,
    },
};

test('normalizeMealPlanRequest keeps objective weighting snapshots canonical across refresh variants', () => {
    const normalizedA = normalizeMealPlanRequest(baseRequest);
    const normalizedB = normalizeMealPlanRequest(equivalentRequest);

    assert.deepEqual(normalizedA.objectiveWeights, {
        cost: 0.45,
        nutrition: 0.35,
        preference: 0.15,
        variety: 0.05,
    });
    assert.deepEqual(normalizedA.objectiveWeights, normalizedB.objectiveWeights);
    assert.deepEqual(normalizedA.preferences, normalizedB.preferences);
    assert.deepEqual(normalizedA.preferences, {
        cuisine: ['italian', 'mediterranean'],
        vegetarian: true,
    });

    const signatureA = buildMealPlanRequestSignature(normalizedA);
    const signatureB = buildMealPlanRequestSignature(normalizedB);

    assert.deepEqual(signatureA, signatureB);
    assert.equal(
        hashModelInput(['request', signatureA, 'catalog', 'catalog-v1']),
        hashModelInput(['request', signatureB, 'catalog', 'catalog-v1']),
    );
});

test('normalizeMealPlanRequest rejects malformed objective weights with typed user-safe errors', () => {
    assert.throws(
        () => normalizeMealPlanRequest({
            ...baseRequest,
            objective_weights: {
                cost: 0.45,
                nutrition: -0.35,
                preference: 0.15,
                variety: 0.05,
            },
        }),
        (error) => {
            assert.ok(error instanceof Error);
            assert.equal(error.name, 'OptimizationRequestValidationError');
            assert.equal(error.code, 'invalidObjectiveWeights');
            assert.equal(error.isUserSafe, true);
            assert.equal(
                error.message,
                'Provide non-negative cost, nutrition, variety, and preference weights.',
            );
            return true;
        },
    );
});
