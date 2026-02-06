/**
 * API endpoint for HiGHS meal optimization
 * Supports standardized constraint builder:
 * - nutrition (min/max)
 * - allergens (hard exclusions)
 * - food frequency (per entry / per tag)
 * - safety amounts (max nutrition caps)
 * Objective: minimize cost
 */

import highsDefault from 'highs-addon';
import { HIGHS_STATUS, DEFAULT_NUTRITION_CONSTRAINTS } from '../../constants/app.js';
import { normalizeAllergenList, normalizeAllergenToken } from '@/constants/allergens';

const { Solver, solverVersion } = highsDefault;
const INF = 1e9;

const NUTRIENT_ALIASES = {
    calories: ['calories', 'kcal'],
    protein: ['protein', 'protein_g'],
    carbohydrates: ['carbohydrates', 'carbs', 'carb_g'],
    fat: ['fat', 'fat_g'],
    sodium: ['sodium', 'sodium_mg'],
    sugar: ['sugar', 'sugar_g'],
    fiber: ['fiber', 'fiber_g'],
    cholesterol: ['cholesterol', 'cholesterol_mg'],
};

const DEFAULTS = {
    horizonDays: 1,
    servingStep: 1,
    maxServingsPerMeal: 6,
    servingsInteger: true,
};

function normalizeNutrientKey(raw) {
    if (!raw) return null;
    const key = String(raw).toLowerCase();
    for (const [canonical, aliases] of Object.entries(NUTRIENT_ALIASES)) {
        if (aliases.includes(key)) return canonical;
    }
    return null;
}

function normalizeNutrition(input) {
    const output = {};
    if (!input) return output;
    for (const [key, value] of Object.entries(input)) {
        const canonical = normalizeNutrientKey(key);
        if (!canonical) continue;
        const numeric = Number(value);
        if (Number.isFinite(numeric)) {
            output[canonical] = numeric;
        }
    }
    return output;
}

function normalizeMeals(rawMeals) {
    return rawMeals.map((meal, index) => {
        const id = meal.id || meal.meal_id || meal.mealId || `meal-${index}`;
        const name = meal.meal_name || meal.mealName || `Meal ${index + 1}`;
        const nutrition = {
            ...normalizeNutrition(meal),
            ...normalizeNutrition(meal.nutrition),
        };
        const allergens = normalizeAllergenList(meal.allergens || []);
        const tags = meal.tags || {};
        const price = Number(meal.price ?? 0);

        return {
            id,
            name,
            nutrition,
            allergens,
            tags,
            price,
        };
    });
}

