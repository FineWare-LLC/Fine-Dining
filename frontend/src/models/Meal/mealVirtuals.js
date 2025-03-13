/******************************************************************************
 * /src/models/MealModel/mealVirtuals.js
 *
 * Defines virtual (computed) fields for the Meal schema. Virtuals do not persist
 * in the database but are accessible when generating or querying documents.
 ******************************************************************************/

/**
 * @function attachMealVirtuals
 * @description Binds all virtual fields to the passed-in schema.
 * @param {import('mongoose').Schema} schema - The Meal schema instance.
 * @returns {void}
 */
export function attachMealVirtuals(schema) {
    /**
     * @name fullDescription
     * @kind virtual
     * @memberof Meal
     * @description Combines mealName, mealType, and date into a descriptive string.
     * @returns {string}
     */
    schema.virtual('fullDescription').get(function () {
        const formattedDate = this.date ? this.date.toDateString() : 'N/A';
        const mealLabel = this.mealName || 'Untitled Meal';
        return `${mealLabel} (${this.mealType}) on ${formattedDate}`;
    });
}
