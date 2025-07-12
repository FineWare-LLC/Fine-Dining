// src/writer/index.mjs
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { stringify } from 'csv-stringify/sync';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Writes the processed meal data to a CSV file
 * @param {Array} sampledData Sampled meal data from sampler
 * @returns {Promise<string>} Path to the written file
 */
export async function run(sampledData) {
    console.log('Running writer step...');

    if (!sampledData || !Array.isArray(sampledData)) {
        console.error('Error: No valid data provided to writer');
        return null;
    }

    console.log(`Writing ${sampledData.length} meals to CSV...`);

    try {
        const outputDir = path.join(__dirname, '../../data/processed');
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const outputFile = path.join(outputDir, `processed_meals_${timestamp}.csv`);

        // Ensure the output directory exists
        await fs.mkdir(outputDir, { recursive: true });

        // Write the data to CSV
        const csvData = stringify(sampledData, {
            header: true,
            columns: Object.keys(sampledData[0] || {}),
        });

        await fs.writeFile(outputFile, csvData, 'utf8');

        // Create a copy with a fixed name for the solver to use
        const solverFile = path.join(outputDir, 'restaurant_meals_processed.csv');
        await fs.writeFile(solverFile, csvData, 'utf8');

        console.log('Writer completed. Files written to:');
        console.log(`- ${outputFile}`);
        console.log(`- ${solverFile}`);

        return solverFile;
    } catch (error) {
        console.error('Error writing CSV:', error);
        return null;
    }
}