// @ts-nocheck
import assert from 'node:assert/strict';
import test from 'node:test';

import {
    buildHouseholdNotificationPreferencesFeedbackContainerStyles,
    buildHouseholdNotificationPreferencesFeedbackState,
} from '../../utils/householdNotificationPreferencesFeedback';

test('buildHouseholdNotificationPreferencesFeedbackState reports loading feedback with stable layout spacing', () => {
    assert.deepEqual(buildHouseholdNotificationPreferencesFeedbackState({
        isLoading: true,
        loadingMessage: 'Checking notification preferences...',
    }), {
        state: 'loading',
        message: 'Checking notification preferences...',
        role: 'status',
        ariaLive: 'polite',
        minHeight: 56,
        showSpinner: true,
    });
});

test('buildHouseholdNotificationPreferencesFeedbackState reports empty, success, and error states accessibly', () => {
    assert.deepEqual(buildHouseholdNotificationPreferencesFeedbackState({}), {
        state: 'empty',
        message: 'Open a household to review notification preferences.',
        role: 'status',
        ariaLive: 'polite',
        minHeight: 56,
        showSpinner: false,
    });

    assert.deepEqual(buildHouseholdNotificationPreferencesFeedbackState({
        household: {
            owner: {
                id: 'owner-1',
                preferences: {
                    emailNotifications: false,
                    pushNotifications: true,
                    language: '  fr  ',
                },
            },
            members: [
                {
                    user: {
                        id: 'member-42',
                        preferences: {
                            smsNotifications: true,
                        },
                    },
                },
            ],
        },
    }), {
        state: 'success',
        message: 'Your notification preferences are ready to review.',
        role: 'status',
        ariaLive: 'polite',
        minHeight: 56,
        showSpinner: false,
    });

    assert.deepEqual(buildHouseholdNotificationPreferencesFeedbackState({
        household: {
            owner: {
                id: 'owner-1',
                preferences: {
                    emailNotifications: 'yes',
                },
            },
        },
    }), {
        state: 'error',
        message: 'We could not read your household notification preferences. Please refresh the planner.',
        role: 'alert',
        ariaLive: 'assertive',
        minHeight: 56,
        showSpinner: false,
    });
});

test('buildHouseholdNotificationPreferencesFeedbackContainerStyles keeps notification preferences feedback visually distinct without layout shift', () => {
    assert.deepEqual(buildHouseholdNotificationPreferencesFeedbackContainerStyles('loading'), {
        backgroundColor: 'transparent',
        border: '1px solid transparent',
    });

    assert.deepEqual(buildHouseholdNotificationPreferencesFeedbackContainerStyles('empty'), {
        backgroundColor: 'transparent',
        border: '1px solid transparent',
    });

    assert.deepEqual(buildHouseholdNotificationPreferencesFeedbackContainerStyles('success'), {
        backgroundColor: 'rgba(76, 175, 80, 0.08)',
        border: '1px solid rgba(76, 175, 80, 0.2)',
    });

    assert.deepEqual(buildHouseholdNotificationPreferencesFeedbackContainerStyles('error'), {
        backgroundColor: 'rgba(244, 67, 54, 0.08)',
        border: '1px solid rgba(244, 67, 54, 0.2)',
    });
});
