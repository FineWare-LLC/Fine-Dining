// @ts-nocheck

const RECIPE_SEARCH_FEEDBACK_MIN_HEIGHT = 72;

const RECIPE_SEARCH_FEEDBACK_SURFACE_STYLES = {
    error: {
        backgroundColor: 'rgba(244, 67, 54, 0.08)',
        border: '1px solid rgba(244, 67, 54, 0.2)',
    },
    success: {
        backgroundColor: 'rgba(76, 175, 80, 0.08)',
        border: '1px solid rgba(76, 175, 80, 0.2)',
    },
    neutral: {
        backgroundColor: 'transparent',
        border: '1px solid transparent',
    },
};

const RECIPE_SEARCH_LOADING_MESSAGE = 'Loading recipes...';
const RECIPE_SEARCH_EMPTY_TITLE = 'No recipes found';
const RECIPE_SEARCH_EMPTY_MESSAGE = 'Try adjusting your filters.';
const RECIPE_SEARCH_ERROR_TITLE = 'Recipe search unavailable';
const RECIPE_SEARCH_ERROR_MESSAGE = 'We could not read your recipes right now. Please refresh the page.';
const RECIPE_SEARCH_ERROR_ACTION_LABEL = 'Try again';
const RECIPE_SEARCH_ERROR_ACTION_KIND = 'retry-search';

export const RECIPE_SEARCH_RESOLVED_MESSAGE = 'Recipes loaded.';

const createState = ({
    state,
    title = null,
    message = null,
    actionLabel = null,
    actionKind = null,
    role = 'status',
    ariaLive = 'polite',
    ariaBusy = 'false',
    showSpinner = false,
    error = null,
}) => ({
    state,
    title,
    message,
    actionLabel,
    actionKind,
    role,
    ariaLive,
    ariaBusy,
    minHeight: RECIPE_SEARCH_FEEDBACK_MIN_HEIGHT,
    showSpinner,
    error,
});

const createErrorState = ({ error }) => createState({
    state: 'error',
    title: RECIPE_SEARCH_ERROR_TITLE,
    message: RECIPE_SEARCH_ERROR_MESSAGE,
    actionLabel: RECIPE_SEARCH_ERROR_ACTION_LABEL,
    actionKind: RECIPE_SEARCH_ERROR_ACTION_KIND,
    role: 'alert',
    ariaLive: 'assertive',
    error,
});

export function buildRecipeSearchFeedbackState({
    isLoading = false,
    recipes = null,
    error = null,
} = {}) {
    if (isLoading) {
        return createState({
            state: 'loading',
            message: RECIPE_SEARCH_LOADING_MESSAGE,
            ariaBusy: 'true',
            showSpinner: true,
        });
    }

    if (error) {
        return createErrorState({ error });
    }

    if (!Array.isArray(recipes)) {
        return createErrorState({
            error: new Error(RECIPE_SEARCH_ERROR_MESSAGE),
        });
    }

    if (recipes.length === 0) {
        return createState({
            state: 'empty',
            title: RECIPE_SEARCH_EMPTY_TITLE,
            message: RECIPE_SEARCH_EMPTY_MESSAGE,
        });
    }

    return createState({
        state: 'resolved',
    });
}

export function buildRecipeSearchFeedbackContainerStyles(state = 'empty') {
    if (state === 'error') {
        return RECIPE_SEARCH_FEEDBACK_SURFACE_STYLES.error;
    }

    if (state === 'resolved') {
        return RECIPE_SEARCH_FEEDBACK_SURFACE_STYLES.success;
    }

    return RECIPE_SEARCH_FEEDBACK_SURFACE_STYLES.neutral;
}
