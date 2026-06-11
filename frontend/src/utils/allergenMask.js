const ZERO_MASK = 0;
const ALLERGEN_MASK_WIDTH = 32;
const ALLERGEN_MASK_LIMIT = 2 ** ALLERGEN_MASK_WIDTH;

/**
 * Normalize an allergen mask to an unsigned 32-bit integer.
 * Values outside the mask width are clamped to the supported range.
 *
 * @param {unknown} maskCandidate potential allergen mask value
 * @returns {number} normalized allergen mask
 */
export function normalizeAllergenMask(maskCandidate) {
    if (typeof maskCandidate !== 'number' || !Number.isFinite(maskCandidate)) {
        return ZERO_MASK;
    }

    if (!Number.isInteger(maskCandidate)) {
        return ZERO_MASK;
    }

    if (maskCandidate <= ZERO_MASK) {
        return ZERO_MASK;
    }

    if (maskCandidate >= ALLERGEN_MASK_LIMIT) {
        return ALLERGEN_MASK_LIMIT - 1;
    }

    return maskCandidate >>> 0;
}

/**
 * Compute the meal-level allergen mask by combining ingredient masks.
 * Missing or invalid masks are ignored so downstream consumers
 * operate on well-defined 32-bit values.
 *
 * @param {Array<{ allergenMask?: number }>} ingredients meal ingredients
 * @returns {number} unsigned 32-bit allergen mask for the meal
 */
export function computeMealAllergenMask(ingredients) {
    if (!Array.isArray(ingredients) || ingredients.length === 0) {
        return ZERO_MASK;
    }

    return ingredients.reduce((aggregatedMask, ingredient) => {
        if (!ingredient || typeof ingredient !== 'object') {
            return aggregatedMask;
        }

        const ingredientMask = normalizeAllergenMask(ingredient.allergenMask);
        return aggregatedMask | ingredientMask;
    }, ZERO_MASK) >>> 0;
}
