import { withErrorHandling } from './baseImports.js';
import { MenuItemModel } from '@/models/MenuItem/index.js';
import { RestaurantModel } from '@/models/Restaurant/index.js';
import mongoose from 'mongoose';
import { sanitizeString } from '@/lib/sanitize.js';

export const createMenuItem = withErrorHandling(async (
  _parent,
  { restaurantId, mealName, price, description, allergens, nutritionFacts },
  context
) => {
  if (!context.user?.userId) {
    throw new Error('Authentication required');
  }
  if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
    throw new Error('Invalid restaurant ID');
  }
  const restaurant = await RestaurantModel.findById(restaurantId);
  if (!restaurant) {
    throw new Error('Restaurant not found');
  }
  const data = {
    restaurant: restaurantId,
    mealName: sanitizeString(mealName),
    price,
    description: description ? sanitizeString(description) : '',
    allergens: allergens || [],
    nutritionFacts: nutritionFacts || ''
  };
  return MenuItemModel.create(data);
});

export const updateMenuItem = withErrorHandling(async (
  _parent,
  { id, mealName, price, description, allergens, nutritionFacts },
  context
) => {
  if (!context.user?.userId) {
    throw new Error('Authentication required');
  }
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error('Invalid menu item ID');
  }
  const updateData = {};
  if (mealName !== undefined) updateData.mealName = sanitizeString(mealName);
  if (price !== undefined) updateData.price = price;
  if (description !== undefined) updateData.description = sanitizeString(description);
  if (allergens !== undefined) updateData.allergens = allergens;
  if (nutritionFacts !== undefined) updateData.nutritionFacts = nutritionFacts;
  return MenuItemModel.findByIdAndUpdate(id, updateData, { new: true });
});

export const deleteMenuItem = withErrorHandling(async (_parent, { id }, context) => {
  if (!context.user?.userId) {
    throw new Error('Authentication required');
  }
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error('Invalid menu item ID');
  }
  const result = await MenuItemModel.findByIdAndDelete(id);
  return Boolean(result);
});
