import { withErrorHandling } from './baseImports.js';
import { RestaurantModel } from '@/models/Restaurant/index.js';
import mongoose from 'mongoose';

/**
 * Creates a new restaurant.
 *
 * @function createRestaurant
 * @param {Object} _parent - Parent resolver result.
 * @param {Object} args - Restaurant input fields.
 * @param {string} args.restaurantName - The name of the restaurant.
 * @param {string} args.address - The address of the restaurant.
 * @param {string} args.phone - The phone number.
 * @param {string} args.website - The website URL.
 * @param {string} args.cuisineType - The type of cuisine.
 * @param {string|number} args.priceRange - The price range.
 * @param {Object} context - GraphQL context.
 * @returns {Promise<Object>} The created restaurant.
 */
export const createRestaurant = withErrorHandling(async (_parent, args, context) => {
  if (!context.user?.userId) {
    throw new Error('Authentication required');
  }

  // Validate required fields
  const { restaurantName, address, phone, website, cuisineType, priceRange } = args;
  if (!restaurantName || typeof restaurantName !== 'string' || !restaurantName.trim()) {
    throw new Error('Restaurant name is required');
  }
  if (!address || typeof address !== 'string' || !address.trim()) {
    throw new Error('Address is required');
  }
  if (!phone || typeof phone !== 'string' || !phone.trim()) {
    throw new Error('Phone number is required');
  }
  if (!website || typeof website !== 'string' || !website.trim()) {
    throw new Error('Website is required');
  }
  if (!cuisineType || typeof cuisineType !== 'string' || !cuisineType.trim()) {
    throw new Error('Cuisine type is required');
  }
  if (!priceRange) {
    throw new Error('Price range is required');
  }

  // Sanitize inputs
  const sanitizedData = {
    restaurantName: restaurantName.trim(),
    address: address.trim(),
    phone: phone.trim(),
    website: website.trim(),
    cuisineType: cuisineType.trim(),
    priceRange,
  };

  return RestaurantModel.create(sanitizedData);
});

/**
 * Updates a restaurant.
 *
 * @function updateRestaurant
 * @param {Object} _parent - Parent resolver result.
 * @param {Object} param0 - Object containing restaurant id and update fields.
 * @param {string} param0.id - The restaurant's ID.
 * @param {string} [param0.restaurantName] - The updated restaurant name.
 * @param {string} [param0.address] - The updated address.
 * @param {string} [param0.phone] - The updated phone number.
 * @param {string} [param0.website] - The updated website URL.
 * @param {string} [param0.cuisineType] - The updated cuisine type.
 * @param {string|number} [param0.priceRange] - The updated price range.
 * @param {Object} context - GraphQL context.
 * @returns {Promise<Object>} The updated restaurant.
 */
export const updateRestaurant = withErrorHandling(async (_parent, { id, restaurantName, address, phone, website, cuisineType, priceRange }, context) => {
  if (!context.user?.userId) {
    throw new Error('Authentication required');
  }
  if (context.user.role !== 'ADMIN') {
    throw new Error('Authorization required: Only admins can update restaurants.');
  }
  // Validate the restaurant ID
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error('Invalid restaurant ID');
  }

  const updateData = {};
  if (restaurantName !== undefined) {
    if (typeof restaurantName !== 'string' || !restaurantName.trim()) {
      throw new Error('Invalid restaurant name');
    }
    updateData.restaurantName = restaurantName.trim();
  }
  if (address !== undefined) {
    if (typeof address !== 'string' || !address.trim()) {
      throw new Error('Invalid address');
    }
    updateData.address = address.trim();
  }
  if (phone !== undefined) {
    if (typeof phone !== 'string' || !phone.trim()) {
      throw new Error('Invalid phone number');
    }
    updateData.phone = phone.trim();
  }
  if (website !== undefined) {
    if (typeof website !== 'string' || !website.trim()) {
      throw new Error('Invalid website URL');
    }
    updateData.website = website.trim();
  }
  if (cuisineType !== undefined) {
    if (typeof cuisineType !== 'string' || !cuisineType.trim()) {
      throw new Error('Invalid cuisine type');
    }
    updateData.cuisineType = cuisineType.trim();
  }
  if (priceRange !== undefined) {
    updateData.priceRange = priceRange;
  }

  const updatedRestaurant = await RestaurantModel.findByIdAndUpdate(id, updateData, { new: true });
  if (!updatedRestaurant) {
    throw new Error('Restaurant not found');
  }
  return updatedRestaurant;
});

/**
 * Deletes a restaurant.
 *
 * @function deleteRestaurant
 * @param {Object} _parent - Parent resolver result.
 * @param {Object} param0 - Object containing restaurant id.
 * @param {string} param0.id - The restaurant's ID.
 * @param {Object} context - GraphQL context.
 * @returns {Promise<Boolean>} True if deletion was successful.
 */
export const deleteRestaurant = withErrorHandling(async (_parent, { id }, context) => {
  if (!context.user?.userId) {
    throw new Error('Authentication required');
  }
  if (context.user.role !== 'ADMIN') {
    throw new Error('Authorization required: Only admins can delete restaurants.');
  }
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error('Invalid restaurant ID');
  }
  const result = await RestaurantModel.findByIdAndDelete(id);
  return Boolean(result);
});
