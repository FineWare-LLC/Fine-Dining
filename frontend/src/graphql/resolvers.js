/**********************************************************
 * FILE: resolvers.js
 * Provides combined GraphQL resolvers for Fine Dining,
 * including user authentication (loginUser).
 **********************************************************/

/**
 * @fileoverview Main GraphQL resolvers for Fine Dining.
 * Uses Mongoose models for data operations and bcrypt/jwt
 * for authentication.
 */

import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

/* Mongoose Models */
import UserModel from '@/models/UserModel';
import RecipeModel from '@/models/RecipeModel';
import RestaurantModel from '@/models/RestaurantModel';
import MealPlanModel from '@/models/MealPlanModel';
import StatsModel from '@/models/StatsModel';

/**
 * @constant resolvers
 * Encapsulates all Queries and Mutations for the schema.
 */
export const resolvers = {
    /******************************************************
     * QUERIES
     ******************************************************/
    Query: {
        /**
         * Retrieves a single user by ID.
         * @param {object} _parent - Unused parent resolver
         * @param {object} args - Resolver arguments
         * @param {string} args.id - User ID
         * @returns {Promise<UserModel>} User document
         */
        async getUser(_parent, { id }) {
            return UserModel.findById(id);
        },

        /**
         * Retrieves all users.
         * @returns {Promise<UserModel[]>} Array of user docs
         */
        async getUsers() {
            return UserModel.find({});
        },

        /**
         * Retrieves a single recipe by ID.
         */
        async getRecipe(_parent, { id }) {
            return RecipeModel.findById(id);
        },

        /**
         * Retrieves all recipes.
         */
        async getRecipes() {
            return RecipeModel.find({});
        },

        /**
         * Retrieves a single restaurant by ID.
         */
        async getRestaurant(_parent, { id }) {
            return RestaurantModel.findById(id);
        },

        /**
         * Retrieves all restaurants.
         */
        async getRestaurants() {
            return RestaurantModel.find({});
        },

        /**
         * Retrieves a meal plan by ID (populates user).
         */
        async getMealPlan(_parent, { id }) {
            return MealPlanModel.findById(id).populate('user');
        },

        /**
         * Retrieves all meal plans (populates user).
         */
        async getMealPlans() {
            return MealPlanModel.find({}).populate('user');
        },

        /**
         * Retrieves stats by userId.
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
         * Creates a new user document (hashed password via pre-save).
         * @param {object} args - Resolver arguments
         * @param {object} args.input - Fields to create user
         * @returns {Promise<UserModel>} Created user doc
         */
        async createUser(_parent, { input }) {
            // Mongoose validation will ensure all required fields exist
            // (name, email, password, gender, measurementSystem).
            return UserModel.create(input);
        },

        /**
         * Logs in the user, returning a JWT + user object.
         * @param {string} email - User's email
         * @param {string} password - User's plain password
         * @returns {{token: string, user: object}}
         */
        async loginUser(_parent, { email, password }) {
            // Include password explicitly
            const user = await UserModel.findOne({ email }).select('+password');
            if (!user) {
                throw new Error('User not found');
            }

            const valid = await bcrypt.compare(password, user.password);
            if (!valid) {
                throw new Error('Invalid credentials');
            }

            // Replace 'YOUR_SECRET_KEY' with a secure key in .env
            const token = jwt.sign(
                { userId: user._id, email: user.email },
                'YOUR_SECRET_KEY',
                { expiresIn: '1d' }
            );

            return {
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                },
            };
        },

        /**
         * Updates user fields by ID; triggers pre-save hook if password changed.
         */
        async updateUser(_parent, { id, input }) {
            const user = await UserModel.findById(id);
            if (!user) throw new Error('User not found');

            Object.assign(user, input);
            return user.save(); // pre-save hook re-hashes if password changed
        },

        /**
         * Deletes a user; returns true if found/deleted.
         */
        async deleteUser(_parent, { id }) {
            const result = await UserModel.findByIdAndDelete(id);
            return !!result;
        },

        /* ------------------------ RECIPE ------------------------ */
        /**
         * Creates a new recipe document.
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
         * Updates a recipe document by ID.
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
         * Deletes a recipe; returns true if found/deleted.
         */
        async deleteRecipe(_parent, { id }) {
            const result = await RecipeModel.findByIdAndDelete(id);
            return !!result;
        },

        /* ------------------------ RESTAURANT ------------------------ */
        /**
         * Creates a new restaurant document.
         */
        async createRestaurant(_parent, { restaurantName, address, phone, website }) {
            return RestaurantModel.create({ restaurantName, address, phone, website });
        },

        /**
         * Deletes a restaurant; returns true if found/deleted.
         */
        async deleteRestaurant(_parent, { id }) {
            const result = await RestaurantModel.findByIdAndDelete(id);
            return !!result;
        },

        /* ------------------------ MEAL PLAN ------------------------ */
        /**
         * Creates a meal plan and populates the user.
         */
        async createMealPlan(_parent, { userId, startDate, endDate }) {
            const newPlan = await MealPlanModel.create({ user: userId, startDate, endDate });
            return newPlan.populate('user');
        },

        /**
         * Deletes a meal plan; returns true if found/deleted.
         */
        async deleteMealPlan(_parent, { id }) {
            const result = await MealPlanModel.findByIdAndDelete(id);
            return !!result;
        },

        /* ------------------------ STATS ------------------------ */
        /**
         * Creates a stats document for a user.
         */
        async createStats(_parent, { userId, macros, micros }) {
            return StatsModel.create({ user: userId, macros, micros });
        },

        /**
         * Deletes a stats document; returns true if found/deleted.
         */
        async deleteStats(_parent, { id }) {
            const result = await StatsModel.findByIdAndDelete(id);
            return !!result;
        },
    },

    /******************************************************
     * FIELD RESOLVERS (OPTIONAL)
     ******************************************************/
    /**
     * MealPlan type resolvers for nested fields.
     */
    MealPlan: {
        async user(parent) {
            return UserModel.findById(parent.user);
        },
        async meals(parent) {
            // If you have a separate Meal model, reference or populate here
            return [];
        },
    },

    /**
     * Meal type resolvers for nested fields.
     */
    Meal: {
        async mealPlan(_parent) {
            return null;
        },
        async recipe(_parent) {
            return null;
        },
        async restaurant(_parent) {
            return null;
        },
    },

    /**
     * Stats type resolvers for nested fields.
     */
    Stats: {
        async user(parent) {
            return UserModel.findById(parent.user);
        },
    },
};

/**********************************************************
 * EXPLANATION (LIKE I AM 10)
 * 1) "createUser" needs "name, email, password, gender,
 *    measurementSystem" to make a new user.
 * 2) "loginUser" checks the password and gives you a "token"
 *    so you can prove you logged in.
 * 3) The rest is for recipes, restaurants, meal plans,
 *    and stats, just like normal.
 **********************************************************/

/**********************************************************
 * EXPLANATION (LIKE I AM A PROFESSIONAL)
 * We have integrated a user authentication flow (loginUser)
 * within the same resolvers file. The user model's password
 * is automatically hashed via a pre-save hook, and we can
 * selectively compare it with user-provided credentials
 * by using `.select('+password')`. The schema now includes
 * a `password` field for user creation, plus a `loginUser`
 * mutation returning an AuthPayload (a token + user).
 **********************************************************/
