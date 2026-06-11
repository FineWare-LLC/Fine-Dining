// @ts-nocheck
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
import { applyPlugins } from '../../../plugins/registry.mjs';
import { countMeals, findMeals } from '../data/MealRepository';
import { findUserById } from '../data/UserRepository';
import { createSolverError } from '../io/solverOutput';
import Cookbook from '../models/Cookbook/cookbookSchema';
import MenuItemModel from '../models/MenuItem/menuItem.model';
import { collectCanonicalAllergies, mealHasAllergenConflict } from '../utils/allergyPreferences';

const { Solver, solverVersion } = highsDefault;
const STATUS_OPTIMAL = 7; // HiGHS status code for Optimal

// Solver configuration via environment variables
const {
    HIGHS_THREADS,
    HIGHS_PRESOLVE,
    HIGHS_TIME_LIMIT,
} = process.env;

const DEFAULT_RESTAURANT_MENU_LIMIT = 300;

function splitSelectedMealIds(selectedMealIds = []) {
    const mealIds = [];
    const menuItemIds = [];

    selectedMealIds.forEach(id => {
        if (typeof id === 'string' && id.startsWith('menu:')) {
            menuItemIds.push(id.slice('menu:'.length));
        } else if (id) {
            mealIds.push(id);
        }
    });

    return { mealIds, menuItemIds };
}

function normalizeRestaurantMenuItem(item) {
    const restaurantName = item.restaurant?.restaurantName || item.restaurantName || 'Restaurant';

    return {
        _id: `menu:${item._id.toString()}`,
        mealName: `${restaurantName} - ${item.mealName}`,
        price: item.price,
        nutrition: {
            carbohydrates: item.carbohydrates,
            protein: item.protein,
            fat: item.fat,
            sodium: item.sodium,
        },
        allergens: item.allergens || [],
        ingredients: [],
        sourceType: 'restaurant-menu',
        menuItemId: item._id.toString(),
        restaurantId: item.restaurant?._id?.toString?.() || item.restaurant?.toString?.() || '',
    };
}

async function findRestaurantMenuCandidates(menuItemIds = []) {
    const query = menuItemIds.length > 0
        ? { _id: { $in: menuItemIds } }
        : { isOptimizerEligible: true };

    const items = await MenuItemModel.find(query)
        .populate('restaurant')
        .limit(DEFAULT_RESTAURANT_MENU_LIMIT);

    return items
        .filter(item => item.price !== undefined && item.price !== null)
        .map(normalizeRestaurantMenuItem);
}

/**
 * Prepares data for the HiGHS solver by fetching user nutrition targets
 * and available meals, and filtering out meals containing user allergens.
 *
 * Note: Meals with a price of 0 are included in the filtering logic.
 * Only meals with undefined or null prices are filtered out.
 * Detailed logging is included to help debug issues with meal filtering.
 *
 * @param {string} userId - The ID of the user to generate a meal plan for
 * @param {Array} selectedMealIds - Optional array of meal IDs to include in the optimization
 * @param {Object} customNutritionTargets - Optional custom nutrition targets to override user's defaults
 * @returns {Promise<Object>} Object containing formatted meal data and user nutrition targets
 */
