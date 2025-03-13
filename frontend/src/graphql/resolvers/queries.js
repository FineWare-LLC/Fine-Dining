/****************************************************************
 * FILE: /src/graphql/schema/resolvers/queries.js
 * Contains all Query resolvers for the Fine Dining application.
 ****************************************************************/

import User from '@/models/User';
import { RecipeModel } from "@/models/Recipe/index.js";
import { RestaurantModel } from '@/models/Restaurant';
import { MealPlanModel } from "@/models/MealPlan";
import { Stats as StatsModel } from "@/graphql/resolvers/resolversFields.js";
import { Review as ReviewModel } from "@/graphql/resolvers/resolversFields.js";
import { paginateQuery } from '@/utils/pagination.js';

/**
 * Alias for imported default User model, for clarity in JSDoc references.
 * @typedef {import('mongoose').Model} UserModel
 */
const UserModel = User;

/**
 * @function ping
 * @description Basic health check query that returns a simple message.
 * @returns {string} - The string "pong".
 */
const ping = () => 'pong';

/* -------------------------------------------------------------------------- */
/*                                 USER QUERIES                                */
/* -------------------------------------------------------------------------- */

/**
 * @function getUser
 * @description Retrieves a single user document by its unique ID.
 * @param {object} _parent - Parent resolver (unused in this case).
 * @param {object} args - The query arguments.
 * @param {string} args.id - The unique ID of the user to fetch.
 * @returns {Promise<UserModel|null>} A promise resolving to the user document or null if not found.
 */
async function getUser(_parent, { id }) {
    return UserModel.findById(id);
}

/**
 * @function getUsers
 * @description Fetches a paginated list of users.
 * @param {object} _parent - Parent resolver (unused).
 * @param {object} args - The query arguments.
 * @param {number} [args.page=1] - The page number.
 * @param {number} [args.limit=10] - The number of users per page.
 * @returns {Promise<UserModel[]>} An array of user documents for the specified page.
 */
async function getUsers(_parent, { page, limit }) {
    return paginateQuery(UserModel, page, limit);
}

/**
 * @function searchUsers
 * @description Searches user documents by matching a keyword against the user’s name or email.
 * @param {object} _parent - Parent resolver (unused).
 * @param {object} args - The query arguments.
 * @param {string} args.keyword - The keyword to match in name or email fields.
 * @returns {Promise<UserModel[]>} An array of user documents matching the query.
 */
async function searchUsers(_parent, { keyword }) {
    return UserModel.find({
        $or: [
            { name: { $regex: keyword, $options: 'i' } },
            { email: { $regex: keyword, $options: 'i' } },
        ],
    });
}

/* -------------------------------------------------------------------------- */
/*                                RECIPE QUERIES                               */
/* -------------------------------------------------------------------------- */

/**
 * @function getRecipe
 * @description Retrieves a single recipe by its ID, with the author populated.
 * @param {object} _parent - Parent resolver (unused).
 * @param {object} args
 * @param {string} args.id - The unique ID of the recipe.
 * @returns {Promise<RecipeModel|null>} A promise resolving to the recipe document or null.
 */
async function getRecipe(_parent, { id }) {
    return RecipeModel.findById(id).populate('author');
}

/**
 * @function getRecipes
 * @description Retrieves a paginated list of recipes.
 * @param {object} _parent - Parent resolver (unused).
 * @param {object} args
 * @param {number} [args.page=1] - The page number.
 * @param {number} [args.limit=10] - The number of recipes per page.
 * @returns {Promise<RecipeModel[]>} A promise resolving to an array of recipes.
 */
async function getRecipes(_parent, { page, limit }) {
    return paginateQuery(RecipeModel, page, limit);
}

/**
 * @function searchRecipes
 * @description Searches recipe documents by matching a keyword against the recipeName field.
 * @param {object} _parent - Parent resolver (unused).
 * @param {object} args
 * @param {string} args.keyword - The keyword to match in recipeName.
 * @returns {Promise<RecipeModel[]>} A promise resolving to an array of matched recipes.
 */
async function searchRecipes(_parent, { keyword }) {
    return RecipeModel.find({
        recipeName: { $regex: keyword, $options: 'i' },
    });
}

/* -------------------------------------------------------------------------- */
/*                             RESTAURANT QUERIES                             */
/* -------------------------------------------------------------------------- */

/**
 * @function getRestaurant
 * @description Retrieves a single restaurant document by its ID.
 * @param {object} _parent - Parent resolver (unused).
 * @param {object} args
 * @param {string} args.id - The unique ID of the restaurant.
 * @returns {Promise<RestaurantModel|null>} A promise resolving to the restaurant or null if not found.
 */
