import {
    DEFAULT_SERVING_UPPER_BOUND,
    BINARY_BIG_M,
    SLACK_PENALTY,
    MICRO_SLACK_PENALTY,
    INF_BOUND,
    CONSTRAINT_TYPES,
} from './constants.js';

function addVariable(state, meta, lower, upper, objective, isInteger) {
    const index = state.variableMeta.length;
    state.variableMeta.push({ ...meta, index });
    state.columnLowerBounds.push(lower);
    state.columnUpperBounds.push(upper);
    state.objective.push(objective);
    state.columnTypes.push(isInteger ? 1 : 0);
    return index;
}

function addConstraint(state, meta, lower, upper, coefficients) {
    const map = new Map(coefficients);
    const index = state.constraints.length;
    state.constraints.push({ ...meta, index, lower, upper, coefficients: map });
    return index;
}

function getNutrientValue(recipe, key) {
    switch (key) {
    case 'kcal':
        return recipe.macros.kcal;
    case 'protein_g':
        return recipe.macros.protein_g;
    case 'carb_g':
        return recipe.macros.carb_g;
    case 'fat_g':
        return recipe.macros.fat_g;
    case 'fiber_g':
        return recipe.macros.fiber_g ?? 0;
    case 'sodium_mg':
        return recipe.macros.sodium_mg ?? 0;
    default:
        return null;
    }
}

