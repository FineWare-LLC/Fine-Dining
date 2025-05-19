/**
 * @file fetch-local-restaurants.mjs
 * @description Fetch nearby restaurants using Overpass and save them to MongoDB.
 *              Usage: node scripts/fetch-local-restaurants.mjs <lat> <lon> [radius] [keyword]
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { dbConnect } from '../src/lib/dbConnect.js';
import { fetchAndStoreNearbyRestaurants } from '../src/services/localRestaurants.service.js';

dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local' });

async function main() {
  const [, , latArg, lonArg, radiusArg = '1000', keyword = ''] = process.argv;

  if (!latArg || !lonArg) {
    console.error('Usage: node scripts/fetch-local-restaurants.mjs <lat> <lon> [radius] [keyword]');
    process.exit(1);
  }

  const lat = parseFloat(latArg);
  const lon = parseFloat(lonArg);
  const radius = parseInt(radiusArg, 10);

  await dbConnect();

  try {
    const inserted = await fetchAndStoreNearbyRestaurants(lat, lon, radius, keyword);
    console.log(`Saved ${inserted.length} restaurants.`);
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
