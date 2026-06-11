/**
 * @file review.model.js
 * @description Creates a Mongoose model from the reviewSchema.
 */

import mongoose from 'mongoose';
import {reviewSchema} from './review.schema.js';

/**
 * @constant {mongoose.Model} Review
 * @description Mongoose model for the "Review" collection.
 *
 * Checks if the model already exists (in case of hot-reload in Next.js),
 * otherwise creates a new model.
 */
export const Review = mongoose.models.Review || mongoose.model('Review', reviewSchema);