export async function prepareSolverData(userId, selectedMealIds = [], customNutritionTargets = null, optimizationParams = null) {
    console.log(`Preparing solver data for user ${userId}...`);
    console.log(`Selected meal IDs: ${selectedMealIds.length > 0 ? selectedMealIds.join(', ') : 'None'}`);
    console.log(`Custom nutrition targets: ${customNutritionTargets ? 'Provided' : 'None'}`);
    const selectedIds = splitSelectedMealIds(selectedMealIds);

    // Fetch user data including nutrition targets and allergies
    const user = await findUserById(userId);
    if (!user) {
        throw new Error('User not found');
    }

    // Fail-shut: enforce tier constraints before continuing
    if (optimizationParams && !['PREMIUM', 'PRO', 'ADMIN', 'SUPER_ADMIN'].includes(optimizationParams.tier) && optimizationParams.advancedConstraints) {
        const adv = optimizationParams.advancedConstraints;
        const hasAdvanced = (adv.allergensToExclude && adv.allergensToExclude.length > 0) ||
                            (adv.cheatDaysAllowed && adv.cheatDaysAllowed > 0) ||
                            (adv.micronutrients && (adv.micronutrients.iron !== null || adv.micronutrients.calcium !== null || adv.micronutrients.vitaminC !== null));
        if (hasAdvanced) {
            throw new Error('FAIL-SHUT: Free tier cannot use advanced optimization constraints.');
        }
    }

    // Extract user's allergies and disallowed ingredients (case-insensitive)
    const userAllergies = collectCanonicalAllergies(user);
    const disallowedIngredients = new Set(
        (user.questionnaire?.disallowedIngredients || user.dislikedIngredients || []).map(i =>
            i.toLowerCase().trim(),
        ),
    );

    if (optimizationParams && ['PREMIUM', 'PRO'].includes(optimizationParams.tier) && optimizationParams.advancedConstraints) {
        if (optimizationParams.advancedConstraints.allergensToExclude) {
            collectCanonicalAllergies({ allergies: optimizationParams.advancedConstraints.allergensToExclude }).forEach((allergy) => {
                userAllergies.add(allergy);
            });
        }
    }

    // Combine user's cookbooks
    const userCookbooks = await Cookbook.find({ user: userId });
    let combinedMealIds = [...selectedIds.mealIds];
    userCookbooks.forEach(cb => {
        if (cb.meals) {
            combinedMealIds.push(...cb.meals.map(m => m.toString()));
        }
    });
    // unique ids
    combinedMealIds = [...new Set(combinedMealIds)];

    // Base query for counting all meals before filtering
    const hasExplicitSelection = selectedMealIds && selectedMealIds.length > 0;
    const baseQuery = hasExplicitSelection
        ? { _id: { $in: combinedMealIds } }
        : {};

    const totalMealsCount = await countMeals(baseQuery);

    // Create meal query based on selected meal IDs
    const mealQuery = { ...baseQuery };

    const filteredMealsRaw = await findMeals(mealQuery);
    const restaurantMenuCandidates = !hasExplicitSelection || selectedIds.menuItemIds.length > 0
        ? await findRestaurantMenuCandidates(selectedIds.menuItemIds)
        : [];
    const candidateMeals = [...filteredMealsRaw, ...restaurantMenuCandidates];
    const candidateCount = totalMealsCount + restaurantMenuCandidates.length;
    console.log(`Query returned ${candidateMeals.length} optimizer candidates out of ${candidateCount} total`);

    // Track filtering statistics
    let allergenCount = 0;
    let ingredientBlockCount = 0;

    // Final filtering - check nutrition values, allergens, and disallowed ingredients
    const filteredMeals = candidateMeals.filter(meal => {
    // Basic nutrition data check
        if (!(meal.price !== undefined && meal.price !== null && meal.nutrition &&
        meal.nutrition.carbohydrates !== undefined &&
        meal.nutrition.protein !== undefined &&
        meal.nutrition.fat !== undefined &&
        meal.nutrition.sodium !== undefined)) {
            return false;
        }

        // Skip meals containing user allergens
        if (mealHasAllergenConflict(meal.allergens, userAllergies)) {
            allergenCount++;
            return false;
        }

        // Skip meals containing disallowed ingredients
        if (disallowedIngredients.size > 0 && meal.ingredients && meal.ingredients.length > 0) {
            const mealIngs = new Set(meal.ingredients.map(i => i.toLowerCase().trim()));
            for (const ing of disallowedIngredients) {
                if (mealIngs.has(ing)) {
                    ingredientBlockCount++;
                    return false;
                }
            }
        }

        return true;
    });

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
        sodiumMax: user.nutritionTargets?.sodiumMax || 2300, // Default to 2300mg sodium maximum (FDA recommendation)
    };

    // Override with custom nutrition targets if provided
    if (customNutritionTargets) {
        if (customNutritionTargets.proteinMin !== undefined) nutritionTargets.proteinMin = customNutritionTargets.proteinMin;
        if (customNutritionTargets.proteinMax !== undefined) nutritionTargets.proteinMax = customNutritionTargets.proteinMax;
        if (customNutritionTargets.carbohydratesMin !== undefined) nutritionTargets.carbohydratesMin = customNutritionTargets.carbohydratesMin;
        if (customNutritionTargets.carbohydratesMax !== undefined) nutritionTargets.carbohydratesMax = customNutritionTargets.carbohydratesMax;
        if (customNutritionTargets.fatMin !== undefined) nutritionTargets.fatMin = customNutritionTargets.fatMin;
        if (customNutritionTargets.fatMax !== undefined) nutritionTargets.fatMax = customNutritionTargets.fatMax;
        if (customNutritionTargets.sodiumMin !== undefined) nutritionTargets.sodiumMin = customNutritionTargets.sodiumMin;
        if (customNutritionTargets.sodiumMax !== undefined) nutritionTargets.sodiumMax = customNutritionTargets.sodiumMax;
    }

    console.log('Using nutrition targets:', nutritionTargets);

    return {
        mealCount: filteredMeals.length,
        totalMealsCount: candidateCount,
        mealIds,
        mealNames,
        prices: Float64Array.from(prices),
        carbohydrates: Float64Array.from(carbs),
        proteins: Float64Array.from(proteins),
        fats: Float64Array.from(fats),
        sodiums: Float64Array.from(sodiums),
        nutritionTargets,
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
        nutritionTargets,
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
        nutritionTargets.sodiumMin,
    ]);

    const rowUpperBounds = new Float64Array([
        nutritionTargets.carbohydratesMax === Infinity ? 1e10 : nutritionTargets.carbohydratesMax,
        nutritionTargets.proteinMax === Infinity ? 1e10 : nutritionTargets.proteinMax,
        nutritionTargets.fatMax === Infinity ? 1e10 : nutritionTargets.fatMax,
        nutritionTargets.sodiumMax === Infinity ? 1e10 : nutritionTargets.sodiumMax,
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
        isMaximization,
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
            if (HIGHS_THREADS) solver.setOptionValue('threads', parseInt(HIGHS_THREADS, 10));
            if (HIGHS_PRESOLVE) solver.setOptionValue('presolve', HIGHS_PRESOLVE);
            if (HIGHS_TIME_LIMIT) solver.setOptionValue('time_limit', parseFloat(HIGHS_TIME_LIMIT));
            // Invoke optional plugins to modify the solver
            applyPlugins(solver);
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
                    sodium: 0,
                };

                sol.columnValues.forEach((halfServings, i) => {
                    if (halfServings > 0.5) {
                        // Round to nearest 0.5
                        const servings = Math.round(halfServings) / 2;

                        selectedMeals.push({
                            mealId: data.mealIds[i],
                            mealName: data.mealNames[i],
                            servings,
                            pricePerServing: data.prices[i],
                            totalPrice: servings * data.prices[i],
                            nutrition: {
                                carbohydrates: data.carbohydrates[i],
                                protein: data.proteins[i],
                                fat: data.fats[i],
                                sodium: data.sodiums[i],
                            },
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
                        sodium: totals.sodium,
                    },
                    objectiveValue: info.objective_function_value,
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
 * @param {Array} selectedMealIds - Optional array of meal IDs to include in the optimization
 * @param {Object} customNutritionTargets - Optional custom nutrition targets to override user's defaults
 * @returns {Promise<Object>} Optimized meal plan
 */
export async function generateOptimizedMealPlan(userId, selectedMealIds = [], customNutritionTargets = null, optimizationParams = null) {
    try {
    // Prepare data for the solver with optional selected meals and custom nutrition targets
        const data = await prepareSolverData(userId, selectedMealIds, customNutritionTargets, optimizationParams);

        // If no meals are available after filtering, return a user-friendly error
        if (data.mealCount === 0) {
            // Check if there were any meals before filtering
            if (data.totalMealsCount === 0) {
                throw new Error('No meals found in the database. Please add some meals before generating an optimized meal plan.');
            } else if (selectedMealIds && selectedMealIds.length > 0) {
                throw new Error('No suitable meals found among your selected meals. Please ensure your selected meals have price and nutrition information and do not contain your allergens.');
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

const OptimizationService = {
    prepareSolverData,
    runOptimization,
    generateOptimizedMealPlan,
};

export default OptimizationService;
