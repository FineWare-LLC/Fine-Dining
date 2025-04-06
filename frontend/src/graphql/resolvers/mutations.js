/****************************************************************
 * FILE: /src/graphql/schema/resolvers/mutations.js
 * Contains all Mutation resolvers for Fine Dining application.
 ****************************************************************/

import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';

import User from '@/models/User';
import {RecipeModel} from '@/models/Recipe';
import {RestaurantModel} from '@/models/Restaurant';
import {MealPlanModel} from "@/models/MealPlan";
import {MealModel} from '@/models/Meal';
import {StatsModel} from '@/models/Stats';
import {Review as ReviewModel} from '@/models/Review';

/**
 * @function createUser
 * @description Creates a new user with the provided input.
 * @param {object} _parent - Parent resolver (unused).
 * @param {object} args - Arguments containing the user input object.
 * @param {object} args.input - The user data (name, email, password, etc.).
 * @returns {Promise<User>} The created user document.
 */
const createUser = async (_parent, {input}) => {
    const existingUser = await User.findOne({email: input.email});
    if (existingUser) {
        throw new Error('Email already in use');
    }
    return User.create(input);
}

/**
 * @function updateUser
 * @description Updates an existing user by ID with new fields.
 * @param {object} _parent - Parent resolver (unused).
 * @param {object} args - Arguments.
 * @param {string} args.id - The user's ID.
 * @param {object} args.input - The fields to update.
 * @returns {Promise<User>} The updated user document.
 */
async function updateUser(_parent, {id, input}) {
    const user = await User.findById(id);
    if (!user) throw new Error(`User with ID ${id} not found`);

    const updatedUser = await User.findByIdAndUpdate(id, {...input}, {new: true});
    return updatedUser;
    return user.save();
}

/**
 * @function deleteUser
 * @description Deletes a user by ID.
 * @note Returns true if a user was found and deleted, false otherwise.
 * @param {object} _parent - Parent resolver (unused).
 * @param {object} args
 * @param {string} args.id - The user's ID.
 * @returns {Promise<boolean>} True if deleted, otherwise false.
 */
async function deleteUser(_parent, {id}) {
    const result = await User.findByIdAndDelete(id);
    return Boolean(result);
}

/* ------------------------------ AUTH MUTATIONS ----------------------------- */

/**
 * @function loginUser
 * @description Attempts to log a user in by verifying their credentials.
 * @param {object} _parent - Parent resolver (unused).
 * @param {object} args
 * @param {string} args.email - The user's email.
 * @param {string} args.password - The user's password in plain text.
 * @returns {Promise<{ token: string, user: object }>} Token + user data.
 */
async function loginUser(_parent, {email, password}) {
    const user = await User.findOne({email}).select('+password');
    if (!user) {
        throw new Error('User not found');
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
        throw new Error('Invalid credentials');
    }

    user.lastLogin = new Date();
    await user.save();

    // In production, use an env-based secret key:
    const token = jwt.sign(
        {userId: user._id, email: user.email, role: user.role},
        'YOUR_SECRET_KEY',
        {expiresIn: '1d'}
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
}

/**
 * @function requestPasswordReset
 * @description Initiates a "forgot password" flow by generating a reset token and emailing it.
 * @param {object} _parent - Parent resolver (unused).
 * @param {object} args
 * @param {string} args.email - The user's email that needs password reset.
 * @returns {Promise<boolean>} Returns true if token creation is successful (even if user not found).
 */
async function requestPasswordReset(_parent, {email}) {
    const user = await User.findOne({email});
    if (!user) {
        // Return true to avoid enumerating user existence.
        return true;
    }
    const resetToken = user.generatePasswordResetToken();
    await user.save();

    // Example: you'd integrate with an email service or Nodemailer here.

    return true;
}

/**
 * @function resetPassword
 * @description Completes the password reset by verifying the reset token and updating the password.
 * @param {object} _parent - Parent resolver (unused).
 * @param {object} args
 * @param {string} args.resetToken - The token user received via email.
 * @param {string} args.newPassword - The user's new password.
 * @returns {Promise<boolean>} True if successful, otherwise an error is thrown.
 */
async function resetPassword(_parent, {resetToken, newPassword}) {
    const user = await User.findOne({passwordResetToken: resetToken});
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
}

/* ------------------------------ RECIPE MUTATIONS --------------------------- */

const createRecipe = async (_parent, {input}) => {
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
    const author = authorId ? await User.findById(authorId) : null;
    if (authorId && !author) {
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
        author: author ? author._id : null,
    });
};