export function buildOptimizationModel(request, catalog) {
    if (catalog.recipes.length === 0) {
        throw new Error('No recipes available after applying filters.');
    }

    const state = {
        variableMeta: [],
        columnLowerBounds: [],
        columnUpperBounds: [],
        columnTypes: [],
        objective: [],
        constraints: [],
        warnings: [],
    };

    const recipeCount = catalog.recipes.length;
    const dayCount = request.horizonDays;

    const xIndex = new Map();
    const yIndex = new Map();

    for (let day = 0; day < dayCount; day += 1) {
        for (let r = 0; r < recipeCount; r += 1) {
            const recipe = catalog.recipes[r];
            const idx = addVariable(
                state,
                { kind: 'x', day, recipeId: recipe.id },
                0,
                DEFAULT_SERVING_UPPER_BOUND,
                recipe.costUsd,
                request.binary.integerServings,
            );
            xIndex.set(`${day}:${recipe.id}`, idx);
        }
    }

    if (request.binary.useRecipeLevel) {
        for (let day = 0; day < dayCount; day += 1) {
            for (let r = 0; r < recipeCount; r += 1) {
                const recipe = catalog.recipes[r];
                const idx = addVariable(
                    state,
                    { kind: 'y', day, recipeId: recipe.id },
                    0,
                    1,
                    0.01,
                    true,
                );
                yIndex.set(`${day}:${recipe.id}`, idx);
            }
        }
    }

    const addSlack = (meta, penalty) => addVariable(state, meta, 0, INF_BOUND, penalty, false);

    const macroTargets = [
        { key: 'kcal', value: request.diet.kcal },
        { key: 'protein_g', value: request.diet.protein_g },
        { key: 'carb_g', value: request.diet.carb_g },
        { key: 'fat_g', value: request.diet.fat_g },
    ];

    for (let day = 0; day < dayCount; day += 1) {
        for (const { key, value } of macroTargets) {
            const base = new Map();
            for (const recipe of catalog.recipes) {
                const idx = xIndex.get(`${day}:${recipe.id}`);
                const nutrientValue = getNutrientValue(recipe, key);
                if (nutrientValue === null) continue;
                base.set(idx, nutrientValue);
            }

            const coeffMin = new Map(base);
            const slackMin = addSlack({ kind: 'slack', day, nutrient: key, bound: 'min' }, SLACK_PENALTY);
            coeffMin.set(slackMin, 1);
            addConstraint(
                state,
                { type: CONSTRAINT_TYPES.NUTRIENT_MIN, day, nutrient: key, bound: 'min', slackIndex: slackMin },
                value,
                INF_BOUND,
                coeffMin,
            );

            const coeffMax = new Map(base);
            const slackMax = addSlack({ kind: 'slack', day, nutrient: key, bound: 'max' }, SLACK_PENALTY);
            coeffMax.set(slackMax, -1);
            addConstraint(
                state,
                { type: CONSTRAINT_TYPES.NUTRIENT_MAX, day, nutrient: key, bound: 'max', slackIndex: slackMax },
                -INF_BOUND,
                value,
                coeffMax,
            );
        }
    }

    for (const [microKey, range] of Object.entries(request.micros)) {
        const nutrientPresent = catalog.recipes.some(recipe => getNutrientValue(recipe, microKey) !== null);
        if (!nutrientPresent) {
            state.warnings.push(`Micronutrient ${microKey} not available in catalog data`);
            continue;
        }

        for (let day = 0; day < dayCount; day += 1) {
            const coeffBase = new Map();
            for (const recipe of catalog.recipes) {
                const idx = xIndex.get(`${day}:${recipe.id}`);
                const nutrientValue = getNutrientValue(recipe, microKey) ?? 0;
                coeffBase.set(idx, nutrientValue);
            }

            if (range.min !== undefined) {
                const slack = addSlack(
                    { kind: 'slack', day, nutrient: microKey, bound: 'min' },
                    MICRO_SLACK_PENALTY,
                );
                const coeff = new Map(coeffBase);
                coeff.set(slack, 1);
                addConstraint(
                    state,
                    { type: CONSTRAINT_TYPES.NUTRIENT_MIN, day, nutrient: microKey, bound: 'min', slackIndex: slack },
                    range.min,
                    INF_BOUND,
                    coeff,
                );
            }

            if (range.max !== undefined) {
                const slack = addSlack(
                    { kind: 'slack', day, nutrient: microKey, bound: 'max' },
                    MICRO_SLACK_PENALTY,
                );
                const coeff = new Map(coeffBase);
                coeff.set(slack, -1);
                addConstraint(
                    state,
                    { type: CONSTRAINT_TYPES.NUTRIENT_MAX, day, nutrient: microKey, bound: 'max', slackIndex: slack },
                    -INF_BOUND,
                    range.max,
                    coeff,
                );
            }
        }
    }

    if (request.budget !== null) {
        for (let day = 0; day < dayCount; day += 1) {
            const coeff = new Map();
            for (const recipe of catalog.recipes) {
                const idx = xIndex.get(`${day}:${recipe.id}`);
                coeff.set(idx, recipe.costUsd);
            }
            addConstraint(
                state,
                { type: CONSTRAINT_TYPES.BUDGET_MAX, day },
                -INF_BOUND,
                request.budget,
                coeff,
            );
        }
    }

    for (let day = 0; day < dayCount; day += 1) {
        const coeff = new Map();
        if (request.binary.useRecipeLevel) {
            for (const recipe of catalog.recipes) {
                const idx = yIndex.get(`${day}:${recipe.id}`);
                if (idx !== undefined) {
                    coeff.set(idx, 1);
                }
            }
            addConstraint(
                state,
                { type: CONSTRAINT_TYPES.MEAL_COUNT_BINARY, day },
                request.mealsPerDay,
                request.mealsPerDay,
                coeff,
            );

            for (const recipe of catalog.recipes) {
                const xIdx = xIndex.get(`${day}:${recipe.id}`);
                const yIdx = yIndex.get(`${day}:${recipe.id}`);
                if (yIdx === undefined) continue;
                const linking = new Map();
                linking.set(xIdx, 1);
                linking.set(yIdx, -BINARY_BIG_M);
                addConstraint(
                    state,
                    { type: CONSTRAINT_TYPES.LINKING, day, recipeId: recipe.id },
                    -INF_BOUND,
                    0,
                    linking,
                );
            }
        } else {
            for (const recipe of catalog.recipes) {
                const idx = xIndex.get(`${day}:${recipe.id}`);
                coeff.set(idx, 1);
            }
            addConstraint(
                state,
                { type: CONSTRAINT_TYPES.MEAL_COUNT, day },
                request.mealsPerDay,
                request.mealsPerDay,
                coeff,
            );
        }
    }

    if (request.inventory.length > 0) {
        state.warnings.push('Inventory constraints skipped: recipe ingredient weights unavailable');
    }

    const rowCount = state.constraints.length;
    const columnCount = state.variableMeta.length;
    let nnz = 0;
    for (const row of state.constraints) {
        nnz += row.coefficients.size;
    }
    const offsets = new Int32Array(rowCount + 1);
    const indices = new Int32Array(nnz);
    const values = new Float64Array(nnz);

    let cursor = 0;
    for (let i = 0; i < rowCount; i += 1) {
        offsets[i] = cursor;
        const row = state.constraints[i];
        const entries = Array.from(row.coefficients.entries()).sort((a, b) => a[0] - b[0]);
        for (const [column, value] of entries) {
            indices[cursor] = column;
            values[cursor] = value;
            cursor += 1;
        }
    }
    offsets[rowCount] = cursor;

    const model = {
        columnCount,
        columnTypes: new Int32Array(state.columnTypes),
        columnLowerBounds: Float64Array.from(state.columnLowerBounds),
        columnUpperBounds: Float64Array.from(state.columnUpperBounds),
        rowCount,
        rowLowerBounds: Float64Array.from(state.constraints.map(c => c.lower)),
        rowUpperBounds: Float64Array.from(state.constraints.map(c => c.upper)),
        weights: { offsets, indices, values },
        objectiveLinearWeights: Float64Array.from(state.objective),
        isMaximization: false,
    };

    return {
        model,
        variableMeta: state.variableMeta,
        constraints: state.constraints,
        warnings: state.warnings,
    };
}
