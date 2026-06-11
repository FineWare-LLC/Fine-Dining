import { withErrorHandling } from './baseQueries.js';

// Conditional imports for optimization features
let presolve, readMeals, buildMealPlanModel;
let optimizationAvailable = false;

try {
    const presolveModule = await import('@highs/src/presolve/index.mjs');
    const solverModule = await import('@highs/src/solver/index.mjs');
    presolve = presolveModule.run;
    readMeals = solverModule.readMeals;
    buildMealPlanModel = solverModule.buildMealPlanModel;
    optimizationAvailable = true;
} catch (error) {
    console.warn('Optimization features unavailable (highs-addon not properly installed):', error.message);
    optimizationAvailable = false;
}

/**
 * Basic health check query.
 *
 * @function ping
 * @returns {string} "pong"
 */
export const ping = withErrorHandling(() => 'pong');

/**
 * Returns variable counts before and after presolve.
 */
export const presolveStats = withErrorHandling(async () => {
    if (!optimizationAvailable) {
        throw new Error('Optimization features are not available. Please install highs-addon properly.');
    }

    const data = await readMeals();
    const baseModel = buildMealPlanModel(data);
    const presolved = presolve(baseModel);
    return {
        before: baseModel.columnCount,
        after: presolved.columnCount,
    };
});
