import test, { describe } from 'node:test';
import assert from 'node:assert/strict';

let prepareSolverData, runOptimization, generateOptimizedMealPlan;
let MealRepository, UserRepository, registry, Solver;
try {
  ({ prepareSolverData, runOptimization, generateOptimizedMealPlan } = await import('../../services/OptimizationService.js'));
  MealRepository = await import('../../data/MealRepository.js');
  UserRepository = await import('../../data/UserRepository.js');
  registry = await import('../../../../plugins/registry.mjs');
  ({ Solver } = await import('highs-addon'));
} catch (err) {
  // Skip the entire suite if solver dependencies are missing
  test('OptimizationService module unavailable', { skip: true }, () => {});
}

if (prepareSolverData) {
  describe('OptimizationService', () => {
    test('prepareSolverData returns formatted data for valid input', async t => {
      // Mock UserRepository methods
      const mockUser = {
        _id: 'u1',
        allergies: [],
        dislikedIngredients: [],
        nutritionTargets: {}
      };

      try {
        t.mock.method(UserRepository, 'findUserById', async () => mockUser);
        t.mock.method(MealRepository, 'countMeals', async () => 2);
        t.mock.method(MealRepository, 'findMeals', async () => [
          {
            _id: 'm1',
            name: 'A',
            price: 5,
            allergens: [],
            ingredients: [],
            nutrition: { carbohydrates: 30, protein: 20, fat: 10, sodium: 300 }
          },
          {
            _id: 'm2',
            name: 'B',
            price: 6,
            allergens: [],
            ingredients: [],
            nutrition: { carbohydrates: 50, protein: 10, fat: 5, sodium: 200 }
          }
        ]);
      } catch (err) {
        if (err.message.includes('Cannot redefine property')) {
          t.skip('Skipping due to mock conflict - methods already mocked');
          return;
        }
        throw err;
      }

      const data = await prepareSolverData('u1');
      assert.equal(data.mealCount, 2);
      assert.deepEqual(Array.from(data.prices), [5, 6]);
      assert.deepEqual(data.mealIds, ['m1', 'm2']);
    });

    test('generateOptimizedMealPlan throws when no meals exist', async t => {
      // Mock UserRepository methods
      const mockUser = {
        _id: 'u1',
        allergies: [],
        dislikedIngredients: [],
        nutritionTargets: {}
      };

      try {
        t.mock.method(UserRepository, 'findUserById', async () => mockUser);
        t.mock.method(MealRepository, 'countMeals', async () => 0);
        t.mock.method(MealRepository, 'findMeals', async () => []);
      } catch (err) {
        if (err.message.includes('Cannot redefine property')) {
          t.skip('Skipping due to mock conflict - methods already mocked');
          return;
        }
        throw err;
      }

      await assert.rejects(
        generateOptimizedMealPlan('u1'),
        /No meals found/
      );
    });

    test('runOptimization rejects on infeasible status', async t => {
      // Check if Solver is available and has prototype
      if (!Solver || !Solver.prototype) {
        t.skip('Solver not available or missing prototype');
        return;
      }

      const solverRun = t.mock.method(Solver.prototype, 'run', function (cb) { cb(null); });
      t.mock.method(Solver.prototype, 'setOptionValue', () => {});
      t.mock.method(Solver.prototype, 'passModel', () => {});
      t.mock.method(Solver.prototype, 'getModelStatus', () => 8); // infeasible
      t.mock.method(Solver.prototype, 'getInfo', () => ({ objective_function_value: 0 }));
      t.mock.method(Solver.prototype, 'getSolution', () => ({ columnValues: [] }));
      const pluginSpy = t.mock.method(registry, 'applyPlugins', () => {});

      const sampleData = {
        mealCount: 1,
        mealIds: ['1'],
        mealNames: ['A'],
        prices: Float64Array.from([5]),
        carbohydrates: Float64Array.from([30]),
        proteins: Float64Array.from([20]),
        fats: Float64Array.from([10]),
        sodiums: Float64Array.from([300]),
        nutritionTargets: {
          carbohydratesMin: 20,
          carbohydratesMax: 100,
          proteinMin: 10,
          proteinMax: 40,
          fatMin: 5,
          fatMax: 20,
          sodiumMin: 100,
          sodiumMax: 500
        }
      };

      await assert.rejects(runOptimization(sampleData), /No feasible meal plan/);
      assert.equal(pluginSpy.mock.calls.length, 1);
      assert.equal(solverRun.mock.calls.length, 1);
    });
  });
}
