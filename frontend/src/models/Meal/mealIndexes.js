/******************************************************************************
 * /src/models/MealModel/mealIndexes.js
 *
 * Declares indexes for the Meal schema. We separate them here to reduce clutter
 * in the main schema file.
 ******************************************************************************/

/**
 * @function attachMealIndexes
 * @description Applies indexes to the Meal schema, e.g., compound indexes to enforce constraints.
 * @param {import('mongoose').Schema} schema - The Meal schema instance.
 * @returns {void}
 */
export function attachMealIndexes(schema) {
    // Example: Uniqueness constraint on (mealPlan, date, mealType)
    schema.index(
        { mealPlan: 1, date: 1, mealType: 1 },
        {
            unique: true,
            name: 'idx_unique_meal_per_type_per_date',
        },
    );
}
