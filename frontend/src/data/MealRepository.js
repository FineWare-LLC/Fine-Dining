import { MealModel } from '../models/Meal/index.js';

/**
 * Count meals matching a query.
 * @param {Object} query
 * @returns {Promise<number>}
 */
export function countMeals(query = {}) {
  return MealModel.countDocuments(query);
}

/**
 * Find meals matching a query.
 * @param {Object} query
 * @returns {Promise<Array>}
 */
export function findMeals(query = {}) {
  return MealModel.find(query);
}

/**
 * Find a meal by id.
 * @param {string} id
 * @returns {Promise<Object|null>}
 */
export function findMealById(id) {
  return MealModel.findById(id);
}

export default {
  countMeals,
  findMeals,
  findMealById,
};
