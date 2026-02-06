import { Place, NearbyQuery } from '../../types/places.ts';

/**
 * Foursquare Places: nearby restaurants.
 * @see https://foursquare.com/products/places-api/
 */
export class FoursquareProvider {
    constructor(apiKey) {
        this.apiKey = apiKey;
    }

    isValidKey() {
        return !!(
            this.apiKey &&
            this.apiKey !== 'YOUR_FOURSQUARE_API_KEY' &&
            !this.apiKey.includes('YOUR_') &&
            !this.apiKey.includes('PLACEHOLDER')
        );
    }

    async findNearby(lat, lon, radius = 1500, keyword = '') {
        const limit = Math.min(20, 50);

        const url = new URL("https://api.foursquare.com/v3/places/search");
        url.searchParams.set("ll", `${lat},${lon}`);
        url.searchParams.set("categories", "13065"); // restaurants category
        url.searchParams.set("radius", String(radius));
        url.searchParams.set("limit", String(limit));
        url.searchParams.set("sort", "RATING");

        if (keyword) {
            url.searchParams.set("query", keyword);
        }

        const res = await fetch(url.toString(), {
            headers: { 
                Authorization: this.apiKey,
                Accept: "application/json"
            },
            signal: AbortSignal.timeout(8000)
        });

        if (!res.ok) {
            throw new Error(`Foursquare error ${res.status}: ${res.statusText}`);
        }

        const data = await res.json();

        if (!data.results || !Array.isArray(data.results)) {
            return [];
        }

        return data.results.map((p) => ({
            id: p.fsq_id,
            name: p.name,
            lat: p.geocodes.main.latitude,
            lon: p.geocodes.main.longitude,
            distance_m: Number(p.distance ?? 0),
            rating: p.rating,
            price: p.price ? "$".repeat(p.price) : undefined,
            open_now: p.hours?.open_now,
            provider: "foursquare",
            url: p.website,
            address: p.location?.formatted_address,
            categories: (p.categories ?? []).map((c) => c.name),
            // Legacy fields for compatibility with existing code
            placeId: p.fsq_id,
            vicinity: p.location?.formatted_address || "Address unavailable",
            userRatingsTotal: undefined,
            location: {
                latitude: p.geocodes.main.latitude,
                longitude: p.geocodes.main.longitude,
            },
        }));
    }
}