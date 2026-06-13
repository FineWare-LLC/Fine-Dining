// @ts-nocheck
import assert from 'node:assert/strict';
import test from 'node:test';
import { buildHouseholdInviteFeedbackState } from '../../utils/householdInviteFeedback';

test('buildHouseholdInviteFeedbackState reports loading feedback with stable layout spacing', () => {
    assert.deepEqual(buildHouseholdInviteFeedbackState({
        isLoading: true,
        loadingMessage: 'Checking your household invite...',
    }), {
        state: 'loading',
        message: 'Checking your household invite...',
        role: 'status',
        ariaLive: 'polite',
        minHeight: 56,
        showSpinner: true,
    });
});

test('buildHouseholdInviteFeedbackState reports empty, success, and error states accessibly', () => {
    assert.deepEqual(buildHouseholdInviteFeedbackState({}), {
        state: 'empty',
        message: 'Generate an invite code to let household members join.',
        role: 'status',
        ariaLive: 'polite',
        minHeight: 56,
        showSpinner: false,
    });

    assert.deepEqual(buildHouseholdInviteFeedbackState({
        hasInviteCode: true,
    }), {
        state: 'success',
        message: 'Your household invite is ready to share.',
        role: 'status',
        ariaLive: 'polite',
        minHeight: 56,
        showSpinner: false,
    });

    assert.deepEqual(buildHouseholdInviteFeedbackState({
        errorMessage: 'Could not load your household invite. Please try again.',
    }), {
        state: 'error',
        message: 'Could not load your household invite. Please try again.',
        role: 'alert',
        ariaLive: 'assertive',
        minHeight: 56,
        showSpinner: false,
    });
});
