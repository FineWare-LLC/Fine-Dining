/******************************************************************************
 * /src/models/MealModel/mealMethods.js
 *
 * Instance methods accessible on each Meal document. For example:
 *   const mealDoc = await Meal.findById(id);
 *   console.log(mealDoc.getMealSummary());
 ******************************************************************************/

/**
 * @function attachMealMethods
 * @description Binds all instance methods to the schema.
 * @param {import('mongoose').Schema} schema - The Meal schema instance.
 * @returns {void}
 */
export function attachMealMethods(schema) {
    /**
     * @function getMealSummary
     * @memberof Meal
     * @instance
     * @description Summarizes the meal including name, type, and up to 3 ingredients.
     * @returns {string} A short descriptive summary of the meal.
     */
    schema.methods.getMealSummary = function () {
        const shortIngredients = this.ingredients.slice(0, 3).join(', ');
        const suffix = this.ingredients.length > 3 ? '...' : '';
        return `${this.mealName || 'Unnamed'} [${this.mealType}] - Ingredients: ${shortIngredients}${suffix}`;
    };

    /**
     * @function toJSONSafe
     * @memberof Meal
     * @instance
     * @description Converts the Meal instance to a sanitized JSON object,
     *              removing some internal or sensitive fields.
     * @returns {Object} The sanitized JSON.
     */
    schema.methods.toJSONSafe = function () {
        const mealObj = this.toObject();
        delete mealObj.__v; // remove Mongoose version key
        return mealObj;
    };
}
