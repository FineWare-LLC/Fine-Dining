// src/enricher/index.mjs
/**
 * Enriches normalized meal data with additional calculated fields
 * @param {Array} normalizedData Normalized meal data from normalizer
 * @returns {Promise<Array>} Enriched meal data
 */
export async function run(normalizedData) {
    console.log("Running enricher step...");

    if (!normalizedData || !Array.isArray(normalizedData)) {
        console.error("Error: No valid data provided to enricher");
        return [];
    }

    console.log(`Enriching ${normalizedData.length} meals...`);

    const enrichedData = normalizedData.map((meal, index) => {
        try {
            const enriched = { ...meal };

            // Calculate protein density (g protein per 100 calories)
            if (enriched.protein !== null && enriched.calories !== null && enriched.calories > 0) {
                enriched.protein_density = +(enriched.protein / enriched.calories * 100).toFixed(2);
            } else {
                enriched.protein_density = null;
            }

            // Calculate carb-to-protein ratio
            if (enriched.carbohydrates !== null && enriched.protein !== null && enriched.protein > 0) {
                enriched.carb_protein_ratio = +(enriched.carbohydrates / enriched.protein).toFixed(2);
            } else {
                enriched.carb_protein_ratio = null;
            }

            // Calculate sodium per calorie
            if (enriched.sodium !== null && enriched.calories !== null && enriched.calories > 0) {
                enriched.sodium_per_calorie = +(enriched.sodium / enriched.calories).toFixed(2);
            } else {
                enriched.sodium_per_calorie = null;
            }

            // Add a price_per_protein field if price is available
            if (enriched.price !== null && enriched.protein !== null && enriched.protein > 0) {
                enriched.price_per_protein = +(enriched.price / enriched.protein).toFixed(2);
            } else {
                enriched.price_per_protein = null;
            }

            // Add health score (lower is better, factors in sodium and protein density)
            if (enriched.sodium_per_calorie !== null && enriched.protein_density !== null) {
                // Simple algorithm: sodium_per_calorie (negative factor) minus protein_density (positive factor)
                enriched.health_score = +((enriched.sodium_per_calorie / 10) - enriched.protein_density).toFixed(2);
            } else {
                enriched.health_score = null;
            }

            // Categorize meal based on protein content
            if (enriched.protein !== null) {
                if (enriched.protein >= 30) {
                    enriched.protein_category = 'high';
                } else if (enriched.protein >= 15) {
                    enriched.protein_category = 'medium';
                } else {
                    enriched.protein_category = 'low';
                }
            } else {
                enriched.protein_category = null;
            }

            return enriched;
        } catch (error) {
            console.error(`Error enriching meal at index ${index}:`, error);
            return meal; // Return original meal if enrichment fails
        }
    });

    console.log(`Enricher completed. Output: ${enrichedData.length} enriched meals`);
    return enrichedData;
}