// @ts-nocheck
// Use global fetch dynamically in methods

import {
    createRestaurantDiscoveryError,
    RestaurantDiscoveryErrorCodes,
} from '@/lib/restaurantDiscoveryError';
import { normalizeCuisineCategories } from '@/utils/cuisineClassification';

function createGooglePlacesUnavailableError(cause) {
    return createRestaurantDiscoveryError(
        RestaurantDiscoveryErrorCodes.UNAVAILABLE,
        'Nearby restaurants are temporarily unavailable. Please try again.',
        cause,
    );
}

export class GooglePlacesProvider {
    constructor(apiKey) {
        this.apiKey = apiKey;
    }

    isValidKey() {
        return !!(
            this.apiKey &&
      this.apiKey !== 'YOUR_GOOGLE_PLACES_API_KEY' &&
      !this.apiKey.includes('YOUR_') &&
      !this.apiKey.includes('PLACEHOLDER')
        );
    }

    async findNearby(lat, lon, radius = 1000, keyword = '') {
        const params = new URLSearchParams({
            location: `${lat},${lon}`,
            radius: String(radius),
            type: 'restaurant',
            key: this.apiKey,
        });
        if (keyword) params.set('keyword', keyword);

        const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?${params.toString()}`;
        const res = await global.fetch(url);
        if (!res.ok) {
            throw createGooglePlacesUnavailableError(
                new Error(`Google Places API error: ${res.status}`),
            );
        }
        const data = await res.json();
        if (!data || !Array.isArray(data.results)) {
            throw createGooglePlacesUnavailableError(
                new Error('Google Places API returned an invalid payload.'),
            );
        }

        return data.results.map((place) => {
            const categories = normalizeCuisineCategories(place.types);
            const openNow = place.opening_hours?.open_now;

            return {
                placeId: place.place_id,
                name: place.name,
                vicinity: place.vicinity || place.formatted_address || 'No address available',
                rating: place.rating,
                userRatingsTotal: place.user_ratings_total,
                location: {
                    latitude: place.geometry?.location?.lat ?? null,
                    longitude: place.geometry?.location?.lng ?? null,
                },
                ...(typeof openNow === 'boolean' ? { open_now: openNow } : {}),
                ...(categories.length > 0 ? { categories } : {}),
            };
        });
    }
}
