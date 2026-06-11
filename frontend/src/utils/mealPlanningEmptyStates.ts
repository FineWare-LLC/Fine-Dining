// @ts-nocheck

const MEAL_PLANNING_EMPTY_STATE_MIN_HEIGHT = 72;
const MEAL_PLANNING_EMPTY_STATE_ERROR_MESSAGE = 'We could not read this meal planning empty state. Please refresh the planner.';
const MEAL_PLANNING_CATALOG_FAILURE_MESSAGE = 'We could not load meals. Please try again.';

const MEAL_PLANNING_EMPTY_STATE_SURFACES = {
    catalog: 'catalog',
    optimizer: 'optimizer',
};

export class MealPlanningEmptyStateValidationError extends Error {
    constructor(code, message = MEAL_PLANNING_EMPTY_STATE_ERROR_MESSAGE) {
        super(message);
        this.name = 'MealPlanningEmptyStateValidationError';
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

const normalizeArray = (value) => (Array.isArray(value) ? value : null);
const normalizeString = (value) => (typeof value === 'string' ? value.trim() : '');

const createState = ({
    status,
    title = null,
    message = null,
    actionLabel = null,
    actionKind = null,
    error = null,
}) => ({
    status,
    title,
    message,
    actionLabel,
    actionKind,
    role: status === 'invalid' || status === 'error' ? 'alert' : 'status',
    ariaLive: status === 'invalid' || status === 'error' ? 'assertive' : 'polite',
    minHeight: MEAL_PLANNING_EMPTY_STATE_MIN_HEIGHT,
    showSpinner: false,
    error,
});

const invalidState = (code) => createState({
    status: 'invalid',
    title: 'Meal planning state unavailable',
    message: MEAL_PLANNING_EMPTY_STATE_ERROR_MESSAGE,
    error: new MealPlanningEmptyStateValidationError(code),
});

const buildCatalogState = ({ hasFilters }) => (
    hasFilters
        ? {
            title: 'No meals match your search or filters.',
            message: 'Try clearing your search or filters to see more meals.',
            actionLabel: 'Reset search',
            actionKind: 'reset-filters',
        }
        : {
            title: 'No meals found yet.',
            message: 'Browse recipes to add meals to the catalog.',
            actionLabel: 'Browse recipes',
            actionKind: 'browse-recipes',
        }
);

const buildOptimizerState = ({ selectedMealCount }) => (
    selectedMealCount > 0
        ? {
            title: 'No optimized meal plan generated yet.',
            message: 'Click Generate Optimized Meal Plan to see results for the meals you chose.',
            actionLabel: 'Generate Optimized Meal Plan',
            actionKind: 'generate-plan',
        }
        : {
            title: 'No optimized meal plan yet.',
            message: 'Select meals in the catalog, then generate an optimized meal plan to see results.',
            actionLabel: 'Open Meal Catalog',
            actionKind: 'open-catalog',
        }
);

export function resolveMealPlanningEmptyState({
    surface,
    meals,
    visibleMeals,
    selectedMeals,
    optimizedMealPlan,
    searchTerm = '',
    restaurantFilter = null,
    errorMessage = '',
} = {}) {
    if (surface !== MEAL_PLANNING_EMPTY_STATE_SURFACES.catalog
        && surface !== MEAL_PLANNING_EMPTY_STATE_SURFACES.optimizer) {
        return invalidState('invalidSurface');
    }

    if (surface === MEAL_PLANNING_EMPTY_STATE_SURFACES.catalog) {
        if (normalizeString(errorMessage)) {
            return createState({
                status: 'error',
                title: 'Meal catalog unavailable',
                message: MEAL_PLANNING_CATALOG_FAILURE_MESSAGE,
                actionLabel: 'Try again',
                actionKind: 'retry-catalog',
                error: new MealPlanningEmptyStateValidationError(
                    'catalogDependencyFailure',
                    MEAL_PLANNING_CATALOG_FAILURE_MESSAGE,
                ),
            });
        }

        const normalizedMeals = normalizeArray(meals);
        if (normalizedMeals === null) {
            return invalidState('invalidPayload');
        }

        const normalizedVisibleMeals = typeof visibleMeals === 'undefined'
            ? normalizedMeals
            : normalizeArray(visibleMeals);
        if (normalizedVisibleMeals === null) {
            return invalidState('invalidPayload');
        }

        if (normalizedVisibleMeals.length > 0) {
            return createState({
                status: 'resolved',
                title: null,
                message: null,
                actionLabel: null,
                actionKind: null,
            });
        }

        const hasFilters = normalizedMeals.length > 0
            && Boolean(normalizeString(searchTerm) || normalizeString(restaurantFilter));
        const catalogState = buildCatalogState({ hasFilters });
        return createState({
            status: 'empty',
            ...catalogState,
        });
    }

    const normalizedSelectedMeals = normalizeArray(selectedMeals);
    if (normalizedSelectedMeals === null) {
        return invalidState('invalidPayload');
    }

    if (optimizedMealPlan !== null
        && (typeof optimizedMealPlan !== 'object' || Array.isArray(optimizedMealPlan))) {
        return invalidState('invalidPayload');
    }

    if (optimizedMealPlan) {
        return createState({
            status: 'resolved',
            title: null,
            message: null,
            actionLabel: null,
            actionKind: null,
        });
    }

    const optimizerState = buildOptimizerState({
        selectedMealCount: normalizedSelectedMeals.length,
    });
    return createState({
        status: 'empty',
        ...optimizerState,
    });
}
