// @ts-nocheck
import { buildAuthFeedbackState } from '@/context/authUtils';
import { validateHouseholdPlanningPreferences } from './householdPlanningPreferences';

const HOUSEHOLD_PLANNING_PREFERENCES_EMPTY_MESSAGE = 'Set household planning preferences to compare conflicts.';
const HOUSEHOLD_PLANNING_PREFERENCES_LOADING_MESSAGE = 'Checking household planning preferences...';
const HOUSEHOLD_PLANNING_PREFERENCES_READY_MESSAGE = 'Household planning preferences are ready to review.';

export function buildHouseholdPlanningPreferencesFeedbackState({
    isLoading = false,
    planningDefaults = null,
    errorMessage = '',
    successMessage = '',
    emptyMessage = HOUSEHOLD_PLANNING_PREFERENCES_EMPTY_MESSAGE,
    loadingMessage = HOUSEHOLD_PLANNING_PREFERENCES_LOADING_MESSAGE,
    readyMessage = HOUSEHOLD_PLANNING_PREFERENCES_READY_MESSAGE,
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

    if (planningDefaults === null || planningDefaults === undefined) {
        return buildAuthFeedbackState({
            emptyMessage,
            loadingMessage,
        });
    }

    const validation = validateHouseholdPlanningPreferences(planningDefaults);
    if (!validation.valid) {
        return buildAuthFeedbackState({
            errorMessage: validation.error.message,
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
