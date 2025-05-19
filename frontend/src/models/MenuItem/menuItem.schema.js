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
  },
  { timestamps: true }
);

export default menuItemSchema;
