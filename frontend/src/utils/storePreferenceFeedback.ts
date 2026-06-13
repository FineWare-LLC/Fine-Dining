// @ts-nocheck

import {
    normalizeStorePreferenceLabel,
    StorePreferenceValidationError,
} from './storePreference';

export { StorePreferenceValidationError } from './storePreference';

const STORE_PREFERENCE_FEEDBACK_MIN_HEIGHT = 56;

const STORE_PREFERENCE_SURFACE_STYLES = {
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

const STORE_PREFERENCE_LOADING_MESSAGE = 'Resolving store preference...';
const STORE_PREFERENCE_EMPTY_TITLE = 'No store preference yet.';
const STORE_PREFERENCE_EMPTY_MESSAGE = 'Add meals with store labels to guide links and prices.';
const STORE_PREFERENCE_ERROR_TITLE = 'Store preference unavailable.';
const STORE_PREFERENCE_ERROR_MESSAGE = 'We could not read your store preference. Please refresh the planner.';
const STORE_PREFERENCE_SUCCESS_TITLE = 'Store preference ready.';

const isUserSafeError = (error) => (
    Boolean(
        error
        && typeof error === 'object'
        && error.isUserSafe === true
        && typeof error.message === 'string'
        && error.message.trim(),
    )
);

const createStorePreferenceFeedbackState = ({
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
    minHeight: STORE_PREFERENCE_FEEDBACK_MIN_HEIGHT,
    showSpinner,
    error,
});

const createEmptyStorePreferenceState = (totalMealCount = 0) => ({
    status: 'empty',
    preferredStore: null,
    matchedMealCount: 0,
    labeledMealCount: 0,
    missingMealCount: 0,
    totalMealCount,
    error: null,
});

const createInvalidStorePreferenceState = () => ({
    status: 'invalid',
    preferredStore: null,
    matchedMealCount: 0,
    labeledMealCount: 0,
    missingMealCount: 0,
    totalMealCount: 0,
    error: new StorePreferenceValidationError('invalidPayload'),
});

const normalizeMealStoreLabel = (candidate) => {
    if (candidate === null || candidate === undefined || candidate === '') {
        return null;
    }

    if (typeof candidate !== 'string') {
        return { invalid: true };
    }

    const normalizedLabel = normalizeStorePreferenceLabel(candidate);
    if (!normalizedLabel) {
        return null;
    }

    return { invalid: false, label: normalizedLabel };
};

const normalizeMealStorePurchaseOptions = (purchaseOptions) => {
    if (purchaseOptions === null || purchaseOptions === undefined) {
        return null;
    }

    if (!Array.isArray(purchaseOptions)) {
        return { invalid: true };
    }

    for (const option of purchaseOptions) {
        if (!option || typeof option !== 'object' || Array.isArray(option)) {
            return { invalid: true };
        }

        if (!('retailer' in option)) {
            continue;
        }

        const normalizedRetailer = normalizeMealStoreLabel(option.retailer);
        if (normalizedRetailer && normalizedRetailer.invalid) {
            return { invalid: true };
        }

        if (normalizedRetailer?.label) {
            return { invalid: false, label: normalizedRetailer.label };
        }
    }

    return null;
};

const collectMealStorePreferenceLabel = (meal) => {
    if (!meal || typeof meal !== 'object' || Array.isArray(meal)) {
        return { invalid: true };
    }

    const primarySources = [
        meal.priceMarket,
        meal.restaurant?.defaultPriceMarket,
        meal.recipe?.priceMarket,
    ];

    for (const source of primarySources) {
        const normalizedSource = normalizeMealStoreLabel(source);
        if (normalizedSource && normalizedSource.invalid) {
            return { invalid: true };
        }

        if (normalizedSource?.label) {
            return { invalid: false, label: normalizedSource.label };
        }
    }

    const purchaseOptionLabel = normalizeMealStorePurchaseOptions(meal.recipe?.purchaseOptions);
    if (purchaseOptionLabel && purchaseOptionLabel.invalid) {
        return { invalid: true };
    }

    if (purchaseOptionLabel?.label) {
        return { invalid: false, label: purchaseOptionLabel.label };
    }

    return { invalid: false, label: null };
};

const formatMealCount = (count, singular, plural) => (
    count === 1 ? `1 ${singular}` : `${count} ${plural}`
);

const resolvePreferredStoreLabel = (storeCounts) => {
    let matchedMealCount = 0;
    const tiedPreferredStores = [];

    for (const [label, count] of storeCounts.entries()) {
        if (count > matchedMealCount) {
            matchedMealCount = count;
            tiedPreferredStores.length = 0;
            tiedPreferredStores.push(label);
            continue;
        }

        if (count === matchedMealCount) {
            tiedPreferredStores.push(label);
        }
    }

    tiedPreferredStores.sort((left, right) => left.localeCompare(right, 'en', { sensitivity: 'base' }));

    return {
        preferredStore: tiedPreferredStores[0] || null,
        matchedMealCount,
    };
};

export function resolveStorePreferenceState(selectedMeals = []) {
    if (typeof selectedMeals === 'undefined' || selectedMeals === null) {
        return createEmptyStorePreferenceState();
    }

    if (!Array.isArray(selectedMeals)) {
        return createInvalidStorePreferenceState();
    }

    if (selectedMeals.length === 0) {
        return createEmptyStorePreferenceState();
    }

    const storeCounts = new Map();
    let labeledMealCount = 0;

    for (const meal of selectedMeals) {
        const mealStorePreference = collectMealStorePreferenceLabel(meal);
        if (mealStorePreference.invalid) {
            return createInvalidStorePreferenceState();
        }

        if (!mealStorePreference.label) {
            continue;
        }

        labeledMealCount += 1;
        storeCounts.set(
            mealStorePreference.label,
            (storeCounts.get(mealStorePreference.label) || 0) + 1,
        );
    }

    if (storeCounts.size === 0) {
        return createEmptyStorePreferenceState(selectedMeals.length);
    }

    const { preferredStore, matchedMealCount } = resolvePreferredStoreLabel(storeCounts);
    const missingMealCount = Math.max(0, selectedMeals.length - labeledMealCount);

    return {
        status: 'resolved',
        preferredStore,
        matchedMealCount,
        labeledMealCount,
        missingMealCount,
        totalMealCount: selectedMeals.length,
        error: null,
    };
}

export function buildStorePreferenceFeedbackState({
    isLoading = false,
    storePreferenceState = null,
    error = null,
} = {}) {
    if (isLoading) {
        return createStorePreferenceFeedbackState({
            state: 'loading',
            message: STORE_PREFERENCE_LOADING_MESSAGE,
            ariaBusy: 'true',
            showSpinner: true,
        });
    }

    if (error) {
        return createStorePreferenceFeedbackState({
            state: 'error',
            title: STORE_PREFERENCE_ERROR_TITLE,
            message: isUserSafeError(error)
                ? error.message.trim()
                : STORE_PREFERENCE_ERROR_MESSAGE,
            actionLabel: 'Refresh planner',
            actionKind: 'refresh-planner',
            role: 'alert',
            ariaLive: 'assertive',
            error,
        });
    }

    if (storePreferenceState?.status === 'invalid') {
        return createStorePreferenceFeedbackState({
            state: 'error',
            title: STORE_PREFERENCE_ERROR_TITLE,
            message: isUserSafeError(storePreferenceState.error)
                ? storePreferenceState.error.message.trim()
                : STORE_PREFERENCE_ERROR_MESSAGE,
            actionLabel: 'Refresh planner',
            actionKind: 'refresh-planner',
            role: 'alert',
            ariaLive: 'assertive',
            error: storePreferenceState.error || null,
        });
    }

    if (storePreferenceState?.status === 'resolved') {
        const preferredStore = storePreferenceState.preferredStore || 'your preferred store';
        const totalMealCount = Math.max(0, Math.floor(Number(storePreferenceState.totalMealCount) || 0));
        const matchedMealCount = Math.max(0, Math.floor(Number(storePreferenceState.matchedMealCount) || 0));
        const labeledMealCount = Math.max(0, Math.floor(Number(storePreferenceState.labeledMealCount) || 0));
        const missingMealCount = Math.max(0, Math.floor(Number(storePreferenceState.missingMealCount) || 0));
        const unmatchedMealCount = Math.max(0, labeledMealCount - matchedMealCount);
        const totalMealLabel = totalMealCount === 1 ? 'meal' : 'meals';
        const matchVerb = matchedMealCount === 1 ? 'matches' : 'match';
        let message = `Preferred store is ${preferredStore}. ${matchedMealCount} of ${totalMealCount} ${totalMealLabel} already ${matchVerb} it.`;

        if (unmatchedMealCount > 0) {
            const unmatchedVerb = unmatchedMealCount === 1 ? 'uses' : 'use';
            message += ` ${formatMealCount(unmatchedMealCount, 'meal', 'meals')} still ${unmatchedVerb} a different store.`;
        }

        if (missingMealCount > 0) {
            const missingVerb = missingMealCount === 1 ? 'needs' : 'need';
            message += ` ${formatMealCount(missingMealCount, 'meal', 'meals')} still ${missingVerb} a store label.`;
        }

        return createStorePreferenceFeedbackState({
            state: 'success',
            title: STORE_PREFERENCE_SUCCESS_TITLE,
            message,
        });
    }

    return createStorePreferenceFeedbackState({
        state: 'empty',
        title: STORE_PREFERENCE_EMPTY_TITLE,
        message: STORE_PREFERENCE_EMPTY_MESSAGE,
        actionLabel: 'Open planner',
        actionKind: 'open-planner',
    });
}

export function buildStorePreferenceFeedbackContainerStyles(state = 'empty') {
    if (state === 'success') {
        return STORE_PREFERENCE_SURFACE_STYLES.success;
    }

    if (state === 'error') {
        return STORE_PREFERENCE_SURFACE_STYLES.error;
    }

    return STORE_PREFERENCE_SURFACE_STYLES.neutral;
}
