/**
 * @file mealPlan.schema.js
 * @description Defines the Mongoose schema for MealPlan objects.
 */

import mongoose from 'mongoose';

/**
 * @constant mealPlanSchema
 * @description Mongoose schema to structure MealPlan documents in MongoDB.
 *
 * Fields:
 * - user: Reference to the User who owns this meal plan.
 * - startDate: The start date of the meal plan (required).
 * - endDate: The end date of the meal plan (required).
 * - title: A short descriptive title of the meal plan.
 * - status: Can be 'ACTIVE', 'COMPLETED', or 'CANCELLED'. Defaults to 'ACTIVE'.
 * - totalCalories: Tracks the total calories allocated in the meal plan.
 * - meals: An array of Meal references belonging to this plan.
 *
 * @type {mongoose.Schema}
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
        title: {
            type: String,
            default: '',
        },
        status: {
            type: String,
            enum: ['ACTIVE', 'COMPLETED', 'CANCELLED'],
            default: 'ACTIVE',
        },
        totalCalories: {
            type: Number,
            default: 0,
        },
        meals: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Meal',
            },
        ],
    },
    {
        timestamps: true,
    }
);

export default mealPlanSchema;
