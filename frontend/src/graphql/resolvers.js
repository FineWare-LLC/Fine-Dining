/**********************************************************
 * FILE: /src/graphql/resolvers.js
 * Provides combined GraphQL resolvers for Fine Dining,
 * heavily expanded with advanced features.
 **********************************************************/

import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';

/* Mongoose Models */
import UserModel from '@/models/UserModel';
import RecipeModel from '@/models/RecipeModel';
import RestaurantModel from '@/models/RestaurantModel';
import MealPlanModel from '@/models/MealPlanModel';
import MealModel from '@/models/MealModel';
import StatsModel from '@/models/StatsModel';
import ReviewModel from '@/models/ReviewModel';

/* Utility function for pagination */
async function paginateQuery(model, page = 1, limit = 10, filter = {}) {
    const skip = (page - 1) * limit;
    const docs = await model.find(filter).skip(skip).limit(limit);
    return docs;
}

export const resolvers = {
    /******************************************************
     * SCALAR RESOLVER EXAMPLE (Date)
     * You must install `graphql-scalars` or create your own
     * basic date parser for your environment.
     ******************************************************/
    Date: {
        __serialize(value) {
            return value instanceof Date ? value.toISOString() : value;
        },
        __parseValue(value) {
            return new Date(value);
        },
        __parseLiteral(ast) {
            return new Date(ast.value);
        },
    },

    /******************************************************
     * QUERIES
     ******************************************************/
    Query: {
        // Health check
        ping: () => 'pong',

        // User
        async getUser(_parent, { id }) {
            return UserModel.findById(id);
        },
        async getUsers(_parent, { page, limit }) {
            return paginateQuery(UserModel, page, limit);
        },
        async searchUsers(_parent, { keyword }) {
            return UserModel.find({
                $or: [
                    { name: { $regex: keyword, $options: 'i' } },
                    { email: { $regex: keyword, $options: 'i' } },
                ],
            });
        },

        // Recipe
        async getRecipe(_parent, { id }) {
            return RecipeModel.findById(id).populate('author');
        },
        async getRecipes(_parent, { page, limit }) {
            return paginateQuery(RecipeModel, page, limit);
        },
        async searchRecipes(_parent, { keyword }) {
            return RecipeModel.find({
                recipeName: { $regex: keyword, $options: 'i' },
            });
        },

        // Restaurant
        async getRestaurant(_parent, { id }) {
            return RestaurantModel.findById(id);
        },
        async getRestaurants(_parent, { page, limit }) {
            return paginateQuery(RestaurantModel, page, limit);
        },
        async searchRestaurants(_parent, { keyword }) {
            return RestaurantModel.find({
                restaurantName: { $regex: keyword, $options: 'i' },
            });
        },

        // Meal Plan
        async getMealPlan(_parent, { id }) {
            return MealPlanModel.findById(id)
                .populate('user')
                .populate('meals');
        },
        async getMealPlans(_parent, { userId, page, limit }) {
            const filter = userId ? { user: userId } : {};
            return paginateQuery(MealPlanModel.find(filter).populate('user'), page, limit);
        },

        // Stats
        async getStatsByUser(_parent, { userId }) {
            return StatsModel.find({ user: userId });
        },

        // Reviews
        async getReview(_parent, { id }) {
            return ReviewModel.findById(id).populate('user');
        },
        async getReviewsForTarget(_parent, { targetType, targetId }) {
            return ReviewModel.find({ targetType, targetId }).populate('user');
        },
    },

    /******************************************************
     * MUTATIONS
     ******************************************************/
    Mutation: {
        /* ---------------------- USER ---------------------- */
        async createUser(_parent, { input }) {
            const existingUser = await UserModel.findOne({ email: input.email });
            if (existingUser) {
                throw new Error('Email already in use');
            }
            return UserModel.create(input);
        },

        async updateUser(_parent, { id, input }) {
            const user = await UserModel.findById(id);
            if (!user) throw new Error('User not found');

            Object.assign(user, input);
            return user.save();
        },

        async deleteUser(_parent, { id }) {
            const result = await UserModel.findByIdAndDelete(id);
            return !!result;
        },

        /* ---------------------- AUTH ---------------------- */
        async loginUser(_parent, { email, password }) {
            const user = await UserModel.findOne({ email }).select('+password');
            if (!user) {
                throw new Error('User not found');
            }

            const valid = await bcrypt.compare(password, user.password);
            if (!valid) {
                throw new Error('Invalid credentials');
            }

            // Optionally, update lastLogin
            user.lastLogin = new Date();
            await user.save();

            // In production, use a secure key from .env
            const token = jwt.sign(
                { userId: user._id, email: user.email, role: user.role },
                'YOUR_SECRET_KEY',
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
        },

        /**
         * For “forgot password” flow, we create a token and email it to the user.
         * In production, you'd configure an actual email transport service.
         */
        async requestPasswordReset(_parent, { email }) {
            const user = await UserModel.findOne({ email });
            if (!user) {
                // We don't reveal user existence to avoid user enumeration attacks.
                return true;
            }
            const resetToken = user.generatePasswordResetToken();
            await user.save();

            // For example, you'd set up an email client with nodemailer:
            // const transporter = nodemailer.createTransport({ ... });
            // transporter.sendMail({
            //   from: '"FineDine" <no-reply@finedine.com>',
            //   to: user.email,
            //   subject: 'Password Reset Request',
            //   text: `Here is your reset token: ${resetToken}`,
            // });

            return true; // Return true if token creation was successful
        },

        /**
         * Resets a user's password using the provided resetToken.
         */
        async resetPassword(_parent, { resetToken, newPassword }) {
            const user = await UserModel.findOne({ passwordResetToken: resetToken });
            if (!user) {
                throw new Error('Invalid or expired reset token.');
            }

            const isValid = user.validatePasswordResetToken(resetToken);
            if (!isValid) {
                throw new Error('Invalid or expired reset token.');
            }

            // Update the user's password
            user.password = newPassword;
            // Clear out the token fields
            user.passwordResetToken = null;
            user.passwordResetTokenExpiry = null;
            await user.save();

            return true;
        },

        /* --------------------- RECIPE --------------------- */
        async createRecipe(
            _parent,
            {
                recipeName,
                ingredients,
                instructions,
                prepTime,
                difficulty,
                nutritionFacts,
                tags,
                images,
                estimatedCost,
                authorId,
            }
        ) {
            const author = authorId ? await UserModel.findById(authorId) : null;
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
        },

        async updateRecipe(
            _parent,
            { id, recipeName, ingredients, instructions, prepTime, difficulty, nutritionFacts, tags, images, estimatedCost }
        ) {
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
        },

        async deleteRecipe(_parent, { id }) {
            const result = await RecipeModel.findByIdAndDelete(id);
            return !!result;
        },

        /* ------------------- RESTAURANT ------------------- */
        async createRestaurant(
            _parent,
            { restaurantName, address, phone, website, cuisineType, priceRange }
        ) {
            return RestaurantModel.create({
                restaurantName,
                address,
                phone,
                website,
                cuisineType,
                priceRange,
            });
        },

        async updateRestaurant(
            _parent,
            { id, restaurantName, address, phone, website, cuisineType, priceRange }
        ) {
            const updateData = {};
            if (restaurantName !== undefined) updateData.restaurantName = restaurantName;
            if (address !== undefined) updateData.address = address;
            if (phone !== undefined) updateData.phone = phone;
            if (website !== undefined) updateData.website = website;
            if (cuisineType !== undefined) updateData.cuisineType = cuisineType;
            if (priceRange !== undefined) updateData.priceRange = priceRange;

            return RestaurantModel.findByIdAndUpdate(id, updateData, { new: true });
        },

        async deleteRestaurant(_parent, { id }) {
            const result = await RestaurantModel.findByIdAndDelete(id);
            return !!result;
        },

        /* ------------------- MEAL PLAN ------------------- */
        async createMealPlan(_parent, { userId, startDate, endDate, title, status, totalCalories }) {
            const user = await UserModel.findById(userId);
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
        },

        async updateMealPlan(_parent, { id, startDate, endDate, title, status, totalCalories }) {
            const updateData = {};
            if (startDate !== undefined) updateData.startDate = startDate;
            if (endDate !== undefined) updateData.endDate = endDate;
            if (title !== undefined) updateData.title = title;
            if (status !== undefined) updateData.status = status;
            if (totalCalories !== undefined) updateData.totalCalories = totalCalories;

            return MealPlanModel.findByIdAndUpdate(id, updateData, { new: true }).populate('user');
        },

        async deleteMealPlan(_parent, { id }) {
            const result = await MealPlanModel.findByIdAndDelete(id);
            return !!result;
        },

        /* --------------------- MEAL --------------------- */
        async createMeal(
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
            // Validate meal plan
            const mealPlan = await MealPlanModel.findById(mealPlanId);
            if (!mealPlan) throw new Error('MealPlan not found');

            // Validate optional references
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

            // Add to mealPlan's meals array
            mealPlan.meals.push(newMeal._id);
            await mealPlan.save();

            return newMeal;
        },

        async updateMeal(
            _parent,
            { id, date, mealType, recipeId, restaurantId, mealName, ingredients, nutritionFacts, portionSize, notes }
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
        },

        async deleteMeal(_parent, { id }) {
            const meal = await MealModel.findById(id);
            if (!meal) return false;

            // Remove meal from associated mealPlan
            const mealPlan = await MealPlanModel.findById(meal.mealPlan);
            if (mealPlan) {
                mealPlan.meals = mealPlan.meals.filter(mId => mId.toString() !== id);
                await mealPlan.save();
            }

            await meal.deleteOne();
            return true;
        },

        /* --------------------- STATS --------------------- */
        async createStats(_parent, { userId, macros, micros, caloriesConsumed, waterIntake, steps }) {
            return StatsModel.create({ user: userId, macros, micros, caloriesConsumed, waterIntake, steps });
        },

        async deleteStats(_parent, { id }) {
            const result = await StatsModel.findByIdAndDelete(id);
            return !!result;
        },

        /* -------------------- REVIEWS -------------------- */
        async createReview(_parent, { targetType, targetId, rating, comment }) {
            // Validate target
            if (!['RECIPE', 'RESTAURANT'].includes(targetType)) {
                throw new Error('Invalid targetType');
            }
            // Could also check if the recipe or restaurant exists:
            // if (targetType === 'RECIPE') { ...check recipe doc... }

            // For demonstration, let's just create the review.
            // In a real app, you'd get userId from the context (the logged-in user).
            // We'll assume a fixed user or pull from context.

            const userId = mongoose.Types.ObjectId('640faaaa4dc91567048f0abc'); // placeholder
            const newReview = await ReviewModel.create({
                user: userId,
                targetType,
                targetId,
                rating,
                comment,
            });

            // Optionally, update averageRating/ratingCount on the target doc
            if (targetType === 'RECIPE') {
                const recipe = await RecipeModel.findById(targetId);
                if (recipe) {
                    recipe.averageRating =
                        (recipe.averageRating * recipe.ratingCount + rating) / (recipe.ratingCount + 1);
                    recipe.ratingCount += 1;
                    await recipe.save();
                }
            } else if (targetType === 'RESTAURANT') {
                const restaurant = await RestaurantModel.findById(targetId);
                if (restaurant) {
                    restaurant.averageRating =
                        (restaurant.averageRating * restaurant.ratingCount + rating) / (restaurant.ratingCount + 1);
                    restaurant.ratingCount += 1;
                    await restaurant.save();
                }
            }

            return newReview;
        },

        async deleteReview(_parent, { id }) {
            const review = await ReviewModel.findById(id);
            if (!review) return false;

            // Optionally, decrement the ratingCount on the target doc,
            // recalculate the average. We'll do so for demonstration.

            if (review.targetType === 'RECIPE') {
                const recipe = await RecipeModel.findById(review.targetId);
                if (recipe && recipe.ratingCount > 0) {
                    // Recalculate average excluding this review
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
        },
    },

    /******************************************************
     * FIELD RESOLVERS
     ******************************************************/

    MealPlan: {
        async user(parent) {
            return UserModel.findById(parent.user);
        },
        async meals(parent) {
            return MealModel.find({ mealPlan: parent._id });
        },
    },

    Meal: {
        async mealPlan(parent) {
            return MealPlanModel.findById(parent.mealPlan);
        },
        async recipe(parent) {
            return RecipeModel.findById(parent.recipe);
        },
        async restaurant(parent) {
            return RestaurantModel.findById(parent.restaurant);
        },
    },

    Stats: {
        async user(parent) {
            return UserModel.findById(parent.user);
        },
    },

    Review: {
        async user(parent) {
            return UserModel.findById(parent.user);
        },
    },
};
