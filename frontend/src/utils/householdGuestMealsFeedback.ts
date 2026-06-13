// @ts-nocheck
import { buildAuthFeedbackState } from '@/context/authUtils';
import { validateHouseholdGuest } from './householdGuest';

const HOUSEHOLD_GUEST_MEALS_EMPTY_MESSAGE = 'Open a household to review temporary guest meals.';
const HOUSEHOLD_GUEST_MEALS_LOADING_MESSAGE = 'Checking temporary guest meals...';
const HOUSEHOLD_GUEST_MEALS_READY_MESSAGE = 'Temporary guest meals are ready to review.';
const HOUSEHOLD_GUEST_MEALS_ERROR_MESSAGE =
    'We could not read your temporary guest meals. Please refresh the planner.';

const HOUSEHOLD_GUEST_MEALS_SURFACE_STYLES = {
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

const resolveHouseholdGuestMealsSnapshot = ({ household = null, guests } = {}) => {
    if (guests !== undefined) {
        return guests;
    }

    if (household === null || household === undefined) {
        return null;
    }

    if (!isPlainObject(household)) {
        return INVALID_HOUSEHOLD_SNAPSHOT;
    }

    if (!Object.prototype.hasOwnProperty.call(household, 'guests')) {
        return null;
    }

    return household.guests;
};

const isValidHouseholdGuestEntry = (guest) => {
    if (!isPlainObject(guest)) {
        return false;
    }

    const validation = validateHouseholdGuest(guest);
    return validation.valid;
};

const validateHouseholdGuestMealsSnapshot = (snapshot) => {
    if (!Array.isArray(snapshot)) {
        return {
            valid: false,
            hasGuests: false,
        };
    }

    if (snapshot.length === 0) {
        return {
            valid: true,
            hasGuests: false,
        };
    }

    if (!snapshot.every(isValidHouseholdGuestEntry)) {
        return {
            valid: false,
            hasGuests: false,
        };
    }

    return {
        valid: true,
        hasGuests: true,
    };
};

export function buildHouseholdGuestMealsFeedbackState({
    isLoading = false,
    household = null,
    guests,
    errorMessage = '',
    successMessage = '',
    emptyMessage = HOUSEHOLD_GUEST_MEALS_EMPTY_MESSAGE,
    loadingMessage = HOUSEHOLD_GUEST_MEALS_LOADING_MESSAGE,
    readyMessage = HOUSEHOLD_GUEST_MEALS_READY_MESSAGE,
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

    const snapshot = resolveHouseholdGuestMealsSnapshot({
        household,
        guests,
    });

    if (snapshot === INVALID_HOUSEHOLD_SNAPSHOT) {
        return buildAuthFeedbackState({
            errorMessage: HOUSEHOLD_GUEST_MEALS_ERROR_MESSAGE,
            emptyMessage,
            loadingMessage,
        });
    }

    if (snapshot === null || snapshot === undefined) {
        return buildAuthFeedbackState({
            emptyMessage,
            loadingMessage,
        });
    }

    const validation = validateHouseholdGuestMealsSnapshot(snapshot);

    if (!validation.valid) {
        return buildAuthFeedbackState({
            errorMessage: HOUSEHOLD_GUEST_MEALS_ERROR_MESSAGE,
            emptyMessage,
            loadingMessage,
        });
    }

    if (!validation.hasGuests) {
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

export function buildHouseholdGuestMealsFeedbackContainerStyles(state = 'empty') {
    if (state === 'success') {
        return HOUSEHOLD_GUEST_MEALS_SURFACE_STYLES.success;
    }

    if (state === 'error') {
        return HOUSEHOLD_GUEST_MEALS_SURFACE_STYLES.error;
    }

    return HOUSEHOLD_GUEST_MEALS_SURFACE_STYLES.neutral;
}
