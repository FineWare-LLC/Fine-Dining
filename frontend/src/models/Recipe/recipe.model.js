/**
 * @file recipe.model.js
 * @description Exports the Mongoose "Recipe" model based on recipe.schema.js.
 */

import mongoose from 'mongoose';
import recipeSchema from './recipe.schema.js';

/**
 * @constant RecipeModel
 * @description
 * Reuses existing "Recipe" model if it’s already registered with Mongoose,
 * otherwise creates a new model with the imported recipeSchema.
 *
 * @example
 * import RecipeModel from './Recipe/recipe.model.js';
 *
 * async function createNewRecipe() {
 *   const newRecipe = new RecipeModel({
 *     recipeName: 'Homemade Pizza',
 *     ingredients: ['Flour', 'Tomato Sauce', 'Cheese'],
 *     instructions: 'Mix dough, add sauce, top with cheese, bake at 220C for 15min.',
 *     prepTime: 30,
 *     difficulty: 'EASY',
 *   });
 *   return await newRecipe.save();
 * }
 */
const RecipeModel =
    mongoose.models.Recipe || mongoose.model('Recipe', recipeSchema);

export default RecipeModel;
