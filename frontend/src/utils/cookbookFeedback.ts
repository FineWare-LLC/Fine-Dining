// @ts-nocheck

const COOKBOOK_LIBRARY_FEEDBACK_MIN_HEIGHT = 72;

const COOKBOOK_LIBRARY_FEEDBACK_SURFACE_STYLES = {
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

const COOKBOOK_LIBRARY_LOADING_MESSAGE = 'Loading your saved recipes...';
export const COOKBOOK_LIBRARY_RESOLVED_MESSAGE = 'Cookbooks loaded.';
const COOKBOOK_LIBRARY_EMPTY_TITLE = 'No cookbooks yet';
const COOKBOOK_LIBRARY_EMPTY_MESSAGE = 'Create a cookbook to start saving recipes.';
const COOKBOOK_LIBRARY_EMPTY_ACTION_LABEL = 'Create cookbook';
const COOKBOOK_LIBRARY_EMPTY_ACTION_KIND = 'open-create-cookbook';
const COOKBOOK_LIBRARY_ERROR_TITLE = 'Cookbooks unavailable';
const COOKBOOK_LIBRARY_ERROR_MESSAGE = 'We could not read your saved recipe state. Please refresh the cookbook.';
const COOKBOOK_LIBRARY_ERROR_ACTION_LABEL = 'Try again';
const COOKBOOK_LIBRARY_ERROR_ACTION_KIND = 'retry-cookbooks';

const isUserSafeError = (error) => (
    Boolean(
        error
        && typeof error === 'object'
        && error.isUserSafe === true
        && typeof error.message === 'string'
        && error.message.trim(),
    )
);

const createValidationErrorMessage = () => COOKBOOK_LIBRARY_ERROR_MESSAGE;

export class CookbookLibraryFeedbackValidationError extends Error {
    constructor(code, message = createValidationErrorMessage()) {
        super(message);
        this.name = 'CookbookLibraryFeedbackValidationError';
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

const createValidationFailure = (code = 'invalidPayload') => (
    new CookbookLibraryFeedbackValidationError(code)
);

const normalizeCookbooks = (cookbooks) => {
    if (cookbooks === undefined || cookbooks === null) {
        return null;
    }

    if (!Array.isArray(cookbooks)) {
        return { invalid: true };
    }

    const isValidCookbook = (cookbook) => (
        Boolean(
            cookbook
            && typeof cookbook === 'object'
            && !Array.isArray(cookbook)
            && typeof cookbook.id === 'string'
            && cookbook.id.trim()
            && typeof cookbook.name === 'string'
            && cookbook.name.trim()
            && typeof cookbook.isPublic === 'boolean'
            && Array.isArray(cookbook.entries),
        )
    );

    if (cookbooks.some((cookbook) => !isValidCookbook(cookbook))) {
        return { invalid: true };
    }

    return cookbooks;
};

const createCookbookLibraryFeedbackState = ({
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
    minHeight: COOKBOOK_LIBRARY_FEEDBACK_MIN_HEIGHT,
    showSpinner,
    error,
});

const createCookbookLibraryErrorState = ({
    error,
    errorTitle = COOKBOOK_LIBRARY_ERROR_TITLE,
    errorMessage = COOKBOOK_LIBRARY_ERROR_MESSAGE,
    errorActionLabel = COOKBOOK_LIBRARY_ERROR_ACTION_LABEL,
    errorActionKind = COOKBOOK_LIBRARY_ERROR_ACTION_KIND,
}) => createCookbookLibraryFeedbackState({
    state: 'error',
    title: errorTitle,
    message: isUserSafeError(error) ? error.message.trim() : errorMessage,
    actionLabel: errorActionLabel,
    actionKind: errorActionKind,
    role: 'alert',
    ariaLive: 'assertive',
    error,
});

export function buildCookbookLibraryFeedbackState({
    isLoading = false,
    cookbooks = null,
    error = null,
    loadingMessage = COOKBOOK_LIBRARY_LOADING_MESSAGE,
    emptyTitle = COOKBOOK_LIBRARY_EMPTY_TITLE,
    emptyMessage = COOKBOOK_LIBRARY_EMPTY_MESSAGE,
    emptyActionLabel = COOKBOOK_LIBRARY_EMPTY_ACTION_LABEL,
    emptyActionKind = COOKBOOK_LIBRARY_EMPTY_ACTION_KIND,
    errorTitle = COOKBOOK_LIBRARY_ERROR_TITLE,
    errorMessage = COOKBOOK_LIBRARY_ERROR_MESSAGE,
    errorActionLabel = COOKBOOK_LIBRARY_ERROR_ACTION_LABEL,
    errorActionKind = COOKBOOK_LIBRARY_ERROR_ACTION_KIND,
} = {}) {
    if (isLoading) {
        return createCookbookLibraryFeedbackState({
            state: 'loading',
            message: loadingMessage,
            ariaBusy: 'true',
            showSpinner: true,
        });
    }

    const normalizedCookbooks = normalizeCookbooks(cookbooks);

    if (error) {
        return createCookbookLibraryErrorState({
            error,
            errorTitle,
            errorMessage,
            errorActionLabel,
            errorActionKind,
        });
    }

    if (normalizedCookbooks === null) {
        return createCookbookLibraryErrorState({
            error: createValidationFailure('invalidPayload'),
            errorTitle,
            errorMessage,
            errorActionLabel,
            errorActionKind,
        });
    }

    if (normalizedCookbooks.invalid) {
        return createCookbookLibraryErrorState({
            error: createValidationFailure('invalidPayload'),
            errorTitle,
            errorMessage,
            errorActionLabel,
            errorActionKind,
        });
    }

    if (normalizedCookbooks.length === 0) {
        return createCookbookLibraryFeedbackState({
            state: 'empty',
            title: emptyTitle,
            message: emptyMessage,
            actionLabel: emptyActionLabel,
            actionKind: emptyActionKind,
        });
    }

    return createCookbookLibraryFeedbackState({
        state: 'resolved',
    });
}

export function buildCookbookLibraryFeedbackContainerStyles(state = 'empty') {
    if (state === 'error') {
        return COOKBOOK_LIBRARY_FEEDBACK_SURFACE_STYLES.error;
    }

    if (state === 'resolved') {
        return COOKBOOK_LIBRARY_FEEDBACK_SURFACE_STYLES.success;
    }

    return COOKBOOK_LIBRARY_FEEDBACK_SURFACE_STYLES.neutral;
}
