/**
 * OptimizationService.js
 * 
 * Service for optimizing meal plans using HiGHS solver.
 * This service fetches user nutrition targets and available meals,
 * filters out meals containing user allergens, and uses HiGHS
 * to generate an optimized meal plan that meets the user's
 * nutritional requirements while minimizing cost.
 */

import highsDefault from 'highs-addon';
import { MealModel } from '../src/models/Meal/index.js';
import User from '../src/models/User/index.js';

const { Solver, solverVersion } = highsDefault;
const STATUS_OPTIMAL = 7; // HiGHS status code for Optimal

/**
 * Prepares data for the HiGHS solver by fetching user nutrition targets
 * and available meals, and filtering out meals containing user allergens.
 * 
 * @param {string} userId - The ID of the user to generate a meal plan for
 * @returns {Promise<Object>} Object containing formatted meal data and user nutrition targets
 */
export async function prepareSolverData(userId) {
  console.log(`Preparing solver data for user ${userId}...`);

  // Fetch user data including nutrition targets and allergies
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  // Extract user's allergies and disallowed ingredients (case-insensitive)
  const userAllergies = (user.questionnaire?.allergies || user.allergies || []).map(a =>
    a.toLowerCase().trim()
  );
  const disallowedIngredients = (user.questionnaire?.disallowedIngredients || user.dislikedIngredients || []).map(i =>
    i.toLowerCase().trim()
  );

  // Count all meals before filtering for better error messages
  const totalMealsCount = await MealModel.countDocuments();

  // Query meals while excluding those lacking required data or containing
  // allergens/disallowed ingredients
  const mealQuery = {
    price: { $ne: null },
    'nutrition.carbohydrates': { $ne: null },
    'nutrition.protein': { $ne: null },
    'nutrition.fat': { $ne: null },
    'nutrition.sodium': { $ne: null }
  };

  if (userAllergies.length > 0) {
    mealQuery.allergens = { $not: { $elemMatch: { $in: userAllergies } } };
  }

  if (disallowedIngredients.length > 0) {
    mealQuery.ingredients = { $not: { $elemMatch: { $in: disallowedIngredients } } };
  }

  const filteredMealsRaw = await MealModel.find(mealQuery);
  console.log(`Query returned ${filteredMealsRaw.length} meals out of ${totalMealsCount} total`);

  // Minimal post-query filtering for any edge cases
  const filteredMeals = filteredMealsRaw.filter(meal =>
    meal.price !== undefined && meal.price !== null && meal.nutrition &&
    meal.nutrition.carbohydrates !== undefined &&
    meal.nutrition.protein !== undefined &&
    meal.nutrition.fat !== undefined &&
    meal.nutrition.sodium !== undefined
  );

  // Format the filtered meals for the HiGHS solver
  const mealIds = [];
  const mealNames = [];
  const prices = [];
  const carbs = [];
  const proteins = [];
  const fats = [];
  const sodiums = [];

  filteredMeals.forEach(meal => {
    mealIds.push(meal._id.toString());
    mealNames.push(meal.mealName || `Meal ${meal._id}`);
    prices.push(meal.price);
    carbs.push(meal.nutrition.carbohydrates);
    proteins.push(meal.nutrition.protein);
    fats.push(meal.nutrition.fat);
    sodiums.push(meal.nutrition.sodium);
  });

  // Get user's nutrition targets with reasonable defaults if not set
  const nutritionTargets = {
    proteinMin: user.nutritionTargets?.proteinMin || 50, // Default to 50g protein minimum
    proteinMax: user.nutritionTargets?.proteinMax || 150, // Default to 150g protein maximum
    carbohydratesMin: user.nutritionTargets?.carbohydratesMin || 100, // Default to 100g carbs minimum
    carbohydratesMax: user.nutritionTargets?.carbohydratesMax || 300, // Default to 300g carbs maximum
    fatMin: user.nutritionTargets?.fatMin || 30, // Default to 30g fat minimum
    fatMax: user.nutritionTargets?.fatMax || 100, // Default to 100g fat maximum
    sodiumMin: user.nutritionTargets?.sodiumMin || 500, // Default to 500mg sodium minimum
    sodiumMax: user.nutritionTargets?.sodiumMax || 2300 // Default to 2300mg sodium maximum (FDA recommendation)
  };

  console.log('Using nutrition targets:', nutritionTargets);

  return {
    mealCount: filteredMeals.length,
    totalMealsCount,
    mealIds,
    mealNames,
    prices: Float64Array.from(prices),
    carbohydrates: Float64Array.from(carbs),
    proteins: Float64Array.from(proteins),
    fats: Float64Array.from(fats),
    sodiums: Float64Array.from(sodiums),
    nutritionTargets
  };
}

/**
 * Builds a HiGHS model for meal plan optimization based on the prepared data.
 * 
 * @param {Object} data - Prepared data from prepareSolverData
 * @returns {Object} HiGHS model configuration
 */
