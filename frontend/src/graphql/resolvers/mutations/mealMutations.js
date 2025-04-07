import { withErrorHandling } from './baseImports.js';
import { MealModel } from '@/models/Meal/index.js';
import { MealPlanModel } from "@/models/MealPlan/index.js";
import { RecipeModel } from '@/models/Recipe/index.js';
import { RestaurantModel } from '@/models/Restaurant/index.js';

/**
 * Creates a meal within a meal plan.
 *
 * @function createMeal
 * @param {Object} _parent - Parent resolver result.
 * @param {Object} param0 - Object containing meal details.
 * @param {Object} context - GraphQL context.
 * @returns {Promise<Object>} The created meal.
 */
export const createMeal = withErrorHandling(async (
  _parent,
  { mealPlanId, date, mealType, recipeId, restaurantId, mealName, ingredients, nutritionFacts, portionSize, notes },
  context
) => {
  if (!context.user?.userId) {
    throw new Error('Authentication required');
  }
  const mealPlan = await MealPlanModel.findById(mealPlanId);
  if (!mealPlan) throw new Error('MealPlan not found');
  if (mealPlan.user.toString() !== context.user.userId && context.user.role !== 'ADMIN') {
    throw new Error('Authorization required: You can only create meals for your own meal plans or be an admin.');
  }
  const recipe = recipeId ? await RecipeModel.findById(recipeId) : null;
  const restaurant = restaurantId ? await RestaurantModel.findById(restaurantId) : null;
  const newMeal = await MealModel.create({
    mealPlan: mealPlan._id,
    date,
    mealType,
    recipe: recipe ? recipe._id : null,
    restaurant: restaurant ? restaurant._id : null,
    mealName,
    ingredients,
    nutritionFacts,
    portionSize,
    notes,
  });
  mealPlan.meals.push(newMeal._id);
  await mealPlan.save();
  return newMeal;
});

/**
 * Updates an existing meal.
 *
 * @function updateMeal
 * @param {Object} _parent - Parent resolver result.
 * @param {Object} param0 - Object containing meal id and update fields.
 * @param {Object} context - GraphQL context.
 * @returns {Promise<Object>} The updated meal.
 */
export const updateMeal = withErrorHandling(async (
  _parent,
  { id, date, mealType, recipeId, restaurantId, mealName, ingredients, nutritionFacts, portionSize, notes },
  context
) => {
  if (!context.user?.userId) {
    throw new Error('Authentication required');
  }
  const meal = await MealModel.findById(id);
  if (!meal) throw new Error('Meal not found');
  const mealPlan = await MealPlanModel.findById(meal.mealPlan);
  if (mealPlan.user.toString() !== context.user.userId && context.user.role !== 'ADMIN') {
    throw new Error('Authorization required: You can only update meals in your own meal plans or be an admin.');
  }
  if (date !== undefined) meal.date = date;
  if (mealType !== undefined) meal.mealType = mealType;
  if (recipeId !== undefined) meal.recipe = recipeId;
  if (restaurantId !== undefined) meal.restaurant = restaurantId;
  if (mealName !== undefined) meal.mealName = mealName;
  if (ingredients !== undefined) meal.ingredients = ingredients;
  if (nutritionFacts !== undefined) meal.nutritionFacts = nutritionFacts;
  if (portionSize !== undefined) meal.portionSize = portionSize;
  if (notes !== undefined) meal.notes = notes;
  return meal.save();
});

/**
 * Deletes a meal.
 *
 * @function deleteMeal
 * @param {Object} _parent - Parent resolver result.
 * @param {Object} param0 - Object containing the meal id.
 * @param {Object} context - GraphQL context.
 * @returns {Promise<Boolean>} True if deletion was successful.
 */
export const deleteMeal = withErrorHandling(async (_parent, { id }, context) => {
  if (!context.user?.userId) {
    throw new Error('Authentication required');
  }
  const meal = await MealModel.findById(id);
  if (!meal) throw new Error('Meal not found');
  const mealPlan = await MealPlanModel.findById(meal.mealPlan);
  if (mealPlan.user.toString() !== context.user.userId && context.user.role !== 'ADMIN') {
    throw new Error('Authorization required: You can only delete meals from your own meal plans or be an admin.');
  }
  if (mealPlan) {
    mealPlan.meals = mealPlan.meals.filter(mId => mId.toString() !== id);
    await mealPlan.save();
  }
  await meal.deleteOne();
  return true;
});