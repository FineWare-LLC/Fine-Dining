// @ts-nocheck
const normalizeAllergyValue = (value) => (typeof value === 'string' ? value.trim().toLowerCase() : '');

const addNormalizedAllergies = (targetSet, values) => {
    if (!(targetSet instanceof Set) || !Array.isArray(values)) {
        return targetSet;
    }

    for (const value of values) {
        const normalizedValue = normalizeAllergyValue(value);
        if (normalizedValue) {
            targetSet.add(normalizedValue);
        }
    }

    return targetSet;
};

export function collectCanonicalAllergies(user = {}) {
    const allergies = new Set();

    if (!user || typeof user !== 'object' || Array.isArray(user)) {
        return allergies;
    }

    addNormalizedAllergies(allergies, user.allergies);
    addNormalizedAllergies(allergies, user.questionnaire?.allergies);
    addNormalizedAllergies(allergies, user.dietaryProfile?.allergens);

    return allergies;
}

export function mealHasAllergenConflict(mealAllergens, userAllergies) {
    if (!Array.isArray(mealAllergens) || mealAllergens.length === 0) {
        return false;
    }

    const normalizedMealAllergens = [];
    const mealAllergenSet = new Set();

    for (const value of mealAllergens) {
        const normalizedValue = normalizeAllergyValue(value);
        if (normalizedValue && !mealAllergenSet.has(normalizedValue)) {
            mealAllergenSet.add(normalizedValue);
            normalizedMealAllergens.push(normalizedValue);
        }
    }

    if (normalizedMealAllergens.length === 0) {
        return false;
    }

    const normalizedUserAllergies = userAllergies instanceof Set
        ? userAllergies
        : collectCanonicalAllergies({
            allergies: Array.isArray(userAllergies) ? userAllergies : [],
        });

    for (const allergy of normalizedUserAllergies) {
        if (mealAllergenSet.has(allergy)) {
            return true;
        }
    }

    for (const allergy of normalizedUserAllergies) {
        for (const mealAllergen of normalizedMealAllergens) {
            if (mealAllergen.includes(allergy) || allergy.includes(mealAllergen)) {
                return true;
            }
        }
    }

    return false;
}
