// @ts-nocheck
import assert from 'node:assert/strict';
import test from 'node:test';
import { buildLoginFeedbackState } from '../../context/authUtils';

test('buildLoginFeedbackState reports session loading and sign-in loading as distinct busy states', () => {
    assert.deepEqual(buildLoginFeedbackState({ authLoading: true }), {
        state: 'loading',
        message: 'Checking your session...',
        role: 'status',
        ariaLive: 'polite',
        minHeight: 56,
        showSpinner: true,
    });

    assert.deepEqual(buildLoginFeedbackState({ mutationLoading: true }), {
        state: 'loading',
        message: 'Signing you in...',
        role: 'status',
        ariaLive: 'polite',
        minHeight: 56,
        showSpinner: true,
    });

    assert.deepEqual(buildLoginFeedbackState({ devLoading: true }), {
        state: 'loading',
        message: 'Signing you in...',
        role: 'status',
        ariaLive: 'polite',
        minHeight: 56,
        showSpinner: true,
    });
});

test('buildLoginFeedbackState keeps empty, success, and error feedback states distinct', () => {
    assert.deepEqual(buildLoginFeedbackState({}), {
        state: 'empty',
        message: 'Ready to sign in.',
        role: 'status',
        ariaLive: 'polite',
        minHeight: 56,
        showSpinner: false,
    });

    assert.deepEqual(buildLoginFeedbackState({ successMessage: 'Signed in. Redirecting to your dashboard...' }), {
        state: 'success',
        message: 'Signed in. Redirecting to your dashboard...',
        role: 'status',
        ariaLive: 'polite',
        minHeight: 56,
        showSpinner: false,
    });

    assert.deepEqual(buildLoginFeedbackState({ errorMessage: 'Login failed. Please check your email and password.' }), {
        state: 'error',
        message: 'Login failed. Please check your email and password.',
        role: 'alert',
        ariaLive: 'assertive',
        minHeight: 56,
        showSpinner: false,
    });

    assert.deepEqual(buildLoginFeedbackState({ sessionNotice: 'Your session has expired. Please sign in again.' }), {
        state: 'error',
        message: 'Your session has expired. Please sign in again.',
        role: 'alert',
        ariaLive: 'assertive',
        minHeight: 56,
        showSpinner: false,
    });
});
