// src/sampler/index.mjs
/**
 * Samples the enriched meal data based on specified criteria
 * @param {Array} enrichedData Enriched meal data from enricher
 * @returns {Promise<Array>} Sampled meal data
 */
export async function run(enrichedData) {
    console.log('Running sampler step...');

    if (!enrichedData || !Array.isArray(enrichedData)) {
        console.error('Error: No valid data provided to sampler');
        return [];
    }

    console.log(`Sampling from ${enrichedData.length} meals...`);

    // In this example, we'll keep all meals that have complete nutritional data
    const sampledData = enrichedData.filter(meal => {
        // Check for required nutritional values
        return meal.calories !== null &&
            meal.protein !== null &&
            meal.carbohydrates !== null &&
            meal.sodium !== null;
    });

    // You could implement additional sampling logic here, such as:
    // - Random sampling to reduce dataset size
    // - Stratified sampling to ensure representation across categories
    // - Filtering based on specific nutritional criteria

    console.log(`Sampler completed. Output: ${sampledData.length} sampled meals`);
    return sampledData;
}