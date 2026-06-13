// @ts-nocheck
// Use global fetch (works with both browser and Node.js with global.fetch set)

import { normalizeCuisineCategories } from '@/utils/cuisineClassification';
import { createRestaurantDiscoveryRateLimitedError } from '@/lib/restaurantDiscoveryError';

export class OverpassPayloadError extends Error {
    constructor(message = 'Invalid Overpass response payload') {
        super(message);
        this.name = 'OverpassPayloadError';
    }
}

export class OverpassProvider {
    constructor(baseUrl) {
        this.baseUrl = baseUrl || 'https://overpass-api.de/api/interpreter';
    }

    async findNearby(lat, lon, radius = 1000, keyword = '') {
        const keywordFilter = keyword ? `["name"~"${keyword}",i]` : '';
        const query = `[out:json][timeout:25];
(
  node["amenity"~"restaurant|fast_food|food_court"](around:${radius},${lat},${lon})${keywordFilter};
  way["amenity"~"restaurant|fast_food|food_court"](around:${radius},${lat},${lon})${keywordFilter};
  relation["amenity"~"restaurant|fast_food|food_court"](around:${radius},${lat},${lon})${keywordFilter};
);
out center;`;

        const body = `data=${encodeURIComponent(query)}`;
        const res = await global.fetch(this.baseUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body,
        });

        if (res.status === 429) {
            throw createRestaurantDiscoveryRateLimitedError(
                new Error('Overpass API error: 429'),
            );
        }

        if (!res.ok) {
            throw new Error(`Overpass error: ${res.status}`);
        }

        const data = await res.json();
        if (!data || !Array.isArray(data.elements)) {
            throw new OverpassPayloadError();
        }

        return data.elements
            .filter((el) => el.type === 'node' || el.center)
            .map((el) => {
                const categories = normalizeCuisineCategories(el.tags?.cuisine);

                return {
                    placeId: `${el.type}-${el.id}`,
                    name: el.tags?.name || 'Unnamed restaurant',
                    vicinity:
                        el.tags?.['addr:full'] ||
                        el.tags?.['addr:street'] ||
                        el.tags?.city ||
                        'Unknown',
                    website: el.tags?.website || null,
                    rating: null,
                    userRatingsTotal: null,
                    location: {
                        latitude: el.lat ?? el.center?.lat ?? null,
                        longitude: el.lon ?? el.center?.lon ?? null,
                    },
                    ...(categories.length > 0 ? { categories } : {}),
                };
            })
            .sort((a, b) => {
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
}
