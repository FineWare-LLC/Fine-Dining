const RECIPE_SWIPER_FEEDBACK_MIN_HEIGHT = 384;
const RECIPE_SWIPER_LOADING_MESSAGE = 'Finding delicious recipes for you...';
export const RECIPE_SWIPER_RESOLVED_MESSAGE = 'Recipes loaded.';
const RECIPE_SWIPER_EMPTY_TITLE = 'No more recipes to explore!';
const RECIPE_SWIPER_EMPTY_MESSAGE = "You've seen all available recipes matching your preferences.";
const RECIPE_SWIPER_EMPTY_ACTION_LABEL = 'Start Over';
const RECIPE_SWIPER_EMPTY_ACTION_KIND = 'reset-swiper';
const RECIPE_SWIPER_ERROR_TITLE = 'Recipe swiper unavailable';
const RECIPE_SWIPER_ERROR_MESSAGE = 'We could not load recipes. Please try again.';
const RECIPE_SWIPER_ERROR_ACTION_LABEL = 'Try Again';
const RECIPE_SWIPER_ERROR_ACTION_KIND = 'retry-swiper';
const RECIPE_SWIPER_WINDOW_ERROR_MESSAGE = 'We could not read this recipe swipe state. Please refresh the recipes page.';

export type RecipeSwiperFeedbackStatus = 'loading' | 'empty' | 'resolved' | 'error';
export type RecipeSwiperFeedbackRole = 'status' | 'alert';
export type RecipeSwiperFeedbackAriaLive = 'polite' | 'assertive';
export type RecipeSwiperFeedbackAriaBusy = 'true' | 'false';

export type RecipeSwiperFeedbackState = {
    state: RecipeSwiperFeedbackStatus;
    title: string | null;
    message: string | null;
    actionLabel: string | null;
    actionKind: string | null;
    role: RecipeSwiperFeedbackRole;
    ariaLive: RecipeSwiperFeedbackAriaLive;
    ariaBusy: RecipeSwiperFeedbackAriaBusy;
    minHeight: number;
    showSpinner: boolean;
    error: unknown | null;
};

export type BuildRecipeSwiperFeedbackStateInput = {
    isLoading?: boolean;
    availableRecipeCount?: number;
    visibleRecipeCount?: number;
    error?: unknown;
};

type RecipeSwiperFeedbackStateInput = {
    state: RecipeSwiperFeedbackStatus;
    title?: string | null;
    message?: string | null;
    actionLabel?: string | null;
    actionKind?: string | null;
    role?: RecipeSwiperFeedbackRole;
    ariaLive?: RecipeSwiperFeedbackAriaLive;
    ariaBusy?: RecipeSwiperFeedbackAriaBusy;
    showSpinner?: boolean;
    error?: unknown | null;
};

type UserSafeError = {
    isUserSafe: true;
    message: string;
};

const isUserSafeError = (error: unknown): error is UserSafeError => (
    Boolean(
        error
        && typeof error === 'object'
        && (error as { isUserSafe?: unknown }).isUserSafe === true
        && typeof (error as { message?: unknown }).message === 'string'
        && (error as { message: string }).message.trim(),
    )
);

const createValidationError = (code: string = 'invalidPayload'): RecipeSwiperFeedbackValidationError => (
    new RecipeSwiperFeedbackValidationError(code, RECIPE_SWIPER_WINDOW_ERROR_MESSAGE)
);

const normalizeCount = (value: unknown): number => {
    const count = Number(value);

    if (!Number.isFinite(count) || count < 0) {
        return Number.NaN;
    }

    return Math.floor(count);
};

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
}: RecipeSwiperFeedbackStateInput): RecipeSwiperFeedbackState => ({
    state,
    title,
    message,
    actionLabel,
    actionKind,
    role,
    ariaLive,
    ariaBusy,
    minHeight: RECIPE_SWIPER_FEEDBACK_MIN_HEIGHT,
    showSpinner,
    error,
});

const createErrorState = ({
    error,
    errorTitle = RECIPE_SWIPER_ERROR_TITLE,
    errorMessage = RECIPE_SWIPER_ERROR_MESSAGE,
    errorActionLabel = RECIPE_SWIPER_ERROR_ACTION_LABEL,
    errorActionKind = RECIPE_SWIPER_ERROR_ACTION_KIND,
}: {
    error: unknown;
    errorTitle?: string;
    errorMessage?: string;
    errorActionLabel?: string;
    errorActionKind?: string;
}): RecipeSwiperFeedbackState => createState({
    state: 'error',
    title: errorTitle,
    message: isUserSafeError(error) ? error.message.trim() : errorMessage,
    actionLabel: errorActionLabel,
    actionKind: errorActionKind,
    role: 'alert',
    ariaLive: 'assertive',
    error,
});

export class RecipeSwiperFeedbackValidationError extends Error {
    code: string;
    isUserSafe: boolean;

    constructor(code: string, message = RECIPE_SWIPER_WINDOW_ERROR_MESSAGE) {
        super(message);
        this.name = 'RecipeSwiperFeedbackValidationError';
        this.code = code;
        this.isUserSafe = true;
    }

    toJSON(): {
        name: string;
        code: string;
        message: string;
        isUserSafe: boolean;
    } {
        return {
            name: this.name,
            code: this.code,
            message: this.message,
            isUserSafe: this.isUserSafe,
        };
    }
}

export function buildRecipeSwiperFeedbackState({
    isLoading = false,
    availableRecipeCount = 0,
    visibleRecipeCount = 0,
    error = null,
}: BuildRecipeSwiperFeedbackStateInput = {}): RecipeSwiperFeedbackState {
    if (isLoading) {
        return createState({
            state: 'loading',
            message: RECIPE_SWIPER_LOADING_MESSAGE,
            ariaBusy: 'true',
            showSpinner: true,
        });
    }

    if (error) {
        return createErrorState({ error });
    }

    const normalizedAvailableRecipeCount = normalizeCount(availableRecipeCount);
    const normalizedVisibleRecipeCount = normalizeCount(visibleRecipeCount);

    if (
        Number.isNaN(normalizedAvailableRecipeCount)
        || Number.isNaN(normalizedVisibleRecipeCount)
        || normalizedVisibleRecipeCount > normalizedAvailableRecipeCount
    ) {
        return createErrorState({
            error: createValidationError('invalidPayload'),
            errorMessage: RECIPE_SWIPER_WINDOW_ERROR_MESSAGE,
        });
    }

    if (normalizedVisibleRecipeCount === 0 || normalizedAvailableRecipeCount === 0) {
        return createState({
            state: 'empty',
            title: RECIPE_SWIPER_EMPTY_TITLE,
            message: RECIPE_SWIPER_EMPTY_MESSAGE,
            actionLabel: RECIPE_SWIPER_EMPTY_ACTION_LABEL,
            actionKind: RECIPE_SWIPER_EMPTY_ACTION_KIND,
        });
    }

    return createState({
        state: 'resolved',
    });
}
