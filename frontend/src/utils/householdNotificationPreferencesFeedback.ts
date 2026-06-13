// @ts-nocheck
import { buildAuthFeedbackState } from '@/context/authUtils';
import { validateHouseholdNotificationPreferences } from './householdNotificationPreferences';

const HOUSEHOLD_NOTIFICATION_PREFERENCES_EMPTY_MESSAGE =
    'Open a household to review notification preferences.';
const HOUSEHOLD_NOTIFICATION_PREFERENCES_LOADING_MESSAGE =
    'Checking notification preferences...';
const HOUSEHOLD_NOTIFICATION_PREFERENCES_READY_MESSAGE =
    'Your notification preferences are ready to review.';
const HOUSEHOLD_NOTIFICATION_PREFERENCES_ERROR_MESSAGE =
    'We could not read your household notification preferences. Please refresh the planner.';

const HOUSEHOLD_NOTIFICATION_PREFERENCES_SURFACE_STYLES = {
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

const validateHouseholdNotificationPreferencesSnapshot = (household) => {
    if (household === null || household === undefined) {
        return {
            valid: true,
            hasPreferences: false,
        };
    }

    if (!isPlainObject(household)) {
        return {
            valid: false,
            hasPreferences: false,
        };
    }

    const preferenceSnapshots = [];

    if (
        Object.prototype.hasOwnProperty.call(household, 'owner')
        && isPlainObject(household.owner)
        && Object.prototype.hasOwnProperty.call(household.owner, 'preferences')
    ) {
        preferenceSnapshots.push(household.owner.preferences);
    }

    if (Array.isArray(household.members)) {
        for (const member of household.members) {
            if (
                !isPlainObject(member)
                || !isPlainObject(member.user)
                || !Object.prototype.hasOwnProperty.call(member.user, 'preferences')
            ) {
                continue;
            }

            preferenceSnapshots.push(member.user.preferences);
        }
    }

    if (preferenceSnapshots.length === 0) {
        return {
            valid: true,
            hasPreferences: false,
        };
    }

    for (const snapshot of preferenceSnapshots) {
        const validation = validateHouseholdNotificationPreferences(snapshot);
        if (!validation.valid) {
            return {
                valid: false,
                hasPreferences: false,
            };
        }
    }

    return {
        valid: true,
        hasPreferences: true,
    };
};

export function buildHouseholdNotificationPreferencesFeedbackState({
    isLoading = false,
    household = null,
    errorMessage = '',
    successMessage = '',
    emptyMessage = HOUSEHOLD_NOTIFICATION_PREFERENCES_EMPTY_MESSAGE,
    loadingMessage = HOUSEHOLD_NOTIFICATION_PREFERENCES_LOADING_MESSAGE,
    readyMessage = HOUSEHOLD_NOTIFICATION_PREFERENCES_READY_MESSAGE,
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

    const validation = validateHouseholdNotificationPreferencesSnapshot(household);
    if (!validation.valid) {
        return buildAuthFeedbackState({
            errorMessage: HOUSEHOLD_NOTIFICATION_PREFERENCES_ERROR_MESSAGE,
            emptyMessage,
            loadingMessage,
        });
    }

    if (!validation.hasPreferences) {
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

export function buildHouseholdNotificationPreferencesFeedbackContainerStyles(state = 'empty') {
    if (state === 'success') {
        return HOUSEHOLD_NOTIFICATION_PREFERENCES_SURFACE_STYLES.success;
    }

    if (state === 'error') {
        return HOUSEHOLD_NOTIFICATION_PREFERENCES_SURFACE_STYLES.error;
    }

    return HOUSEHOLD_NOTIFICATION_PREFERENCES_SURFACE_STYLES.neutral;
}
