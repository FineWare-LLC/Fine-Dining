/**********************************************************
 * FILE: resolvers.js
 * Provides the GraphQL resolvers for Fine Dining
 **********************************************************/

import UserModel from '@/models/UserModel';        // Example Mongoose model
import RecipeModel from '@/models/RecipeModel';    // Example Mongoose model
import RestaurantModel from '@/models/RestaurantModel';
import MealPlanModel from '@/models/MealPlanModel';
import StatsModel from '@/models/StatsModel';

/**
 * @constant resolvers
 * Maps Query and Mutation fields to JavaScript functions
 * that fetch or modify the data.
 */
export const resolvers = {
    /******************************************************
     * QUERIES
     ******************************************************/
    Query: {
        /**
         * @function getUser
         * Fetches one user by their ID.
         * @param {object} _parent
         * @param {object} args
         * @returns {Promise<object>} user
         */
        async getUser(_parent, { id }) {
            return await UserModel.findById(id);
        },

        /**
         * @function getUsers
         * Fetches all users.
         * @returns {Promise<object[]>} array of users
         */
        async getUsers() {
            return await UserModel.find({});
        },

        /**
         * @function getRecipe
         * Fetches a specific recipe by ID.
         * @param {object} _parent
         * @param {object} args
         * @returns {Promise<object>} recipe
         */
        async getRecipe(_parent, { id }) {
            return await RecipeModel.findById(id);
        },

        /**
         * @function getRecipes
         * Fetches all recipes.
         * @returns {Promise<object[]>} array of recipes
         */
        async getRecipes() {
            return await RecipeModel.find({});
        },

        /**
         * @function getRestaurant
         * Fetches a specific restaurant by ID.
         * @param {object} _parent
         * @param {object} args
         * @returns {Promise<object>} restaurant
         */
        async getRestaurant(_parent, { id }) {
            return await RestaurantModel.findById(id);
        },

        /**
         * @function getRestaurants
         * Fetches all restaurants.
         * @returns {Promise<object[]>} array of restaurants
         */
        async getRestaurants() {
            return await RestaurantModel.find({});
        },

        /**
         * @function getMealPlan
         * Retrieves a single MealPlan by ID.
         * NOTE: Removed populate('meals') to avoid errors if
         * 'meals' field doesn’t exist in your MealPlan schema.
         * @param {object} _parent
         * @param {object} args
         * @returns {Promise<object>} mealPlan
         */
        async getMealPlan(_parent, { id }) {
            return await MealPlanModel
                .findById(id)
                .populate('user'); // no .populate('meals')
        },

        /**
         * @function getMealPlans
         * Retrieves all MealPlans.
         * NOTE: Removed populate('meals') to avoid errors if
         * 'meals' field doesn’t exist in your MealPlan schema.
         * @returns {Promise<object[]>} array of mealPlans
         */
        async getMealPlans() {
            return await MealPlanModel
                .find({})
                .populate('user'); // no .populate('meals')
        },

        /**
         * @function getStatsByUser
         * Retrieves all stats entries for a given user.
         * @param {object} _parent
         * @param {object} args
         * @returns {Promise<object[]>} array of stats
         */
        async getStatsByUser(_parent, { userId }) {
            return await StatsModel.find({ user: userId });
        },
    },

    /******************************************************
     * MUTATIONS
     ******************************************************/
    Mutation: {
        /**
         * @function createUser
         * Creates a new user document.
         * @param {object} _parent
         * @param {object} args
         * @returns {Promise<object>} newly created user
         */
        async createUser(_parent, { input }) {
            const newUser = await UserModel.create(input);
            return newUser;
        },

        /**
         * @function updateUser
         * Updates user details by ID.
         * @param {object} _parent
         * @param {object} args
         * @returns {Promise<object|null>} updated user or null
         */
        async updateUser(_parent, { id, input }) {
            return await UserModel.findByIdAndUpdate(id, input, { new: true });
        },

        /**
         * @function deleteUser
         * Removes a user document by ID.
         * @param {object} _parent
         * @param {object} args
         * @returns {Promise<boolean>} true if deleted successfully
         */
        async deleteUser(_parent, { id }) {
            const result = await UserModel.findByIdAndDelete(id);
            return !!result;
        },

        /**
         * @function createRecipe
         * Creates a new recipe document.
         * @param {object} _parent
         * @param {object} args
         * @returns {Promise<object>} newly created recipe
         */
        async createRecipe(
            _parent,
            { recipeName, ingredients, instructions, prepTime, difficulty, nutritionFacts }
        ) {
            const newRecipe = await RecipeModel.create({
                recipeName,
                ingredients,
                instructions,
                prepTime,
                difficulty: difficulty || 'EASY',
                nutritionFacts,
            });
            return newRecipe;
        },

        /**
         * @function createRestaurant
         * Creates a new restaurant document.
         * @param {object} _parent
         * @param {object} args
         * @returns {Promise<object>} newly created restaurant
         */
        async createRestaurant(_parent, { restaurantName, address, phone, website }) {
            return await RestaurantModel.create({
                restaurantName,
                address,
                phone,
                website,
            });
        },

        /**
         * @function createMealPlan
         * Creates a new MealPlan for a specific user.
         * @param {object} _parent
         * @param {object} args
         * @returns {Promise<object>} newly created meal plan
         */
        async createMealPlan(_parent, { userId, startDate, endDate }) {
            const newPlan = await MealPlanModel.create({
                user: userId,
                startDate,
                endDate,
            });
            return newPlan.populate('user');
        },

        /**
         * @function deleteMealPlan
         * Deletes a MealPlan by ID.
         * @param {object} _parent
         * @param {object} args
         * @returns {Promise<boolean>} true if deletion was successful
         */
        async deleteMealPlan(_parent, { id }) {
            const result = await MealPlanModel.findByIdAndDelete(id);
            return !!result;
        },

        /**
         * @function createStats
         * Creates a new stats document for a user.
         * @param {object} _parent
         * @param {object} args
         * @returns {Promise<object>} newly created stats
         */
        async createStats(_parent, { userId, macros, micros }) {
            const newStats = await StatsModel.create({
                user: userId,
                macros,
                micros,
            });
            return newStats;
        },
    },

    /******************************************************
     * FIELD RESOLVERS (OPTIONAL)
     * Define how to fetch relations if not using .populate()
     ******************************************************/
    MealPlan: {
        async user(parent) {
            return UserModel.findById(parent.user);
        },
        async meals(parent) {
            // If you had a "meals" field in MealPlan schema referencing a Meal model,
            // you could return real data here. For now, just return an empty array.
            return [];
        },
    },
    Meal: {
        // Only relevant if you define a Meal model with these fields
        async mealPlan(parent) {
            return null;
        },
        async recipe(parent) {
            return null;
        },
        async restaurant(parent) {
            return null;
        },
    },
    Stats: {
        async user(parent) {
            return UserModel.findById(parent.user);
        },
    },
};

/**********************************************************
 * EXPLANATION (LIKE I AM 10)
 * - "Query" means we get data (like getUser or getRecipe).
 * - "Mutation" means we change data (like createUser).
 * - "await" tells our code to wait for the database call.
 **********************************************************/

/**********************************************************
 * EXPLANATION (LIKE I AM A PROFESSIONAL)
 * The resolver map translates the schema’s query and
 * mutation definitions to actual functions that interface
 * with Mongoose models. Each function either fetches
 * or manipulates data and returns it in the format
 * matching the defined schema types. Field-level resolvers
 * provide fine-grained control for populating related data,
 * but to avoid breaking code, references to "meals" have
 * been removed from direct .populate(), and the Meal field
 * resolvers are stubbed out unless you add a Meal model/logic.
 **********************************************************/
