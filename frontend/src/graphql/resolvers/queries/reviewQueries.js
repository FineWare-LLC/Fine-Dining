import { withErrorHandling } from './baseQueries.js';
import { Review as ReviewModel } from '@/graphql/resolvers/resolversFields.js';

/**
 * Retrieves a single review by ID, populating the user who created it.
 *
 * @function getReview
 * @param {object} _parent
 * @param {object} args - Contains { id }
 * @param {object} context - GraphQL context.
 * @returns {Promise<Object|null>} The review document or null.
 */
export const getReview = withErrorHandling(async (_parent, { id }, context) => {
    return ReviewModel.findById(id).populate('user');
});

/**
 * Retrieves all reviews for a specified target.
 *
 * @function getReviewsForTarget
 * @param {object} _parent
 * @param {object} args - Contains { targetType, targetId }
 * @param {object} context - GraphQL context.
 * @returns {Promise<Object[]>} An array of review documents.
 */
export const getReviewsForTarget = withErrorHandling(async (_parent, { targetType, targetId }, context) => {
    return ReviewModel.find({ targetType, targetId }).populate('user');
});