// @ts-nocheck
import { buildAuthFeedbackState } from '@/context/authUtils';

const HOUSEHOLD_SHARED_PLAN_EDITING_EMPTY_MESSAGE = 'Open a household to edit the shared plan.';
const HOUSEHOLD_SHARED_PLAN_EDITING_LOADING_MESSAGE = 'Checking your shared plan...';
const HOUSEHOLD_SHARED_PLAN_EDITING_READY_MESSAGE = 'Your shared plan is ready to edit.';

const HOUSEHOLD_SHARED_PLAN_EDITING_SURFACE_STYLES = {
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

export function buildHouseholdSharedPlanEditingFeedbackState({
    isLoading = false,
    errorMessage = '',
    sessionNotice = '',
    successMessage = '',
    hasSharedPlan = false,
    emptyMessage = HOUSEHOLD_SHARED_PLAN_EDITING_EMPTY_MESSAGE,
    loadingMessage = HOUSEHOLD_SHARED_PLAN_EDITING_LOADING_MESSAGE,
    readyMessage = HOUSEHOLD_SHARED_PLAN_EDITING_READY_MESSAGE,
} = {}) {
    return buildAuthFeedbackState({
        isLoading,
        errorMessage,
        sessionNotice,
        successMessage: successMessage || (hasSharedPlan ? readyMessage : ''),
        emptyMessage,
        loadingMessage,
    });
}

export function buildHouseholdSharedPlanEditingFeedbackContainerStyles(state = 'empty') {
    if (state === 'success') {
        return HOUSEHOLD_SHARED_PLAN_EDITING_SURFACE_STYLES.success;
    }

    if (state === 'error') {
        return HOUSEHOLD_SHARED_PLAN_EDITING_SURFACE_STYLES.error;
    }

    return HOUSEHOLD_SHARED_PLAN_EDITING_SURFACE_STYLES.neutral;
}
