// src/fetcher/index.mjs
import { parse } from 'csv-parse/sync';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';
import * as scraper from './scraper.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Fetches meal data from specified sources
 * @returns {Promise<Array>} Raw meal data
 */
export async function run() {
    console.log("Running fetcher step...");

    // Define data sources (local files and/or URLs)
    const sources = [
        {
            type: 'file',
            path: path.join(__dirname, '../../data/raw/restaurant_meals_8000_full.csv')
        },
        // Add more sources as needed
        // { type: 'url', path: 'https://example.com/meals.csv' }
    ];

    let allMeals = [];

    // Process each source
    for (const source of sources) {
        try {
            let data;
            if (source.type === 'file') {
                console.log(`Fetching data from file: ${source.path}`);
                const content = await fs.readFile(source.path, 'utf8');
                data = parse(content, { columns: true, skip_empty_lines: true });
            } else if (source.type === 'url') {
                console.log(`Fetching data from URL: ${source.path}`);
                const response = await fetch(source.path);
                if (!response.ok) {
                    throw new Error(`Failed to fetch from ${source.path}: ${response.statusText}`);
                }
                const content = await response.text();
                data = parse(content, { columns: true, skip_empty_lines: true });
            }

            console.log(`Fetched ${data.length} meals from ${source.path}`);
            allMeals = [...allMeals, ...data];
        } catch (error) {
            console.error(`Error fetching from ${source.path}:`, error);
        }
    }

    // Run the web scraper to collect data from food chains and Walmart
    try {
        console.log("Running web scraper to collect data from food chains and Walmart...");
        const scrapedData = await scraper.run();
        console.log(`Scraped ${scrapedData.length} meals from food chains and Walmart`);
        allMeals = [...allMeals, ...scrapedData];
    } catch (error) {
        console.error("Error running web scraper:", error);
    }

    console.log(`Fetcher completed. Total meals fetched: ${allMeals.length}`);
    return allMeals;
}
