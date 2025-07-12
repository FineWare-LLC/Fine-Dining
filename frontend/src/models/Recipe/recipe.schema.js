/**
 * @file recipe.schema.js
 * @description Mongoose schema definition for the "Recipe" collection.
 */

import mongoose from 'mongoose';

const { Schema } = mongoose;

/**
 * @constant recipeSchema
 * @description
 * Schema for the Recipe model containing all fields for a recipe document.
 *
 * Fields:
 *  - recipeName {String}     Name of the recipe (required).
 *  - ingredients {[String]}  Array of ingredients (required).
 *  - instructions {String}   Recipe instructions (required).
 *  - prepTime {Number}       Preparation time in minutes (required).
 *  - difficulty {String}     Either 'EASY', 'INTERMEDIATE', or 'HARD' (default 'EASY').
 *  - nutritionFacts {String} Optional nutritional info.
 *  - tags {[String]}         Tags for search or categorization.
 *  - images {[String]}       Image URLs/paths for the dish.
 *  - estimatedCost {Number}  Estimated cost in currency units (default 0).
 *  - author {ObjectId}       Reference to the User model (if any).
 *  - averageRating {Number}  Computed average rating (default 0).
 *  - ratingCount {Number}    How many users have rated the recipe (default 0).
 *
 * Timestamps:
 *  - createdAt / updatedAt automatically managed by Mongoose.
 */
const recipeSchema = new Schema(
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
        nutritionFacts: {
            type: String,
            default: '',
        },
        tags: [
            {
                type: String,
            },
        ],
        images: [
            {
                type: String,
            },
        ],
        estimatedCost: {
            type: Number,
            default: 0,
        },
        author: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
        averageRating: {
            type: Number,
            default: 0,
        },
        ratingCount: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true },
);

export default recipeSchema;
