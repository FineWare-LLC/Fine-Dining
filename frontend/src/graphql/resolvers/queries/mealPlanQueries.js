import { withErrorHandling } from './baseQueries.js';
import { MealPlanModel } from '@/models/MealPlan/index.js';
import { paginateQuery } from '@/utils/pagination.js';

/**
 * Retrieves a single meal plan by ID, populating user and meals.
 *
 * @function getMealPlan
 * @param {object} _parent
 * @param {object} args - Contains { id }
 * @param {object} context - GraphQL context.
 * @returns {Promise<Object|null>} The meal plan document or null.
 */
export const getMealPlan = withErrorHandling(async (_parent, { id }, context) => {
  if (!context.user?.userId) {
    throw new Error('Authentication required');
  }
  const mealPlan = await MealPlanModel.findById(id);
  if (!mealPlan) throw new Error('Meal plan not found');
  if (mealPlan.user.toString() !== context.user.userId && context.user.role !== 'ADMIN') {
    throw new Error('Authorization required: You can only get your own meal plans or be an admin.');
  }
  return mealPlan.populate('user').populate('meals');
});

/**
 * Retrieves paginated meal plans, optionally filtered by a user ID.
 *
 * @function getMealPlans
 * @param {object} _parent
 * @param {object} args - Contains { userId, page, limit }
 * @param {object} context - GraphQL context.
 * @returns {Promise<Object[]>} An array of meal plan documents.
 */
export const getMealPlans = withErrorHandling(async (_parent, { userId, page, limit }, context) => {
  if (!context.user?.userId) {
    throw new Error('Authentication required');
  }
  if (userId && context.user.userId !== userId && context.user.role !== 'ADMIN') {
    throw new Error('Authorization required: You can only get your own meal plans or be an admin.');
  }
  const filter = userId ? { user: userId } : {};
  return paginateQuery(
    MealPlanModel.find(filter).populate('user'),
    page,
    limit
  );
});