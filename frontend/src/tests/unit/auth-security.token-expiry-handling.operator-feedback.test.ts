// @ts-nocheck
import assert from 'node:assert/strict';
import test from 'node:test';
import { buildAuthFeedbackState } from '../../context/authUtils';

test('buildAuthFeedbackState reports loading feedback with stable layout spacing', () => {
    assert.deepEqual(buildAuthFeedbackState({ isLoading: true }), {
        state: 'loading',
        message: 'Checking your session...',
        role: 'status',
        ariaLive: 'polite',
        minHeight: 56,
        showSpinner: true,
    });
});

test('buildAuthFeedbackState reports the empty sign-in state with stable layout spacing', () => {
    assert.deepEqual(buildAuthFeedbackState({}), {
        state: 'empty',
        message: 'Ready to sign in.',
        role: 'status',
        ariaLive: 'polite',
        minHeight: 56,
        showSpinner: false,
    });
});

test('buildAuthFeedbackState reports a successful sign-in handoff', () => {
    assert.deepEqual(buildAuthFeedbackState({ successMessage: 'Signed in. Redirecting...' }), {
        state: 'success',
        message: 'Signed in. Redirecting...',
        role: 'status',
        ariaLive: 'polite',
        minHeight: 56,
        showSpinner: false,
    });
});

test('buildAuthFeedbackState reports expired-session feedback as an alert', () => {
    assert.deepEqual(buildAuthFeedbackState({ sessionNotice: 'Your session has expired. Please sign in again.' }), {
        state: 'error',
        message: 'Your session has expired. Please sign in again.',
        role: 'alert',
        ariaLive: 'assertive',
        minHeight: 56,
        showSpinner: false,
    });
});
