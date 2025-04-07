import { withErrorHandling } from './baseQueries.js';
import { RestaurantModel } from '@/models/Restaurant/index.js';
import { paginateQuery } from '@/utils/pagination.js';

/**
 * Retrieves a single restaurant by ID.
 *
 * @function getRestaurant
 * @param {object} _parent
 * @param {object} args - Contains { id }
 * @param {object} context - GraphQL context.
 * @returns {Promise<Object|null>} The restaurant document or null.
 */
export const getRestaurant = withErrorHandling(async (_parent, { id }, context) => {
  return RestaurantModel.findById(id);
});

/**
 * Retrieves a paginated list of restaurants.
 *
 * @function getRestaurants
 * @param {object} _parent
 * @param {object} args - Contains { page, limit }
 * @param {object} context - GraphQL context.
 * @returns {Promise<Object[]>} An array of restaurant documents.
 */
export const getRestaurants = withErrorHandling(async (_parent, { page, limit }, context) => {
  return paginateQuery(RestaurantModel, page, limit);
});

/**
 * Searches restaurants by matching a keyword against the restaurantName field.
 *
 * @function searchRestaurants
 * @param {object} _parent
 * @param {object} args - Contains { keyword }
 * @param {object} context - GraphQL context.
 * @returns {Promise<Object[]>} An array of matching restaurants.
 */
export const searchRestaurants = withErrorHandling(async (_parent, { keyword }, context) => {
  return RestaurantModel.find({
    restaurantName: { $regex: keyword, $options: 'i' }
  });
});