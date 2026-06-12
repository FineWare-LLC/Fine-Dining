// @ts-nocheck
import { Place, NearbyQuery } from '../../types/places.ts';
import { normalizeCuisineCategories } from '@/utils/cuisineClassification';

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

        const res = await fetch(url.toString(), {
            headers: { 
                Authorization: `Bearer ${this.apiKey}`,
                Accept: 'application/json'
            },
            signal: AbortSignal.timeout(8000)
        });

        if (!res.ok) {
            throw new Error(`Yelp error ${res.status}: ${res.statusText}`);
        }

        const data = await res.json();

        if (!data.businesses || !Array.isArray(data.businesses)) {
            return [];
        }

        return data.businesses.map((b) => {
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
