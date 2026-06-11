import { withErrorHandling } from '../queries/baseQueries.js';
import { RecipeModel } from '@/models/Recipe/index.js';
import { UserModel } from '@/models/User/index.js';

/**
 * Save/like a recipe for the authenticated user
 * 
 * @param {object} _parent
 * @param {object} args - Contains recipeId
 * @param {object} context - GraphQL context with user info
 * @returns {Promise<Object>} The saved Recipe
 */
export const saveRecipe = withErrorHandling(async (_parent, { recipeId }, context) => {
  if (!context.user?.userId) {
    throw new Error('Authentication required');
  }

  // Check if recipe exists
  const recipe = await RecipeModel.findById(recipeId);
  if (!recipe) {
    throw new Error('Recipe not found');
  }

  // Add to user's favorites using atomic update
  await UserModel.findByIdAndUpdate(
    context.user.userId,
    { 
        $addToSet: { favoriteRecipes: recipeId },
        $pull: { rejectedRecipes: recipeId } // Ensure it's not in rejected if we like it now
    }
  );

  return recipe;
});

/**
 * Reject/dismiss a recipe for the authenticated user
 * 
 * @param {object} _parent
 * @param {object} args - Contains recipeId
 * @param {object} context - GraphQL context with user info
 * @returns {Promise<Boolean>} Success status
 */
export const rejectRecipe = withErrorHandling(async (_parent, { recipeId }, context) => {
  if (!context.user?.userId) {
    throw new Error('Authentication required');
  }

  // Check if recipe exists (optional, but good for validity)
  const recipe = await RecipeModel.findById(recipeId);
  if (!recipe) {
    throw new Error('Recipe not found');
  }

  // Add to user's rejected recipes
  await UserModel.findByIdAndUpdate(
    context.user.userId,
    { 
        $addToSet: { rejectedRecipes: recipeId },
        $pull: { favoriteRecipes: recipeId } // Remove from favorites if we reject it now
    }
  );

  return true;
});

/**
 * Create a new recipe
 */
export const createRecipe = withErrorHandling(async (_parent, args, context) => {
    if (!context.user?.userId) {
        throw new Error('Authentication required');
    }

    const newRecipe = await RecipeModel.create({
        ...args,
        author: context.user.userId,
        createdAt: new Date(),
        updatedAt: new Date()
    });

    return newRecipe.populate('author');
});

/**
 * Update an existing recipe
 */
export const updateRecipe = withErrorHandling(async (_parent, args, context) => {
    if (!context.user?.userId) {
        throw new Error('Authentication required');
    }

    const { id, ...updates } = args;

    const recipe = await RecipeModel.findById(id);
    if (!recipe) {
        throw new Error('Recipe not found');
    }

    // Check ownership or admin role
    if (recipe.author?.toString() !== context.user.userId && context.user.role !== 'ADMIN') {
        throw new Error('Not authorized to update this recipe');
    }

    Object.assign(recipe, updates);
    recipe.updatedAt = new Date();
    
    await recipe.save();
    return recipe.populate('author');
});

/**
 * Delete a recipe
 */
export const deleteRecipe = withErrorHandling(async (_parent, { id }, context) => {
    if (!context.user?.userId) {
        throw new Error('Authentication required');
    }

    const recipe = await RecipeModel.findById(id);
    if (!recipe) {
        throw new Error('Recipe not found');
    }

    // Check ownership or admin role
    if (recipe.author?.toString() !== context.user.userId && context.user.role !== 'ADMIN') {
        throw new Error('Not authorized to delete this recipe');
    }

    await RecipeModel.findByIdAndDelete(id);
    return true;
});