function normalizeConstraints(rawConstraints = {}) {
    const constraints = rawConstraints || {};
    const horizonDays = Number(constraints.horizon_days ?? constraints.horizonDays ?? DEFAULTS.horizonDays) || DEFAULTS.horizonDays;
    let servingStep = Number(constraints.serving_step ?? constraints.servingStep ?? DEFAULTS.servingStep) || DEFAULTS.servingStep;
    const maxServingsPerMeal = Number(constraints.max_servings_per_meal ?? constraints.maxServingsPerMeal ?? DEFAULTS.maxServingsPerMeal) || DEFAULTS.maxServingsPerMeal;
    // Enforce full servings to prevent fractional waste.
    const servingsInteger = true;

    if (servingsInteger) {
        servingStep = Math.max(1, Math.round(servingStep));
    } else {
        servingStep = Math.max(0.1, servingStep);
    }

    const allergens = constraints.allergens || {};
    const forbiddenAllergens = new Set(
        normalizeAllergenList(
            allergens.forbidden || allergens.excluded || constraints.allergens_forbidden || [],
        ).map(token => normalizeAllergenToken(token)),
    );

    const nutritionRanges = {};
    if (constraints.nutrition && typeof constraints.nutrition === 'object') {
        for (const [key, range] of Object.entries(constraints.nutrition)) {
            const canonical = normalizeNutrientKey(key);
            if (!canonical || !range) continue;
            const min = range.min !== undefined ? Number(range.min) : undefined;
            const max = range.max !== undefined ? Number(range.max) : undefined;
            const period = range.period || 'total';
            nutritionRanges[canonical] = { min, max, period };
        }
    }

    // Backwards compatibility: old constraints shape (calories/protein/etc)
    const legacyKeys = ['calories', 'protein', 'carbohydrates', 'fat', 'sodium'];
    for (const key of legacyKeys) {
        if (constraints[key] && typeof constraints[key] === 'object') {
            const canonical = normalizeNutrientKey(key);
            if (!canonical) continue;
            const { min, max } = constraints[key];
            nutritionRanges[canonical] = { min, max, period: 'total' };
        }
    }

    // Safety caps merge (max bounds)
    if (constraints.safety && typeof constraints.safety === 'object') {
        for (const [key, range] of Object.entries(constraints.safety)) {
            const canonical = normalizeNutrientKey(key);
            if (!canonical || !range) continue;
            const max = range.max !== undefined ? Number(range.max) : undefined;
            if (max === undefined) continue;
            const existing = nutritionRanges[canonical] || { period: 'total' };
            nutritionRanges[canonical] = {
                ...existing,
                max: existing.max !== undefined ? Math.min(existing.max, max) : max,
            };
        }
    }

    // If no nutrition provided, use defaults
    if (Object.keys(nutritionRanges).length === 0) {
        for (const [key, range] of Object.entries(DEFAULT_NUTRITION_CONSTRAINTS)) {
            const canonical = normalizeNutrientKey(key);
            if (!canonical) continue;
            nutritionRanges[canonical] = { min: range.min, max: range.max, period: 'total' };
        }
    }

    const frequency = constraints.frequency || {};
    const perEntry = frequency.per_entry || frequency.perEntry || {};
    const perTag = frequency.per_tag || frequency.perTag || {};

    const mealsPerDay = constraints.meals_per_day ?? constraints.mealsPerDay ?? null;

    return {
        horizonDays,
        servingStep,
        maxServingsPerMeal,
        servingsInteger,
        forbiddenAllergens,
        nutritionRanges,
        mealsPerDay,
        frequency: {
            perEntry,
            perTag,
        },
    };
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { meals, constraints } = req.body;

        if (!meals || !Array.isArray(meals) || meals.length === 0) {
            return res.status(400).json({ error: 'No meals provided' });
        }

        const normalizedMeals = normalizeMeals(meals);
        const normalizedConstraints = normalizeConstraints(constraints);

        const optimizationResult = await runOptimization({
            meals: normalizedMeals,
            constraints: normalizedConstraints,
        });

        res.status(200).json(optimizationResult);
    } catch (error) {
        console.error('Optimization error:', error);
        res.status(500).json({ error: 'Optimization failed', details: error.message });
    }
}

