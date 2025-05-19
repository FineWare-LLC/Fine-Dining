import { GooglePlacesProvider } from './providers/GooglePlacesProvider.js';
import { OverpassProvider } from './providers/OverpassProvider.js';

const google = new GooglePlacesProvider(process.env.GOOGLE_PLACES_API_KEY);
const overpass = new OverpassProvider(
  process.env.OVERPASS_URL || 'https://overpass-api.de/api/interpreter'
);

export async function findNearbyRestaurants(lat, lon, radius = 1000, keyword = '') {
  if (google.isValidKey()) {
    try {
      return {
        restaurants: await google.findNearby(lat, lon, radius, keyword),
        source: 'google',
      };
    } catch (err) {
      console.warn(`Google Places failed (${err.message}). Falling back to Overpass.`);
    }
  }
  try {
    return {
      restaurants: await overpass.findNearby(lat, lon, radius, keyword),
      source: 'overpass',
    };
  } catch (err) {
    console.error(`Overpass failed (${err.message}).`);
    return { restaurants: [], source: null };
  }
}
