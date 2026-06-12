// @ts-nocheck
import { ENERGY_TOLERANCE } from './constants';
import { validateMealPlanRequest } from './schema';

function isPlainObject(value) {
    return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

const OBJECTIVE_WEIGHT_KEYS = ['cost', 'nutrition', 'variety', 'preference'];
const DEFAULT_OBJECTIVE_WEIGHTS = Object.freeze({
    cost: 1,
    nutrition: 1,
    variety: 1,
    preference: 1,
});

function normalizeStringList(values = []) {
    return Array.from(
        new Set(
            values
                .map(value => (typeof value === 'string' ? value.toLowerCase().trim() : ''))
                .filter(Boolean),
        ),
    ).sort((a, b) => a.localeCompare(b));
}

function normalizeInventoryList(entries = []) {
    return entries
        .map(item => ({
            ingredientId: typeof item?.ingredient_id === 'string'
                ? item.ingredient_id.toLowerCase().trim()
                : typeof item?.ingredientId === 'string'
                    ? item.ingredientId.toLowerCase().trim()
                    : '',
            grams: Number(item?.grams),
        }))
        .filter(item => item.ingredientId && Number.isFinite(item.grams))
        .sort((a, b) => a.ingredientId.localeCompare(b.ingredientId) || a.grams - b.grams);
}

function normalizePreferenceValue(value) {
    if (Array.isArray(value)) {
        if (value.every(item => typeof item === 'string')) {
            return normalizeStringList(value);
        }

        return value
            .map(item => normalizePreferenceValue(item))
            .sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
    }

    if (isPlainObject(value)) {
        return Object.keys(value)
            .sort((a, b) => a.localeCompare(b))
            .reduce((acc, key) => {
                acc[key] = normalizePreferenceValue(value[key]);
                return acc;
            }, {});
    }

    if (typeof value === 'string') {
        return value.trim();
    }

    return value;
}

function normalizeMicros(micros = {}) {
    return Object.entries(micros)
        .filter(([, range]) => range && (range.min !== undefined || range.max !== undefined))
        .sort(([left], [right]) => left.toLowerCase().localeCompare(right.toLowerCase()))
        .reduce((acc, [key, range]) => {
            acc[key.toLowerCase()] = {
                ...(range.min !== undefined ? { min: range.min } : {}),
                ...(range.max !== undefined ? { max: range.max } : {}),
            };
            return acc;
        }, {});
}

function normalizeObjectiveWeights(objectiveWeights = {}) {
    if (!isPlainObject(objectiveWeights) || Object.keys(objectiveWeights).length === 0) {
        return { ...DEFAULT_OBJECTIVE_WEIGHTS };
    }

    const normalized = {};
    for (const key of OBJECTIVE_WEIGHT_KEYS) {
        const value = objectiveWeights[key];
        if (!Number.isFinite(value) || value < 0) {
            throw createOptimizationRequestValidationError(
                'invalidObjectiveWeights',
                'Provide non-negative cost, nutrition, variety, and preference weights.',
            );
        }
        normalized[key] = value;
    }

    const unexpectedKeys = Object.keys(objectiveWeights).filter(
        key => !OBJECTIVE_WEIGHT_KEYS.includes(key),
    );
    if (unexpectedKeys.length > 0) {
        throw createOptimizationRequestValidationError(
            'invalidObjectiveWeights',
            'Provide non-negative cost, nutrition, variety, and preference weights.',
        );
    }

    return normalized;
}

function buildCanonicalSignatureValue(value) {
    if (Array.isArray(value)) {
        return value
            .map(item => buildCanonicalSignatureValue(item))
            .sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
    }

    if (isPlainObject(value)) {
        return Object.keys(value)
            .sort((a, b) => a.localeCompare(b))
            .reduce((acc, key) => {
                acc[key] = buildCanonicalSignatureValue(value[key]);
                return acc;
            }, {});
    }

    return value;
}

export class OptimizationRequestValidationError extends Error {
    constructor(code, message) {
        super(message);
        this.name = 'OptimizationRequestValidationError';
        this.code = code;
        this.isUserSafe = true;
    }

    toJSON() {
        return {
            name: this.name,
            code: this.code,
            message: this.message,
            isUserSafe: this.isUserSafe,
        };
    }
}

function createOptimizationRequestValidationError(code, message) {
    return new OptimizationRequestValidationError(code, message);
}

export function buildMealPlanRequestSignature(request) {
    return buildCanonicalSignatureValue({
        userId: request.userId,
        horizonDays: request.horizonDays,
        mealsPerDay: request.mealsPerDay,
        diet: request.diet,
        micros: request.micros,
        allergens: request.allergens,
        bannedIngredients: request.bannedIngredients,
        objectiveWeights: request.objectiveWeights,
        preferences: request.preferences,
        inventory: request.inventory,
        budget: request.budget,
        timePerMeal: request.timePerMeal,
        binary: request.binary,
        allowLeftovers: request.allowLeftovers,
    });
}

export function normalizeMealPlanRequest(payload) {
    const validation = validateMealPlanRequest(payload);
    if (!validation.success) {
        throw createOptimizationRequestValidationError(
            'invalidPayload',
            'We could not read this meal plan request. Please refresh the planner.',
        );
    }

    const parsed = validation.data;
    const { diet } = parsed;
    const energy = 4 * (diet.protein_g + diet.carb_g) + 9 * diet.fat_g;
    const deviation = Math.abs(energy - diet.kcal) / Math.max(diet.kcal, 1);
    if (deviation > ENERGY_TOLERANCE) {
        throw createOptimizationRequestValidationError(
            'energyMismatch',
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
        objectiveWeights: normalizeObjectiveWeights(parsed.objective_weights || {}),
        preferences: normalizePreferenceValue(parsed.preferences || {}),
        inventory: normalizeInventoryList(parsed.inventory || []),
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
