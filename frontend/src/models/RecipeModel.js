/*************************************************************
 * FILE: /src/models/RecipeModel.js
 * Minimal Mongoose model for Recipe in Fine Dining
 *************************************************************/

import mongoose from 'mongoose';

/**
 * @constant recipeSchema
 * Defines fields for the Recipe collection.
 */
const recipeSchema = new mongoose.Schema(
    {
        recipeName: {
            type: String,
            required: true,
        },
        ingredients: {
            type: [String],
            required: true,
        },
        instructions: {
            type: String,
            required: true,
        },
        prepTime: {
            type: Number,
            required: true,
        },
        difficulty: {
            type: String,
            enum: ['EASY', 'INTERMEDIATE', 'HARD'],
            default: 'EASY',
        },
        nutritionFacts: String,
    },
    { timestamps: true }
);

/**
 * @constant RecipeModel
 * Creates a Mongoose model named "Recipe" if not already existing.
 */
export default mongoose.models.Recipe || mongoose.model('Recipe', recipeSchema);
