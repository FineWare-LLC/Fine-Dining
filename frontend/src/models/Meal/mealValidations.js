/******************************************************************************
 * /src/models/MealModel/mealValidations.js
 *
 * Contains custom validation functions for the Meal schema fields.
 * Splitting them out helps keep mealSchema.js clean and readable.
 ******************************************************************************/

import { Schema } from 'mongoose';

/**
 * @function dateWithinLastFiftyYears
 * @description Validates that a given date is not more than 50 years in the past.
 * @param {Date} value - The date value to validate.
 * @returns {boolean} true if the date is within the last 50 years, false otherwise.
 */
export function dateWithinLastFiftyYears(value) {
    if (!(value instanceof Date)) return false;

    const fiftyYearsAgo = new Date();
    fiftyYearsAgo.setFullYear(fiftyYearsAgo.getFullYear() - 50);
    return value >= fiftyYearsAgo;
}

/**
 * @function validateNonEmptyIngredients
 * @description Ensures that an array of string ingredients contains no empty strings.
 * @param {string[]} vals - Array of ingredients to check.
 * @returns {boolean} true if all strings are non-empty, false otherwise.
 */
export function validateNonEmptyIngredients(vals) {
    return vals.every((ingredient) => ingredient.trim().length > 0);
}
