/**
 * @file fetch-menus.mjs
 * Fetch websites for restaurants using Overpass and scrape menu items.
 */
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import fetch from 'node-fetch';
import { dbConnect } from '../src/lib/dbConnect.js';
import { scrapeMenu } from '../src/lib/menuScraper.mjs';
import { MenuItemModel } from '../src/models/MenuItem/index.js';
import { RestaurantModel } from '../src/models/Restaurant/index.js';

dotenv.config({ path: '.env.local' });

const OVERPASS_URL = process.env.OVERPASS_URL || 'https://overpass-api.de/api/interpreter';

async function fetchWebsite(name) {
    const query = `[out:json][timeout:25];node["name"~"${name}"]["website"];out 1;`;
    const body = `data=${encodeURIComponent(query)}`;
    const res = await fetch(OVERPASS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
    });
    if (!res.ok) return null;
    const data = await res.json();
    const el = data.elements && data.elements[0];
    return el?.tags?.website || null;
}

async function main() {
    await dbConnect();
    const restaurants = await RestaurantModel.find();

    for (const rest of restaurants) {
        if (!rest.website) {
            const site = await fetchWebsite(rest.restaurantName);
            if (site) {
                rest.website = site;
                await rest.save();
                console.log(`Updated website for ${rest.restaurantName}`);
            }
        }

        if (!rest.website) continue;

        try {
            const items = await scrapeMenu(rest.website);
            for (const item of items) {
                await MenuItemModel.create({
                    restaurant: rest._id,
                    name: item.name,
                    price: item.price ?? 0,
                    calories: item.calories ?? 0,
                    protein: item.protein ?? 0,
                    carbohydrates: item.carbohydrates ?? 0,
                    fat: item.fat ?? 0,
                    sodium: item.sodium ?? 0,
                });
            }
            console.log(`Saved ${items.length} items for ${rest.restaurantName}`);
        } catch (e) {
            console.error(`Failed to scrape ${rest.restaurantName}:`, e.message);
        }
    }

    await mongoose.disconnect();
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
