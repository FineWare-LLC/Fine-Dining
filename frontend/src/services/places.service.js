import { GooglePlacesProvider } from './providers/GooglePlacesProvider.js';
import { OverpassProvider } from './providers/OverpassProvider.js';

const CACHE_TTL = Number.parseInt(process.env.PLACES_CACHE_TTL_MS || '0', 10) || 0;
const _cache = new Map();

export function clearPlacesCache() {
    _cache.clear();
}

const google = new GooglePlacesProvider(process.env.GOOGLE_PLACES_API_KEY);
const overpass = new OverpassProvider(
    process.env.OVERPASS_URL || 'https://overpass-api.de/api/interpreter',
);

export async function findNearbyRestaurants(lat, lon, radius = 1000, keyword = '') {
    const key = `${lat}:${lon}:${radius}:${keyword}`;
    const now = Date.now();
    const cached = _cache.get(key);
    if (cached && cached.expiry > now) {
        return cached.value;
    }

    if (google.isValidKey()) {
        try {
            const value = {
                restaurants: await google.findNearby(lat, lon, radius, keyword),
                source: 'google',
            };
            if (CACHE_TTL > 0) _cache.set(key, { value, expiry: now + CACHE_TTL });
            return value;
        } catch (err) {
            console.warn(`Google Places failed (${err.message}). Falling back to Overpass.`);
        }
    }
    try {
        const value = {
            restaurants: await overpass.findNearby(lat, lon, radius, keyword),
            source: 'overpass',
        };
        if (CACHE_TTL > 0) _cache.set(key, { value, expiry: now + CACHE_TTL });
        return value;
    } catch (err) {
        console.error(`Overpass failed (${err.message}).`);
        return { restaurants: [], source: null };
    }
}
