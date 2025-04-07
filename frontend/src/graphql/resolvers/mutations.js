/****************************************************************
 * FILE: /src/graphql/schema/resolvers/mutations.js
 * Contains all Mutation resolvers for Fine Dining application.
 ****************************************************************/

import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';

import User from '@/models/User';
import { RecipeModel } from '@/models/Recipe';
import { RestaurantModel } from '@/models/Restaurant';
import { MealPlanModel } from "@/models/MealPlan";
import { MealModel } from '@/models/Meal';
import { StatsModel } from '@/models/Stats';
import { Review as ReviewModel } from '@/models/Review';

/**
 * A helper function that wraps resolvers to catch unexpected errors.
 *
 * @param {Function} resolver - The resolver function to wrap.
 * @returns {Function} The wrapped resolver function.
 */
const withErrorHandling = (resolver) => async (parent, args, context, info) => {
    try {
        return await resolver(parent, args, context, info);
    } catch (error) {
        console.error('Resolver Error:', error);
        // Optionally, you can inspect error types and rethrow known errors.
        // For unexpected errors, throw a generic error message.
        throw new Error('Internal server error.');
    }
};

/* ----------------------------- USER MUTATIONS ----------------------------- */

/**
 * @function createUser
 * @description Creates a new user with the provided input.
 * Public mutation.
 */
const createUser = withErrorHandling(async (_parent, { input }, context) => {
    const existingUser = await User.findOne({ email: input.email });
    if (existingUser) {
        throw new Error('Email already in use');
    }
    return User.create(input);
});

/**
 * @function updateUser
 * @description Updates an existing user by ID with new fields.
 * Protected: requires that the user is logged in and is updating their own profile or is an admin.
 */
const updateUser = withErrorHandling(async (_parent, { id, input }, context) => {
    if (!context.user?.userId) {
        throw new Error('Authentication required');
    }
    if (context.user.userId !== id && context.user.role !== 'ADMIN') {
        throw new Error('Authorization required: You can only update your own profile.');
    }
    const user = await User.findById(id);
    if (!user) throw new Error(`User with ID ${id} not found`);
    const updatedUser = await User.findByIdAndUpdate(id, { ...input }, { new: true });
    return updatedUser;
});

/**
 * @function deleteUser
 * @description Deletes a user by ID.
 * Protected: requires that the user is logged in and can only delete their own profile unless admin.
 */
const deleteUser = withErrorHandling(async (_parent, { id }, context) => {
    if (!context.user?.userId) {
        throw new Error('Authentication required');
    }
    if (context.user.userId !== id && context.user.role !== 'ADMIN') {
        throw new Error('Authorization required: You can only delete your own profile or be an admin.');
    }
    const result = await User.findByIdAndDelete(id);
    return Boolean(result);
});

/* ------------------------------ AUTH MUTATIONS ----------------------------- */

/**
 * @function loginUser
 * @description Attempts to log a user in by verifying their credentials.
 * Public mutation.
 */
const loginUser = withErrorHandling(async (_parent, { email, password }, context) => {
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
        throw new Error('User not found');
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
        throw new Error('Invalid credentials');
    }
    user.lastLogin = new Date();
    await user.save();
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        console.error('FATAL ERROR: JWT_SECRET is not defined in environment variables.');
        throw new Error('Authentication configuration error.');
    }
    const token = jwt.sign(
        { userId: user._id, email: user.email, role: user.role },
        secret,
        { expiresIn: '1d' }
    );
    return {
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            accountStatus: user.accountStatus,
        },
    };
});

/**
 * @function requestPasswordReset
 * @description Initiates a "forgot password" flow by generating a reset token.
 * Public mutation.
 */
const requestPasswordReset = withErrorHandling(async (_parent, { email }, context) => {
    const user = await User.findOne({ email });
    if (!user) {
        return true; // Avoid user enumeration
    }
    const resetToken = user.generatePasswordResetToken();
    await user.save();
    // Integration with email service would go here.
    return true;
});

/**
 * @function resetPassword
 * @description Completes the password reset by verifying the reset token and updating the password.
 * Public mutation.
 */
