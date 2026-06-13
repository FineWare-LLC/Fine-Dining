// @ts-nocheck
import { buildAuthFeedbackState } from '@/context/authUtils';

const HOUSEHOLD_INVITE_EMPTY_MESSAGE = 'Generate an invite code to let household members join.';
const HOUSEHOLD_INVITE_LOADING_MESSAGE = 'Checking your household invite...';
const HOUSEHOLD_INVITE_READY_MESSAGE = 'Your household invite is ready to share.';

export function buildHouseholdInviteFeedbackState({
    isLoading = false,
    errorMessage = '',
    successMessage = '',
    hasInviteCode = false,
    emptyMessage = HOUSEHOLD_INVITE_EMPTY_MESSAGE,
    loadingMessage = HOUSEHOLD_INVITE_LOADING_MESSAGE,
    readyMessage = HOUSEHOLD_INVITE_READY_MESSAGE,
} = {}) {
    return buildAuthFeedbackState({
        isLoading,
        errorMessage,
        successMessage: successMessage || (hasInviteCode ? readyMessage : ''),
        emptyMessage,
        loadingMessage,
    });
}
