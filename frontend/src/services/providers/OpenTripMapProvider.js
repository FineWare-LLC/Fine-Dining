import { Place, NearbyQuery } from '../../types/places.ts';

/**
 * OpenTripMap: nearby restaurants by bbox-radius approximation.
 * @see https://dev.opentripmap.org/
 */
export class OpenTripMapProvider {
    constructor(apiKey) {
        this.apiKey = apiKey;
    }

    isValidKey() {
        return !!(
            this.apiKey &&
            this.apiKey !== 'YOUR_OPENTRIPMAP_API_KEY' &&
            !this.apiKey.includes('YOUR_') &&
            !this.apiKey.includes('PLACEHOLDER')
        );
    }

    async findNearby(lat, lon, radius = 1500, keyword = '') {
        const limit = 20;

        const url = new URL("https://api.opentripmap.com/0.1/en/places/radius");
        url.searchParams.set("radius", String(radius));
        url.searchParams.set("lon", String(lon));
        url.searchParams.set("lat", String(lat));
        url.searchParams.set("kinds", "restaurants");
        url.searchParams.set("limit", String(limit));
        url.searchParams.set("apikey", this.apiKey);

        if (keyword) {
            // OpenTripMap doesn't have direct keyword search, but we can filter results
            // This is a limitation of the free API
        }

        const res = await fetch(url.toString(), { 
            signal: AbortSignal.timeout(8000)
        });

        if (!res.ok) {
            throw new Error(`OpenTripMap error ${res.status}: ${res.statusText}`);
        }

        const data = await res.json();

        if (!data.features || !Array.isArray(data.features)) {
            return [];
        }

        let results = data.features.map((f) => ({
            id: f.id ?? crypto.randomUUID(),
            name: f.properties.name ?? "Unknown Restaurant",
            lat: f.geometry.coordinates[1],
            lon: f.geometry.coordinates[0],
            distance_m: Math.round(f.properties.dist ?? 0),
            rating: undefined, // OpenTripMap doesn't provide ratings
            price: undefined,
            open_now: undefined,
            provider: "opentripmap",
            url: f.properties.otm || f.properties.wikidata || f.properties.wikipedia,
            address: f.properties.address,
            categories: f.properties.kinds?.split(","),
            // Legacy fields for compatibility with existing code
            placeId: f.id ?? crypto.randomUUID(),
            vicinity: f.properties.address || "Address unavailable",
            userRatingsTotal: undefined,
            location: {
                latitude: f.geometry.coordinates[1],
                longitude: f.geometry.coordinates[0],
            },
        }));

        // Filter by keyword if provided (client-side filtering since API doesn't support it)
        if (keyword) {
            const keywordLower = keyword.toLowerCase();
            results = results.filter(r => 
                r.name.toLowerCase().includes(keywordLower) ||
                (r.address && r.address.toLowerCase().includes(keywordLower))
            );
        }

        return results;
    }
}