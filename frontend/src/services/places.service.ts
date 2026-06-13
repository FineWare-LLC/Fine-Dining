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

function restaurantIsOpenNow(restaurant) {
    return restaurant?.open_now === true;
}

function sortRestaurantsCanonically(restaurants) {
    return [...restaurants].sort((a, b) => {
        const aName = String(a.name || '').toLowerCase();
        const bName = String(b.name || '').toLowerCase();
        if (aName !== bName) {
            return aName < bName ? -1 : 1;
        }

        const aVicinity = String(a.vicinity || '').toLowerCase();
        const bVicinity = String(b.vicinity || '').toLowerCase();
        if (aVicinity !== bVicinity) {
            return aVicinity < bVicinity ? -1 : 1;
        }

        const aPlaceId = String(a.placeId || '').toLowerCase();
        const bPlaceId = String(b.placeId || '').toLowerCase();
        if (aPlaceId !== bPlaceId) {
            return aPlaceId < bPlaceId ? -1 : 1;
        }

        return 0;
    });
}

function createNearbyRestaurantsUnavailableError(cause) {
    return createRestaurantDiscoveryError(
        RestaurantDiscoveryErrorCodes.UNAVAILABLE,
        'Nearby restaurants are temporarily unavailable. Please try again.',
        cause,
    );
}

function isRestaurantDiscoveryRateLimitedError(error) {
    return error?.code === RestaurantDiscoveryErrorCodes.RATE_LIMITED;
}

export async function findNearbyRestaurants(lat, lon, radius = 1000, keyword = '', options = {}) {
    const validated = validateNearbyRestaurantSearch(lat, lon, radius);
    const requireHours = options?.requireHours === true;

    if (google.isValidKey()) {
        try {
            const restaurants = await google.findNearby(
                validated.lat,
                validated.lon,
                validated.radius,
                keyword,
            );
            const normalizedRestaurants = requireHours
                ? sortRestaurantsCanonically(restaurants.filter(restaurantIsOpenNow))
                : restaurants;

            if (normalizedRestaurants.length > 0) {
                return {
                    restaurants: normalizedRestaurants,
                    source: 'google',
                    status: 'success',
                };
            }

            if (requireHours) {
                throw createNearbyRestaurantsUnavailableError(
                    new Error('Google Places returned restaurants without known hours.'),
                );
            }

            return {
                restaurants: normalizedRestaurants,
                source: 'google',
                status: 'empty',
            };
        } catch (err) {
            if (isRestaurantDiscoveryRateLimitedError(err)) {
                throw err;
            }
            if (requireHours) {
                throw createNearbyRestaurantsUnavailableError(err);
            }
            console.warn(`Google Places failed (${err.message}). Falling back to Overpass.`);
        }
    }

    if (requireHours) {
        throw createNearbyRestaurantsUnavailableError(
            new Error('Nearby restaurants are temporarily unavailable. Please try again.'),
        );
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
        if (isRestaurantDiscoveryRateLimitedError(err)) {
            throw err;
        }
        console.error(`Overpass failed (${err.message}).`);
        throw createNearbyRestaurantsUnavailableError(err);
    }
}
