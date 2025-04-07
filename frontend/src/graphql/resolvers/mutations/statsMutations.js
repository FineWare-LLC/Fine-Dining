import { withErrorHandling } from './baseImports.js';
import { StatsModel } from '@/models/Stats/index.js';

/**
 * Creates user stats.
 *
 * @function createStats
 * @param {Object} _parent - Parent resolver result.
 * @param {Object} param0 - Object containing stats details.
 * @param {Object} context - GraphQL context.
 * @returns {Promise<Object>} The created stats.
 */
export const createStats = withErrorHandling(async (_parent, { userId, macros, micros, caloriesConsumed, waterIntake, steps }, context) => {
  if (!context.user?.userId) {
    throw new Error('Authentication required');
  }
  if (context.user.userId !== userId && context.user.role !== 'ADMIN') {
    throw new Error('Authorization required: You can only create stats for yourself or be an admin.');
  }
  return StatsModel.create({
    user: userId,
    macros,
    micros,
    caloriesConsumed,
    waterIntake,
    steps,
  });
});

/**
 * Deletes user stats.
 *
 * @function deleteStats
 * @param {Object} _parent - Parent resolver result.
 * @param {Object} param0 - Object containing stats id.
 * @param {Object} context - GraphQL context.
 * @returns {Promise<Boolean>} True if deletion was successful.
 */
export const deleteStats = withErrorHandling(async (_parent, { id }, context) => {
  if (!context.user?.userId) {
    throw new Error('Authentication required');
  }
  const stats = await StatsModel.findById(id);
  if (!stats) throw new Error('Stats not found');
  if (stats.user.toString() !== context.user.userId && context.user.role !== 'ADMIN') {
    throw new Error('Authorization required: You can only delete your own stats or be an admin.');
  }
  const result = await StatsModel.findByIdAndDelete(id);
  return !!result;
});