function buildOptimizationModel(data) {
  const { 
    mealCount, 
    prices, 
    carbohydrates, 
    proteins, 
    fats, 
    sodiums, 
    nutritionTargets 
  } = data;

  // Variables x_i = number of HALF-servings of meal i
  const columnCount = mealCount;
  const columnLowerBounds = new Float64Array(mealCount).fill(0);
  const columnUpperBounds = new Float64Array(mealCount).fill(4); // max 2 servings = 4 half-servings

  // Objective: minimize total price
  const objectiveWeights = new Float64Array(mealCount);
  for (let i = 0; i < mealCount; i++) {
    objectiveWeights[i] = prices[i] * 0.5; // price per half-serving
  }
  const isMaximization = false; // minimize total price

  // Nutrient constraints
  const rowCount = 4;
  const rowLowerBounds = new Float64Array([
    nutritionTargets.carbohydratesMin,
    nutritionTargets.proteinMin,
    nutritionTargets.fatMin,
    nutritionTargets.sodiumMin
  ]);

  const rowUpperBounds = new Float64Array([
    nutritionTargets.carbohydratesMax === Infinity ? 1e10 : nutritionTargets.carbohydratesMax,
    nutritionTargets.proteinMax === Infinity ? 1e10 : nutritionTargets.proteinMax,
    nutritionTargets.fatMax === Infinity ? 1e10 : nutritionTargets.fatMax,
    nutritionTargets.sodiumMax === Infinity ? 1e10 : nutritionTargets.sodiumMax
  ]);

  // Sparse matrix: for each half-serving variable we halve its nutrient
  const offsets = new Int32Array([0, mealCount, 2*mealCount, 3*mealCount, 4*mealCount]);

  const indices = new Int32Array(4 * mealCount);
  for (let r = 0; r < 4; ++r) {
    for (let c = 0; c < mealCount; ++c) {
      indices[r * mealCount + c] = c;
    }
  }

  const values = new Float64Array(4 * mealCount);
  // Row 0: carbs per HALF-serving = carbohydrates[i] * 0.5
  // Row 1: protein per HALF-serving = proteins[i] * 0.5
  // Row 2: fat per HALF-serving = fats[i] * 0.5
  // Row 3: sodium per HALF-serving = sodiums[i] * 0.5
  for (let i = 0; i < mealCount; ++i) {
    values[0 * mealCount + i] = carbohydrates[i] * 0.5;
    values[1 * mealCount + i] = proteins[i] * 0.5;
    values[2 * mealCount + i] = fats[i] * 0.5;
    values[3 * mealCount + i] = sodiums[i] * 0.5;
  }

  return {
    columnCount,
    columnLowerBounds,
    columnUpperBounds,
    rowCount,
    rowLowerBounds,
    rowUpperBounds,
    weights: { offsets, indices, values },
    objectiveLinearWeights: objectiveWeights,
    isMaximization
  };
}

/**
 * Runs the HiGHS optimization to generate an optimized meal plan.
 * 
 * @param {Object} data - Prepared data from prepareSolverData
 * @returns {Promise<Object>} Optimized meal plan results
 */
export async function runOptimization(data) {
  return new Promise((resolve, reject) => {
    try {
      console.log(`Running optimization for ${data.mealCount} meals...`);

      // Build the optimization model
      const model = buildOptimizationModel(data);

      // Initialize the solver
      const solver = new Solver();
      solver.passModel(model);
      console.log('Model transferred to HiGHS – solving...');

      // Run the solver
      solver.run(err => {
        if (err) {
          console.error('HiGHS error:', err);
          return reject(new Error(`HiGHS solver error: ${err}`));
        }

        const status = solver.getModelStatus();
        console.log(`Solver status code: ${status}`);

        if (status !== STATUS_OPTIMAL) {
          if (status === 8) { // Infeasible
            return reject(new Error('No feasible meal plan found with the given constraints. Try relaxing your nutritional targets.'));
          } else {
            return reject(new Error(`Solver did not reach Optimal solution (status code: ${status})`));
          }
        }

        const info = solver.getInfo();
        const sol = solver.getSolution();

        // Process the solution
        const selectedMeals = [];
        const totals = { 
          price: 0,
          carbs: 0, 
          protein: 0, 
          fat: 0, 
          sodium: 0 
        };

        sol.columnValues.forEach((halfServings, i) => {
          if (halfServings > 0.5) {
            // Round to nearest 0.5
            const servings = Math.round(halfServings) / 2;

            selectedMeals.push({
              mealId: data.mealIds[i],
              mealName: data.mealNames[i],
              servings: servings,
              pricePerServing: data.prices[i],
              totalPrice: servings * data.prices[i],
              nutrition: {
                carbohydrates: data.carbohydrates[i],
                protein: data.proteins[i],
                fat: data.fats[i],
                sodium: data.sodiums[i]
              }
            });

            totals.price += servings * data.prices[i];
            totals.carbs += servings * data.carbohydrates[i];
            totals.protein += servings * data.proteins[i];
            totals.fat += servings * data.fats[i];
            totals.sodium += servings * data.sodiums[i];
          }
        });

        resolve({
          meals: selectedMeals,
          totalCost: totals.price,
          totalNutrition: {
            carbohydrates: totals.carbs,
            protein: totals.protein,
            fat: totals.fat,
            sodium: totals.sodium
          },
          objectiveValue: info.objective_function_value
        });
      });
    } catch (error) {
      console.error('Optimization error:', error);
      reject(error);
    }
  });
}

/**
 * Generates an optimized meal plan for a user.
 * 
 * @param {string} userId - The ID of the user to generate a meal plan for
 * @returns {Promise<Object>} Optimized meal plan
 */
export async function generateOptimizedMealPlan(userId) {
  try {
    // Prepare data for the solver
    const data = await prepareSolverData(userId);

    // If no meals are available after filtering, return a user-friendly error
    if (data.mealCount === 0) {
      // Check if there were any meals before filtering
      if (data.totalMealsCount === 0) {
        throw new Error('No meals found in the database. Please add some meals before generating an optimized meal plan.');
      } else {
        throw new Error('No suitable meals found after filtering allergens and checking for required nutrition data. Please ensure your meals have price and nutrition information.');
      }
    }

    // Run the optimization
    const result = await runOptimization(data);

    return result;
  } catch (error) {
    console.error('Error generating optimized meal plan:', error);
    throw error;
  }
}

export default {
  prepareSolverData,
  runOptimization,
  generateOptimizedMealPlan
};
