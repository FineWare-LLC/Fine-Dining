import { withErrorHandling } from './baseImports.js';
import User from '@/models/User/index.js';
import { RecipeModel } from '@/models/Recipe/index.js';
import mongoose from 'mongoose';

/**
 * Creates a new recipe.
 *
 * @function createRecipe
 * @param {Object} _parent - Parent resolver result.
 * @param {Object} param0 - Object containing recipe input.
 * @param {string} param0.input.recipeName - The name of the recipe.
 * @param {Array}  param0.input.ingredients - The list of ingredients.
 * @param {string} param0.input.instructions - The recipe instructions.
 * @param {number} param0.input.prepTime - Preparation time in minutes.
 * @param {string} param0.input.difficulty - Difficulty level (e.g., "Easy", "Medium", "Hard").
 * @param {Object} param0.input.nutritionFacts - Nutrition facts object.
 * @param {Array}  param0.input.tags - An array of tags.
 * @param {Array}  param0.input.images - An array of image URLs.
 * @param {number} param0.input.estimatedCost - The estimated cost.
 * @param {string} [param0.input.authorId] - Optional author ID (only modifiable by ADMIN).
 * @param {Object} context - GraphQL context.
 * @returns {Promise<Object>} The created recipe.
 */
export const createRecipe = withErrorHandling(async (_parent, { input }, context) => {
  // Ensure the user is authenticated
  if (!context.user?.userId) {
    throw new Error('Authentication required');
  }

  // Destructure and validate required fields
  let {
    recipeName,
    ingredients,
    instructions,
    prepTime,
    difficulty,
    nutritionFacts,
    tags,
    images,
    estimatedCost,
    authorId
  } = input;

  if (!recipeName || typeof recipeName !== 'string' || !recipeName.trim()) {
    throw new Error('A valid recipe name is required.');
  }
  recipeName = recipeName.trim();

  if (!Array.isArray(ingredients) || ingredients.length === 0) {
    throw new Error('At least one ingredient is required.');
  }

  if (!instructions || typeof instructions !== 'string' || !instructions.trim()) {
    throw new Error('Instructions are required.');
  }
  instructions = instructions.trim();

  if (typeof prepTime !== 'number' || prepTime <= 0) {
    throw new Error('Preparation time must be a positive number.');
  }

  if (!difficulty || typeof difficulty !== 'string' || !difficulty.trim()) {
    throw new Error('Difficulty is required.');
  }
  difficulty = difficulty.trim();

  // Optional: Validate nutritionFacts, tags, images, estimatedCost if needed
  // For example, ensure estimatedCost is a non-negative number:
  if (typeof estimatedCost !== 'number' || estimatedCost < 0) {
    throw new Error('Estimated cost must be a non-negative number.');
  }

  // Authorization: if authorId is provided, only allow if the requester is ADMIN or the id matches
  if (authorId && authorId !== context.user.userId && context.user.role !== 'ADMIN') {
    throw new Error('Authorization required: You can only create recipes as yourself.');
  }

  // Determine the author: if ADMIN and authorId provided, use that; otherwise, use the logged-in user
  const author = context.user.role === 'ADMIN' && authorId
      ? await User.findById(authorId)
      : await User.findById(context.user.userId);

  if (!author) {
    throw new Error('Author not found');
  }

  return RecipeModel.create({
    recipeName,
    ingredients,
    instructions,
    prepTime,
    difficulty,
    nutritionFacts,
    tags,
    images,
    estimatedCost,
    author: author._id,
  });
});

/**
 * Updates an existing recipe.
 *
 * @function updateRecipe
 * @param {Object} _parent - Parent resolver result.
 * @param {Object} param0 - Object containing recipe id and update fields.
 * @param {string} param0.id - The recipe's ID.
 * @param {string} [param0.recipeName] - The updated recipe name.
 * @param {Array}  [param0.ingredients] - The updated list of ingredients.
 * @param {string} [param0.instructions] - The updated instructions.
 * @param {number} [param0.prepTime] - The updated preparation time.
 * @param {string} [param0.difficulty] - The updated difficulty level.
 * @param {Object} [param0.nutritionFacts] - The updated nutrition facts.
 * @param {Array}  [param0.tags] - The updated tags.
 * @param {Array}  [param0.images] - The updated images.
 * @param {number} [param0.estimatedCost] - The updated estimated cost.
 * @param {Object} context - GraphQL context.
 * @returns {Promise<Object>} The updated recipe.
 */
