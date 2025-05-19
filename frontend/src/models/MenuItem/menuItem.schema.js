import mongoose from 'mongoose';

const { Schema } = mongoose;

const menuItemSchema = new Schema(
  {
    restaurant: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    mealName: { type: String, required: true, trim: true },
    price: { type: Number, default: 0 },
    description: { type: String, default: '' },
    allergens: { type: [String], default: [] },
    nutritionFacts: { type: String, default: '' }
    // Nutrition details
    calories: { type: Number, default: 0 },
    protein: { type: Number, default: 0 },
    carbohydrates: { type: Number, default: 0 },
    fat: { type: Number, default: 0 },
    sodium: { type: Number, default: 0 },
  },
  { timestamps: true, collection: 'menuItems' }
);

export default menuItemSchema;
