import { withErrorHandling } from './baseImports.js';
import User from '@/models/User/index.js';
import { MealPlanModel } from "@/models/MealPlan/index.js";

/**
 * Creates a new meal plan.
 *
 * @function createMealPlan
 * @param {Object} _parent - Parent resolver result.
 * @param {Object} param0 - Object containing meal plan details.
 * @param {Object} context - GraphQL context.
 * @returns {Promise<Object>} The created meal plan.
 */
export const createMealPlan = withErrorHandling(async (_parent, { userId, startDate, endDate, title, status, totalCalories }, context) => {
  if (!context.user?.userId) {
    throw new Error('Authentication required');
  }
  if (context.user.userId !== userId && context.user.role !== 'ADMIN') {
    throw new Error('Authorization required: You can only create meal plans for yourself or be an admin.');
  }
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');
  const newPlan = await MealPlanModel.create({
    user: user._id,
    startDate,
    endDate,
    title,
    status,
    totalCalories,
  });
  return newPlan.populate('user');
});

/**
 * Updates an existing meal plan.
 *
 * @function updateMealPlan
 * @param {Object} _parent - Parent resolver result.
 * @param {Object} param0 - Object containing meal plan id and update fields.
 * @param {Object} context - GraphQL context.
 * @returns {Promise<Object>} The updated meal plan.
 */
export const updateMealPlan = withErrorHandling(async (_parent, { id, startDate, endDate, title, status, totalCalories }, context) => {
  if (!context.user?.userId) {
    throw new Error('Authentication required');
  }
  const mealPlan = await MealPlanModel.findById(id);
  if (!mealPlan) throw new Error('Meal plan not found');
  if (mealPlan.user.toString() !== context.user.userId && context.user.role !== 'ADMIN') {
    throw new Error('Authorization required: You can only update your own meal plans or be an admin.');
  }
  const updateData = {};
  if (startDate !== undefined) updateData.startDate = startDate;
  if (endDate !== undefined) updateData.endDate = endDate;
  if (title !== undefined) updateData.title = title;
  if (status !== undefined) updateData.status = status;
  if (totalCalories !== undefined) updateData.totalCalories = totalCalories;
  return MealPlanModel.findByIdAndUpdate(id, updateData, { new: true }).populate('user');
});

/**
 * Deletes a meal plan.
 *
 * @function deleteMealPlan
 * @param {Object} _parent - Parent resolver result.
 * @param {Object} param0 - Object containing meal plan id.
 * @param {Object} context - GraphQL context.
 * @returns {Promise<Boolean>} True if deletion was successful.
 */
export const deleteMealPlan = withErrorHandling(async (_parent, { id }, context) => {
  if (!context.user?.userId) {
    throw new Error('Authentication required');
  }
  const mealPlan = await MealPlanModel.findById(id);
  if (!mealPlan) throw new Error('Meal plan not found');
  if (mealPlan.user.toString() !== context.user.userId && context.user.role !== 'ADMIN') {
    throw new Error('Authorization required: You can only delete your own meal plans or be an admin.');
  }
  const result = await MealPlanModel.findByIdAndDelete(id);
  return !!result;
});