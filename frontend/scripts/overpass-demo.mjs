/**
 * @file overpass-demo.mjs
 * @description Query the Overpass API for nearby restaurants.
 *              Usage: node scripts/overpass-demo.mjs <lat> <lon> [radius] [keyword]
 */
import dotenv from 'dotenv';
import { OverpassProvider } from '../src/services/providers/OverpassProvider.js';

dotenv.config({ path: '.env.local' });

const [,, latArg, lonArg, radiusArg = '1000', keyword = ''] = process.argv;

if (!latArg || !lonArg) {
  console.error('Usage: node scripts/overpass-demo.mjs <lat> <lon> [radius] [keyword]');
  process.exit(1);
}

const lat = parseFloat(latArg);
const lon = parseFloat(lonArg);
const radius = parseInt(radiusArg, 10);

const provider = new OverpassProvider(
  process.env.OVERPASS_URL || 'https://overpass-api.de/api/interpreter'
);

provider.findNearby(lat, lon, radius, keyword)
  .then((restaurants) => {
    console.log(JSON.stringify(restaurants, null, 2));
  })
  .catch((err) => {
    console.error('Error querying Overpass:', err.message);
    process.exit(1);
  });

