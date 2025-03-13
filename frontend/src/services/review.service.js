/**
 * @file review.service.js
 * @description Provides service-level functions for handling review operations.
 * These are convenience methods that help abstract direct model calls.
 */

import { Review } from '../models/review/index.js';

/**
 * Create a new review.
 *
 * @async
 * @function createReview
 * @param {Object} reviewData - The data needed to create a new review.
 * @param {string} reviewData.user - The user ID who wrote the review.
 * @param {string} reviewData.targetType - Type of target (RECIPE or RESTAURANT).
 * @param {string} reviewData.targetId - The ID of the target being reviewed.
 * @param {number} reviewData.rating - A rating from 1-5.
 * @param {string} [reviewData.comment] - Optional comment for the review.
 * @returns {Promise<Object>} The newly created review document.
 * @throws Will throw an error if MongoDB insert fails.
 */
export async function createReview(reviewData) {
    try {
        const newReview = await Review.create(reviewData);
        return newReview;
    } catch (error) {
        throw new Error(`Failed to create review: ${error.message}`);
    }
}

/**
 * Retrieve reviews by a specific target.
 *
 * @async
 * @function getReviewsByTarget
 * @param {string} targetType - The type of the target (RECIPE or RESTAURANT).
 * @param {string} targetId - The unique ID of the target.
 * @returns {Promise<Array<Object>>} An array of review documents.
 * @throws Will throw an error if retrieval fails.
 */
export async function getReviewsByTarget(targetType, targetId) {
    try {
        const reviews = await Review.find({ targetType, targetId }).exec();
        return reviews;
    } catch (error) {
        throw new Error(`Failed to retrieve reviews: ${error.message}`);
    }
}
