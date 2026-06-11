// @ts-nocheck
import assert from 'node:assert/strict';
import test from 'node:test';
import { buildAuthFeedbackState } from '../../context/authUtils';

test('buildAuthFeedbackState exposes signup operator feedback states with stable layout spacing', () => {
    const signupMessages = {
        emptyMessage: 'Complete your account details to continue.',
        loadingMessage: 'Creating your account...',
        successMessage: 'Account created. Redirecting to onboarding...',
        errorMessage: 'Please enter a valid email address.',
    };

    assert.deepEqual(
        buildAuthFeedbackState({
            isLoading: true,
            ...signupMessages,
        }),
        {
            state: 'loading',
            message: 'Creating your account...',
            role: 'status',
            ariaLive: 'polite',
            minHeight: 56,
            showSpinner: true,
        },
    );

    assert.deepEqual(
        buildAuthFeedbackState({
            ...signupMessages,
        }),
        {
            state: 'error',
            message: 'Please enter a valid email address.',
            role: 'alert',
            ariaLive: 'assertive',
            minHeight: 56,
            showSpinner: false,
        },
    );

    assert.deepEqual(
        buildAuthFeedbackState({
            successMessage: signupMessages.successMessage,
            emptyMessage: signupMessages.emptyMessage,
        }),
        {
            state: 'success',
            message: 'Account created. Redirecting to onboarding...',
            role: 'status',
            ariaLive: 'polite',
            minHeight: 56,
            showSpinner: false,
        },
    );

    assert.deepEqual(
        buildAuthFeedbackState({
            emptyMessage: signupMessages.emptyMessage,
        }),
        {
            state: 'empty',
            message: 'Complete your account details to continue.',
            role: 'status',
            ariaLive: 'polite',
            minHeight: 56,
            showSpinner: false,
        },
    );
});
