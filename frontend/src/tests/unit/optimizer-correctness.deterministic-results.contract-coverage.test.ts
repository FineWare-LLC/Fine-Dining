// @ts-nocheck
import assert from 'node:assert/strict';
import os from 'node:os';
import path from 'node:path';
import test, { mock } from 'node:test';
import { clearCache } from '../../optimizer2/cache';
import { MealPlanResponseSchema } from '../../optimizer2/schema';

const baseRequest = {
    user_id: 'user-deterministic-results',
    horizon_days: 2,
    meals_per_day: 2,
    diet: {
        kcal: 1940,
        protein_g: 100,
        carb_g: 200,
        fat_g: 60,
    },
    micros: {
        zinc: {
            min: 2,
        },
    },
    allergens: ['Milk', 'egg', 'milk'],
    banned_ingredients: [' Onion ', 'garlic'],
    preferences: {
        vegetarian: true,
        cuisine: ['Mediterranean', 'italian'],
    },
    inventory: [
        { ingredient_id: 'Rice', grams: 200 },
        { ingredient_id: 'apple', grams: 100 },
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
        ZINC: {
            min: 2,
        },
    },
    allergens: ['egg', 'Milk'],
    banned_ingredients: ['garlic', ' onion '],
    preferences: {
        cuisine: ['italian', 'MEDITERRANEAN'],
        vegetarian: true,
    },
    inventory: [
        { ingredient_id: 'apple', grams: 100 },
        { ingredient_id: 'RICE', grams: 200 },
    ],
    binary_vars: {
        integer_servings: true,
        use_recipe_level: false,
    },
};

test('optimizeMealPlan keeps optimal responses canonical across equivalent optimizer payloads and cache refreshes', async () => {
    const originalMongoUri = process.env.MONGODB_URI;
    const originalNextDistDir = process.env.NEXT_DIST_DIR;
    const auditDir = path.join(os.tmpdir(), `fine-dining-optimizer-audit-${process.pid}`);
    const warnMock = mock.method(console, 'warn', () => {});

    delete process.env.MONGODB_URI;
    process.env.NEXT_DIST_DIR = auditDir;
    clearCache();

    try {
        const { optimizeMealPlan } = await import('../../optimizer2/index');
        const first = await optimizeMealPlan(baseRequest, {
            cacheTtlMs: 60_000,
            timeLimitSec: 1,
        });
        const second = await optimizeMealPlan(equivalentRequest, {
            cacheTtlMs: 60_000,
            timeLimitSec: 1,
        });

        assert.equal(first.status, 'optimal');
        assert.equal(second.status, 'optimal');
        assert.deepEqual(first, second);
        assert.equal(first.diagnostics.model_hash, second.diagnostics.model_hash);
        assert.deepEqual(first.daily[0].meals.map(meal => meal.items[0].recipe_id), ['fallback_oats']);
        assert.deepEqual(second.daily[0].meals.map(meal => meal.items[0].recipe_id), ['fallback_oats']);
        assert.doesNotThrow(() => MealPlanResponseSchema.parse(first));
        assert.doesNotThrow(() => MealPlanResponseSchema.parse(second));
    } finally {
        warnMock.mock.restore();
        clearCache();
        if (originalMongoUri === undefined) {
            delete process.env.MONGODB_URI;
        } else {
            process.env.MONGODB_URI = originalMongoUri;
        }
        if (originalNextDistDir === undefined) {
            delete process.env.NEXT_DIST_DIR;
        } else {
            process.env.NEXT_DIST_DIR = originalNextDistDir;
        }
    }
});
