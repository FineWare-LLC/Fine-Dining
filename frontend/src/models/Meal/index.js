/******************************************************************************
 * /src/models/MealModel/index.js
 *
 * Combines the schema, hooks, statics, methods, virtuals, and indexes into
 * the final Mongoose model. Exports the model as default.
 ******************************************************************************/

import mongoose from 'mongoose';
import {mealSchema} from './mealSchema.js';
import {attachMealHooks} from './mealHooks.js';
import {attachMealMethods} from './mealMethods.js';
import {attachMealStatics} from './mealStatics.js';
import {attachMealVirtuals} from './mealVirtuals.js';
import {attachMealIndexes} from './mealIndexes.js';

/**
 * Apply hooks, methods, statics, virtuals, and indexes:
 */
attachMealHooks(mealSchema);
attachMealMethods(mealSchema);
attachMealStatics(mealSchema);
attachMealVirtuals(mealSchema);
attachMealIndexes(mealSchema);

/**
 * Create (or retrieve) the Mongoose model.
 * We use mongoose.models.Meal to avoid recompiling the model in a hot-reload environment
 * like Next.js or serverless environments.
 */
export const MealModel = mongoose.models.Meal || mongoose.model('Meal', mealSchema);

export default {MealModel};
