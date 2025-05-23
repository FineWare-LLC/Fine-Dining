/******************************************************************************
 * /src/models/MealModel/mealSchema.js
 *
 * Base schema definition for Meal. This file references the custom validators
 * but not the hooks, statics, or methods—those are applied outside.
 ******************************************************************************/

import mongoose from 'mongoose';
import { dateWithinLastFiftyYears, validateNonEmptyIngredients } from './mealValidations.js';

const { Schema } = mongoose;

/**
 * @typedef {import('mongoose').Types.ObjectId} ObjectId
 */

/**
 * @class Meal
 * @classdesc Represents a planned meal object in the system. Belongs to a MealPlan,
 *            includes date, type (BREAKFAST, LUNCH, DINNER, SNACK), optional
 *            recipe/restaurant references, user-friendly name, ingredients,
 *            and nutritionFacts.
 */
export const mealSchema = new Schema(
    {
        mealPlan: {
            type: Schema.Types.ObjectId,
            ref: 'MealPlan',
            required: true,
        },
        date: {
            type: Date,
            required: true,
            validate: {
                validator: dateWithinLastFiftyYears,
                message: 'Meal date cannot be set more than 50 years in the past.',
            },
        },
        mealType: {
            type: String,
            enum: ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'],
            required: true,
        },
        recipe: {
            type: Schema.Types.ObjectId,
            ref: 'Recipe',
        },
        restaurant: {
            type: Schema.Types.ObjectId,
            ref: 'Restaurant',
        },
        mealName: {
            type: String,
            trim: true,
            default: '',
            maxlength: [120, 'Meal name cannot exceed 120 characters'],
        },
        price: {
            type: Number,
            default: 0,
            min: [0, 'Price cannot be negative'],
        },
        ingredients: {
            type: [String],
            default: [],
            validate: {
                validator: validateNonEmptyIngredients,
                message: 'Ingredients must not contain empty strings.',
            },
        },
        nutrition: {
            carbohydrates: {
                type: Number,
                default: 0,
                min: [0, 'Carbohydrates cannot be negative'],
            },
            protein: {
                type: Number,
                default: 0,
                min: [0, 'Protein cannot be negative'],
            },
            fat: {
                type: Number,
                default: 0,
                min: [0, 'Fat cannot be negative'],
            },
            sodium: {
                type: Number,
                default: 0,
                min: [0, 'Sodium cannot be negative'],
            },
        },
        allergens: {
            type: [String],
            default: [],
        },
        nutritionFacts: {
            type: String,
            default: '',
        },
    },
    {
        timestamps: true,
    }
);
