import test from 'node:test';
import assert from 'node:assert/strict';
import { runOptimization } from '../../services/OptimizationService.js';

const sampleData = {
  mealCount: 2,
  mealIds: ['1', '2'],
  mealNames: ['A', 'B'],
  prices: Float64Array.from([5, 6]),
  carbohydrates: Float64Array.from([30, 50]),
  proteins: Float64Array.from([20, 10]),
  fats: Float64Array.from([10, 5]),
  sodiums: Float64Array.from([300, 200]),
  nutritionTargets: {
    carbohydratesMin: 20,
    carbohydratesMax: 100,
    proteinMin: 10,
    proteinMax: 40,
    fatMin: 5,
    fatMax: 20,
    sodiumMin: 100,
    sodiumMax: 500,
  },
};

test('runOptimization can be executed concurrently', async () => {
  const runs = Array.from({ length: 3 }, () => runOptimization(sampleData));
  const results = await Promise.all(runs);
  for (const res of results) {
    assert.ok(res.meals.length > 0, 'no meals returned');
  }
});
