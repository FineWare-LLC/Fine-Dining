// @ts-nocheck
import { MODEL_STATUS } from './constants';
import { interpretStatus } from '../io/solverOutput';

const OPTIMIZATION_FAILURE_MESSAGE = 'Optimization failed. Please try again.';

function round(value, decimals = 2) {
    const factor = 10 ** decimals;
    return Math.round((value + Number.EPSILON) * factor) / factor;
}

function buildObjectiveResponse(request, value = null) {
    const objective = { name: 'min_cost' };
    if (value !== null && value !== undefined) {
        objective.value = value;
    }
    if (request?.objectiveWeights) {
        objective.breakdown = { ...request.objectiveWeights };
    }
    return objective;
}

export class SolverOutputValidationError extends Error {
    constructor(message = 'We could not read the solver result. Please rerun the optimizer.') {
        super(message);
        this.name = 'SolverOutputValidationError';
        this.code = 'invalidSolverOutput';
        this.isUserSafe = true;
    }
}

function readSolverSolution(solution) {
    if (!solution || typeof solution !== 'object') {
        throw new SolverOutputValidationError();
    }

    return {
        columnValues: Array.from(solution.columnValues ?? []),
        rowDualValues: Array.from(solution.rowDualValues ?? []),
    };
}

export function interpretOptimization({ request, catalog, buildResult, solverResult, modelHash, timings }) {
    const { status, solution, info, solverVersion } = solverResult;
    const statusKey = Object.keys(MODEL_STATUS).find(key => MODEL_STATUS[key] === status) || 'UNKNOWN';
    const statusMessage = interpretStatus(status).message;

    if (status === MODEL_STATUS.INFEASIBLE) {
        return {
            status: 'infeasible',
            message: statusMessage,
            objective: buildObjectiveResponse(request),
            daily: [],
            diagnostics: {
                warnings: [...buildResult.warnings, statusMessage],
                model_hash: modelHash,
                solver: { version: solverVersion, status_code: status },
                iterations: info?.simplex_iteration_count ?? null,
                solve_time_ms: timings.solveMs,
            },
        };
    }

    if (status !== MODEL_STATUS.OPTIMAL) {
        return {
            status: 'error',
            message: OPTIMIZATION_FAILURE_MESSAGE,
            objective: buildObjectiveResponse(request),
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

    const { columnValues, rowDualValues } = readSolverSolution(solution);

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
        const sortedSelections = selections.toSorted((a, b) => {
            const servingsDelta = b.servings - a.servings;
            if (Math.abs(servingsDelta) > 1e-9) return servingsDelta;
            return a.recipe.id.localeCompare(b.recipe.id);
        });

        const canonicalSelections = sortedSelections.map(sel => {
            const servings = request.binary.integerServings
                ? Math.round(sel.servings)
                : round(sel.servings, 2);

            return { ...sel, servings };
        });

        const meals = canonicalSelections.map(sel => ({
            name: sel.recipe.mealName,
            items: [
                {
                    recipe_id: sel.recipe.id,
                    servings: sel.servings,
                },
            ],
        }));

        const totals = canonicalSelections.reduce(
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

    const shadowPriceTotals = {};
    for (const constraint of buildResult.constraints) {
        if (!constraint.nutrient) continue;
        const dual = rowDualValues[constraint.index];
        if (!Number.isFinite(dual)) continue;
        const key = constraint.nutrient;
        if (shadowPriceTotals[key] === undefined) shadowPriceTotals[key] = 0;
        shadowPriceTotals[key] += dual;
    }
    const shadowPrices = Object.fromEntries(
        Object.entries(shadowPriceTotals).map(([key, total]) => [key, round(total, 4)]),
    );

    const objectiveValue = info?.objective_function_value ?? null;

    return {
        status: 'optimal',
        objective: buildObjectiveResponse(request, objectiveValue !== null ? round(objectiveValue, 2) : null),
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
