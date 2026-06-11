/**
 * @file mealPlan.model.js
 * @description Exports a Mongoose model for MealPlan documents.
 */

import mongoose from 'mongoose';
import mealPlanSchema from './mealPlan.schema.js';

/**
 * @constant MealPlanModel
 * @description Mongoose model for the "MealPlan" collection. If it already exists in the Mongoose
 * registry, it will use that model instead of creating a new one (to avoid recompilation issues in dev).
 *
 * @type {mongoose.Model}
 *
 * @example
 * // Usage
 * import MealPlanModel from 'src/models/mealPlan/mealPlan.model.js';
 * const mealPlan = await MealPlanModel.create({ user: userId, startDate: new Date(), ... });
 */
const MealPlanModel =
    mongoose.models.MealPlan || mongoose.model('MealPlan', mealPlanSchema);

export default MealPlanModel;
