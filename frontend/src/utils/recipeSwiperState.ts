export type RecipeSwiperCard = {
    id?: string;
    [key: string]: unknown;
};

const RECIPE_SWIPER_WINDOW_ERROR_MESSAGE = 'We could not read this recipe swipe state. Please refresh the recipes page.';
export const RECIPE_SWIPER_FAILURE_MESSAGE = 'We could not save that swipe. Please try again.';

export class RecipeSwiperWindowValidationError extends Error {
    code: string;
    isUserSafe: boolean;

    constructor(code: string, message = RECIPE_SWIPER_WINDOW_ERROR_MESSAGE) {
        super(message);
        this.name = 'RecipeSwiperWindowValidationError';
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

export type ResolveRecipeSwiperWindowArgs = {
    recipes?: RecipeSwiperCard[];
    currentIndex?: number;
    swipedRecipeIds?: {
        has: (recipeId: string) => boolean;
    } | Set<string> | string[];
    windowSize?: number;
};

export type RecipeSwiperWindowValidationInput = {
    recipes: RecipeSwiperCard[];
    currentIndex: number;
    swipedRecipeIds: {
        has: (recipeId: string) => boolean;
    } | Set<string>;
    windowSize: number;
};

export type RecipeSwiperWindowValidationSuccess = {
    valid: true;
    input: RecipeSwiperWindowValidationInput;
    error: null;
};

export type RecipeSwiperWindowValidationFailure = {
    valid: false;
    input: null;
    error: RecipeSwiperWindowValidationError;
};

export type RecipeSwiperWindowValidationResult = (
    RecipeSwiperWindowValidationSuccess
    | RecipeSwiperWindowValidationFailure
);

const createRecipeSwiperWindowValidationError = (code: string = 'invalidPayload') => (
    new RecipeSwiperWindowValidationError(code, RECIPE_SWIPER_WINDOW_ERROR_MESSAGE)
);

const isUserSafeError = (error: unknown) => (
    Boolean(
        error
        && typeof error === 'object'
        && (error as { isUserSafe?: unknown }).isUserSafe === true
        && typeof (error as { message?: unknown }).message === 'string'
        && (error as { message?: string }).message?.trim(),
    )
);

const normalizeRecipeSwiperDecisionIdSet = (value: unknown) => {
    if (value instanceof Set || Array.isArray(value)) {
        return new Set(value);
    }

    return new Set<string>();
};

const normalizeRecipeSwiperWindowIdCollection = (value: unknown) => {
    if (value instanceof Set || Array.isArray(value)) {
        return new Set(value);
    }

    if (value != null && typeof (value as { has?: unknown }).has === 'function') {
        return value as { has: (recipeId: string) => boolean };
    }

    return new Set<string>();
};

const normalizeRecipeSwiperDecisionState = (state: {
    currentIndex?: unknown;
    swipedRecipeIds?: unknown;
} = {}) => {
    const currentIndex = Number((state as { currentIndex?: unknown }).currentIndex);
    const swipedRecipeIds = (state as { swipedRecipeIds?: unknown }).swipedRecipeIds;

    return {
        currentIndex: Number.isFinite(currentIndex) && currentIndex > 0
            ? Math.floor(currentIndex)
            : 0,
        swipedRecipeIds: normalizeRecipeSwiperDecisionIdSet(swipedRecipeIds),
    };
};

export function applyRecipeSwiperDecision(
    state: {
        currentIndex?: number;
        swipedRecipeIds?: Set<string> | string[];
    } = {},
    recipeId?: string,
) {
    const normalizedState = normalizeRecipeSwiperDecisionState(state);
    const nextSwipedRecipeIds = new Set(normalizedState.swipedRecipeIds);

    if (typeof recipeId === 'string' && recipeId.trim()) {
        nextSwipedRecipeIds.add(recipeId);
    }

    return {
        currentIndex: normalizedState.currentIndex + 1,
        swipedRecipeIds: nextSwipedRecipeIds,
    };
}

export function rollbackRecipeSwiperDecision(
    state: {
        currentIndex?: number;
        swipedRecipeIds?: Set<string> | string[];
    } = {},
    recipeId?: string,
) {
    const normalizedState = normalizeRecipeSwiperDecisionState(state);
    const nextSwipedRecipeIds = new Set(normalizedState.swipedRecipeIds);

    if (typeof recipeId === 'string' && recipeId.trim()) {
        nextSwipedRecipeIds.delete(recipeId);
    }

    return {
        currentIndex: Math.max(0, normalizedState.currentIndex - 1),
        swipedRecipeIds: nextSwipedRecipeIds,
    };
}

export function buildRecipeSwiperFailureMessage(error: unknown = null) {
    if (isUserSafeError(error)) {
        return (error as { message: string }).message.trim();
    }

    return RECIPE_SWIPER_FAILURE_MESSAGE;
}

export function validateRecipeSwiperWindowInput(
    input: ResolveRecipeSwiperWindowArgs | null | undefined = {},
): RecipeSwiperWindowValidationResult {
    const {
        recipes = [],
        currentIndex = 0,
        swipedRecipeIds = new Set<string>(),
        windowSize = 3,
    } = input ?? {};

    if (!Array.isArray(recipes)) {
        return {
            valid: false,
            input: null,
            error: createRecipeSwiperWindowValidationError(),
        };
    }

    if (!Number.isFinite(currentIndex) || currentIndex < 0) {
        return {
            valid: false,
            input: null,
            error: createRecipeSwiperWindowValidationError(),
        };
    }

    if (!Number.isFinite(windowSize) || windowSize < 1) {
        return {
            valid: false,
            input: null,
            error: createRecipeSwiperWindowValidationError(),
        };
    }

    if (
        swipedRecipeIds != null
        && !Array.isArray(swipedRecipeIds)
        && typeof swipedRecipeIds.has !== 'function'
    ) {
        return {
            valid: false,
            input: null,
            error: createRecipeSwiperWindowValidationError(),
        };
    }

    return {
        valid: true,
        input: {
            recipes,
            currentIndex: Math.floor(currentIndex),
            swipedRecipeIds: normalizeRecipeSwiperWindowIdCollection(swipedRecipeIds),
            windowSize: Math.floor(windowSize),
        },
        error: null,
    };
}

export function resolveRecipeSwiperWindow(
    input: ResolveRecipeSwiperWindowArgs | null | undefined = {},
) {
    const {
        recipes = [],
        currentIndex = 0,
        swipedRecipeIds = new Set<string>(),
        windowSize = 3,
    } = input ?? {};

    const validation = validateRecipeSwiperWindowInput({
        recipes,
        currentIndex,
        swipedRecipeIds,
        windowSize,
    });

    if (!validation.valid) {
        return [];
    }

    const {
        recipes: recipeList,
        currentIndex: startIndex,
        swipedRecipeIds: validatedSwipedRecipeIds,
        windowSize: visibleWindowSize,
    } = validation.input;

    const hasSwipedRecipe = validatedSwipedRecipeIds != null && typeof validatedSwipedRecipeIds.has === 'function'
        ? (recipeId: string) => validatedSwipedRecipeIds.has(recipeId)
        : () => false;

    const visibleRecipes: RecipeSwiperCard[] = [];

    for (let index = startIndex; index < recipeList.length && visibleRecipes.length < visibleWindowSize; index += 1) {
        const recipe = recipeList[index];

        if (!recipe || typeof recipe !== 'object') {
            continue;
        }

        if (typeof recipe.id === 'string' && hasSwipedRecipe(recipe.id)) {
            continue;
        }

        visibleRecipes.push(recipe);
    }

    return visibleRecipes;
}
