/****************************************************************
 * FILE: /src/graphql/schema/resolvers/resolversFields.js
 * Field-level resolvers and custom scalars.
 ****************************************************************/

import { MealModel} from '@/models/Meal';
import {RecipeModel} from '@/models/Recipe';
import {RestaurantModel} from "@/models/Restaurant/index.js";
import {MealPlanModel} from "@/models/MealPlan";

/**
 * @constant DateScalar
 * @description Example of a custom Date scalar implementation.
 */
export const DateScalar = {
    __serialize(value) {
        return value instanceof Date ? value.toISOString() : value;
    }, __parseValue(value) {
        return new Date(value);
    }, __parseLiteral(ast) {
        return new Date(ast.value);
    },
};

/* ---------------------------- Field Resolvers ----------------------------- */

/**
 * @namespace MealPlan
 * @property {Function} user - Resolves the user field by ID.
 * @property {Function} meals - Resolves the list of meals for the mealPlan.
 */
export const MealPlan = {
    async user(parent) {
        return UserModel.findById(parent.user);
    }, async meals(parent) {
        return MealModel.find({mealPlan: parent._id});
    },
};

/**
 * @namespace Meal
 * @property {Function} mealPlan - Resolves the associated MealPlan by ID.
 * @property {Function} recipe - Resolves the Recipe if applicable.
 * @property {Function} restaurant - Resolves the Restaurant if applicable.
 */
export const Meal = {
    async mealPlan(parent) {
        return MealPlanModel.findById(parent.mealPlan);
    }, async recipe(parent) {
        return RecipeModel.findById(parent.recipe);
    }, async restaurant(parent) {
        return RestaurantModel.findById(parent.restaurant);
    },
};

/**
 * @namespace Stats
 * @property {Function} user - Resolves the user document for these stats.
 */
export const Stats = {
    async user(parent) {
        return UserModel.findById(parent.user);
    },
};

/**
 * @namespace Review
 * @property {Function} user - Resolves the user document who created the review.
 */
export const Review = {
    async user(parent) {
        return UserModel.findById(parent.user);
    },
};
