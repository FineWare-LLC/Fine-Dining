import { MealPlanRequestSchema } from './schema.js';
import { ENERGY_TOLERANCE } from './constants.js';

function normalizeStringList(values = []) {
    return Array.from(new Set(values.map(v => v.toLowerCase().trim()).filter(Boolean)));
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

    const micros = {};
    for (const [key, range] of Object.entries(parsed.micros || {})) {
        if (range && (range.min !== undefined || range.max !== undefined)) {
            micros[key.toLowerCase()] = { ...range };
        }
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
        micros,
        allergens: normalizeStringList(parsed.allergens),
        bannedIngredients: normalizeStringList(parsed.banned_ingredients),
        preferences: parsed.preferences || {},
        inventory: (parsed.inventory || []).map(item => ({
            ingredientId: item.ingredient_id.toLowerCase(),
            grams: item.grams,
        })),
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

