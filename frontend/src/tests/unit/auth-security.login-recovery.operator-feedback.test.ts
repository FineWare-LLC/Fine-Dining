// @ts-nocheck
import assert from 'node:assert/strict';
import test from 'node:test';
import {
    buildAuthFeedbackContainerStyles,
    buildAuthFeedbackState,
} from '../../context/authUtils';

test('buildAuthFeedbackState exposes login operator feedback states with stable layout spacing', () => {
    assert.deepEqual(
        buildAuthFeedbackState({
            isLoading: true,
            emptyMessage: 'Ready to sign in.',
            loadingMessage: 'Checking your credentials...',
            successMessage: 'Signed in. Redirecting to your dashboard...',
            errorMessage: 'Login failed. Please check your email and password.',
        }),
        {
            state: 'loading',
            message: 'Checking your credentials...',
            role: 'status',
            ariaLive: 'polite',
            minHeight: 56,
            showSpinner: true,
        },
    );

    assert.deepEqual(
        buildAuthFeedbackState({
            errorMessage: 'Login failed. Please check your email and password.',
        }),
        {
            state: 'error',
            message: 'Login failed. Please check your email and password.',
            role: 'alert',
            ariaLive: 'assertive',
            minHeight: 56,
            showSpinner: false,
        },
    );

    assert.deepEqual(
        buildAuthFeedbackState({
            successMessage: 'Signed in. Redirecting to your dashboard...',
        }),
        {
            state: 'success',
            message: 'Signed in. Redirecting to your dashboard...',
            role: 'status',
            ariaLive: 'polite',
            minHeight: 56,
            showSpinner: false,
        },
    );

    assert.deepEqual(
        buildAuthFeedbackState({
            emptyMessage: 'Ready to sign in.',
        }),
        {
            state: 'empty',
            message: 'Ready to sign in.',
            role: 'status',
            ariaLive: 'polite',
            minHeight: 56,
            showSpinner: false,
        },
    );
});

test('buildAuthFeedbackContainerStyles keeps login feedback visually distinct without layout shift', () => {
    assert.deepEqual(buildAuthFeedbackContainerStyles('loading'), {
        bgcolor: 'transparent',
        border: '1px solid transparent',
    });

    assert.deepEqual(buildAuthFeedbackContainerStyles('empty'), {
        bgcolor: 'transparent',
        border: '1px solid transparent',
    });

    assert.deepEqual(buildAuthFeedbackContainerStyles('success'), {
        bgcolor: 'rgba(76, 175, 80, 0.08)',
        border: '1px solid rgba(76, 175, 80, 0.2)',
    });

    assert.deepEqual(buildAuthFeedbackContainerStyles('error'), {
        bgcolor: 'rgba(244, 67, 54, 0.08)',
        border: '1px solid rgba(244, 67, 54, 0.2)',
    });
});
