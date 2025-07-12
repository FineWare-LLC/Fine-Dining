// src/normalizer/index.mjs
/**
 * Normalizes raw meal data
 * @param {Array} rawData Raw meal data from fetcher
 * @returns {Promise<Array>} Normalized meal data
 */
export async function run(rawData) {
    console.log('Running normalizer step...');

    if (!rawData || !Array.isArray(rawData)) {
        console.error('Error: No valid data provided to normalizer');
        return [];
    }

    console.log(`Normalizing ${rawData.length} meals...`);

    const normalizedData = rawData.map((meal, index) => {
        try {
            // Create a new object to avoid modifying the original
            const normalized = { ...meal };

            // Ensure consistent field names (lowercase, snake_case)
            const standardizeKey = (key) => {
                return key.toLowerCase().replace(/\s+/g, '_');
            };

            // Convert object keys to standardized format
            Object.keys(meal).forEach(key => {
                const standardKey = standardizeKey(key);
                if (key !== standardKey) {
                    normalized[standardKey] = normalized[key];
                    delete normalized[key];
                }
            });

            // Ensure required fields exist
            const requiredFields = ['meal_name', 'calories', 'protein', 'carbohydrates', 'sodium'];
            const missingFields = requiredFields.filter(field => !(field in normalized));

            if (missingFields.length > 0) {
                console.warn(`Row ${index+1}: Missing required fields: ${missingFields.join(', ')}`);
            }

            // Convert numeric fields from strings to numbers
            const numericFields = ['calories', 'protein', 'carbohydrates', 'sodium', 'price'];
            numericFields.forEach(field => {
                if (field in normalized) {
                    const value = normalized[field];
                    if (value === 'NA' || value === '' || value === undefined) {
                        normalized[field] = null;
                    } else {
                        normalized[field] = Number(value);

                        // Check if conversion resulted in NaN
                        if (isNaN(normalized[field])) {
                            console.warn(`Row ${index+1}: Invalid numeric value for ${field}: ${value}`);
                            normalized[field] = null;
                        }
                    }
                }
            });

            // Add the price field if it doesn't exist
            if (!('price' in normalized)) {
                normalized.price = null;
            }

            // Add the allergens field if it doesn't exist
            if (!('allergens' in normalized)) {
                normalized.allergens = '';
            }

            // Normalize 'salad' field if it exists
            if ('salad' in normalized) {
                const saladValue = normalized.salad.toString().toLowerCase().trim();
                normalized.salad = ['yes', 'true', '1'].includes(saladValue);
            }

            return normalized;
        } catch (error) {
            console.error(`Error normalizing meal at index ${index}:`, error);
            return null;
        }
    }).filter(meal => meal !== null); // Remove any meals that failed normalization

    console.log(`Normalizer completed. Output: ${normalizedData.length} normalized meals`);
    return normalizedData;
}