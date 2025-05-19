import { OverpassProvider } from './providers/OverpassProvider.js';
import { RestaurantModel } from '../models/Restaurant/index.js';

const overpass = new OverpassProvider(
  process.env.OVERPASS_URL || 'https://overpass-api.de/api/interpreter'
);

/**
 * Fetch nearby restaurants using Overpass and store them in MongoDB.
 *
 * @param {number} lat - Latitude of the location.
 * @param {number} lon - Longitude of the location.
 * @param {number} [radius=1000] - Search radius in meters.
 * @param {string} [keyword=''] - Optional search keyword.
 * @returns {Promise<Array>} Array of inserted Restaurant documents.
 */
export async function fetchAndStoreNearbyRestaurants(lat, lon, radius = 1000, keyword = '') {
  const results = await overpass.findNearby(lat, lon, radius, keyword);

  const docs = results.map((r) => ({
    restaurantName: r.name,
    address: r.vicinity,
    averageRating: typeof r.rating === 'number' ? r.rating : 0,
    ratingCount: typeof r.userRatingsTotal === 'number' ? r.userRatingsTotal : 0,
  }));

  if (docs.length === 0) return [];

  return RestaurantModel.insertMany(docs, { ordered: false });
}
