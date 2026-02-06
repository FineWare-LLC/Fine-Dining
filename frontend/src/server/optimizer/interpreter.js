import { MODEL_STATUS } from './constants.js';

function round(value, decimals = 2) {
    const factor = 10 ** decimals;
    return Math.round((value + Number.EPSILON) * factor) / factor;
}

export function interpretOptimization({ request, catalog, buildResult, solverResult, modelHash, timings }) {
    const { status, solution, info, solverVersion } = solverResult;
    const statusKey = Object.keys(MODEL_STATUS).find(key => MODEL_STATUS[key] === status) || 'UNKNOWN';

    if (status === MODEL_STATUS.INFEASIBLE) {
        return {
            status: 'infeasible',
            objective: { name: 'min_cost' },
            daily: [],
            diagnostics: {
                warnings: buildResult.warnings,
                model_hash: modelHash,
                solver: { version: solverVersion, status_code: status },
                iterations: info?.simplex_iteration_count ?? null,
                solve_time_ms: timings.solveMs,
            },
        };
    }

    if (status !== MODEL_STATUS.OPTIMAL) {
        return {
            status: 'partial',
            objective: { name: 'min_cost' },
            daily: [],
            diagnostics: {
                warnings: [
                    ...buildResult.warnings,
                    `Solver ended with status ${statusKey}`,
                ],
                model_hash: modelHash,
                solver: { version: solverVersion, status_code: status },
                iterations: info?.simplex_iteration_count ?? null,
                solve_time_ms: timings.solveMs,
            },
        };
    }

    const columnValues = Array.from(solution.columnValues ?? []);
    const rowDualValues = Array.from(solution.rowDualValues ?? []);

    const recipeMap = new Map(catalog.recipes.map(recipe => [recipe.id, recipe]));

    const daySummaries = [];
    for (let day = 0; day < request.horizonDays; day += 1) {
        const selections = [];
        for (const meta of buildResult.variableMeta) {
            if (meta.kind !== 'x' || meta.day !== day) continue;
            const servings = columnValues[meta.index] ?? 0;
            if (servings <= 1e-6) continue;
            const recipe = recipeMap.get(meta.recipeId);
            if (!recipe) continue;
            selections.push({ recipe, servings });
        }
        selections.sort((a, b) => b.servings - a.servings);

        const meals = selections.map(sel => ({
            name: sel.recipe.mealName,
            items: [
                {
                    recipe_id: sel.recipe.id,
                    servings: request.binary.integerServings ? Math.round(sel.servings) : round(sel.servings, 2),
                },
            ],
        }));

        const totals = selections.reduce(
            (acc, { recipe, servings }) => {
                acc.kcal += recipe.macros.kcal * servings;
                acc.protein_g += recipe.macros.protein_g * servings;
                acc.carb_g += recipe.macros.carb_g * servings;
                acc.fat_g += recipe.macros.fat_g * servings;
                acc.cost_usd += recipe.costUsd * servings;
                return acc;
            },
            { kcal: 0, protein_g: 0, carb_g: 0, fat_g: 0, cost_usd: 0 },
        );

        daySummaries.push({
            day_index: day + 1,
            meals,
            totals: {
                kcal: round(totals.kcal),
                protein_g: round(totals.protein_g),
                carb_g: round(totals.carb_g),
                fat_g: round(totals.fat_g),
                cost_usd: round(totals.cost_usd, 2),
            },
        });
    }

    const shadowPrices = {};
    for (const constraint of buildResult.constraints) {
        if (!constraint.nutrient) continue;
        const dual = rowDualValues[constraint.index];
        if (!Number.isFinite(dual)) continue;
        const key = constraint.nutrient;
        if (!shadowPrices[key]) shadowPrices[key] = 0;
        shadowPrices[key] += round(dual, 4);
    }

    const objectiveValue = info?.objective_function_value ?? null;

    return {
        status: 'optimal',
        objective: {
            name: 'min_cost',
            value: objectiveValue !== null ? round(objectiveValue, 2) : null,
        },
        daily: daySummaries,
        shadow_prices: shadowPrices,
        diagnostics: {
            solve_time_ms: timings.solveMs,
            iterations: info?.simplex_iteration_count ?? null,
            warnings: buildResult.warnings,
            model_hash: modelHash,
            solver: { version: solverVersion, status_code: status },
        },
    };
}

