// @ts-nocheck
import { buildAuthFeedbackState } from '@/context/authUtils';
import { validateHouseholdPlanApproval } from './householdPlanApproval';

const HOUSEHOLD_PLAN_APPROVAL_EMPTY_MESSAGE = 'Open a household to review plan approval.';
const HOUSEHOLD_PLAN_APPROVAL_LOADING_MESSAGE = 'Checking household plan approval...';
const HOUSEHOLD_PLAN_APPROVAL_DRAFT_MESSAGE = 'Your household plan is waiting for approval.';
const HOUSEHOLD_PLAN_APPROVAL_READY_MESSAGE = 'Your household plan is approved and ready to use.';
const HOUSEHOLD_PLAN_APPROVAL_ERROR_MESSAGE =
    'We could not read your household plan approval. Please refresh the planner.';

const HOUSEHOLD_PLAN_APPROVAL_SURFACE_STYLES = {
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

const resolveHouseholdPlanApprovalSnapshot = ({ household = null, planApproval } = {}) => {
    if (planApproval !== undefined) {
        return planApproval;
    }

    if (household === null || household === undefined) {
        return null;
    }

    if (!isPlainObject(household)) {
        return INVALID_HOUSEHOLD_SNAPSHOT;
    }

    if (!Object.prototype.hasOwnProperty.call(household, 'planApproval')) {
        return null;
    }

    return household.planApproval;
};

export function buildHouseholdPlanApprovalFeedbackState({
    isLoading = false,
    household = null,
    planApproval,
    errorMessage = '',
    successMessage = '',
    draftMessage = HOUSEHOLD_PLAN_APPROVAL_DRAFT_MESSAGE,
    emptyMessage = HOUSEHOLD_PLAN_APPROVAL_EMPTY_MESSAGE,
    loadingMessage = HOUSEHOLD_PLAN_APPROVAL_LOADING_MESSAGE,
    readyMessage = HOUSEHOLD_PLAN_APPROVAL_READY_MESSAGE,
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

    const approvalSnapshot = resolveHouseholdPlanApprovalSnapshot({
        household,
        planApproval,
    });

    if (approvalSnapshot === INVALID_HOUSEHOLD_SNAPSHOT) {
        return buildAuthFeedbackState({
            errorMessage: HOUSEHOLD_PLAN_APPROVAL_ERROR_MESSAGE,
            emptyMessage,
            loadingMessage,
        });
    }

    if (approvalSnapshot === null || approvalSnapshot === undefined) {
        return buildAuthFeedbackState({
            emptyMessage,
            loadingMessage,
        });
    }

    const validation = validateHouseholdPlanApproval(approvalSnapshot);
    if (!validation.valid) {
        return buildAuthFeedbackState({
            errorMessage: validation.error.message,
            emptyMessage,
            loadingMessage,
        });
    }

    if (validation.planApproval.status === 'DRAFT') {
        return buildAuthFeedbackState({
            emptyMessage: draftMessage || emptyMessage,
            loadingMessage,
        });
    }

    return buildAuthFeedbackState({
        successMessage: successMessage || readyMessage,
        emptyMessage,
        loadingMessage,
    });
}

export function buildHouseholdPlanApprovalFeedbackContainerStyles(state = 'empty') {
    if (state === 'success') {
        return HOUSEHOLD_PLAN_APPROVAL_SURFACE_STYLES.success;
    }

    if (state === 'error') {
        return HOUSEHOLD_PLAN_APPROVAL_SURFACE_STYLES.error;
    }

    return HOUSEHOLD_PLAN_APPROVAL_SURFACE_STYLES.neutral;
}
