// @ts-nocheck
import { GooglePlacesProvider } from './providers/GooglePlacesProvider';
import { OverpassProvider } from './providers/OverpassProvider';
import {
    createRestaurantDiscoveryError,
    RestaurantDiscoveryErrorCodes,
} from '@/lib/restaurantDiscoveryError';
import { validateNearbyRestaurantSearch } from '@/lib/restaurantDiscoveryValidation';
export {
    CuisineClassificationError,
    CuisineClassificationErrorCodes,
    normalizeCuisineCategories,
} from '@/utils/cuisineClassification';

const google = new GooglePlacesProvider(process.env.GOOGLE_PLACES_API_KEY);
const overpass = new OverpassProvider(
    process.env.OVERPASS_URL || 'https://overpass-api.de/api/interpreter',
);

export async function findNearbyRestaurants(lat, lon, radius = 1000, keyword = '') {
    const validated = validateNearbyRestaurantSearch(lat, lon, radius);

    if (google.isValidKey()) {
        try {
            const restaurants = await google.findNearby(
                validated.lat,
                validated.lon,
                validated.radius,
                keyword,
            );
            return {
                restaurants,
                source: 'google',
                status: restaurants.length > 0 ? 'success' : 'empty',
            };
        } catch (err) {
            console.warn(`Google Places failed (${err.message}). Falling back to Overpass.`);
        }
    }
    try {
        const restaurants = await overpass.findNearby(
            validated.lat,
            validated.lon,
            validated.radius,
            keyword,
        );
        return {
            restaurants,
            source: 'overpass',
            status: restaurants.length > 0 ? 'success' : 'empty',
        };
    } catch (err) {
        console.error(`Overpass failed (${err.message}).`);
        throw createRestaurantDiscoveryError(
            RestaurantDiscoveryErrorCodes.UNAVAILABLE,
            'Nearby restaurants are temporarily unavailable. Please try again.',
            err,
        );
    }
}
