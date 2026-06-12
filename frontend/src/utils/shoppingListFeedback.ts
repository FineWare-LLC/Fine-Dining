// @ts-nocheck

const GROCERY_LIST_EXPORT_FEEDBACK_MIN_HEIGHT = 56;
const GROCERY_LIST_EXPORT_FAILURE_MESSAGE = 'We could not build your grocery list. Please refresh the planner.';

const GROCERY_LIST_AGGREGATION_FEEDBACK_MIN_HEIGHT = 56;
const GROCERY_LIST_AGGREGATION_LOADING_MESSAGE = 'Building your grocery list...';
const GROCERY_LIST_AGGREGATION_EMPTY_TITLE = 'No meals selected yet.';
const GROCERY_LIST_AGGREGATION_EMPTY_MESSAGE = 'Add meals to your plan to build a grocery list.';
const GROCERY_LIST_AGGREGATION_EMPTY_ACTION_LABEL = 'Open planner';
const GROCERY_LIST_AGGREGATION_BLOCKED_TITLE = 'Grocery tools locked';
const GROCERY_LIST_AGGREGATION_BLOCKED_MESSAGE = 'Upgrade to unlock grocery tools.';
const GROCERY_LIST_AGGREGATION_BLOCKED_ACTION_LABEL = 'Upgrade for grocery tools';
const GROCERY_LIST_AGGREGATION_ERROR_TITLE = 'Grocery list unavailable';
const GROCERY_LIST_AGGREGATION_ERROR_MESSAGE = 'We could not read your grocery list. Please refresh the planner.';
const GROCERY_LIST_AGGREGATION_ERROR_ACTION_LABEL = 'Refresh planner';
const GROCERY_LIST_AGGREGATION_SUCCESS_MESSAGE = (itemCount = 0) => (
    itemCount === 1
        ? 'Your grocery list is ready for 1 ingredient.'
        : `Your grocery list is ready for ${itemCount} ingredients.`
);
const PANTRY_AWARE_GROCERY_LIST_FEEDBACK_MIN_HEIGHT = 56;
const PANTRY_AWARE_GROCERY_LIST_LOADING_MESSAGE = 'Applying pantry staples...';
const PANTRY_AWARE_GROCERY_LIST_EMPTY_TITLE = 'Pantry already covers this list.';
const PANTRY_AWARE_GROCERY_LIST_EMPTY_ACTION_LABEL = 'Open planner';
const PANTRY_AWARE_GROCERY_LIST_EMPTY_MESSAGE = 'No additional groceries are needed.';
const PANTRY_AWARE_GROCERY_LIST_ERROR_TITLE = 'Pantry data unavailable';
const PANTRY_AWARE_GROCERY_LIST_ERROR_MESSAGE = 'We could not read your pantry-aware grocery list. Please refresh the planner.';
const PANTRY_AWARE_GROCERY_LIST_ERROR_ACTION_LABEL = 'Refresh planner';
const PANTRY_AWARE_GROCERY_LIST_SUCCESS_TITLE = 'Pantry applied.';
const PANTRY_AWARE_GROCERY_LIST_SUCCESS_MESSAGE = (removedItemCount = 0) => (
    removedItemCount <= 0
        ? 'Pantry left this grocery list unchanged.'
        : removedItemCount === 1
        ? 'Pantry removed 1 item from the list.'
        : `Pantry removed ${removedItemCount} items from the list.`
);

const isUserSafeError = (error) => (
    Boolean(
        error
        && typeof error === 'object'
        && error.isUserSafe === true
        && typeof error.message === 'string'
        && error.message.trim(),
    )
);

const createGroceryListAggregationFeedbackState = ({
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
    minHeight: GROCERY_LIST_AGGREGATION_FEEDBACK_MIN_HEIGHT,
    showSpinner,
    error,
});

const getAggregationErrorMessage = (error) => (
    isUserSafeError(error)
        ? error.message.trim()
        : GROCERY_LIST_AGGREGATION_ERROR_MESSAGE
);

const getAggregationItemCount = (aggregationState) => (
    Array.isArray(aggregationState?.items) ? aggregationState.items.length : 0
);

const createPantryAwareGroceryListFeedbackState = ({
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
    minHeight: PANTRY_AWARE_GROCERY_LIST_FEEDBACK_MIN_HEIGHT,
    showSpinner,
    error,
});

const getPantryAwareItemCount = (pantryAwareState) => (
    Array.isArray(pantryAwareState?.items) ? pantryAwareState.items.length : 0
);

const normalizePantryAwareItemCount = (value) => {
    const numericValue = Number(value);

    if (!Number.isFinite(numericValue) || numericValue < 0) {
        return 0;
    }

    return Math.floor(numericValue);
};

const getPantryAwareErrorMessage = (error) => (
    isUserSafeError(error)
        ? error.message.trim()
        : PANTRY_AWARE_GROCERY_LIST_ERROR_MESSAGE
);

