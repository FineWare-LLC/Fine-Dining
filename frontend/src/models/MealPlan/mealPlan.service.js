/**
 * @file mealPlan.service.js
 * @description Provides business-logic-related methods for the MealPlan model (over-engineering example).
 */

import MealPlanModel from './mealPlan.model.js';

/**
 * @function createMealPlan
 * @description Creates a new meal plan document.
 * @param {Object} mealPlanData - Data to create a new MealPlan.
 * @returns {Promise<Object>} Newly created MealPlan document.
 *
 * @example
 * const newMealPlan = await createMealPlan({ user: '123', startDate: new Date(), endDate: ... });
 */
export async function createMealPlan(mealPlanData) {
    return MealPlanModel.create(mealPlanData);
}

/**
 * @function getMealPlanById
 * @description Retrieves a MealPlan document by its ID.
 * @param {string} mealPlanId - Mongoose ObjectId string representing the MealPlan.
 * @returns {Promise<Object|null>} The MealPlan document if found, otherwise null.
 *
 * @example
 * const plan = await getMealPlanById('603cbf0dcf1e3b3254d78901');
 */
export async function getMealPlanById(mealPlanId) {
    return MealPlanModel.findById(mealPlanId).populate('meals');
}

/**
 * @function getMealPlansByUser
 * @description Fetches all MealPlan documents for a specific user.
 * @param {string} userId - The user ID whose meal plans should be fetched.
 * @returns {Promise<Array<Object>>} An array of MealPlan documents.
 *
 * @example
 * const mealPlans = await getMealPlansByUser('603cbf0dcf1e3b3254d78901');
 */
export async function getMealPlansByUser(userId) {
    return MealPlanModel.find({ user: userId }).sort({ startDate: 1 });
}

/**
 * @function updateMealPlan
 * @description Updates a MealPlan document with the given changes.
 * @param {string} mealPlanId - Mongoose ObjectId of the MealPlan to update.
 * @param {Object} updateData - Fields to be updated on the MealPlan.
 * @returns {Promise<Object|null>} The updated MealPlan document if found, otherwise null.
 *
 * @example
 * const updatedPlan = await updateMealPlan('603cbf0dcf1e3b3254d78901', { title: 'New Title' });
 */
export async function updateMealPlan(mealPlanId, updateData) {
    return MealPlanModel.findByIdAndUpdate(mealPlanId, updateData, { new: true });
}

/**
 * @function deleteMealPlan
 * @description Removes a MealPlan document by its ID.
 * @param {string} mealPlanId - Mongoose ObjectId of the MealPlan to delete.
 * @returns {Promise<Object|null>} The removed MealPlan document if found, otherwise null.
 *
 * @example
 * const deletedPlan = await deleteMealPlan('603cbf0dcf1e3b3254d78901');
 */
export async function deleteMealPlan(mealPlanId) {
    return MealPlanModel.findByIdAndRemove(mealPlanId);
}
