import assert from 'node:assert/strict';
import { performance } from 'node:perf_hooks';
import test from 'node:test';

let OptimizationService;
let generateOptimizedMealPlan;
try {
    OptimizationService = await import('../../services/OptimizationService.js');
    ({ generateOptimizedMealPlan } = OptimizationService);
} catch (err) {
    // Skip test suite when solver dependencies are not installed
    test('generateOptimizedMealPlan performance benchmark', { skip: true }, () => {});
}

const sampleData = {
    mealCount: 2,
    totalMealsCount: 2,
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

if (generateOptimizedMealPlan) {
    test('generateOptimizedMealPlan completes within benchmark', async t => {
    // Skip this test if prepareSolverData is already mocked (to avoid conflicts)
        try {
            t.mock.method(OptimizationService, 'prepareSolverData', async () => sampleData);
        } catch (err) {
            if (err.message.includes('Cannot redefine property')) {
                t.skip('Skipping due to mock conflict - prepareSolverData already mocked');
                return;
            }
            throw err;
        }

        const threshold = parseFloat(process.env.MEAL_PLAN_BENCHMARK_MS || '500');
        const start = performance.now();
        const result = await generateOptimizedMealPlan('u1');
        const duration = performance.now() - start;
        console.log('Meal plan generation took', duration, 'ms');

        assert.ok(result.meals.length > 0, 'no meals returned');
        assert.ok(duration < threshold, `Execution took ${duration}ms, exceeds ${threshold}ms`);
    });
}
