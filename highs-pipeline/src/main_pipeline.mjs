// src/main_pipeline.mjs
// Orchestrates the data processing pipeline steps.

import * as enricher from './enricher/index.mjs';
import * as fetcher from './fetcher/index.mjs';
import * as logger from './logger/index.mjs';
import * as normalizer from './normalizer/index.mjs';
import * as sampler from './sampler/index.mjs';
import * as writer from './writer/index.mjs';

async function runPipeline() {
    console.log('Starting data pipeline...');

    try {
        // Start tracking pipeline execution
        logger.startStep('pipeline', 0);

        // Step 1: Fetch raw data
        logger.startStep('fetcher', 0);
        const rawData = await fetcher.run();
        logger.endStep('fetcher', rawData.length);

        // Step 2: Normalize the data
        logger.startStep('normalizer', rawData.length);
        const normalizedData = await normalizer.run(rawData);
        logger.endStep('normalizer', normalizedData.length);

        // Step 3: Enrich the data with calculated fields
        logger.startStep('enricher', normalizedData.length);
        const enrichedData = await enricher.run(normalizedData);
        logger.endStep('enricher', enrichedData.length);

        // Step 4: Sample the data if needed
        logger.startStep('sampler', enrichedData.length);
        const sampledData = await sampler.run(enrichedData);
        logger.endStep('sampler', sampledData.length);

        // Step 5: Write the processed data to CSV
        logger.startStep('writer', sampledData.length);
        const outputFile = await writer.run(sampledData);
        logger.endStep('writer', sampledData.length);

        // Final step: Log summary statistics
        logger.endStep('pipeline', sampledData.length);
        logger.logSummary();

        console.log(`Pipeline completed successfully! Output file: ${outputFile}`);
    } catch (error) {
        logger.recordError('pipeline', error);
        console.error('Pipeline failed:', error);
        logger.logSummary();
    }
}

runPipeline().catch(error => {
    console.error('Uncaught pipeline error:', error);
    process.exit(1);
});