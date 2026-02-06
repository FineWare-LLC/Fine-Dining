import { withErrorHandling } from './baseQueries.js';
import { MealModel } from '@/models/Meal/index.js';
import { MealPlanModel } from '@/models/MealPlan/index.js';
import { paginateQuery } from '@/utils/pagination.js';
import { buildPriceRangeFilter, buildNutritionRangeFilter, buildAllergenFilter, buildMealFilter } from '@/utils/filterUtils.js';

/**
 * Retrieves meals with optional filtering by price, nutrition, and allergens.
 *
 * @function getMeals
 * @param {object} _parent
 * @param {object} args - Contains filter parameters
 * @param {object} context - GraphQL context.
 * @returns {Promise<Object[]>} An array of meal documents.
 */
export const getMeals = withErrorHandling(async (
    _parent,
    { mealPlanId, priceRange, nutritionRange, allergensFilter, page, limit },
    context,
) => {
    if (!context.user?.userId) {
        throw new Error('Authentication required');
    }

    // Build the filter object
    const filter = {};

    // Filter by meal plan if provided
    if (mealPlanId) {
    // Verify the user has access to this meal plan
        const mealPlan = await MealPlanModel.findById(mealPlanId);
        if (!mealPlan) {
            throw new Error('Meal plan not found');
        }
        if (mealPlan.user.toString() !== context.user.userId && context.user.role !== 'ADMIN') {
            throw new Error('Authorization required: You can only access your own meal plans or be an admin.');
        }
        filter.mealPlan = mealPlanId;
    } else {
    // If no meal plan ID is provided, only return meals from meal plans the user owns
        const userMealPlans = await MealPlanModel.find({ user: context.user.userId }).select('_id');
        const userMealPlanIds = userMealPlans.map(plan => plan._id);
        filter.mealPlan = { $in: userMealPlanIds };
    }

    // Apply filters using utility functions
    buildPriceRangeFilter(priceRange, filter);
    buildNutritionRangeFilter(nutritionRange, filter);
    buildAllergenFilter(allergensFilter, filter);

    // Execute the query with pagination
    return paginateQuery(
        MealModel.find(filter)
            .populate('mealPlan')
            .populate('recipe')
            .populate('restaurant'),
        page,
        limit,
    );
});

/**
 * Retrieves all available meals for the meal catalog.
 * This query returns all meals in the database without filtering by meal plan ownership.
 *
 * @function getAllMeals
 * @param {object} _parent
 * @param {object} args - Contains filter parameters
 * @param {object} context - GraphQL context.
 * @returns {Promise<Object[]>} An array of meal documents.
 */
export const getAllMeals = withErrorHandling(async (
    _parent,
    { priceRange, nutritionRange, allergensFilter, page, limit },
    context,
) => {
    if (!context.user?.userId) {
        throw new Error('Authentication required');
    }

    // Build the filter object using utility functions
    let filter = {};
    filter = buildPriceRangeFilter(priceRange, filter);
    filter = buildNutritionRangeFilter(nutritionRange, filter);
    filter = buildAllergenFilter(allergensFilter, filter);

    // Execute the query with pagination
    // Don't filter by meal plan for the catalog view - we want to show all available meals
    return paginateQuery(
        MealModel.find(filter)
            .populate('recipe')
            .populate('restaurant'),
        page,
        limit,
    );
});

/**
 * Retrieves meals with advanced filtering for the meal catalog interface.
 * This query supports search, dietary filters, nutrition ranges, prep time, cuisines, and allergen exclusions.
 *
 * @function getMealsWithFilters
 * @param {object} _parent
 * @param {object} args - Contains advanced filter parameters
 * @param {object} context - GraphQL context.
 * @returns {Promise<Object>} Paginated meals with metadata.
 */
