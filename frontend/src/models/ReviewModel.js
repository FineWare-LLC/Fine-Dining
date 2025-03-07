/*************************************************************
 * FILE: /src/models/ReviewModel.js
 * Allows users to leave reviews for recipes or restaurants.
 *************************************************************/

import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        /**
         * A flexible reference: this could point to a Recipe or a Restaurant.
         * We store the target model type in "type" so we know which to populate.
         * Alternatively, keep separate "recipe" and "restaurant" fields if
         * you want stricter references.
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
    { timestamps: true }
);

export default mongoose.models.Review || mongoose.model('Review', reviewSchema);
