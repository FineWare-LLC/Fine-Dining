import { MealPlanRequestSchema } from './schema.js';
import { ENERGY_TOLERANCE } from './constants.js';

function compareStrings(left, right) {
    if (left < right) return -1;
    if (left > right) return 1;
    return 0;
}

function normalizeStringList(values = []) {
    return Array.from(new Set(values.map(v => v.toLowerCase().trim()).filter(Boolean))).sort(compareStrings);
}

function normalizeMicros(micros = {}) {
    const normalized = {};
    const entries = Object.entries(micros)
        .filter(([, range]) => range && (range.min !== undefined || range.max !== undefined))
        .map(([key, range]) => [key.toLowerCase(), range])
        .sort(([left], [right]) => compareStrings(left, right));

    for (const [key, range] of entries) {
        const nextRange = {};
        if (range.min !== undefined) {
            nextRange.min = range.min;
        }
        if (range.max !== undefined) {
            nextRange.max = range.max;
        }
        normalized[key] = nextRange;
    }

    return normalized;
}

function normalizePreferenceValue(value) {
    if (Array.isArray(value)) {
        if (value.every(entry => typeof entry === 'string')) {
            return normalizeStringList(value);
        }
        return value.map(item => normalizePreferenceValue(item));
    }

    if (value && typeof value === 'object') {
        const normalized = {};
        for (const key of Object.keys(value).sort(compareStrings)) {
            normalized[key] = normalizePreferenceValue(value[key]);
        }
        return normalized;
    }

    return value;
}

function normalizePreferences(preferences = {}) {
    return normalizePreferenceValue(preferences);
}

function normalizeInventory(inventory = []) {
    return inventory
        .map((item, index) => ({
            ingredientId: String(item.ingredientId ?? item.ingredient_id).toLowerCase(),
            grams: item.grams,
            index,
        }))
        .sort((left, right) =>
            compareStrings(left.ingredientId, right.ingredientId)
            || left.grams - right.grams
            || left.index - right.index)
        .map(({ index, ...item }) => item);
}

export function buildMealPlanRequestSignature(request) {
    return {
        userId: request.userId,
        horizonDays: request.horizonDays,
        mealsPerDay: request.mealsPerDay,
        diet: {
            kcal: request.diet.kcal,
            protein_g: request.diet.protein_g,
            carb_g: request.diet.carb_g,
            fat_g: request.diet.fat_g,
        },
        micros: normalizeMicros(request.micros || {}),
        allergens: normalizeStringList(request.allergens || []),
        bannedIngredients: normalizeStringList(request.bannedIngredients || []),
        preferences: normalizePreferences(request.preferences || {}),
        inventory: normalizeInventory(request.inventory || []),
        budget: request.budget ?? null,
        timePerMeal: request.timePerMeal ?? null,
        binary: {
            useRecipeLevel: request.binary?.useRecipeLevel ?? true,
            integerServings: request.binary?.integerServings ?? false,
        },
        allowLeftovers: request.allowLeftovers,
    };
}

export function normalizeMealPlanRequest(payload) {
    const parsed = MealPlanRequestSchema.parse(payload);
    const { diet } = parsed;
    const energy = 4 * (diet.protein_g + diet.carb_g) + 9 * diet.fat_g;
    const deviation = Math.abs(energy - diet.kcal) / Math.max(diet.kcal, 1);
    if (deviation > ENERGY_TOLERANCE) {
        throw new Error(
            `Energy balance mismatch. kcal=${diet.kcal.toFixed(1)} macros imply ${energy.toFixed(1)} kcal`,
        );
    }

    return {
        userId: parsed.user_id,
        horizonDays: parsed.horizon_days,
        mealsPerDay: parsed.meals_per_day,
        diet: {
            kcal: diet.kcal,
            protein_g: diet.protein_g,
            carb_g: diet.carb_g,
            fat_g: diet.fat_g,
        },
        micros: normalizeMicros(parsed.micros || {}),
        allergens: normalizeStringList(parsed.allergens),
        bannedIngredients: normalizeStringList(parsed.banned_ingredients),
        preferences: normalizePreferences(parsed.preferences || {}),
        inventory: normalizeInventory(parsed.inventory || []),
        budget: parsed.budget?.max_usd_per_day ?? null,
        timePerMeal: parsed.time_per_meal_min ?? null,
        binary: {
            useRecipeLevel: parsed.binary_vars?.use_recipe_level ?? true,
            integerServings: parsed.binary_vars?.integer_servings ?? false,
        },
        allowLeftovers: parsed.allow_leftovers,
        raw: parsed,
    };
}
