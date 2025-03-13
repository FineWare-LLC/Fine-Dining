/**
 * @file index.js
 * @description Aggregates and re-exports all MealPlan-related modules in one place.
 */

import MealPlanModel from './mealPlan.model.js';
import mealPlanSchema from './mealPlan.schema.js';
import {
    createMealPlan,
    getMealPlanById,
    getMealPlansByUser,
    updateMealPlan,
    deleteMealPlan,
} from './mealPlan.service.js';

export {
    mealPlanSchema,
    MealPlanModel,
    createMealPlan,
    getMealPlanById,
    getMealPlansByUser,
    updateMealPlan,
    deleteMealPlan,
};
