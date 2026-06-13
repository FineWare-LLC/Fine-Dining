// @ts-nocheck
import { buildAuthFeedbackState } from '@/context/authUtils';
import { validateHouseholdShoppingOwnership } from './householdShoppingOwnership';

const HOUSEHOLD_SHOPPING_OWNERSHIP_EMPTY_MESSAGE = 'Open a household to review shopping ownership.';
const HOUSEHOLD_SHOPPING_OWNERSHIP_LOADING_MESSAGE = 'Checking shopping ownership...';
const HOUSEHOLD_SHOPPING_OWNERSHIP_READY_MESSAGE = 'Your shopping ownership assignment is ready to review.';
const HOUSEHOLD_SHOPPING_OWNERSHIP_ERROR_MESSAGE =
    'We could not read your shopping ownership assignment. Please refresh the planner.';

const HOUSEHOLD_SHOPPING_OWNERSHIP_SURFACE_STYLES = {
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

const isPlainObject = (value) => (
    value !== null
    && typeof value === 'object'
    && !Array.isArray(value)
);

const INVALID_HOUSEHOLD_SNAPSHOT = Symbol('invalidHouseholdSnapshot');

const resolveHouseholdShoppingOwnershipSnapshot = ({ household = null, shoppingOwnership } = {}) => {
    if (shoppingOwnership !== undefined) {
        return shoppingOwnership;
    }

    if (household === null || household === undefined) {
        return null;
    }

    if (!isPlainObject(household)) {
        return INVALID_HOUSEHOLD_SNAPSHOT;
    }

    if (!Object.prototype.hasOwnProperty.call(household, 'shoppingOwnership')) {
        return null;
    }

    return household.shoppingOwnership;
};

export function buildHouseholdShoppingOwnershipFeedbackState({
    isLoading = false,
    household = null,
    shoppingOwnership,
    errorMessage = '',
    successMessage = '',
    emptyMessage = HOUSEHOLD_SHOPPING_OWNERSHIP_EMPTY_MESSAGE,
    loadingMessage = HOUSEHOLD_SHOPPING_OWNERSHIP_LOADING_MESSAGE,
    readyMessage = HOUSEHOLD_SHOPPING_OWNERSHIP_READY_MESSAGE,
} = {}) {
    if (isLoading) {
        return buildAuthFeedbackState({
            isLoading,
            loadingMessage,
        });
    }

    if (errorMessage) {
        return buildAuthFeedbackState({
            errorMessage,
            emptyMessage,
            loadingMessage,
        });
    }

    const shoppingOwnershipSnapshot = resolveHouseholdShoppingOwnershipSnapshot({
        household,
        shoppingOwnership,
    });

    if (shoppingOwnershipSnapshot === INVALID_HOUSEHOLD_SNAPSHOT) {
        return buildAuthFeedbackState({
            errorMessage: HOUSEHOLD_SHOPPING_OWNERSHIP_ERROR_MESSAGE,
            emptyMessage,
            loadingMessage,
        });
    }

    if (shoppingOwnershipSnapshot === null || shoppingOwnershipSnapshot === undefined) {
        return buildAuthFeedbackState({
            emptyMessage,
            loadingMessage,
        });
    }

    const validation = validateHouseholdShoppingOwnership(shoppingOwnershipSnapshot);
    if (!validation.valid) {
        return buildAuthFeedbackState({
            errorMessage: validation.error.message,
            emptyMessage,
            loadingMessage,
        });
    }

    if (validation.shoppingOwnership === null) {
        return buildAuthFeedbackState({
            emptyMessage,
            loadingMessage,
        });
    }

    return buildAuthFeedbackState({
        successMessage: successMessage || readyMessage,
        emptyMessage,
        loadingMessage,
    });
}

export function buildHouseholdShoppingOwnershipFeedbackContainerStyles(state = 'empty') {
    if (state === 'success') {
        return HOUSEHOLD_SHOPPING_OWNERSHIP_SURFACE_STYLES.success;
    }

    if (state === 'error') {
        return HOUSEHOLD_SHOPPING_OWNERSHIP_SURFACE_STYLES.error;
    }

    return HOUSEHOLD_SHOPPING_OWNERSHIP_SURFACE_STYLES.neutral;
}
