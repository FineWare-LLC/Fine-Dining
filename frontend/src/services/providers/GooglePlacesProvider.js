import fetch from 'node-fetch';

export class GooglePlacesProvider {
    constructor(apiKey) {
        this.apiKey = apiKey;
    }

    isValidKey() {
        return (
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
        const res = await fetch(url);
        if (!res.ok) {
            throw new Error(`Google Places API error: ${res.status}`);
        }
        const data = await res.json();
        if (!Array.isArray(data.results)) return [];

        return data.results.map((place) => ({
            placeId: place.place_id,
            name: place.name,
            vicinity: place.vicinity || place.formatted_address || 'No address available',
            rating: place.rating,
            userRatingsTotal: place.user_ratings_total,
            location: {
                latitude: place.geometry?.location?.lat ?? null,
                longitude: place.geometry?.location?.lng ?? null,
            },
        }));
    }
}
