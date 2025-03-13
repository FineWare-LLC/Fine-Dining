/**
 * @file index.js
 * @description Imports and re-exports the recipe schema and model.
 *              This is the main entry point for the "Recipe" folder.
 */

import recipeSchema from './recipe.schema.js';
import RecipeModel from './recipe.model.js';

/**
 * @module Recipe
 * @description
 * A convenient barrel file that groups recipe-related exports in one place.
 *
 * @property {Schema} recipeSchema - Mongoose Schema for the Recipe model.
 * @property {Model} RecipeModel - Mongoose Model for the Recipe collection.
 */
export {
    recipeSchema,
    RecipeModel
};
