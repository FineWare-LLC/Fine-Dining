/**
 * optimizationMutations.js
 *
 * GraphQL resolvers for meal plan optimization mutations.
 */

import { withErrorHandling } from './baseImports.js';
import OptimizationService from '@/services/OptimizationService.js';

/**
 * Generates an optimized meal plan for the authenticated user.
 * The plan is optimized to meet the user's nutritional targets
 * while minimizing the total cost.
 *
 * @function generateOptimizedMealPlan
 * @param {Object} _parent - Parent resolver result.
 * @param {Object} _args - Arguments (none required for this mutation).
 * @param {Object} context - GraphQL context containing the authenticated user.
 * @returns {Promise<Object>} The generated meal plan.
 * @throws {Error} If the user is not authenticated.
 * @throws {Error} If no suitable meals are found after filtering.
 * @throws {Error} If the optimization fails to find a feasible solution.
 */
export const generateOptimizedMealPlan = withErrorHandling(async (
    _parent,
    { selectedMealIds, customNutritionTargets },
    context,
) => {
    // Authentication check
    if (!context.user?.userId) {
        throw new Error('Authentication required');
    }

    // Get the user ID from the context
    const {userId} = context.user;

    // Generate the optimized meal plan with optional selected meals and custom nutrition targets
    const result = await OptimizationService.generateOptimizedMealPlan(
        userId,
        selectedMealIds,
        customNutritionTargets,
    );

    return result;
});
