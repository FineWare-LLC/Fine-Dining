// @ts-nocheck

const USER_SEARCH_FEEDBACK_MIN_HEIGHT = 72;

const USER_SEARCH_FEEDBACK_SURFACE_STYLES = {
    error: {
        bgcolor: 'rgba(244, 67, 54, 0.08)',
        border: '1px solid rgba(244, 67, 54, 0.2)',
    },
    success: {
        bgcolor: 'rgba(76, 175, 80, 0.08)',
        border: '1px solid rgba(76, 175, 80, 0.2)',
    },
    neutral: {
        bgcolor: 'transparent',
        border: '1px solid transparent',
    },
};

const USER_SEARCH_LOADING_MESSAGE = 'Loading user lookup...';
const USER_SEARCH_EMPTY_PROMPT_MESSAGE = 'Search for a user by name or email.';
const USER_SEARCH_EMPTY_RESULT_MESSAGE = (keyword) => `No users found for "${keyword}".`;
const USER_SEARCH_ERROR_MESSAGE = 'We could not read your user lookup. Please refresh the admin page.';

const createState = ({
    state,
    message,
    role = 'status',
    ariaLive = 'polite',
    ariaBusy = 'false',
    showSpinner = false,
}) => ({
    state,
    message,
    role,
    ariaLive,
    ariaBusy,
    minHeight: USER_SEARCH_FEEDBACK_MIN_HEIGHT,
    showSpinner,
});

const createErrorState = ({ message }) => createState({
    state: 'error',
    message: message || USER_SEARCH_ERROR_MESSAGE,
    role: 'alert',
    ariaLive: 'assertive',
});

const normalizeKeyword = (searchKeyword = '') => searchKeyword.trim();

export function buildUserSearchFeedbackState({
    isLoading = false,
    users = null,
    searchKeyword = '',
    errorMessage = '',
    loadingMessage = USER_SEARCH_LOADING_MESSAGE,
    emptyPromptMessage = USER_SEARCH_EMPTY_PROMPT_MESSAGE,
} = {}) {
    if (isLoading) {
        return createState({
            state: 'loading',
            message: loadingMessage,
            ariaBusy: 'true',
            showSpinner: true,
        });
    }

    if (errorMessage) {
        return createErrorState({ message: errorMessage });
    }

    if (!Array.isArray(users)) {
        return createErrorState({ message: USER_SEARCH_ERROR_MESSAGE });
    }

    const normalizedKeyword = normalizeKeyword(searchKeyword);

    if (users.length === 0) {
        return createState({
            state: 'empty',
            message: normalizedKeyword
                ? USER_SEARCH_EMPTY_RESULT_MESSAGE(normalizedKeyword)
                : emptyPromptMessage,
        });
    }

    const countLabel = users.length === 1 ? 'user' : 'users';

    return createState({
        state: 'success',
        message: normalizedKeyword
            ? `Found ${users.length} ${countLabel} for "${normalizedKeyword}".`
            : `Showing ${users.length} ${countLabel}.`,
    });
}

export function buildUserSearchFeedbackContainerStyles(state = 'empty') {
    if (state === 'success') {
        return USER_SEARCH_FEEDBACK_SURFACE_STYLES.success;
    }

    if (state === 'error') {
        return USER_SEARCH_FEEDBACK_SURFACE_STYLES.error;
    }

    return USER_SEARCH_FEEDBACK_SURFACE_STYLES.neutral;
}
