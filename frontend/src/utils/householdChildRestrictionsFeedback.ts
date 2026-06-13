// @ts-nocheck
import { buildAuthFeedbackState } from '@/context/authUtils';
import { resolveHouseholdChildRestrictionProfile } from './householdChildRestrictions';

const HOUSEHOLD_CHILD_RESTRICTIONS_EMPTY_MESSAGE = 'Open a household to review child restrictions.';
const HOUSEHOLD_CHILD_RESTRICTIONS_LOADING_MESSAGE = 'Checking child restriction settings...';
const HOUSEHOLD_CHILD_RESTRICTIONS_READY_MESSAGE = 'Child restriction settings are ready to review.';

const HOUSEHOLD_CHILD_RESTRICTIONS_SURFACE_STYLES = {
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

export function buildHouseholdChildRestrictionsFeedbackState({
    isLoading = false,
    user = null,
    errorMessage = '',
    successMessage = '',
    emptyMessage = HOUSEHOLD_CHILD_RESTRICTIONS_EMPTY_MESSAGE,
    loadingMessage = HOUSEHOLD_CHILD_RESTRICTIONS_LOADING_MESSAGE,
    readyMessage = HOUSEHOLD_CHILD_RESTRICTIONS_READY_MESSAGE,
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

    if (user === null || user === undefined) {
        return buildAuthFeedbackState({
            emptyMessage,
            loadingMessage,
        });
    }

    const childRestrictionProfile = resolveHouseholdChildRestrictionProfile(user);

    if (!childRestrictionProfile.valid) {
        return buildAuthFeedbackState({
            errorMessage: childRestrictionProfile.error.message,
            emptyMessage,
            loadingMessage,
        });
    }

    if (childRestrictionProfile.hardRestrictions.length === 0) {
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

export function buildHouseholdChildRestrictionsFeedbackContainerStyles(state = 'empty') {
    if (state === 'success') {
        return HOUSEHOLD_CHILD_RESTRICTIONS_SURFACE_STYLES.success;
    }

    if (state === 'error') {
        return HOUSEHOLD_CHILD_RESTRICTIONS_SURFACE_STYLES.error;
    }

    return HOUSEHOLD_CHILD_RESTRICTIONS_SURFACE_STYLES.neutral;
}
