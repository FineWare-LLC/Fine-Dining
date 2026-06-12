import assert from 'node:assert/strict';
import test from 'node:test';
import { hashModelInput } from '../../server/optimizer/hash.js';
import {
    buildMealPlanRequestSignature,
    normalizeMealPlanRequest,
} from '../../server/optimizer/normalizer.js';

const buildLargeConstraintRequest = (variant = 'base') => {
    const allergens = Array.from({ length: 2048 }, (_, index) => (
        index % 2 === 0 ? ' Milk ' : 'egg'
    ));
    const bannedIngredients = Array.from({ length: 2048 }, (_, index) => (
        index % 3 === 0 ? ' Onion ' : ' GARLIC '
    ));
    const cuisine = Array.from({ length: 2048 }, (_, index) => (
        index % 2 === 0 ? 'Mexican' : 'italian'
    ));
    const inventory = [
        ...Array.from({ length: 256 }, (_, index) => ({ ingredient_id: 'Rice', grams: 100 + index })),
        ...Array.from({ length: 256 }, (_, index) => ({ ingredient_id: 'Beans', grams: 100 + index })),
        ...Array.from({ length: 256 }, (_, index) => ({ ingredient_id: 'Apple', grams: 100 + index })),
        ...Array.from({ length: 256 }, (_, index) => ({ ingredient_id: 'Tofu', grams: 100 + index })),
    ];

    const micros = variant === 'base'
        ? {
            Zinc: { max: 12 },
            Calcium: { min: 1000 },
            Iron: { min: 8 },
        }
        : {
            Iron: { min: 8 },
            Zinc: { max: 12 },
            Calcium: { min: 1000 },
        };

    return {
        user_id: 'user-large',
        horizon_days: 7,
        meals_per_day: 3,
        diet: {
            kcal: 2200,
            protein_g: 120,
            carb_g: 250,
            fat_g: 70,
        },
        micros,
        allergens: variant === 'base' ? allergens : [...allergens].reverse(),
        banned_ingredients: variant === 'base' ? bannedIngredients : [...bannedIngredients].reverse(),
        preferences: variant === 'base'
            ? {
                vegetarian: true,
                cuisine,
            }
            : {
                cuisine: [...cuisine].reverse(),
                vegetarian: true,
            },
        inventory: variant === 'base' ? inventory : [...inventory].reverse(),
        budget: {
            max_usd_per_day: 18,
        },
        time_per_meal_min: 40,
        binary_vars: {
            use_recipe_level: true,
            integer_servings: false,
        },
        allow_leftovers: true,
    };
};

test('normalizeMealPlanRequest canonicalizes a large constraint fixture into a stable solver signature', () => {
    const normalizedA = normalizeMealPlanRequest(buildLargeConstraintRequest('base'));
    const normalizedB = normalizeMealPlanRequest(buildLargeConstraintRequest('reversed'));

    assert.deepEqual(normalizedA.allergens, ['egg', 'milk']);
    assert.deepEqual(normalizedA.bannedIngredients, ['garlic', 'onion']);
    assert.deepEqual(normalizedA.preferences, {
        cuisine: ['italian', 'mexican'],
        vegetarian: true,
    });
    assert.deepEqual(Object.keys(normalizedA.micros), ['calcium', 'iron', 'zinc']);
    assert.deepEqual(normalizedA.inventory.slice(0, 3), [
        { ingredientId: 'apple', grams: 100 },
        { ingredientId: 'apple', grams: 101 },
        { ingredientId: 'apple', grams: 102 },
    ]);
    assert.deepEqual(normalizedA.inventory[normalizedA.inventory.length - 1], {
        ingredientId: 'tofu',
        grams: 355,
    });

    const signatureA = buildMealPlanRequestSignature(normalizedA);
    const signatureB = buildMealPlanRequestSignature(normalizedB);

    assert.deepEqual(signatureA, signatureB);
    assert.equal(
        hashModelInput(['request', signatureA, 'catalog', 'catalog-v1']),
        hashModelInput(['request', signatureB, 'catalog', 'catalog-v1']),
    );
});
