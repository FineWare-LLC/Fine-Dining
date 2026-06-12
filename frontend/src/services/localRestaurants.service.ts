// @ts-nocheck
import { RestaurantModel } from '../models/Restaurant/index';
import { OverpassProvider } from './providers/OverpassProvider';
import {
    createRestaurantDiscoveryError,
    RestaurantDiscoveryErrorCodes,
} from '@/lib/restaurantDiscoveryError';
import { validateNearbyRestaurantSearch } from '@/lib/restaurantDiscoveryValidation';
import { normalizeCuisineCategories } from '@/utils/cuisineClassification';
import { dedupeRestaurantResults, hasValidRestaurantResults } from '@/utils/restaurantDeduplication';

const overpass = new OverpassProvider(
    process.env.OVERPASS_URL || 'https://overpass-api.de/api/interpreter',
);

function createNearbyRestaurantsUnavailableError(cause) {
    return createRestaurantDiscoveryError(
        RestaurantDiscoveryErrorCodes.UNAVAILABLE,
        'Nearby restaurants are temporarily unavailable. Please try again.',
        cause,
    );
}

function compareDescendingNumbers(a, b) {
    const normalizedA = Number.isFinite(a) ? a : Number.NEGATIVE_INFINITY;
    const normalizedB = Number.isFinite(b) ? b : Number.NEGATIVE_INFINITY;

    if (normalizedA !== normalizedB) {
        return normalizedB - normalizedA;
    }

    return 0;
}

function compareStringsAscending(a, b) {
    const normalizedA = String(a || '').toLowerCase();
    const normalizedB = String(b || '').toLowerCase();

    if (normalizedA !== normalizedB) {
        return normalizedA < normalizedB ? -1 : 1;
    }

    return 0;
}

function sortPrivacySafeRestaurantDocs(restaurants) {
    return [...restaurants].sort((a, b) => {
        const ratingComparison = compareDescendingNumbers(a.averageRating, b.averageRating);
        if (ratingComparison !== 0) {
            return ratingComparison;
        }

        const ratingCountComparison = compareDescendingNumbers(a.ratingCount, b.ratingCount);
        if (ratingCountComparison !== 0) {
            return ratingCountComparison;
        }

        const nameComparison = compareStringsAscending(a.restaurantName, b.restaurantName);
        if (nameComparison !== 0) {
            return nameComparison;
        }

        return compareStringsAscending(a.address, b.address);
    });
}

export function buildPrivacySafeRestaurantDocs(restaurants = []) {
    if (!Array.isArray(restaurants)) {
        return [];
    }

    const docs = restaurants.map((r) => {
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

    return sortPrivacySafeRestaurantDocs(docs);
}

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

    if (!hasValidRestaurantResults(results)) {
        throw createNearbyRestaurantsUnavailableError();
    }

    let docs;
    try {
        docs = buildPrivacySafeRestaurantDocs(dedupeRestaurantResults(results));
    } catch (err) {
        throw createNearbyRestaurantsUnavailableError(err);
    }

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
