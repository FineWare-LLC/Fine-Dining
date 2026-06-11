export const MEAL_PLANNING_EMPTY_STATE_MESSAGES = {
    catalog: 'No meals found. Try adjusting your search or filters.',
    optimizer: 'No optimized meal plan generated yet. Select meals in the first tab, then '
        + 'use Generate Optimized Meal Plan below.',
};

export const getMealCatalogEmptyStateMessage = () => MEAL_PLANNING_EMPTY_STATE_MESSAGES.catalog;

export const getMealPlanOptimizerEmptyStateMessage = () =>
    MEAL_PLANNING_EMPTY_STATE_MESSAGES.optimizer;