async function getRestaurant(_parent, { id }) {
    return RestaurantModel.findById(id);
}

/**
 * @function getRestaurants
 * @description Retrieves a paginated list of restaurants.
 * @param {object} _parent - Parent resolver (unused).
 * @param {object} args
 * @param {number} [args.page=1] - The page number.
 * @param {number} [args.limit=10] - The number of restaurants per page.
 * @returns {Promise<RestaurantModel[]>} A promise resolving to an array of restaurants.
 */
async function getRestaurants(_parent, { page, limit }) {
    return paginateQuery(RestaurantModel, page, limit);
}

/**
 * @function searchRestaurants
 * @description Searches restaurant documents by matching a keyword against the restaurantName field.
 * @param {object} _parent - Parent resolver (unused).
 * @param {object} args
 * @param {string} args.keyword - The keyword to match in restaurantName.
 * @returns {Promise<RestaurantModel[]>} A promise resolving to an array of matched restaurants.
 */
async function searchRestaurants(_parent, { keyword }) {
    return RestaurantModel.find({
        restaurantName: { $regex: keyword, $options: 'i' },
    });
}

/* -------------------------------------------------------------------------- */
/*                              MEAL PLAN QUERIES                             */
/* -------------------------------------------------------------------------- */

/**
 * @function getMealPlan
 * @description Retrieves a single meal plan by ID, populating the associated user and meals.
 * @param {object} _parent - Parent resolver (unused).
 * @param {object} args
 * @param {string} args.id - The unique ID of the meal plan.
 * @returns {Promise<MealPlanModel|null>} A promise that resolves to the meal plan or null if not found.
 */
async function getMealPlan(_parent, { id }) {
    return MealPlanModel.findById(id)
        .populate('user')
        .populate('meals');
}

/**
 * @function getMealPlans
 * @description Retrieves paginated meal plans, optionally filtered by a specific user’s ID.
 * @param {object} _parent - Parent resolver (unused).
 * @param {object} args
 * @param {string} [args.userId] - If provided, filter meal plans by the given user’s ID.
 * @param {number} [args.page=1] - The page number to return.
 * @param {number} [args.limit=10] - The number of meal plans per page.
 * @returns {Promise<MealPlanModel[]>} A promise resolving to an array of meal plan documents.
 */
async function getMealPlans(_parent, { userId, page, limit }) {
    const filter = userId ? { user: userId } : {};
    return paginateQuery(
        MealPlanModel.find(filter).populate('user'),
        page,
        limit
    );
}

/* -------------------------------------------------------------------------- */
/*                                  STATS QUERY                                */
/* -------------------------------------------------------------------------- */

/**
 * @function getStatsByUser
 * @description Retrieves user-specific statistics.
 * @param {object} _parent - Parent resolver (unused).
 * @param {object} args
 * @param {string} args.userId - The unique ID of the user for whom to retrieve stats.
 * @returns {Promise<Object[]>} A promise that resolves to an array of user stats objects.
 */
async function getStatsByUser(_parent, { userId }) {
    return StatsModel.find({ user: userId });
}

/* -------------------------------------------------------------------------- */
/*                                  REVIEW QUERIES                             */
/* -------------------------------------------------------------------------- */

/**
 * @function getReview
 * @description Retrieves a single review by its ID, populating the user who created it.
 * @param {object} _parent - Parent resolver (unused).
 * @param {object} args
 * @param {string} args.id - The unique ID of the review to retrieve.
 * @returns {Promise<ReviewModel|null>} A promise that resolves to the review document or null if not found.
 */
async function getReview(_parent, { id }) {
    return ReviewModel.findById(id).populate('user');
}

/**
 * @function getReviewsForTarget
 * @description Retrieves all reviews matching a specific target type and target ID, populating the user who created each review.
 * @param {object} _parent - Parent resolver (unused).
 * @param {object} args
 * @param {string} args.targetType - The type of target (e.g., 'Restaurant', 'Recipe').
 * @param {string} args.targetId - The unique ID of the target resource being reviewed.
 * @returns {Promise<ReviewModel[]>} A promise that resolves to an array of reviews.
 */
async function getReviewsForTarget(_parent, { targetType, targetId }) {
    return ReviewModel.find({ targetType, targetId }).populate('user');
}

/* -------------------------------------------------------------------------- */
/*                                QUERY EXPORTS                                */
/* -------------------------------------------------------------------------- */

export const Query = {
    ping,
    getUser,
    getUsers,
    searchUsers,
    getRecipe,
    getRecipes,
    searchRecipes,
    getRestaurant,
    getRestaurants,
    searchRestaurants,
    getMealPlan,
    getMealPlans,
    getStatsByUser,
    getReview,
    getReviewsForTarget,
};
