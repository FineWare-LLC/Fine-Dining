// @ts-nocheck
import { withErrorHandling } from './baseQueries';
import { RecipeModel } from '@/models/Recipe/index';
import { paginateQuery } from '@/utils/pagination';
import { validateRecipeSearchInput } from '@/utils/recipeSearch';

/**
 * Retrieves a single recipe by ID, populating the author.
 *
 * @function getRecipe
 * @param {object} _parent
 * @param {object} args - Contains { id }
 * @param {object} context - GraphQL context.
 * @returns {Promise<Object|null>} The recipe document or null.
 */
export const getRecipe = withErrorHandling(async (_parent, { id }, context) => {
    return RecipeModel.findById(id).populate('author');
});

/**
 * Retrieves a paginated list of recipes.
 *
 * @function getRecipes
 * @param {object} _parent
 * @param {object} args - Contains { page, limit }
 * @param {object} context - GraphQL context.
 * @returns {Promise<Object[]>} An array of recipe documents.
 */
export const getRecipes = withErrorHandling(async (_parent, { page, limit }, context) => {
    return paginateQuery(RecipeModel, page, limit);
});

/**
 * Searches recipes by matching a keyword against the recipeName field.
 *
 * @function searchRecipes
 * @param {object} _parent
 * @param {object} args - Contains { keyword }
 * @param {object} context - GraphQL context.
 * @returns {Promise<Object[]>} An array of matching recipes.
 */
export const searchRecipes = withErrorHandling(async (_parent, { keyword }, context) => {
    const validatedKeyword = validateRecipeSearchInput(keyword);
    if (!validatedKeyword.valid) {
        throw validatedKeyword.error;
    }

    return RecipeModel.find(validatedKeyword.input.filter)
        .sort({ recipeName: 1, _id: 1 });
});
