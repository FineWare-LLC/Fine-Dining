import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeMealPlanRequest } from '../../../server/optimizer/normalizer.js';

const baseRequest = {
    user_id: 'user123',
    horizon_days: 1,
    meals_per_day: 3,
    diet: {
        kcal: 2300,
        protein_g: 120,
        carb_g: 250,
        fat_g: 70,
    },
};

test('normalizeMealPlanRequest produces canonical shape', () => {
    const result = normalizeMealPlanRequest(baseRequest);
    assert.equal(result.userId, 'user123');
    assert.equal(result.horizonDays, 1);
    assert.equal(result.mealsPerDay, 3);
    assert.deepEqual(result.diet, baseRequest.diet);
});

test('normalizeMealPlanRequest rejects energy imbalance', () => {
    const bad = {
        ...baseRequest,
        diet: { ...baseRequest.diet, kcal: 1500 },
    };
    assert.throws(() => normalizeMealPlanRequest(bad), /Energy balance mismatch/);
});
