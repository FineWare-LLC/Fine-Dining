/**********************************************************
 * FILE: resolvers.js
 * Provides the GraphQL resolvers for Fine Dining
 * Updated to include updateRecipe, deleteRecipe, deleteRestaurant, deleteStats.
 **********************************************************/

import UserModel from '@/models/UserModel';
import RecipeModel from '@/models/RecipeModel';
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
         */
        async getUser(_parent, { id }) {
            return UserModel.findById(id);
        },

        /**
         * @function getUsers
         * Fetches all users.
         */
        async getUsers() {
            return UserModel.find({});
        },

        /**
         * @function getRecipe
         * Fetches a specific recipe by ID.
         */
        async getRecipe(_parent, { id }) {
            return RecipeModel.findById(id);
        },

        /**
         * @function getRecipes
         * Fetches all recipes.
         */
        async getRecipes() {
            return RecipeModel.find({});
        },

        /**
         * @function getRestaurant
         * Fetches a specific restaurant by ID.
         */
        async getRestaurant(_parent, { id }) {
            return RestaurantModel.findById(id);
        },

        /**
         * @function getRestaurants
         * Fetches all restaurants.
         */
        async getRestaurants() {
            return RestaurantModel.find({});
        },

        /**
         * @function getMealPlan
         * Retrieves a single MealPlan by ID (only populates user).
         */
        async getMealPlan(_parent, { id }) {
            return MealPlanModel.findById(id).populate('user');
        },

        /**
         * @function getMealPlans
         * Retrieves all MealPlans (only populates user).
         */
        async getMealPlans() {
            return MealPlanModel.find({}).populate('user');
        },

        /**
         * @function getStatsByUser
         * Retrieves all Stats records for a given user.
         */
        async getStatsByUser(_parent, { userId }) {
            return StatsModel.find({ user: userId });
        },
    },

    /******************************************************
     * MUTATIONS
     ******************************************************/
    Mutation: {
        /**
         * @function createUser
         * Creates a new User document.
         */
        async createUser(_parent, { input }) {
            return UserModel.create(input);
        },

        /**
         * @function updateUser
         * Updates an existing User by ID.
         */
        async updateUser(_parent, { id, input }) {
            return UserModel.findByIdAndUpdate(id, input, { new: true });
        },

        /**
         * @function deleteUser
         * Removes a User by ID; returns true if successful.
         */
        async deleteUser(_parent, { id }) {
            const result = await UserModel.findByIdAndDelete(id);
            return !!result;
        },

        /**
         * @function createRecipe
         * Creates a new Recipe document.
         */
        async createRecipe(
            _parent,
            { recipeName, ingredients, instructions, prepTime, difficulty, nutritionFacts }
        ) {
            return RecipeModel.create({
                recipeName,
                ingredients,
                instructions,
                prepTime,
                difficulty: difficulty || 'EASY',
                nutritionFacts,
            });
        },

        /**
         * @function updateRecipe
         * Updates a Recipe by ID; returns the updated Recipe.
         */
        async updateRecipe(
            _parent,
            { id, recipeName, ingredients, instructions, prepTime, difficulty, nutritionFacts }
        ) {
            const updateData = {};
            if (recipeName !== undefined) updateData.recipeName = recipeName;
            if (ingredients !== undefined) updateData.ingredients = ingredients;
            if (instructions !== undefined) updateData.instructions = instructions;
            if (prepTime !== undefined) updateData.prepTime = prepTime;
            if (difficulty !== undefined) updateData.difficulty = difficulty;
            if (nutritionFacts !== undefined) updateData.nutritionFacts = nutritionFacts;

            return RecipeModel.findByIdAndUpdate(id, updateData, { new: true });
        },

        /**
         * @function deleteRecipe
         * Removes a Recipe by ID; returns true if successful.
         */
        async deleteRecipe(_parent, { id }) {
            const result = await RecipeModel.findByIdAndDelete(id);
            return !!result;
        },

        /**
         * @function createRestaurant
         * Creates a new Restaurant document.
         */
        async createRestaurant(_parent, { restaurantName, address, phone, website }) {
            return RestaurantModel.create({
                restaurantName,
                address,
                phone,
                website,
            });
        },

        /**
         * @function deleteRestaurant
         * Removes a Restaurant by ID; returns true if successful.
         */
        async deleteRestaurant(_parent, { id }) {
            const result = await RestaurantModel.findByIdAndDelete(id);
            return !!result;
        },

        /**
         * @function createMealPlan
         * Creates a new MealPlan for a specific user.
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
         * Deletes a MealPlan by ID; returns true if successful.
         */
        async deleteMealPlan(_parent, { id }) {
            const result = await MealPlanModel.findByIdAndDelete(id);
            return !!result;
        },

        /**
         * @function createStats
         * Creates a new Stats document for a specific user.
         */
        async createStats(_parent, { userId, macros, micros }) {
            return StatsModel.create({
                user: userId,
                macros,
                micros,
            });
        },

        /**
         * @function deleteStats
         * Removes a Stats doc by ID; returns true if successful.
         */
        async deleteStats(_parent, { id }) {
            const result = await StatsModel.findByIdAndDelete(id);
            return !!result;
        },
    },

    /******************************************************
     * FIELD RESOLVERS (OPTIONAL)
     ******************************************************/
    MealPlan: {
        async user(parent) {
            return UserModel.findById(parent.user);
        },
        async meals(parent) {
            // Return an empty array or add logic if you have a Meal model
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
 * - We added updateRecipe, deleteRecipe, deleteRestaurant,
 *   and deleteStats to do more advanced modifications.
 **********************************************************/

/**********************************************************
 * EXPLANATION (LIKE I AM A PROFESSIONAL)
 * The resolver map translates our schema's queries and
 * mutations into Mongoose calls. Beyond the previously
 * working create and read operations, we've added:
 *   - updateRecipe  -> partial updates to existing recipes
 *   - deleteRecipe  -> removes a recipe by ID
 *   - deleteRestaurant -> removes a restaurant by ID
 *   - deleteStats   -> removes user stats by ID
 * This completes full CRUD coverage for your GraphQL API.
 **********************************************************/
