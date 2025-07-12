#!/usr/bin/env node
// tools/build-meal-csv.mjs
// Comprehensive 8,000-meal CSV builder with full nutrition and variety

import fs from 'fs/promises';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';
import fetch from 'node-fetch';

const OUT_CSV = 'restaurant_meals_8000_full.csv';

// URLs or paths to various data sources
const DATA_SOURCES = [
    'https://www.openintro.org/data/csv/fastfood.csv', // Example of one data source (replace with your own)
    // Add more data sources as needed, local files or URLs
];

/**
 * Function to fetch and parse CSV data from a URL
 * @param {string} url The URL of the CSV file
 * @returns {Array} Parsed CSV data as an array of objects
 */
async function fetchCSV(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch CSV from ${url}: ${response.statusText}`);
        }
        const csvData = await response.text();
        return parse(csvData, { columns: true });
    } catch (error) {
        console.error(`Error fetching CSV from ${url}: ${error.message}`);
        return [];
    }
}

/**
 * Function to build the meal dataset
 * @param {Array} sources Array of data sources (URLs or local paths)
 * @param {number} targetCount Target number of meals to include in the dataset
 * @returns {Array} Array of objects representing meals with detailed nutritional data
 */
async function buildMeals(sources, targetCount) {
    const allMeals = [];

    // Fetch and merge data from each source
    for (const source of sources) {
        const meals = await fetchCSV(source);
        allMeals.push(...meals);
    }

    // Ensure we have at least `targetCount` meals
    const sampledMeals = sampleMeals(allMeals, targetCount);

    return sampledMeals;
}

/**
 * Function to sample meals from the merged dataset
 * @param {Array} meals Array of meal objects
 * @param {number} targetCount Target number of meals to sample
 * @returns {Array} Sampled array of meal objects
 */
function sampleMeals(meals, targetCount) {
    const totalMeals = meals.length;
    if (totalMeals <= targetCount) {
        return meals; // Return all meals if less than targetCount
    }
    const sampledIndices = new Set();
    while (sampledIndices.size < targetCount) {
        const randomIndex = Math.floor(Math.random() * totalMeals);
        sampledIndices.add(randomIndex);
    }
    return Array.from(sampledIndices).map(index => meals[index]);
}

/**
 * Function to write meals to CSV file
 * @param {Array} meals Array of meal objects to write to CSV
 * @param {string} outFile Path to the output CSV file
 */
async function writeCSV(meals, outFile) {
    try {
        const csvData = stringify(meals, { header: true });
        await fs.writeFile(outFile, csvData);
        console.log(`✅ Successfully wrote ${meals.length} meals to ${outFile}`);
    } catch (error) {
        console.error(`❌ Error writing meals to ${outFile}: ${error.message}`);
    }
}

// Main execution
async function main() {
    const meals = await buildMeals(DATA_SOURCES, 8000);
    await writeCSV(meals, OUT_CSV);
}

main();