export const updateRecipe = withErrorHandling(async (
    _parent,
    { id, recipeName, ingredients, instructions, prepTime, difficulty, nutritionFacts, tags, images, estimatedCost },
    context
) => {
  // Authentication check
  if (!context.user?.userId) {
    throw new Error('Authentication required');
  }

  // Validate recipe ID
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error('Invalid recipe ID');
  }

  const recipe = await RecipeModel.findById(id);
  if (!recipe) {
    throw new Error('Recipe not found');
  }

  // Authorization check: only owner or admin can update
  if (recipe.author.toString() !== context.user.userId && context.user.role !== 'ADMIN') {
    throw new Error('Authorization required: You can only update your own recipes.');
  }

  const updateData = {};
  if (recipeName !== undefined) {
    if (typeof recipeName !== 'string' || !recipeName.trim()) {
      throw new Error('Invalid recipe name');
    }
    updateData.recipeName = recipeName.trim();
  }
  if (ingredients !== undefined) {
    if (!Array.isArray(ingredients) || ingredients.length === 0) {
      throw new Error('Ingredients must be a non-empty array');
    }
    updateData.ingredients = ingredients;
  }
  if (instructions !== undefined) {
    if (typeof instructions !== 'string' || !instructions.trim()) {
      throw new Error('Invalid instructions');
    }
    updateData.instructions = instructions.trim();
  }
  if (prepTime !== undefined) {
    if (typeof prepTime !== 'number' || prepTime <= 0) {
      throw new Error('Preparation time must be a positive number');
    }
    updateData.prepTime = prepTime;
  }
  if (difficulty !== undefined) {
    if (typeof difficulty !== 'string' || !difficulty.trim()) {
      throw new Error('Invalid difficulty');
    }
    updateData.difficulty = difficulty.trim();
  }
  if (nutritionFacts !== undefined) {
    updateData.nutritionFacts = nutritionFacts;
  }
  if (tags !== undefined) {
    if (!Array.isArray(tags)) {
      throw new Error('Tags must be an array');
    }
    updateData.tags = tags;
  }
  if (images !== undefined) {
    if (!Array.isArray(images)) {
      throw new Error('Images must be an array');
    }
    updateData.images = images;
  }
  if (estimatedCost !== undefined) {
    if (typeof estimatedCost !== 'number' || estimatedCost < 0) {
      throw new Error('Estimated cost must be a non-negative number');
    }
    updateData.estimatedCost = estimatedCost;
  }

  return RecipeModel.findByIdAndUpdate(id, updateData, { new: true });
});

/**
 * Deletes a recipe.
 *
 * @function deleteRecipe
 * @param {Object} _parent - Parent resolver result.
 * @param {Object} param0 - Object containing the recipe id.
 * @param {string} param0.id - The recipe's ID.
 * @param {Object} context - GraphQL context.
 * @returns {Promise<Boolean>} True if deletion was successful.
 */
export const deleteRecipe = withErrorHandling(async (_parent, { id }, context) => {
  // Authentication check
  if (!context.user?.userId) {
    throw new Error('Authentication required');
  }
  // Validate recipe ID
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error('Invalid recipe ID');
  }
  const recipe = await RecipeModel.findById(id);
  if (!recipe) {
    throw new Error('Recipe not found');
  }
  // Authorization check: only owner or admin can delete
  if (recipe.author.toString() !== context.user.userId && context.user.role !== 'ADMIN') {
    throw new Error('Authorization required: You can only delete your own recipes.');
  }
  const result = await RecipeModel.findByIdAndDelete(id);
  return !!result;
});
