/*************************************************************
 * FILE: /src/models/MealPlanModel.js
 * Minimal Mongoose model for MealPlan in Fine Dining
 *************************************************************/

import mongoose from 'mongoose';

/**
 * @constant mealPlanSchema
 * Defines fields for the MealPlan collection.
 */
const mealPlanSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        startDate: {
            type: Date,
            required: true,
        },
        endDate: {
            type: Date,
            required: true,
        },
        meals: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Meal',
            },
        ],
    },
    { timestamps: true }
);

/**
 * @constant MealPlanModel
 * Creates a Mongoose model named "MealPlan" if not already existing.
 */
export default mongoose.models.MealPlan || mongoose.model('MealPlan', mealPlanSchema);

