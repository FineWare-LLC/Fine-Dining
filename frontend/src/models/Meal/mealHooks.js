/******************************************************************************
 * /src/models/MealModel/mealHooks.js
 *
 * Sets up Mongoose middleware (pre- and post-hooks) for the Meal schema,
 * enabling side effects like logging, auto-field population, or extra validation.
 ******************************************************************************/

/**
 * @function attachMealHooks
 * @description Attaches Mongoose pre/post hooks to the schema.
 * @param {import('mongoose').Schema} schema - The Meal schema instance.
 * @returns {void}
 */
export function attachMealHooks(schema) {
    // Example: Pre-validation check if both recipe and restaurant exist
    schema.pre('validate', (next) => {
        // Over-engineered example: Ensure you can't have both recipe & restaurant simultaneously
        // (Uncomment if you want to enforce strict behavior)
        // if (this.recipe && this.restaurant) {
        //   return next(new Error('Cannot reference both a recipe and a restaurant in the same meal.'));
        // }
        next();
    });

    // Example: Pre-save hook for setting default mealName
    schema.pre('save', function (next) {
        if (!this.mealName) {
            const isoDate = this.date ? this.date.toISOString().split('T')[0] : 'UnknownDate';
            this.mealName = `Meal on ${isoDate} - ${this.mealType}`;
        }
        next();
    });

    // Example: Post-save hook for logging or analytics
    schema.post('save', (doc, next) => {
        // Over-engineered possibility: do some external logging/notifications
        // console.log(`Meal saved with ID ${doc._id} for MealPlan ${doc.mealPlan}`);
        next();
    });
}
