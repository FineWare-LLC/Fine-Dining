import { Place, NearbyQuery } from '../../types/places.ts';

/**
 * Geoapify client: nearby restaurants.
 * @see https://www.geoapify.com/places-api/
 */
export class GeoapifyProvider {
    constructor(apiKey) {
        this.apiKey = apiKey;
    }

    isValidKey() {
        return !!(
            this.apiKey &&
            this.apiKey !== 'YOUR_GEOAPIFY_API_KEY' &&
            !this.apiKey.includes('YOUR_') &&
            !this.apiKey.includes('PLACEHOLDER')
        );
    }

    async findNearby(lat, lon, radius = 1500, keyword = '') {
        const limit = 20;

        const url = new URL("https://api.geoapify.com/v2/places");
        url.searchParams.set("categories", "catering.restaurant");
        url.searchParams.set("filter", `circle:${lon},${lat},${radius}`);
        url.searchParams.set("bias", `proximity:${lon},${lat}`);
        url.searchParams.set("limit", String(limit));
        url.searchParams.set("apiKey", this.apiKey);

        if (keyword) {
            url.searchParams.set("text", keyword);
        }

        const res = await fetch(url.toString(), { 
            signal: AbortSignal.timeout(8000)
        });
        
        if (!res.ok) {
            throw new Error(`Geoapify error ${res.status}: ${res.statusText}`);
        }
        
        const data = await res.json();

        if (!data.features || !Array.isArray(data.features)) {
            return [];
        }

        return data.features.map((f) => ({
            id: f.properties.place_id ?? f.properties.osm_id ?? crypto.randomUUID(),
            name: f.properties.name ?? "Unknown",
            lat: f.geometry.coordinates[1],
            lon: f.geometry.coordinates[0],
            distance_m: Number(f.properties.distance ?? 0),
            rating: f.properties.rating,
            price: f.properties.price_rate ? String(f.properties.price_rate) : undefined,
            open_now: f.properties.open_now,
            provider: "geoapify",
            url: f.properties.website || f.properties.datasource?.raw?.url,
            address: f.properties.formatted,
            categories: f.properties.categories,
            // Legacy fields for compatibility with existing code
            placeId: f.properties.place_id ?? f.properties.osm_id ?? crypto.randomUUID(),
            vicinity: f.properties.formatted || "Address unavailable",
            userRatingsTotal: undefined,
            location: {
                latitude: f.geometry.coordinates[1],
                longitude: f.geometry.coordinates[0],
            },
        }));
    }
}