const resetPassword = withErrorHandling(async (_parent, { resetToken, newPassword }, context) => {
    const user = await User.findOne({ passwordResetToken: resetToken });
    if (!user) {
        throw new Error('Invalid or expired reset token.');
    }
    const isValid = user.validatePasswordResetToken(resetToken);
    if (!isValid) {
        throw new Error('Invalid or expired reset token.');
    }
    user.password = newPassword;
    user.passwordResetToken = null;
    user.passwordResetTokenExpiry = null;
    await user.save();
    return true;
});

/* ------------------------------ RECIPE MUTATIONS --------------------------- */

/**
 * @function createRecipe
 * @description Creates a new recipe.
 * Protected: requires authentication. The recipe author is set to the logged-in user.
 */
const createRecipe = withErrorHandling(async (_parent, { input }, context) => {
    if (!context.user?.userId) {
        throw new Error('Authentication required');
    }
    // Enforce that the recipe is created by the logged-in user.
    const {
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
    // If an authorId is provided, ensure it matches the logged-in user or the user is an admin.
    if (authorId && authorId !== context.user.userId && context.user.role !== 'ADMIN') {
        throw new Error('Authorization required: You can only create recipes as yourself.');
    }
    // Force the author to be the logged-in user if not an admin.
    const author = context.user.role === 'ADMIN' && authorId ? await User.findById(authorId) : await User.findById(context.user.userId);
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
 * @function updateRecipe
 * @description Updates an existing recipe.
 * Protected: only the recipe owner or an admin can update the recipe.
 */
const updateRecipe = withErrorHandling(async (
    _parent,
    { id, recipeName, ingredients, instructions, prepTime, difficulty, nutritionFacts, tags, images, estimatedCost },
    context
) => {
    if (!context.user?.userId) {
        throw new Error('Authentication required');
    }
    const recipe = await RecipeModel.findById(id);
    if (!recipe) {
        throw new Error('Recipe not found');
    }
    if (recipe.author.toString() !== context.user.userId && context.user.role !== 'ADMIN') {
        throw new Error('Authorization required: You can only update your own recipes.');
    }
    const updateData = {};
    if (recipeName !== undefined) updateData.recipeName = recipeName;
    if (ingredients !== undefined) updateData.ingredients = ingredients;
    if (instructions !== undefined) updateData.instructions = instructions;
    if (prepTime !== undefined) updateData.prepTime = prepTime;
    if (difficulty !== undefined) updateData.difficulty = difficulty;
    if (nutritionFacts !== undefined) updateData.nutritionFacts = nutritionFacts;
    if (tags !== undefined) updateData.tags = tags;
    if (images !== undefined) updateData.images = images;
    if (estimatedCost !== undefined) updateData.estimatedCost = estimatedCost;
    return RecipeModel.findByIdAndUpdate(id, updateData, { new: true });
});

/**
 * @function deleteRecipe
 * @description Deletes a recipe.
 * Protected: only the recipe owner or an admin can delete the recipe.
 */
const deleteRecipe = withErrorHandling(async (_parent, { id }, context) => {
    if (!context.user?.userId) {
        throw new Error('Authentication required');
    }
    const recipe = await RecipeModel.findById(id);
    if (!recipe) {
        throw new Error('Recipe not found');
    }
    if (recipe.author.toString() !== context.user.userId && context.user.role !== 'ADMIN') {
        throw new Error('Authorization required: You can only delete your own recipes.');
    }
    const result = await RecipeModel.findByIdAndDelete(id);
    return !!result;
});

/* --------------------------- RESTAURANT MUTATIONS -------------------------- */

/**
 * @function createRestaurant
 * @description Creates a new restaurant.
 * Protected: requires authentication.
 */
const createRestaurant = withErrorHandling(async (_parent, args, context) => {
    if (!context.user?.userId) {
        throw new Error('Authentication required');
    }
    const { restaurantName, address, phone, website, cuisineType, priceRange } = args;
    return RestaurantModel.create({
        restaurantName,
        address,
        phone,
        website,
        cuisineType,
        priceRange,
    });
});

/**
 * @function updateRestaurant
 * @description Updates a restaurant.
 * Protected: only admins can update restaurants.
 */
const updateRestaurant = withErrorHandling(async (_parent, { id, restaurantName, address, phone, website, cuisineType, priceRange }, context) => {
    if (!context.user?.userId) {
        throw new Error('Authentication required');
    }
    if (context.user.role !== 'ADMIN') {
        throw new Error('Authorization required: Only admins can update restaurants.');
    }
    const updateData = {};
    if (restaurantName !== undefined) updateData.restaurantName = restaurantName;
    if (address !== undefined) updateData.address = address;
    if (phone !== undefined) updateData.phone = phone;
    if (website !== undefined) updateData.website = website;
    if (cuisineType !== undefined) updateData.cuisineType = cuisineType;
    if (priceRange !== undefined) updateData.priceRange = priceRange;
    return RestaurantModel.findByIdAndUpdate(id, updateData, { new: true });
});

/**
 * @function deleteRestaurant
 * @description Deletes a restaurant.
 * Protected: only admins can delete restaurants.
 */
const deleteRestaurant = withErrorHandling(async (_parent, { id }, context) => {
    if (!context.user?.userId) {
        throw new Error('Authentication required');
    }
    if (context.user.role !== 'ADMIN') {
        throw new Error('Authorization required: Only admins can delete restaurants.');
    }
    const result = await RestaurantModel.findByIdAndDelete(id);
    return !!result;
});

/* --------------------------- MEAL PLAN MUTATIONS --------------------------- */

/**
 * @function createMealPlan
 * @description Creates a meal plan.
 * Protected: a user can only create a meal plan for themselves unless admin.
 */
const createMealPlan = withErrorHandling(async (_parent, { userId, startDate, endDate, title, status, totalCalories }, context) => {
    if (!context.user?.userId) {
        throw new Error('Authentication required');
    }
    if (context.user.userId !== userId && context.user.role !== 'ADMIN') {
        throw new Error('Authorization required: You can only create meal plans for yourself or be an admin.');
    }
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');
    const newPlan = await MealPlanModel.create({
        user: user._id,
        startDate,
        endDate,
        title,
        status,
        totalCalories,
    });
    return newPlan.populate('user');
});

/**
 * @function updateMealPlan
 * @description Updates a meal plan.
 * Protected: only the meal plan owner or an admin can update.
 */
const updateMealPlan = withErrorHandling(async (_parent, { id, startDate, endDate, title, status, totalCalories }, context) => {
    if (!context.user?.userId) {
        throw new Error('Authentication required');
    }
    const mealPlan = await MealPlanModel.findById(id);
    if (!mealPlan) throw new Error('Meal plan not found');
    if (mealPlan.user.toString() !== context.user.userId && context.user.role !== 'ADMIN') {
        throw new Error('Authorization required: You can only update your own meal plans or be an admin.');
    }
    const updateData = {};
    if (startDate !== undefined) updateData.startDate = startDate;
    if (endDate !== undefined) updateData.endDate = endDate;
    if (title !== undefined) updateData.title = title;
    if (status !== undefined) updateData.status = status;
    if (totalCalories !== undefined) updateData.totalCalories = totalCalories;
    return MealPlanModel.findByIdAndUpdate(id, updateData, { new: true }).populate('user');
});

/**
 * @function deleteMealPlan
 * @description Deletes a meal plan.
 * Protected: only the owner or an admin can delete.
 */
const deleteMealPlan = withErrorHandling(async (_parent, { id }, context) => {
    if (!context.user?.userId) {
        throw new Error('Authentication required');
    }
    const mealPlan = await MealPlanModel.findById(id);
    if (!mealPlan) throw new Error('Meal plan not found');
    if (mealPlan.user.toString() !== context.user.userId && context.user.role !== 'ADMIN') {
        throw new Error('Authorization required: You can only delete your own meal plans or be an admin.');
    }
    const result = await MealPlanModel.findByIdAndDelete(id);
    return !!result;
});

/* ------------------------------ MEAL MUTATIONS ----------------------------- */

/**
 * @function createMeal
 * @description Creates a meal within a meal plan.
 * Protected: only the owner or an admin can add meals.
 */
const createMeal = withErrorHandling(async (
    _parent,
    { mealPlanId, date, mealType, recipeId, restaurantId, mealName, ingredients, nutritionFacts, portionSize, notes },
    context
) => {
    if (!context.user?.userId) {
        throw new Error('Authentication required');
    }
    const mealPlan = await MealPlanModel.findById(mealPlanId);
    if (!mealPlan) throw new Error('MealPlan not found');
    if (mealPlan.user.toString() !== context.user.userId && context.user.role !== 'ADMIN') {
        throw new Error('Authorization required: You can only create meals for your own meal plans or be an admin.');
    }
    const recipe = recipeId ? await RecipeModel.findById(recipeId) : null;
    const restaurant = restaurantId ? await RestaurantModel.findById(restaurantId) : null;
    const newMeal = await MealModel.create({
        mealPlan: mealPlan._id,
        date,
        mealType,
        recipe: recipe ? recipe._id : null,
        restaurant: restaurant ? restaurant._id : null,
        mealName,
        ingredients,
        nutritionFacts,
        portionSize,
        notes,
    });
    mealPlan.meals.push(newMeal._id);
    await mealPlan.save();
    return newMeal;
});

/**
 * @function updateMeal
 * @description Updates a meal.
 * Protected: only the owner (via the meal plan) or an admin can update.
 */
const updateMeal = withErrorHandling(async (
    _parent,
    { id, date, mealType, recipeId, restaurantId, mealName, ingredients, nutritionFacts, portionSize, notes },
    context
) => {
    if (!context.user?.userId) {
        throw new Error('Authentication required');
    }
    const meal = await MealModel.findById(id);
    if (!meal) throw new Error('Meal not found');
    const mealPlan = await MealPlanModel.findById(meal.mealPlan);
    if (mealPlan.user.toString() !== context.user.userId && context.user.role !== 'ADMIN') {
        throw new Error('Authorization required: You can only update meals in your own meal plans or be an admin.');
    }
    if (date !== undefined) meal.date = date;
    if (mealType !== undefined) meal.mealType = mealType;
    if (recipeId !== undefined) meal.recipe = recipeId;
    if (restaurantId !== undefined) meal.restaurant = restaurantId;
    if (mealName !== undefined) meal.mealName = mealName;
    if (ingredients !== undefined) meal.ingredients = ingredients;
    if (nutritionFacts !== undefined) meal.nutritionFacts = nutritionFacts;
    if (portionSize !== undefined) meal.portionSize = portionSize;
    if (notes !== undefined) meal.notes = notes;
    return meal.save();
});

/**
 * @function deleteMeal
 * @description Deletes a meal.
 * Protected: only the owner (via the meal plan) or an admin can delete.
 */
const deleteMeal = withErrorHandling(async (_parent, { id }, context) => {
    if (!context.user?.userId) {
        throw new Error('Authentication required');
    }
    const meal = await MealModel.findById(id);
    if (!meal) throw new Error('Meal not found');
    const mealPlan = await MealPlanModel.findById(meal.mealPlan);
    if (mealPlan.user.toString() !== context.user.userId && context.user.role !== 'ADMIN') {
        throw new Error('Authorization required: You can only delete meals from your own meal plans or be an admin.');
    }
    if (mealPlan) {
        mealPlan.meals = mealPlan.meals.filter(mId => mId.toString() !== id);
        await mealPlan.save();
    }
    await meal.deleteOne();
    return true;
});

/* ----------------------------- STATS MUTATIONS ----------------------------- */

/**
 * @function createStats
 * @description Creates user stats.
 * Protected: a user can only create stats for themselves unless admin.
 */
const createStats = withErrorHandling(async (
    _parent,
    { userId, macros, micros, caloriesConsumed, waterIntake, steps },
    context
) => {
    if (!context.user?.userId) {
        throw new Error('Authentication required');
    }
    if (context.user.userId !== userId && context.user.role !== 'ADMIN') {
        throw new Error('Authorization required: You can only create stats for yourself or be an admin.');
    }
    return StatsModel.create({
        user: userId,
        macros,
        micros,
        caloriesConsumed,
        waterIntake,
        steps,
    });
});

/**
 * @function deleteStats
 * @description Deletes stats.
 * Protected: only the stats owner or an admin can delete.
 */
const deleteStats = withErrorHandling(async (_parent, { id }, context) => {
    if (!context.user?.userId) {
        throw new Error('Authentication required');
    }
    const stats = await StatsModel.findById(id);
    if (!stats) throw new Error('Stats not found');
    if (stats.user.toString() !== context.user.userId && context.user.role !== 'ADMIN') {
        throw new Error('Authorization required: You can only delete your own stats or be an admin.');
    }
    const result = await StatsModel.findByIdAndDelete(id);
    return !!result;
});

/* ----------------------------- REVIEW MUTATIONS ---------------------------- */

/**
 * @function createReview
 * @description Creates a review.
 * Protected: requires authentication.
 */
const createReview = withErrorHandling(async (_parent, { targetType, targetId, rating, comment }, context) => {
    if (!context.user?.userId) {
        throw new Error('Authentication required');
    }
    if (!['RECIPE', 'RESTAURANT'].includes(targetType)) {
        throw new Error('Invalid targetType');
    }
    const userId = context.user.userId;
    const newReview = await ReviewModel.create({
        user: userId,
        targetType,
        targetId,
        rating,
        comment,
    });

    // Update rating averages on target
    if (targetType === 'RECIPE') {
        const recipe = await RecipeModel.findById(targetId);
        if (recipe) {
            recipe.averageRating =
                (recipe.averageRating * recipe.ratingCount + rating) /
                (recipe.ratingCount + 1);
            recipe.ratingCount += 1;
            await recipe.save();
        }
    } else if (targetType === 'RESTAURANT') {
        const restaurant = await RestaurantModel.findById(targetId);
        if (restaurant) {
            restaurant.averageRating =
                (restaurant.averageRating * restaurant.ratingCount + rating) /
                (restaurant.ratingCount + 1);
            restaurant.ratingCount += 1;
            await restaurant.save();
        }
    }
    return newReview;
});

/**
 * @function deleteReview
 * @description Deletes a review.
 * Protected: only the review owner or an admin can delete.
 */
const deleteReview = withErrorHandling(async (_parent, { id }, context) => {
    if (!context.user?.userId) {
        throw new Error('Authentication required');
    }
    const review = await ReviewModel.findById(id);
    if (!review) throw new Error('Review not found');
    if (review.user.toString() !== context.user.userId && context.user.role !== 'ADMIN') {
        throw new Error('Authorization required: You can only delete your own reviews or be an admin.');
    }
    if (review.targetType === 'RECIPE') {
        const recipe = await RecipeModel.findById(review.targetId);
        if (recipe && recipe.ratingCount > 0) {
            const totalRating = recipe.averageRating * recipe.ratingCount;
            const newTotal = totalRating - review.rating;
            const newCount = recipe.ratingCount - 1;
            recipe.ratingCount = newCount;
            recipe.averageRating = newCount > 0 ? newTotal / newCount : 0;
            await recipe.save();
        }
    } else if (review.targetType === 'RESTAURANT') {
        const restaurant = await RestaurantModel.findById(review.targetId);
        if (restaurant && restaurant.ratingCount > 0) {
            const totalRating = restaurant.averageRating * restaurant.ratingCount;
            const newTotal = totalRating - review.rating;
            const newCount = restaurant.ratingCount - 1;
            restaurant.ratingCount = newCount;
            restaurant.averageRating = newCount > 0 ? newTotal / newCount : 0;
            await restaurant.save();
        }
    }
    await ReviewModel.findByIdAndDelete(id);
    return true;
});

export const Mutation = {
    // Users
    createUser,
    updateUser,
    deleteUser,

    // Auth
    loginUser,
    requestPasswordReset,
    resetPassword,

    // Recipe
    createRecipe,
    updateRecipe,
    deleteRecipe,

    // Restaurant
    createRestaurant,
    updateRestaurant,
    deleteRestaurant,

    // Meal Plan
    createMealPlan,
    updateMealPlan,
    deleteMealPlan,

    // Meal
    createMeal,
    updateMeal,
    deleteMeal,

    // Stats
    createStats,
    deleteStats,

    // Reviews
    createReview,
    deleteReview,
};
