// @ts-nocheck
import { RestaurantModel } from '../models/Restaurant/index';
import { OverpassProvider } from './providers/OverpassProvider';
import {
    createRestaurantDiscoveryError,
    RestaurantDiscoveryErrorCodes,
} from '@/lib/restaurantDiscoveryError';
import { validateNearbyRestaurantSearch } from '@/lib/restaurantDiscoveryValidation';
import { normalizeCuisineCategories } from '@/utils/cuisineClassification';

const overpass = new OverpassProvider(
    process.env.OVERPASS_URL || 'https://overpass-api.de/api/interpreter',
);

/**
 * Fetch nearby restaurants using Overpass and store them in MongoDB.
 *
 * @param {number} lat - Latitude of the location.
 * @param {number} lon - Longitude of the location.
 * @param {number} [radius=1000] - Search radius in meters.
 * @param {string} [keyword=''] - Optional search keyword.
 * @returns {Promise<Array>} Array of inserted Restaurant documents.
 */
export async function fetchAndStoreNearbyRestaurants(lat, lon, radius = 1000, keyword = '') {
    const validated = validateNearbyRestaurantSearch(lat, lon, radius);

    let results;
    try {
        results = await overpass.findNearby(
            validated.lat,
            validated.lon,
            validated.radius,
            keyword,
        );
    } catch (err) {
        if (err?.code === RestaurantDiscoveryErrorCodes.RATE_LIMITED) {
            throw err;
        }
        throw createRestaurantDiscoveryError(
            RestaurantDiscoveryErrorCodes.UNAVAILABLE,
            'Nearby restaurants are temporarily unavailable. Please try again.',
            err,
        );
    }

    const docs = results.map((r) => {
        const cuisineType = normalizeCuisineCategories(r.categories);

        return {
            restaurantName: r.name,
            address: r.vicinity,
            averageRating: typeof r.rating === 'number' ? r.rating : 0,
            ratingCount: typeof r.userRatingsTotal === 'number' ? r.userRatingsTotal : 0,
            ...(typeof r.open_now === 'boolean' ? { open_now: r.open_now } : {}),
            ...(cuisineType.length > 0 ? { cuisineType } : {}),
        };
    });

    if (docs.length === 0) return [];

    try {
        return await RestaurantModel.insertMany(docs, { ordered: true });
    } catch (err) {
        throw createRestaurantDiscoveryError(
            RestaurantDiscoveryErrorCodes.PERSISTENCE_FAILED,
            'Nearby restaurants could not be saved right now. Please try again.',
            err,
        );
    }
}
