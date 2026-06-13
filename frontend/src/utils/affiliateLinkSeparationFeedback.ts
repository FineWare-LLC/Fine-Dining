// @ts-nocheck

const AFFILIATE_LINK_SEPARATION_FEEDBACK_MIN_HEIGHT = 56;

const AFFILIATE_LINK_SEPARATION_SURFACE_STYLES = {
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

const AFFILIATE_LINK_PATTERN = /(?:https?:\/\/|www\.)\S+/i;

const AFFILIATE_LINK_SEPARATION_ERROR_MESSAGES = {
    invalidPayload: 'We could not read the selected meals. Please refresh the planner.',
    linkLeak: 'We found merchant links in recipe text. Please keep shopping links in purchaseOptions.',
};

const AFFILIATE_LINK_SEPARATION_LOADING_MESSAGE = 'Checking shopping links...';
const AFFILIATE_LINK_SEPARATION_EMPTY_TITLE = 'No meals selected yet.';
const AFFILIATE_LINK_SEPARATION_EMPTY_MESSAGE = 'Add meals to confirm shopping links stay in purchaseOptions.';
const AFFILIATE_LINK_SEPARATION_EMPTY_ACTION_LABEL = 'Open planner';
const AFFILIATE_LINK_SEPARATION_ERROR_TITLE = 'Shopping links need cleanup.';
const AFFILIATE_LINK_SEPARATION_ERROR_ACTION_LABEL = 'Refresh planner';
const AFFILIATE_LINK_SEPARATION_SUCCESS_TITLE = 'Shopping links separated.';

export class AffiliateLinkSeparationValidationError extends Error {
    constructor(reason, recipeName = '', message = AFFILIATE_LINK_SEPARATION_ERROR_MESSAGES.linkLeak) {
        super(message);
        this.name = 'AffiliateLinkSeparationValidationError';
        this.code = 'invalidAffiliateLinkData';
        this.reason = reason;
        this.recipeName = recipeName;
        this.isUserSafe = true;
    }

    toJSON() {
        return {
            name: this.name,
            code: this.code,
            message: this.message,
            reason: this.reason,
            recipeName: this.recipeName,
            isUserSafe: this.isUserSafe,
        };
    }
}

const createAffiliateLinkSeparationError = (reason, recipeName = '', message) => (
    new AffiliateLinkSeparationValidationError(reason, recipeName, message)
);

const normalizeText = (value) => {
    if (typeof value !== 'string') {
        return '';
    }

    return value.trim().replace(/\s+/g, ' ').toLowerCase();
};

const normalizeCount = (value) => {
    const numericValue = Number(value);

    if (!Number.isFinite(numericValue) || numericValue < 0) {
        return 0;
    }

    return Math.floor(numericValue);
};

const getRecipeName = (meal) => {
    const recipeNameCandidates = [
        meal?.recipeName,
        meal?.mealName,
        meal?.recipe?.recipeName,
        meal?.recipe?.mealName,
        meal?.meal?.recipeName,
        meal?.meal?.mealName,
    ];

    for (const candidate of recipeNameCandidates) {
        if (typeof candidate === 'string' && candidate.trim()) {
            return candidate.trim();
        }
    }

    return 'Recipe';
};

const collectTextFields = (meal) => ([
    meal?.recipeName,
    meal?.mealName,
    meal?.instructions,
    meal?.description,
    meal?.recipe?.recipeName,
    meal?.recipe?.mealName,
    meal?.recipe?.instructions,
    meal?.recipe?.description,
    meal?.meal?.recipeName,
    meal?.meal?.mealName,
    meal?.meal?.instructions,
    meal?.meal?.description,
].filter((value) => typeof value === 'string'));

const collectIngredientCollections = (meal) => {
    const collections = [
        meal?.ingredients,
        meal?.recipe?.ingredients,
        meal?.meal?.ingredients,
    ];

    return collections.filter(Array.isArray);
};

const findAffiliateLinkLeak = (meal) => {
    for (const fieldValue of collectTextFields(meal)) {
        if (AFFILIATE_LINK_PATTERN.test(fieldValue)) {
            return {
                reason: 'recipeText',
                recipeName: getRecipeName(meal),
            };
        }
    }

    const ingredientCollections = collectIngredientCollections(meal);
    for (const ingredients of ingredientCollections) {
        for (const ingredient of ingredients) {
            if (!ingredient || typeof ingredient !== 'object' || Array.isArray(ingredient)) {
                continue;
            }

            for (const [reason, value] of Object.entries({
                name: ingredient.name,
                canonicalName: ingredient.canonicalName,
                category: ingredient.category,
            })) {
                if (typeof value === 'string' && AFFILIATE_LINK_PATTERN.test(value)) {
                    return {
                        reason: `ingredients.${reason}`,
                        recipeName: getRecipeName(meal),
                    };
                }
            }
        }
    }

    return null;
};

const countPurchaseOptions = (meal) => {
    let linkedPurchaseOptionCount = 0;
    const ingredientCollections = collectIngredientCollections(meal);

    for (const ingredients of ingredientCollections) {
        for (const ingredient of ingredients) {
            if (!ingredient || typeof ingredient !== 'object' || Array.isArray(ingredient)) {
                continue;
            }

            if (Array.isArray(ingredient.purchaseOptions)) {
                linkedPurchaseOptionCount += ingredient.purchaseOptions.length;
            }
        }
    }

    if (Array.isArray(meal?.purchaseOptions)) {
        linkedPurchaseOptionCount += meal.purchaseOptions.length;
    }

    if (Array.isArray(meal?.recipe?.purchaseOptions)) {
        linkedPurchaseOptionCount += meal.recipe.purchaseOptions.length;
    }

    return linkedPurchaseOptionCount;
};

export function resolveAffiliateLinkSeparationState(selectedMeals = []) {
    if (typeof selectedMeals === 'undefined' || selectedMeals === null) {
        return {
            status: 'empty',
            selectedMealCount: 0,
            linkedPurchaseOptionCount: 0,
            error: null,
        };
    }

    if (!Array.isArray(selectedMeals)) {
        return {
            status: 'invalid',
            selectedMealCount: 0,
            linkedPurchaseOptionCount: 0,
            error: createAffiliateLinkSeparationError(
                'payload',
                '',
                AFFILIATE_LINK_SEPARATION_ERROR_MESSAGES.invalidPayload,
            ),
        };
    }

    if (selectedMeals.length === 0) {
        return {
            status: 'empty',
            selectedMealCount: 0,
            linkedPurchaseOptionCount: 0,
            error: null,
        };
    }

    let linkedPurchaseOptionCount = 0;

    for (const meal of selectedMeals) {
        const leak = findAffiliateLinkLeak(meal);
        if (leak) {
            return {
                status: 'invalid',
                selectedMealCount: 0,
                linkedPurchaseOptionCount: 0,
                error: createAffiliateLinkSeparationError(
                    leak.reason,
                    leak.recipeName,
                    AFFILIATE_LINK_SEPARATION_ERROR_MESSAGES.linkLeak,
                ),
            };
        }

        linkedPurchaseOptionCount += countPurchaseOptions(meal);
    }

    return {
        status: 'resolved',
        selectedMealCount: selectedMeals.length,
        linkedPurchaseOptionCount,
        error: null,
    };
}

export function buildAffiliateLinkSeparationFeedbackState({
    isLoading = false,
    affiliateLinkSeparationState = null,
} = {}) {
    if (isLoading) {
        return {
            state: 'loading',
            title: null,
            message: AFFILIATE_LINK_SEPARATION_LOADING_MESSAGE,
            actionLabel: null,
            actionKind: null,
            role: 'status',
            ariaLive: 'polite',
            ariaBusy: 'true',
            minHeight: AFFILIATE_LINK_SEPARATION_FEEDBACK_MIN_HEIGHT,
            showSpinner: true,
            error: null,
        };
    }

    if (affiliateLinkSeparationState?.status === 'invalid') {
        return {
            state: 'error',
            title: AFFILIATE_LINK_SEPARATION_ERROR_TITLE,
            message: affiliateLinkSeparationState.error?.message
                || AFFILIATE_LINK_SEPARATION_ERROR_MESSAGES.linkLeak,
            actionLabel: AFFILIATE_LINK_SEPARATION_ERROR_ACTION_LABEL,
            actionKind: 'refresh-planner',
            role: 'alert',
            ariaLive: 'assertive',
            ariaBusy: 'false',
            minHeight: AFFILIATE_LINK_SEPARATION_FEEDBACK_MIN_HEIGHT,
            showSpinner: false,
            error: affiliateLinkSeparationState.error || null,
        };
    }

    if (affiliateLinkSeparationState?.status === 'resolved') {
        const mealCount = normalizeCount(affiliateLinkSeparationState.selectedMealCount);
        const purchaseOptionCount = normalizeCount(affiliateLinkSeparationState.linkedPurchaseOptionCount);
        const purchaseOptionMessage = purchaseOptionCount === 1
            ? '1 purchase option remains linked to ingredient metadata.'
            : purchaseOptionCount > 1
                ? `${purchaseOptionCount} purchase options remain linked to ingredient metadata.`
                : 'No purchase options are attached yet.';

        return {
            state: 'success',
            title: AFFILIATE_LINK_SEPARATION_SUCCESS_TITLE,
            message: `Shopping links stay in purchaseOptions for ${mealCount} selected ${mealCount === 1 ? 'meal' : 'meals'}. ${purchaseOptionMessage}`,
            actionLabel: null,
            actionKind: null,
            role: 'status',
            ariaLive: 'polite',
            ariaBusy: 'false',
            minHeight: AFFILIATE_LINK_SEPARATION_FEEDBACK_MIN_HEIGHT,
            showSpinner: false,
            error: null,
        };
    }

    return {
        state: 'empty',
        title: AFFILIATE_LINK_SEPARATION_EMPTY_TITLE,
        message: AFFILIATE_LINK_SEPARATION_EMPTY_MESSAGE,
        actionLabel: AFFILIATE_LINK_SEPARATION_EMPTY_ACTION_LABEL,
        actionKind: 'open-planner',
        role: 'status',
        ariaLive: 'polite',
        ariaBusy: 'false',
        minHeight: AFFILIATE_LINK_SEPARATION_FEEDBACK_MIN_HEIGHT,
        showSpinner: false,
        error: null,
    };
}

export function buildAffiliateLinkSeparationFeedbackContainerStyles(state = 'empty') {
    if (state === 'success') {
        return AFFILIATE_LINK_SEPARATION_SURFACE_STYLES.success;
    }

    if (state === 'error') {
        return AFFILIATE_LINK_SEPARATION_SURFACE_STYLES.error;
    }

    return AFFILIATE_LINK_SEPARATION_SURFACE_STYLES.neutral;
}
