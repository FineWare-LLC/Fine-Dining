// @ts-nocheck
import { withErrorHandling } from './baseQueries';
import Recipe from '@/models/Recipe';
import User from '@/models/User';

const RECIPE_SEARCH_FAILURE_MESSAGE = 'We could not read your recipes right now. Please refresh the page.';

const createRecipeSearchFailureError = (cause) => {
    const error = new Error(RECIPE_SEARCH_FAILURE_MESSAGE);
    error.code = 'recipeSearchUnavailable';
    error.isUserSafe = true;
    error.cause = cause;
    return error;
};

export const getDietaryProfile = async (_, { userId }, context) => {
    if (!context.user?.userId) throw new Error('Authentication required');
    const user = await User.findById(userId).select('dietaryProfile');
    if (!user) throw new Error('User not found');
    return user.dietaryProfile || {};
};

export const getNutritionTargets = async (_, { userId }, context) => {
    if (!context.user?.userId) throw new Error('Authentication required');
    const user = await User.findById(userId).select('nutritionTargets');
    if (!user) throw new Error('User not found');
    return user.nutritionTargets || {};
};

export const searchRecipesByDiet = withErrorHandling(async (_, args) => {
    const {
        diets, allergenExclusions, cuisines, mealTypes,
        maxPrepTime, maxDifficulty, page = 1, limit = 20,
    } = args;

    const filter = {};

    if (allergenExclusions?.length) {
        filter.allergens = { $nin: allergenExclusions };
    }
    if (diets?.length) {
        filter.dietaryTags = { $all: diets };
    }
    if (cuisines?.length) {
        filter.cuisine = { $in: cuisines };
    }
    if (mealTypes?.length) {
        filter.mealTypes = { $in: mealTypes };
    }
    if (maxPrepTime) {
        filter.totalTime = { $lte: maxPrepTime };
    }
    if (maxDifficulty) {
        const levels = ['EASY', 'INTERMEDIATE', 'HARD'];
        const idx = levels.indexOf(maxDifficulty);
        if (idx >= 0) {
            filter.difficulty = { $in: levels.slice(0, idx + 1) };
        }
    }

    const skip = (page - 1) * limit;

    try {
        return await Recipe.find(filter)
            .sort({ averageRating: -1 })
            .skip(skip)
            .limit(limit)
            .populate('author');
    } catch (error) {
        console.error('Recipe search failed:', error);
        throw createRecipeSearchFailureError(error);
    }
});
