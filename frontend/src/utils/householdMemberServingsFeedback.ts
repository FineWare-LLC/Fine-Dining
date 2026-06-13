// @ts-nocheck
import { buildAuthFeedbackState } from '@/context/authUtils';
import { normalizeHouseholdServingMultiplier } from './householdMemberServings';

const HOUSEHOLD_MEMBER_SERVINGS_EMPTY_MESSAGE = 'Open a household to review per-member servings.';
const HOUSEHOLD_MEMBER_SERVINGS_LOADING_MESSAGE = 'Checking per-member servings...';
const HOUSEHOLD_MEMBER_SERVINGS_READY_MESSAGE = 'Per-member serving counts are ready to review.';
const HOUSEHOLD_MEMBER_SERVINGS_ERROR_MESSAGE =
    'We could not read your per-member servings. Please refresh the household.';

const HOUSEHOLD_MEMBER_SERVINGS_SURFACE_STYLES = {
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

const isValidServingEntry = (entry) => {
    if (!isPlainObject(entry)) {
        return false;
    }

    try {
        normalizeHouseholdServingMultiplier(entry.servingMultiplier);
        return true;
    } catch {
        return false;
    }
};

const validateHouseholdMemberServingsSnapshot = (household) => {
    if (household === null || household === undefined) {
        return {
            valid: true,
            hasEntries: false,
        };
    }

    if (!isPlainObject(household)) {
        return {
            valid: false,
            hasEntries: false,
        };
    }

    if (!Array.isArray(household.members) || !Array.isArray(household.guests)) {
        return {
            valid: false,
            hasEntries: false,
        };
    }

    if (!household.members.every(isValidServingEntry) || !household.guests.every(isValidServingEntry)) {
        return {
            valid: false,
            hasEntries: false,
        };
    }

    return {
        valid: true,
        hasEntries: household.members.length > 0 || household.guests.length > 0,
    };
};

export function buildHouseholdMemberServingsFeedbackState({
    isLoading = false,
    household = null,
    errorMessage = '',
    successMessage = '',
    emptyMessage = HOUSEHOLD_MEMBER_SERVINGS_EMPTY_MESSAGE,
    loadingMessage = HOUSEHOLD_MEMBER_SERVINGS_LOADING_MESSAGE,
    readyMessage = HOUSEHOLD_MEMBER_SERVINGS_READY_MESSAGE,
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

    const validation = validateHouseholdMemberServingsSnapshot(household);

    if (!validation.valid) {
        return buildAuthFeedbackState({
            errorMessage: HOUSEHOLD_MEMBER_SERVINGS_ERROR_MESSAGE,
            emptyMessage,
            loadingMessage,
        });
    }

    if (!validation.hasEntries) {
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

export function buildHouseholdMemberServingsFeedbackContainerStyles(state = 'empty') {
    if (state === 'success') {
        return HOUSEHOLD_MEMBER_SERVINGS_SURFACE_STYLES.success;
    }

    if (state === 'error') {
        return HOUSEHOLD_MEMBER_SERVINGS_SURFACE_STYLES.error;
    }

    return HOUSEHOLD_MEMBER_SERVINGS_SURFACE_STYLES.neutral;
}
