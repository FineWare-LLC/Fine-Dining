import * as cheerio from 'cheerio';
import nodeFetch from 'node-fetch';

/**
 * Scrape menu items and basic nutrition info from a restaurant website.
 * The scraper looks for elements containing menu item text and attempts
 * to extract common nutrition values via regular expressions.
 *
 * @param {string} url - The website URL to scrape.
 * @returns {Promise<Array>} Array of menu item objects.
 */
export async function scrapeMenu(url) {
    const fetchImplementation = typeof globalThis.fetch === 'function' ? globalThis.fetch.bind(globalThis) : nodeFetch;
    const res = await fetchImplementation(url);
    if (!res.ok) {
        throw new Error(`Failed to fetch ${url}: ${res.statusText}`);
    }

    const html = await res.text();
    const $ = cheerio.load(html);
    const items = [];

    const candidates = $('.menu-item, .item, li, div');
    candidates.each((i, el) => {
        const text = $(el).text().replace(/\s+/g, ' ').trim();
        if (!text) return;

        const nameMatch = text.match(/^([^\d$]+?)\s*(?:-|\$|\d|cal|g|mg)/i);
        const priceMatch = text.match(/\$(\d+(?:\.\d+)?)/);
        const caloriesMatch = text.match(/(\d+)\s*cal/i);
        const proteinMatch = text.match(/(\d+)\s*g\s*protein/i);
        const carbsMatch = text.match(/(\d+)\s*g\s*carb/i);
        const fatMatch = text.match(/(\d+)\s*g\s*fat/i);
        const sodiumMatch = text.match(/(\d+)\s*mg\s*sodium/i);

        const name = nameMatch ? nameMatch[1].trim() : text.slice(0, 50);
        const item = {
            name,
            price: priceMatch ? parseFloat(priceMatch[1]) : null,
            calories: caloriesMatch ? parseInt(caloriesMatch[1]) : null,
            protein: proteinMatch ? parseInt(proteinMatch[1]) : null,
            carbohydrates: carbsMatch ? parseInt(carbsMatch[1]) : null,
            fat: fatMatch ? parseInt(fatMatch[1]) : null,
            sodium: sodiumMatch ? parseInt(sodiumMatch[1]) : null,
        };

        // Require at least a name
        if (item.name) items.push(item);
    });

    return items;
}