async function runOptimization({ meals, constraints }) {
    try {
        const mealCount = meals.length;
        const {
            servingStep,
            maxServingsPerMeal,
            servingsInteger,
            horizonDays,
            forbiddenAllergens,
            nutritionRanges,
            mealsPerDay,
            frequency,
        } = constraints;

        const columnLowerBounds = [];
        const columnUpperBounds = [];
        const objectiveWeights = [];
        const integrality = [];

        const perEntry = frequency.perEntry || {};
        for (let i = 0; i < mealCount; i += 1) {
            const meal = meals[i];
            const hasForbidden = meal.allergens.some(allergen => forbiddenAllergens.has(allergen));
            const baseUpper = maxServingsPerMeal / servingStep;
            const upper = hasForbidden ? 0 : baseUpper;

            columnLowerBounds.push(0);
            columnUpperBounds.push(upper);
            objectiveWeights.push(meal.price * servingStep);
            integrality.push(servingsInteger ? 1 : 0);

            const limit = perEntry[meal.id];
            if (limit !== undefined) {
                const maxValue = typeof limit === 'number' ? limit : limit?.max;
                if (Number.isFinite(maxValue)) {
                    columnUpperBounds[i] = Math.min(columnUpperBounds[i], maxValue / servingStep);
                }
                const minValue = typeof limit === 'object' ? limit?.min : undefined;
                if (Number.isFinite(minValue)) {
                    columnLowerBounds[i] = Math.max(columnLowerBounds[i], minValue / servingStep);
                }
            }
        }

        if (columnUpperBounds.every(value => value <= 0)) {
            return {
                status: 'infeasible',
                message: 'All meals were excluded by constraints (allergens or limits).',
            };
        }

        const slackMeta = [];
        const slackPenaltyMap = {
            calories: 0.02,
            protein: 1,
            carbohydrates: 0.5,
            fat: 1,
            sodium: 0.01,
            sugar: 0.5,
            fiber: 0.5,
            cholesterol: 0.05,
        };
        const defaultSlackPenalty = 0.5;
        const addSlack = (nutrient, bound) => {
            const index = columnLowerBounds.length;
            columnLowerBounds.push(0);
            columnUpperBounds.push(INF);
            objectiveWeights.push(slackPenaltyMap[nutrient] ?? defaultSlackPenalty);
            integrality.push(0);
            slackMeta.push({ nutrient, bound, index });
            return index;
        };

        const rowLowerBounds = [];
        const rowUpperBounds = [];
        const rowCoeffs = [];
        const rowLabels = [];

        const nutrientKeys = Object.keys(nutritionRanges);
        for (const key of nutrientKeys) {
            const range = nutritionRanges[key] || {};
            const period = range.period || 'total';
            const multiplier = period === 'day' ? horizonDays : 1;
            const hasMin = Number.isFinite(range.min);
            const hasMax = Number.isFinite(range.max);
            if (!hasMin && !hasMax) continue;

            const baseCoeff = new Map();
            for (let i = 0; i < mealCount; i += 1) {
                const value = meals[i].nutrition[key] ?? 0;
                if (!value) continue;
                baseCoeff.set(i, value * servingStep);
            }

            if (hasMin) {
                const coeff = new Map(baseCoeff);
                const slackIndex = addSlack(key, 'min');
                coeff.set(slackIndex, 1);
                rowLowerBounds.push(range.min * multiplier);
                rowUpperBounds.push(INF);
                rowCoeffs.push(coeff);
                rowLabels.push(`nutrient:${key}:min`);
            }

            if (hasMax) {
                const coeff = new Map(baseCoeff);
                const slackIndex = addSlack(key, 'max');
                coeff.set(slackIndex, -1);
                rowLowerBounds.push(-INF);
                rowUpperBounds.push(range.max * multiplier);
                rowCoeffs.push(coeff);
                rowLabels.push(`nutrient:${key}:max`);
            }
        }

        if (mealsPerDay !== null && mealsPerDay !== undefined) {
            const coeff = new Map();
            for (let i = 0; i < mealCount; i += 1) {
                coeff.set(i, servingStep);
            }

            const minValue = typeof mealsPerDay === 'number'
                ? mealsPerDay * horizonDays
                : Number.isFinite(mealsPerDay.min)
                    ? mealsPerDay.min * horizonDays
                    : null;
            const maxValue = typeof mealsPerDay === 'number'
                ? mealsPerDay * horizonDays
                : Number.isFinite(mealsPerDay.max)
                    ? mealsPerDay.max * horizonDays
                    : null;

            if (minValue !== null) {
                const coeffMin = new Map(coeff);
                const slackIndex = addSlack('meals_per_day', 'min');
                coeffMin.set(slackIndex, 1);
                rowLowerBounds.push(minValue);
                rowUpperBounds.push(INF);
                rowCoeffs.push(coeffMin);
                rowLabels.push('servings:total:min');
            }

            if (maxValue !== null) {
                const coeffMax = new Map(coeff);
                const slackIndex = addSlack('meals_per_day', 'max');
                coeffMax.set(slackIndex, -1);
                rowLowerBounds.push(-INF);
                rowUpperBounds.push(maxValue);
                rowCoeffs.push(coeffMax);
                rowLabels.push('servings:total:max');
            }
        }

        const perTag = frequency.perTag || {};
        for (const [tagKey, tagLimits] of Object.entries(perTag)) {
            if (!tagLimits || typeof tagLimits !== 'object') continue;
            for (const [tagValue, maxValue] of Object.entries(tagLimits)) {
                const limit = Number(maxValue);
                if (!Number.isFinite(limit)) continue;
                const coeff = new Map();
                for (let i = 0; i < mealCount; i += 1) {
                    const mealTag = meals[i].tags?.[tagKey] || meals[i][tagKey];
                    const tagValueNormalized = String(tagValue).toLowerCase();
                    const matches = Array.isArray(mealTag)
                        ? mealTag.some(item => String(item).toLowerCase() === tagValueNormalized)
                        : String(mealTag).toLowerCase() === tagValueNormalized;
                    if (matches) {
                        coeff.set(i, servingStep);
                    }
                }
                if (coeff.size === 0) continue;
                rowLowerBounds.push(-INF);
                rowUpperBounds.push(limit);
                rowCoeffs.push(coeff);
                rowLabels.push(`frequency:${tagKey}:${tagValue}`);
            }
        }

        const rowCount = rowCoeffs.length;
        const offsets = new Int32Array(rowCount + 1);
        const indices = [];
        const values = [];
        let cursor = 0;
        for (let r = 0; r < rowCount; r += 1) {
            offsets[r] = cursor;
            const entries = Array.from(rowCoeffs[r].entries()).sort((a, b) => a[0] - b[0]);
            for (const [idx, value] of entries) {
                indices.push(idx);
                values.push(value);
                cursor += 1;
            }
        }
        offsets[rowCount] = cursor;

        const solver = new Solver();
        solver.passModel({
            columnCount: columnLowerBounds.length,
            columnLowerBounds: Float64Array.from(columnLowerBounds),
            columnUpperBounds: Float64Array.from(columnUpperBounds),
            rowCount,
            rowLowerBounds: Float64Array.from(rowLowerBounds),
            rowUpperBounds: Float64Array.from(rowUpperBounds),
            weights: {
                offsets,
                indices: Int32Array.from(indices),
                values: Float64Array.from(values),
            },
            objectiveLinearWeights: Float64Array.from(objectiveWeights),
            isMaximization: false,
            integrality: Int32Array.from(integrality),
        });

        const status = await new Promise((resolve, reject) => {
            solver.run((err) => {
                if (err) {
                    reject(new Error(err));
                } else {
                    resolve(solver.getModelStatus());
                }
            });
        });

        if (status === HIGHS_STATUS.OPTIMAL) {
            const solution = solver.getSolution();
            const columnValues =
                solution?.columnValues ||
                solution?.colValue ||
                solution?.col_values ||
                null;

            if (!columnValues || typeof columnValues.length !== 'number') {
                throw new Error('Solver did not return column values.');
            }
            const mealPlan = [];
            const totals = { cost: 0 };

            for (const key of nutrientKeys) {
                totals[key] = 0;
            }

            for (let i = 0; i < mealCount; i += 1) {
                const raw = columnValues[i] ?? 0;
                const steps = servingsInteger ? Math.round(raw) : raw;
                if (steps <= 1e-6) continue;
                const servings = steps * servingStep;

                const nutritionTotals = {};
                for (const key of nutrientKeys) {
                    const value = (meals[i].nutrition[key] || 0) * servings;
                    nutritionTotals[key] = value;
                    totals[key] += value;
                }

                const totalCost = meals[i].price * servings;
                totals.cost += totalCost;

                mealPlan.push({
                    mealId: meals[i].id,
                    mealName: meals[i].name,
                    servings,
                    totalCost,
                    ...nutritionTotals,
                });
            }

            const totalNutrition = {
                calories: totals.calories ?? 0,
                protein: totals.protein ?? 0,
                carbohydrates: totals.carbohydrates ?? 0,
                fat: totals.fat ?? 0,
                sodium: totals.sodium ?? 0,
                cost: totals.cost,
            };

            const decoratedMealPlan = mealPlan.map(item => ({
                mealId: item.mealId,
                mealName: item.mealName,
                servings: item.servings,
                totalCalories: item.calories ?? 0,
                totalProtein: item.protein ?? 0,
                totalCarbs: item.carbohydrates ?? 0,
                totalFat: item.fat ?? 0,
                totalSodium: item.sodium ?? 0,
                totalCost: item.totalCost,
            }));

            const slackReport = {};
            for (const slack of slackMeta) {
                const value = columnValues[slack.index] ?? 0;
                if (value <= 1e-6) continue;
                if (!slackReport[slack.nutrient]) slackReport[slack.nutrient] = {};
                slackReport[slack.nutrient][slack.bound] = value;
            }

            const objectiveValue = objectiveWeights.reduce(
                (sum, weight, index) => sum + weight * (columnValues[index] ?? 0),
                0,
            );

            return {
                status: 'optimal',
                mealPlan: decoratedMealPlan,
                totalNutrition,
                solverInfo: {
                    version: solverVersion(),
                    iterations: solver.getInfo().simplex_iteration_count || 0,
                    runtime: solver.getInfo().runtime || 0,
                    objectiveValue,
                },
                diagnostics: {
                    row_labels: rowLabels,
                    horizon_days: horizonDays,
                    serving_step: servingStep,
                    slack: slackReport,
                },
            };
        }

        return {
            status: 'infeasible',
            message: 'No feasible solution found. Try adjusting your meal dataset or constraints.',
            solverStatus: status,
        };
    } catch (error) {
        console.error('HiGHS solver error:', error);
        throw new Error(`Solver failed: ${error.message}`);
    }
}
