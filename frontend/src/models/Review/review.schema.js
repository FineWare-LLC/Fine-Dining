/**
 * @file review.schema.js
 * @description Defines the schema for storing user reviews on recipes or restaurants.
 */

import mongoose from 'mongoose';

/**
 * @constant {mongoose.Schema} reviewSchema
 * @description MongoDB schema definition for the Review collection.
 *
 * Fields:
 * - user: The ObjectId reference to the user who wrote the review.
 * - targetType: String enum indicating what the review targets (e.g., 'RECIPE' or 'RESTAURANT').
 * - targetId: The ObjectId reference to the target (recipe or restaurant).
 * - rating: A numeric rating from 1 to 5 (inclusive).
 * - comment: Optional text comment for the review.
 *
 * @example
 * // Example instantiation:
 * const newReview = new Review({
 *   user: someUserId,
 *   targetType: 'RECIPE',
 *   targetId: someRecipeId,
 *   rating: 5,
 *   comment: 'Delicious recipe!',
 * });
 */
export const reviewSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        /**
         * A flexible reference: this could point to a Recipe or a Restaurant.
         * We store the target model type in "targetType" to populate accordingly.
         */
        targetType: {
            type: String,
            enum: ['RECIPE', 'RESTAURANT'],
            required: true,
        },
        targetId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },
        rating: {
            type: Number,
            min: 1,
            max: 5,
            required: true,
        },
        comment: {
            type: String,
            default: '',
        },
    },
    {
        timestamps: true,
    },
);