const updateRecipe = async (
    _parent,
    {id, recipeName, ingredients, instructions, prepTime, difficulty, nutritionFacts, tags, images, estimatedCost}
) => {
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

    return RecipeModel.findByIdAndUpdate(id, updateData, {new: true});
}

async function deleteRecipe(_parent, {id}) {
    const result = await RecipeModel.findByIdAndDelete(id);
    return !!result;
}

/* --------------------------- RESTAURANT MUTATIONS -------------------------- */

async function createRestaurant(
    _parent,
    {restaurantName, address, phone, website, cuisineType, priceRange}
) {
    return RestaurantModel.create({
        restaurantName,
        address,
        phone,
        website,
        cuisineType,
        priceRange,
    });
}

async function updateRestaurant(
    _parent,
    {id, restaurantName, address, phone, website, cuisineType, priceRange}
) {
    const updateData = {};
    if (restaurantName !== undefined) updateData.restaurantName = restaurantName;
    if (address !== undefined) updateData.address = address;
    if (phone !== undefined) updateData.phone = phone;
    if (website !== undefined) updateData.website = website;
    if (cuisineType !== undefined) updateData.cuisineType = cuisineType;
    if (priceRange !== undefined) updateData.priceRange = priceRange;

    return RestaurantModel.findByIdAndUpdate(id, updateData, {new: true});
}

async function deleteRestaurant(_parent, {id}) {
    const result = await RestaurantModel.findByIdAndDelete(id);
    return !!result;
}

/* --------------------------- MEAL PLAN MUTATIONS --------------------------- */

async function createMealPlan(
    _parent,
    {userId, startDate, endDate, title, status, totalCalories}
) {
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
}

async function updateMealPlan(
    _parent,
    {id, startDate, endDate, title, status, totalCalories}
) {
    const updateData = {};
    if (startDate !== undefined) updateData.startDate = startDate;
    if (endDate !== undefined) updateData.endDate = endDate;
    if (title !== undefined) updateData.title = title;
    if (status !== undefined) updateData.status = status;
    if (totalCalories !== undefined) updateData.totalCalories = totalCalories;

    return MealPlanModel.findByIdAndUpdate(id, updateData, {new: true}).populate('user');
}

async function deleteMealPlan(_parent, {id}) {
    const result = await MealPlanModel.findByIdAndDelete(id);
    return !!result;
}

/* ------------------------------ MEAL MUTATIONS ----------------------------- */

async function createMeal(
    _parent,
    {
        mealPlanId,
        date,
        mealType,
        recipeId,
        restaurantId,
        mealName,
        ingredients,
        nutritionFacts,
        portionSize,
        notes,
    }
) {
    const mealPlan = await MealPlanModel.findById(mealPlanId);
    if (!mealPlan) throw new Error('MealPlan not found');

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
}

async function updateMeal(
    _parent,
    {id, date, mealType, recipeId, restaurantId, mealName, ingredients, nutritionFacts, portionSize, notes}
) {
    const meal = await MealModel.findById(id);
    if (!meal) throw new Error('Meal not found');

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
}

async function deleteMeal(_parent, {id}) {
    const meal = await MealModel.findById(id);
    if (!meal) return false;

    const mealPlan = await MealPlanModel.findById(meal.mealPlan);
    if (mealPlan) {
        mealPlan.meals = mealPlan.meals.filter(mId => mId.toString() !== id);
        await mealPlan.save();
    }

    await meal.deleteOne();
    return true;
}

/* ----------------------------- STATS MUTATIONS ----------------------------- */

async function createStats(
    _parent,
    {userId, macros, micros, caloriesConsumed, waterIntake, steps}
) {
    return StatsModel.create({
        user: userId,
        macros,
        micros,
        caloriesConsumed,
        waterIntake,
        steps,
    });
}

async function deleteStats(_parent, {id}) {
    const result = await StatsModel.findByIdAndDelete(id);
    return !!result;
}

/* ----------------------------- REVIEW MUTATIONS ---------------------------- */

async function createReview(_parent, {targetType, targetId, rating, comment}) {
    if (!['RECIPE', 'RESTAURANT'].includes(targetType)) {
        throw new Error('Invalid targetType');
    }

    // In real app, userId usually comes from context (logged-in user).
    const userId = mongoose.Types.ObjectId('640faaaa4dc91567048f0abc'); // placeholder

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
}

async function deleteReview(_parent, {id}) {
    const review = await ReviewModel.findById(id);
    if (!review) return false;

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
}

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
