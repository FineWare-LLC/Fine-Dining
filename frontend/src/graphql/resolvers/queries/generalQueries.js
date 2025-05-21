import { withErrorHandling } from './baseQueries.js';
import { run as presolve } from '@highs/src/presolve/index.mjs';
import { readMeals, buildMealPlanModel } from '@highs/src/solver/index.mjs';

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
    const data = await readMeals();
    const baseModel = buildMealPlanModel(data);
    const presolved = presolve(baseModel);
    return {
        before: baseModel.columnCount,
        after: presolved.columnCount,
    };
});
