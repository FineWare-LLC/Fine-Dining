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
    return paginateQuery(RestaurantModel.find(), page, limit);
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
        restaurantName: { $regex: keyword, $options: 'i' },
    });
});
/**
 * Finds nearby restaurants using the Google Places API.
 *
 * @function findNearbyRestaurants
 * @param {object} _parent
 * @param {object} args - { latitude, longitude, radius, keyword }
 * @param {object} context - GraphQL context
 * @returns {Promise<{restaurants: Object[], source: string | null}>}
 *   Object containing restaurant list and the provider source
 */
export const findNearbyRestaurants = withErrorHandling(async (
    _parent,
    { latitude, longitude, radius, keyword },
    context,
) => {
    const service = await import('@/services/places.service.js');
    return service.findNearbyRestaurants(latitude, longitude, radius, keyword);
});

/**
 * Finds nearby LOCAL restaurants with filtering to exclude chains and prioritize 
 * truly local establishments.
 *
 * @function findNearbyLocalRestaurants
 * @param {object} _parent
 * @param {object} args - { latitude, longitude, radius, keyword, excludeChains, minLocalScore, maxResults }
 * @param {object} context - GraphQL context
 * @returns {Promise<{restaurants: Object[], source: string | null, filteredCount: number, localCount: number}>}
 *   Object containing filtered local restaurant list and filtering metadata
 */
export const findNearbyLocalRestaurants = withErrorHandling(async (
    _parent,
    { latitude, longitude, radius, keyword, excludeChains, minLocalScore, maxResults },
    context,
) => {
    const service = await import('@/services/localRestaurantFilter.service.js');
    
    const filterOptions = {
        excludeChains: excludeChains !== false, // Default to true
        minLocalScore: minLocalScore || 30,
        maxResults: maxResults || 20
    };
    
    return service.findNearbyLocalRestaurants(latitude, longitude, radius, keyword, filterOptions);
});
