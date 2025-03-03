// /src/models/MealModel.js
import mongoose from 'mongoose';

/**
 * Example schema for an individual Meal
 */
const mealSchema = new mongoose.Schema(
    {
        mealPlan: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'MealPlan',
            required: true,
        },
        date: {
            type: Date,
            required: true,
        },
        mealType: {
            type: String,
            enum: ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'],
            required: true,
        },
        recipe: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Recipe',
        },
        restaurant: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Restaurant',
        },
        mealName: String,
        ingredients: [String],
        nutritionFacts: String,
    },
    { timestamps: true }
);

export default mongoose.models.Meal || mongoose.model('Meal', mealSchema);
