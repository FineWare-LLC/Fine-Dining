// @ts-nocheck
import { Place, NearbyQuery } from '../../types/places.ts';
import {
    createRestaurantDiscoveryError,
    RestaurantDiscoveryErrorCodes,
} from '@/lib/restaurantDiscoveryError';
import { normalizeCuisineCategories } from '@/utils/cuisineClassification';

function createYelpUnavailableError(cause) {
    return createRestaurantDiscoveryError(
        RestaurantDiscoveryErrorCodes.UNAVAILABLE,
        'Nearby restaurants are temporarily unavailable. Please try again.',
        cause,
    );
}

/**
 * Yelp client: nearby restaurants.
 * @see https://docs.developer.yelp.com/
 */
export class YelpProvider {
    constructor(apiKey) {
        this.apiKey = apiKey;
    }

    isValidKey() {
        return !!(
            this.apiKey &&
            this.apiKey !== 'YOUR_YELP_API_KEY' &&
            !this.apiKey.includes('YOUR_') &&
            !this.apiKey.includes('PLACEHOLDER')
        );
    }

    async findNearby(lat, lon, radius = 1500, keyword = '') {
        const clampedRadius = Math.min(radius, 40000); // Yelp max radius
        const limit = Math.min(20, 50);

        const url = new URL("https://api.yelp.com/v3/businesses/search");
        url.searchParams.set("latitude", String(lat));
        url.searchParams.set("longitude", String(lon));
        url.searchParams.set("radius", String(clampedRadius));
        url.searchParams.set("categories", "restaurants");
        url.searchParams.set("limit", String(limit));
        url.searchParams.set("sort_by", "rating");

        if (keyword) {
            url.searchParams.set("term", keyword);
        }

        let res;
        try {
            res = await fetch(url.toString(), {
                headers: {
                    Authorization: `Bearer ${this.apiKey}`,
                    Accept: 'application/json',
                },
                signal: AbortSignal.timeout(8000),
            });
        } catch (err) {
            throw createYelpUnavailableError(err);
        }

        if (!res.ok) {
            throw createYelpUnavailableError(new Error(`Yelp error ${res.status}: ${res.statusText}`));
        }

        let data;
        try {
            data = await res.json();
        } catch (err) {
            throw createYelpUnavailableError(err);
        }

        if (!data || !Array.isArray(data.businesses)) {
            throw createYelpUnavailableError(new Error('Yelp API returned an invalid payload.'));
        }

        return data.businesses.map((b) => {
            if (
                !b ||
                typeof b.id !== 'string' ||
                typeof b.name !== 'string' ||
                !b.location ||
                typeof b.review_count !== 'number' ||
                !Number.isFinite(b.review_count) ||
                !b.coordinates ||
                typeof b.coordinates.latitude !== 'number' ||
                !Number.isFinite(b.coordinates.latitude) ||
                typeof b.coordinates.longitude !== 'number' ||
                !Number.isFinite(b.coordinates.longitude)
            ) {
                throw createYelpUnavailableError(
                    new Error('Yelp API returned an invalid payload.'),
                );
            }

            const rawCategories = Array.isArray(b.categories)
                ? b.categories
                    .map((category) => {
                        if (typeof category === 'string') {
                            return category;
                        }

                        return typeof category?.title === 'string' ? category.title : '';
                    })
                    .filter(Boolean)
                : [];

            const categories = normalizeCuisineCategories(rawCategories);

            return {
                ...(categories.length > 0 ? { categories } : {}),
                id: b.id,
                name: b.name,
                lat: b.coordinates.latitude,
                lon: b.coordinates.longitude,
                distance_m: Math.round(b.distance ?? 0),
                rating: b.rating,
                price: b.price,
                ...(typeof b.is_closed === 'boolean' ? { open_now: !b.is_closed } : {}),
                provider: "yelp",
                url: b.url,
                address: [b.location.address1, b.location.city].filter(Boolean).join(", "),
                // Legacy fields for compatibility with existing code
                placeId: b.id,
                vicinity: [b.location.address1, b.location.city].filter(Boolean).join(", ") || "Address unavailable",
                userRatingsTotal: b.review_count,
                location: {
                    latitude: b.coordinates.latitude,
                    longitude: b.coordinates.longitude,
                },
            };
        });
    }
}
