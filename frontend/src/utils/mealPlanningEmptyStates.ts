// @ts-nocheck

const MEAL_PLANNING_EMPTY_STATE_MIN_HEIGHT = 72;
const MEAL_PLANNING_EMPTY_STATE_ERROR_MESSAGE = 'We could not read this meal planning empty state. Please refresh the planner.';
const MEAL_PLANNING_CATALOG_FAILURE_MESSAGE = 'We could not load meals. Please try again.';
const MEAL_PLANNING_CATALOG_LOADING_MESSAGE = 'Loading meal catalog...';

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

const normalizeWarnings = (warnings) => {
    if (!Array.isArray(warnings)) {
        return [];
    }

    const canonicalWarnings = new Map();

    warnings.forEach((warning) => {
        const message = typeof warning === 'string' ? warning.trim() : '';
        if (!message) {
            return;
        }

        const key = message.toLowerCase();
        const current = canonicalWarnings.get(key);
        if (!current) {
            canonicalWarnings.set(key, new Set([message]));
            return;
        }

        current.add(message);
    });

    return Array.from(canonicalWarnings.entries())
        .map(([key, messages]) => (messages.size === 1 ? Array.from(messages)[0] : key))
        .sort((left, right) => (
            left.toLowerCase().localeCompare(right.toLowerCase()) || left.localeCompare(right)
        ));
};

const normalizeOptimizedMealPlan = (value) => {
    if (typeof value === 'undefined' || value === null) {
        return { status: 'empty' };
    }

    if (typeof value !== 'object' || Array.isArray(value)) {
        return { status: 'invalid' };
    }

    const meals = normalizeArray(value.meals);
    if (meals === null) {
        return { status: 'invalid' };
    }

    if (meals.length === 0) {
        return { status: 'empty' };
    }

    const totalNutrition = value.totalNutrition;
    if (!totalNutrition || typeof totalNutrition !== 'object' || Array.isArray(totalNutrition)) {
        return { status: 'invalid' };
    }

    if (!Number.isFinite(Number(value.totalCost))) {
        return { status: 'invalid' };
    }

    return { status: 'resolved' };
};

const createState = ({
    status,
    title = null,
    message = null,
    actionLabel = null,
    actionKind = null,
    error = null,
    showSpinner = false,
}) => ({
    status,
    title,
    message,
    actionLabel,
    actionKind,
    role: status === 'invalid' || status === 'error' ? 'alert' : 'status',
    ariaLive: status === 'invalid' || status === 'error' ? 'assertive' : 'polite',
    minHeight: MEAL_PLANNING_EMPTY_STATE_MIN_HEIGHT,
    showSpinner,
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

const buildCatalogLoadingState = () => createState({
    status: 'loading',
    message: MEAL_PLANNING_CATALOG_LOADING_MESSAGE,
    error: null,
    showSpinner: true,
});

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

    const normalizedOptimizedMealPlan = normalizeOptimizedMealPlan(optimizedMealPlan);
    if (normalizedOptimizedMealPlan.status === 'invalid') {
        return invalidState('invalidPayload');
    }

    if (normalizedOptimizedMealPlan.status === 'resolved') {
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

export function resolveMealPlanOptimizerDisplayState({
    selectedMeals,
    optimizedMealPlan,
} = {}) {
    const emptyState = resolveMealPlanningEmptyState({
        surface: MEAL_PLANNING_EMPTY_STATE_SURFACES.optimizer,
        selectedMeals,
        optimizedMealPlan,
    });

    return {
        emptyState,
        shouldRenderOptimizedMealPlan: emptyState.status === 'resolved',
    };
}

export function buildMealPlanOptimizerFeedbackState({
    isLoading = false,
    optimizationError = null,
    selectedMeals,
    optimizedMealPlan,
    optimizationWarnings = null,
} = {}) {
    const displayState = resolveMealPlanOptimizerDisplayState({
        selectedMeals,
        optimizedMealPlan,
    });
    const emptyState = displayState.emptyState;
    const optimizationErrorMessage = typeof optimizationError === 'string'
        ? optimizationError.trim()
        : optimizationError?.message?.trim?.() || '';
    const warnings = normalizeWarnings(
        optimizationWarnings
        ?? optimizedMealPlan?.warnings
        ?? optimizedMealPlan?.diagnostics?.warnings,
    );

    if (isLoading) {
        return {
            kind: 'loading',
            role: 'status',
            ariaLive: 'polite',
            ariaBusy: true,
            minHeight: MEAL_PLANNING_EMPTY_STATE_MIN_HEIGHT,
            showSpinner: true,
            title: 'Generating optimized meal plan...',
            message: 'We are still preparing your result. This panel will update when the optimizer finishes.',
        };
    }

    if (optimizationError !== null && optimizationError !== undefined) {
        return {
            kind: 'error',
            role: 'alert',
            ariaLive: 'assertive',
            ariaBusy: false,
            minHeight: MEAL_PLANNING_EMPTY_STATE_MIN_HEIGHT,
            showSpinner: false,
            message: optimizationErrorMessage || 'Failed to generate meal plan.',
        };
    }

    if (emptyState.status === 'invalid') {
        return {
            kind: 'invalid',
            role: 'alert',
            ariaLive: 'assertive',
            ariaBusy: false,
            minHeight: MEAL_PLANNING_EMPTY_STATE_MIN_HEIGHT,
            showSpinner: false,
            message: emptyState.error.message,
        };
    }

    if (displayState.shouldRenderOptimizedMealPlan) {
        const successState = {
            kind: 'success',
            role: 'status',
            ariaLive: 'polite',
            ariaBusy: false,
            minHeight: MEAL_PLANNING_EMPTY_STATE_MIN_HEIGHT,
            showSpinner: false,
            displayState,
        };

        if (warnings.length > 0) {
            successState.warnings = warnings;
        }

        return successState;
    }

    return {
        kind: 'empty',
        ...emptyState,
        ariaBusy: false,
    };
}

export function buildMealCatalogFeedbackState({
    isLoading = false,
    meals,
    visibleMeals,
    searchTerm = '',
    restaurantFilter = null,
    errorMessage = '',
} = {}) {
    if (isLoading) {
        return buildCatalogLoadingState();
    }

    return resolveMealPlanningEmptyState({
        surface: MEAL_PLANNING_EMPTY_STATE_SURFACES.catalog,
        meals,
        visibleMeals,
        searchTerm,
        restaurantFilter,
        errorMessage,
    });
}
