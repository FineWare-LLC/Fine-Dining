// @ts-nocheck
import assert from 'node:assert/strict';
import test from 'node:test';
import { buildSessionRefreshFeedbackState } from '../../context/authUtils';

test('buildSessionRefreshFeedbackState exposes session refresh operator feedback with stable layout spacing', () => {
    assert.deepEqual(buildSessionRefreshFeedbackState({ isLoading: true }), {
        state: 'loading',
        message: 'Refreshing your session...',
        role: 'status',
        ariaLive: 'polite',
        minHeight: 56,
        showSpinner: true,
    });

    assert.deepEqual(
        buildSessionRefreshFeedbackState({
            sessionNotice: 'Your session has expired. Please sign in again.',
        }),
        {
            state: 'error',
            message: 'Your session has expired. Please sign in again.',
            role: 'alert',
            ariaLive: 'assertive',
            minHeight: 56,
            showSpinner: false,
        },
    );

    assert.deepEqual(
        buildSessionRefreshFeedbackState({
            successMessage: 'Session restored. Redirecting to your dashboard...',
        }),
        {
            state: 'success',
            message: 'Session restored. Redirecting to your dashboard...',
            role: 'status',
            ariaLive: 'polite',
            minHeight: 56,
            showSpinner: false,
        },
    );

    assert.deepEqual(buildSessionRefreshFeedbackState({}), {
        state: 'empty',
        message: 'Ready to sign in.',
        role: 'status',
        ariaLive: 'polite',
        minHeight: 56,
        showSpinner: false,
    });
});
