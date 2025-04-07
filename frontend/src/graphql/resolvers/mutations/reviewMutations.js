import { withErrorHandling } from './baseImports.js';
import { Review as ReviewModel } from '@/models/Review/index.js';
import { RecipeModel } from '@/models/Recipe/index.js';
import { RestaurantModel } from '@/models/Restaurant/index.js';
import mongoose from 'mongoose';

/**
 * Creates a new review.
 *
 * @function createReview
 * @param {Object} _parent - Parent resolver result.
 * @param {Object} param0 - Object containing review details.
 * @param {string} param0.targetType - The type of target ('RECIPE' or 'RESTAURANT').
 * @param {string} param0.targetId - The ID of the target resource.
 * @param {number|string} param0.rating - The review rating (must be between 1 and 5).
 * @param {string} param0.comment - The review comment.
 * @param {Object} context - GraphQL context.
 * @returns {Promise<Object>} The created review.
 */
export const createReview = withErrorHandling(async (_parent, { targetType, targetId, rating, comment }, context) => {
  // Authentication check
  if (!context.user?.userId) {
    throw new Error('Authentication required');
  }

  // Validate targetType
  if (!['RECIPE', 'RESTAURANT'].includes(targetType)) {
    throw new Error('Invalid targetType');
  }

  // Validate targetId is a valid ObjectId
  if (!mongoose.Types.ObjectId.isValid(targetId)) {
    throw new Error('Invalid targetId');
  }

  // Validate rating: must be a number between 1 and 5.
  const numericRating = Number(rating);
  if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
    throw new Error('Rating must be a number between 1 and 5');
  }

  // Validate and sanitize comment
  if (typeof comment !== 'string') {
    throw new Error('Comment must be a string');
  }
  comment = comment.trim();

  const userId = context.user.userId;
  const newReview = await ReviewModel.create({
    user: userId,
    targetType,
    targetId,
    rating: numericRating,
    comment,
  });

  // Update target's rating aggregates
  if (targetType === 'RECIPE') {
    const recipe = await RecipeModel.findById(targetId);
    if (recipe) {
      recipe.averageRating = ((recipe.averageRating * recipe.ratingCount) + numericRating) / (recipe.ratingCount + 1);
      recipe.ratingCount += 1;
      await recipe.save();
    }
  } else if (targetType === 'RESTAURANT') {
    const restaurant = await RestaurantModel.findById(targetId);
    if (restaurant) {
      restaurant.averageRating = ((restaurant.averageRating * restaurant.ratingCount) + numericRating) / (restaurant.ratingCount + 1);
      restaurant.ratingCount += 1;
      await restaurant.save();
    }
  }
  return newReview;
});

/**
 * Deletes a review.
 *
 * @function deleteReview
 * @param {Object} _parent - Parent resolver result.
 * @param {Object} param0 - Object containing the review id.
 * @param {string} param0.id - The ID of the review to delete.
 * @param {Object} context - GraphQL context.
 * @returns {Promise<Boolean>} True if deletion was successful.
 */
export const deleteReview = withErrorHandling(async (_parent, { id }, context) => {
  // Authentication check
  if (!context.user?.userId) {
    throw new Error('Authentication required');
  }

  // Validate review id
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error('Invalid review id');
  }

  const review = await ReviewModel.findById(id);
  if (!review) {
    throw new Error('Review not found');
  }
  // Authorization: only review owner or admin can delete
  if (review.user.toString() !== context.user.userId && context.user.role !== 'ADMIN') {
    throw new Error('Authorization required: You can only delete your own reviews or be an admin.');
  }

  // Update target's rating aggregates
  if (review.targetType === 'RECIPE') {
    const recipe = await RecipeModel.findById(review.targetId);
    if (recipe && recipe.ratingCount > 0) {
      const totalRating = recipe.averageRating * recipe.ratingCount;
      const newTotal = totalRating - review.rating;
      const newCount = recipe.ratingCount - 1;
      recipe.ratingCount = newCount;
      recipe.averageRating = newCount > 0 ? newTotal / newCount : 0;
      await recipe.save();
    }
  } else if (review.targetType === 'RESTAURANT') {
    const restaurant = await RestaurantModel.findById(review.targetId);
    if (restaurant && restaurant.ratingCount > 0) {
      const totalRating = restaurant.averageRating * restaurant.ratingCount;
      const newTotal = totalRating - review.rating;
      const newCount = restaurant.ratingCount - 1;
      restaurant.ratingCount = newCount;
      restaurant.averageRating = newCount > 0 ? newTotal / newCount : 0;
      await restaurant.save();
    }
  }
  await ReviewModel.findByIdAndDelete(id);
  return true;
});
