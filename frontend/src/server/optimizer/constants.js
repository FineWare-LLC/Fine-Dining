export const DEFAULT_SERVING_UPPER_BOUND = 6;
export const BINARY_BIG_M = 6;
export const SLACK_PENALTY = 25;
export const MICRO_SLACK_PENALTY = 15;
export const ENERGY_TOLERANCE = 0.12;
export const HASH_NAMESPACE = 'meal-optimizer:v1';
export const MAX_RECIPES = 400;
export const BUDGET_TOLERANCE = 1e-6;
export const INF_BOUND = 1e9;

export const MODEL_STATUS = {
    NOTSET: 0,
    LOAD_ERROR: 1,
    MODEL_ERROR: 2,
    PRESOLVE_ERROR: 3,
    SOLVE_ERROR: 4,
    POSTSOLVE_ERROR: 5,
    TIMELIMIT_FEASIBLE: 6,
    OPTIMAL: 7,
    INFEASIBLE: 8,
    UNBOUNDED: 9,
    UNBOUNDED_OR_INFEASIBLE: 10,
    MODEL_EMPTY: 11,
    PRIMAL_FEASIBLE: 12,
    DUAL_FEASIBLE: 13,
    PRESOLVED: 14,
    POSTSOLVED: 15,
};

export const CONSTRAINT_TYPES = {
    NUTRIENT_MIN: 'nutrient-min',
    NUTRIENT_MAX: 'nutrient-max',
    BUDGET_MAX: 'budget-max',
    MEAL_COUNT: 'meal-count',
    MEAL_COUNT_BINARY: 'meal-count-binary',
    LINKING: 'linking',
};

