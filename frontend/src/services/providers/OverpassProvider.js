// Use global fetch (works with both browser and Node.js with global.fetch set)

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

        if (!res.ok) {
            throw new Error(`Overpass error: ${res.status}`);
        }

        const data = await res.json();
        if (!Array.isArray(data.elements)) return [];

        return data.elements
            .filter((el) => el.type === 'node' || el.center)
            .map((el) => ({
                placeId: `${el.type}-${el.id}`,
                name: el.tags?.name || 'Unnamed restaurant',
                vicinity: el.tags?.['addr:full'] || el.tags?.['addr:street'] || el.tags?.city || 'Unknown',
                website: el.tags?.website || null,
                rating: null,
                userRatingsTotal: null,
                location: {
                    latitude: el.lat ?? el.center?.lat ?? null,
                    longitude: el.lon ?? el.center?.lon ?? null,
                },
            }));
    }
}
