import { withErrorHandling } from './baseQueries.js';
import { MealModel } from '@/models/Meal/index.js';
import { MealPlanModel } from '@/models/MealPlan/index.js';
import { paginateQuery } from '@/utils/pagination.js';

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
  context
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

  // Filter by price range if provided
  if (priceRange) {
    filter.price = {};
    if (priceRange.min !== undefined) {
      filter.price.$gte = priceRange.min;
    }
    if (priceRange.max !== undefined) {
      filter.price.$lte = priceRange.max;
    }
  }

  // Filter by nutrition range if provided
  if (nutritionRange) {
    if (nutritionRange.carbohydratesMin !== undefined) {
      filter['nutrition.carbohydrates'] = filter['nutrition.carbohydrates'] || {};
      filter['nutrition.carbohydrates'].$gte = nutritionRange.carbohydratesMin;
    }
    if (nutritionRange.carbohydratesMax !== undefined) {
      filter['nutrition.carbohydrates'] = filter['nutrition.carbohydrates'] || {};
      filter['nutrition.carbohydrates'].$lte = nutritionRange.carbohydratesMax;
    }
    if (nutritionRange.proteinMin !== undefined) {
      filter['nutrition.protein'] = filter['nutrition.protein'] || {};
      filter['nutrition.protein'].$gte = nutritionRange.proteinMin;
    }
    if (nutritionRange.proteinMax !== undefined) {
      filter['nutrition.protein'] = filter['nutrition.protein'] || {};
      filter['nutrition.protein'].$lte = nutritionRange.proteinMax;
    }
    if (nutritionRange.fatMin !== undefined) {
      filter['nutrition.fat'] = filter['nutrition.fat'] || {};
      filter['nutrition.fat'].$gte = nutritionRange.fatMin;
    }
    if (nutritionRange.fatMax !== undefined) {
      filter['nutrition.fat'] = filter['nutrition.fat'] || {};
      filter['nutrition.fat'].$lte = nutritionRange.fatMax;
    }
    if (nutritionRange.sodiumMin !== undefined) {
      filter['nutrition.sodium'] = filter['nutrition.sodium'] || {};
      filter['nutrition.sodium'].$gte = nutritionRange.sodiumMin;
    }
    if (nutritionRange.sodiumMax !== undefined) {
      filter['nutrition.sodium'] = filter['nutrition.sodium'] || {};
      filter['nutrition.sodium'].$lte = nutritionRange.sodiumMax;
    }
  }

  // Filter by allergens if provided
  if (allergensFilter) {
    if (allergensFilter.includeAllergens && allergensFilter.includeAllergens.length > 0) {
      filter.allergens = { $in: allergensFilter.includeAllergens };
    }
    if (allergensFilter.excludeAllergens && allergensFilter.excludeAllergens.length > 0) {
      filter.allergens = filter.allergens || {};
      filter.allergens.$nin = allergensFilter.excludeAllergens;
    }
  }

  // Execute the query with pagination
  return paginateQuery(
    MealModel.find(filter)
      .populate('mealPlan')
      .populate('recipe')
      .populate('restaurant'),
    page,
    limit
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
  context
) => {
  if (!context.user?.userId) {
    throw new Error('Authentication required');
  }

  // Build the filter object
  const filter = {};

  // Filter by price range if provided
  if (priceRange) {
    filter.price = {};
    if (priceRange.min !== undefined) {
      filter.price.$gte = priceRange.min;
    }
    if (priceRange.max !== undefined) {
      filter.price.$lte = priceRange.max;
    }
  }

  // Filter by nutrition range if provided
  if (nutritionRange) {
    if (nutritionRange.carbohydratesMin !== undefined) {
      filter['nutrition.carbohydrates'] = filter['nutrition.carbohydrates'] || {};
      filter['nutrition.carbohydrates'].$gte = nutritionRange.carbohydratesMin;
    }
    if (nutritionRange.carbohydratesMax !== undefined) {
      filter['nutrition.carbohydrates'] = filter['nutrition.carbohydrates'] || {};
      filter['nutrition.carbohydrates'].$lte = nutritionRange.carbohydratesMax;
    }
    if (nutritionRange.proteinMin !== undefined) {
      filter['nutrition.protein'] = filter['nutrition.protein'] || {};
      filter['nutrition.protein'].$gte = nutritionRange.proteinMin;
    }
    if (nutritionRange.proteinMax !== undefined) {
      filter['nutrition.protein'] = filter['nutrition.protein'] || {};
      filter['nutrition.protein'].$lte = nutritionRange.proteinMax;
    }
    if (nutritionRange.fatMin !== undefined) {
      filter['nutrition.fat'] = filter['nutrition.fat'] || {};
      filter['nutrition.fat'].$gte = nutritionRange.fatMin;
    }
    if (nutritionRange.fatMax !== undefined) {
      filter['nutrition.fat'] = filter['nutrition.fat'] || {};
      filter['nutrition.fat'].$lte = nutritionRange.fatMax;
    }
    if (nutritionRange.sodiumMin !== undefined) {
      filter['nutrition.sodium'] = filter['nutrition.sodium'] || {};
      filter['nutrition.sodium'].$gte = nutritionRange.sodiumMin;
    }
    if (nutritionRange.sodiumMax !== undefined) {
      filter['nutrition.sodium'] = filter['nutrition.sodium'] || {};
      filter['nutrition.sodium'].$lte = nutritionRange.sodiumMax;
    }
  }

  // Filter by allergens if provided
  if (allergensFilter) {
    if (allergensFilter.includeAllergens && allergensFilter.includeAllergens.length > 0) {
      filter.allergens = { $in: allergensFilter.includeAllergens };
    }
    if (allergensFilter.excludeAllergens && allergensFilter.excludeAllergens.length > 0) {
      filter.allergens = filter.allergens || {};
      filter.allergens.$nin = allergensFilter.excludeAllergens;
    }
  }

  // Execute the query with pagination
  // Don't filter by meal plan for the catalog view - we want to show all available meals
  return paginateQuery(
    MealModel.find(filter)
      .populate('recipe')
      .populate('restaurant'),
    page,
    limit
  );
});