export const getMealsWithFilters = withErrorHandling(async (
    _parent,
    { 
        page, 
        limit, 
        search, 
        diets, 
        caloriesMin, 
        caloriesMax, 
        proteinMin, 
        proteinMax, 
        prepTimeMax, 
        cuisines, 
        allergenExclusions 
    },
    context,
) => {
    if (!context.user?.userId) {
        throw new Error('Authentication required');
    }

    // Build the filter object using comprehensive utility function
    const filter = buildMealFilter({
        search,
        diets,
        caloriesMin,
        caloriesMax,
        proteinMin,
        proteinMax,
        prepTimeMax,
        cuisines,
        allergenExclusions
    });

    // Execute the query with pagination
    const query = MealModel.find(filter)
        .populate('recipe')
        .populate('restaurant')
        .sort({ createdAt: -1 }); // Sort by most recent first

    // Get total count for pagination
    const totalCount = await MealModel.countDocuments(filter);

    // Apply pagination
    const skip = ((page || 1) - 1) * (limit || 20);
    const meals = await query.skip(skip).limit(limit || 20);

    // Calculate if there are more pages
    const hasNextPage = skip + meals.length < totalCount;

    return {
        meals,
        totalCount,
        hasNextPage,
    };
});

/**
 * Provides search suggestions for autocomplete functionality.
 * Returns suggestions for meal names, ingredients, cuisines, and dietary tags.
 *
 * @function getSearchSuggestions
 * @param {object} _parent
 * @param {object} args - Contains query string
 * @param {object} context - GraphQL context.
 * @returns {Promise<Object>} Search suggestions object.
 */
export const getSearchSuggestions = withErrorHandling(async (
    _parent,
    { query },
    context,
) => {
    if (!context.user?.userId) {
        throw new Error('Authentication required');
    }

    if (!query || query.length < 2) {
        return {
            meals: [],
            ingredients: [],
            cuisines: [],
            tags: [],
        };
    }

    const searchRegex = new RegExp(query, 'i');

    // Get meal name suggestions
    const mealSuggestions = await MealModel.distinct('mealName', {
        mealName: searchRegex
    }).limit(10);

    // Get ingredient suggestions from recipes (assuming ingredients are stored as string arrays)
    const ingredientSuggestions = await MealModel.aggregate([
        { $lookup: { from: 'recipes', localField: 'recipe', foreignField: '_id', as: 'recipeData' } },
        { $unwind: '$recipeData' },
        { $unwind: '$recipeData.ingredients' },
        { $match: { 'recipeData.ingredients': searchRegex } },
        { $group: { _id: '$recipeData.ingredients' } },
        { $limit: 10 },
        { $project: { _id: 0, name: '$_id' } }
    ]);

    // Get cuisine suggestions from restaurants
    const cuisineSuggestions = await MealModel.aggregate([
        { $lookup: { from: 'restaurants', localField: 'restaurant', foreignField: '_id', as: 'restaurantData' } },
        { $unwind: '$restaurantData' },
        { $unwind: '$restaurantData.cuisineType' },
        { $match: { 'restaurantData.cuisineType': searchRegex } },
        { $group: { _id: '$restaurantData.cuisineType' } },
        { $limit: 10 },
        { $project: { _id: 0, cuisine: '$_id' } }
    ]);

    // Get dietary tag suggestions from recipes (if tags exist)
    const tagSuggestions = await MealModel.aggregate([
        { $lookup: { from: 'recipes', localField: 'recipe', foreignField: '_id', as: 'recipeData' } },
        { $unwind: '$recipeData' },
        { $unwind: { path: '$recipeData.tags', preserveNullAndEmptyArrays: true } },
        { $match: { 'recipeData.tags': searchRegex } },
        { $group: { _id: '$recipeData.tags' } },
        { $limit: 10 },
        { $project: { _id: 0, tag: '$_id' } }
    ]);

    return {
        meals: mealSuggestions || [],
        ingredients: ingredientSuggestions.map(item => item.name) || [],
        cuisines: cuisineSuggestions || [],
        tags: tagSuggestions.map(item => item.tag) || [],
    };
});