export function buildGroceryListExportFeedbackState({ error = null } = {}) {
    if (!error) {
        return null;
    }

    return {
        state: 'error',
        message: isUserSafeError(error)
            ? error.message.trim()
            : GROCERY_LIST_EXPORT_FAILURE_MESSAGE,
        role: 'alert',
        ariaLive: 'assertive',
        minHeight: GROCERY_LIST_EXPORT_FEEDBACK_MIN_HEIGHT,
        showSpinner: false,
    };
}

export function buildGroceryListAggregationFeedbackState({
    isLoading = false,
    locked = false,
    aggregationState = null,
} = {}) {
    if (isLoading) {
        return createGroceryListAggregationFeedbackState({
            state: 'loading',
            message: GROCERY_LIST_AGGREGATION_LOADING_MESSAGE,
            ariaBusy: 'true',
            showSpinner: true,
        });
    }

    if (locked) {
        return createGroceryListAggregationFeedbackState({
            state: 'blocked',
            title: GROCERY_LIST_AGGREGATION_BLOCKED_TITLE,
            message: GROCERY_LIST_AGGREGATION_BLOCKED_MESSAGE,
            actionLabel: GROCERY_LIST_AGGREGATION_BLOCKED_ACTION_LABEL,
            actionKind: 'upgrade-account',
        });
    }

    if (aggregationState?.status === 'invalid') {
        return createGroceryListAggregationFeedbackState({
            state: 'error',
            title: GROCERY_LIST_AGGREGATION_ERROR_TITLE,
            message: getAggregationErrorMessage(aggregationState.error),
            actionLabel: GROCERY_LIST_AGGREGATION_ERROR_ACTION_LABEL,
            actionKind: 'refresh-planner',
            role: 'alert',
            ariaLive: 'assertive',
            error: aggregationState.error || null,
        });
    }

    const itemCount = getAggregationItemCount(aggregationState);
    if (itemCount === 0) {
        return createGroceryListAggregationFeedbackState({
            state: 'empty',
            title: GROCERY_LIST_AGGREGATION_EMPTY_TITLE,
            message: GROCERY_LIST_AGGREGATION_EMPTY_MESSAGE,
            actionLabel: GROCERY_LIST_AGGREGATION_EMPTY_ACTION_LABEL,
            actionKind: 'open-planner',
        });
    }

    return createGroceryListAggregationFeedbackState({
        state: 'success',
        message: GROCERY_LIST_AGGREGATION_SUCCESS_MESSAGE(itemCount),
    });
}

export function buildPantryAwareGroceryListFeedbackState({
    isLoading = false,
    baseFeedbackState = null,
    pantryAwareState = null,
    pantryAwareGroceryList = null,
    groceryItems = [],
    groceryItemCount = 0,
} = {}) {
    if (isLoading) {
        return createPantryAwareGroceryListFeedbackState({
            state: 'loading',
            message: PANTRY_AWARE_GROCERY_LIST_LOADING_MESSAGE,
            ariaBusy: 'true',
            showSpinner: true,
        });
    }

    if (baseFeedbackState && baseFeedbackState.state !== 'success') {
        return { ...baseFeedbackState };
    }

    const resolvedPantryAwareState = pantryAwareGroceryList ?? pantryAwareState;

    if (resolvedPantryAwareState?.status === 'invalid') {
        return createPantryAwareGroceryListFeedbackState({
            state: 'error',
            title: PANTRY_AWARE_GROCERY_LIST_ERROR_TITLE,
            message: getPantryAwareErrorMessage(resolvedPantryAwareState.error),
            actionLabel: PANTRY_AWARE_GROCERY_LIST_ERROR_ACTION_LABEL,
            actionKind: 'refresh-planner',
            role: 'alert',
            ariaLive: 'assertive',
            error: resolvedPantryAwareState.error || null,
        });
    }

    const pantryItemCount = getPantryAwareItemCount(resolvedPantryAwareState);
    if (pantryItemCount === 0) {
        return createPantryAwareGroceryListFeedbackState({
            state: 'empty',
            title: PANTRY_AWARE_GROCERY_LIST_EMPTY_TITLE,
            message: PANTRY_AWARE_GROCERY_LIST_EMPTY_MESSAGE,
            actionLabel: PANTRY_AWARE_GROCERY_LIST_EMPTY_ACTION_LABEL,
            actionKind: 'open-planner',
        });
    }

    const resolvedGroceryItemCount = Array.isArray(groceryItems)
        ? groceryItems.length
        : normalizePantryAwareItemCount(groceryItemCount);
    const removedItemCount = Math.max(0, normalizePantryAwareItemCount(resolvedGroceryItemCount) - pantryItemCount);

    return createPantryAwareGroceryListFeedbackState({
        state: 'success',
        title: PANTRY_AWARE_GROCERY_LIST_SUCCESS_TITLE,
        message: PANTRY_AWARE_GROCERY_LIST_SUCCESS_MESSAGE(removedItemCount),
    });
}
