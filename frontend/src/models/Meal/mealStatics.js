/******************************************************************************
 * /src/models/MealModel/mealStatics.js
 *
 * Static methods (called on the Model itself, not the document). For example:
 *   const meals = await Meal.findByMealPlan(mealPlanId);
 ******************************************************************************/

/**
 * @function attachMealStatics
 * @description Binds static methods to the Meal schema.
 * @param {import('mongoose').Schema} schema - The Meal schema instance.
 * @returns {void}
 */
export function attachMealStatics(schema) {
    /**
     * @function findByMealPlan
     * @memberof Meal
     * @static
     * @description Finds all meals for a specified mealPlan ID.
     * @param {import('mongoose').Types.ObjectId} mealPlanId - The MealPlan ID to search by.
     * @returns {Promise<Array<Meal>>} Promise resolving to an array of Meals.
     */
    schema.statics.findByMealPlan = function (mealPlanId) {
        return this.find({ mealPlan: mealPlanId }).exec();
    };

    /**
     * @function findByDateRange
     * @memberof Meal
     * @static
     * @description Finds all meals within the specified date range.
     * @param {Date} startDate - Start date of the range.
     * @param {Date} endDate - End date of the range.
     * @param {import('mongoose').Types.ObjectId} [mealPlanId] - (Optional) MealPlan ID filter.
     * @returns {Promise<Array<Meal>>} Promise resolving to an array of Meals.
     */
    schema.statics.findByDateRange = function (startDate, endDate, mealPlanId) {
        const query = {
            date: {
                $gte: startDate,
                $lte: endDate,
            },
        };
        if (mealPlanId) {
            query.mealPlan = mealPlanId;
        }
        return this.find(query).exec();
    };

    /**
     * @function searchByIngredient
     * @memberof Meal
     * @static
     * @description Finds all meals containing a specific ingredient (case-insensitive).
     * @param {string} ingredient - The ingredient to search for.
     * @returns {Promise<Array<Meal>>} Promise resolving to an array of Meals.
     */
    schema.statics.searchByIngredient = function (ingredient) {
        return this.find({
            ingredients: {
                $regex: new RegExp(ingredient, 'i'),
            },
        }).exec();
    };
}
