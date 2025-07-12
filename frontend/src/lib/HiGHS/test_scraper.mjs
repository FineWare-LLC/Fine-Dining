import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import * as scraper from './src/fetcher/scraper.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Test script to run the web scraper and verify it works correctly
 */
async function testScraper() {
    console.log('Starting scraper test...');

    try {
    // Run the scraper
        console.log('Running web scraper...');
        const scrapedData = await scraper.run();

        console.log(`Scraped ${scrapedData.length} meals from food chains and Walmart`);

        // Print a sample of the scraped data
        if (scrapedData.length > 0) {
            console.log('\nSample of scraped data:');
            console.log(JSON.stringify(scrapedData[0], null, 2));
        }

        // Save the scraped data to a JSON file for inspection
        const outputDir = path.join(__dirname, 'data/raw');
        await fs.mkdir(outputDir, { recursive: true });

        const outputFile = path.join(outputDir, 'scraped_data_test.json');
        await fs.writeFile(outputFile, JSON.stringify(scrapedData, null, 2), 'utf8');

        console.log(`\nSaved scraped data to ${outputFile}`);
        console.log('Scraper test completed successfully!');
    } catch (error) {
        console.error('Error running scraper test:', error);
    }
}

// Run the test
testScraper().catch(error => {
    console.error('Uncaught error:', error);
    process.exit(1);
});