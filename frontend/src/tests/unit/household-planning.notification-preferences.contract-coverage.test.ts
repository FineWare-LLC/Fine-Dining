// @ts-nocheck
import assert from 'node:assert/strict';
import test from 'node:test';

import {
    HouseholdNotificationPreferencesValidationError,
    normalizeHouseholdNotificationPreferencesSnapshot,
    validateHouseholdNotificationPreferences,
} from '../../utils/householdNotificationPreferences';

test('validateHouseholdNotificationPreferences canonicalizes notification settings and defaults', () => {
    const input = {
        emailNotifications: false,
        pushNotifications: true,
        language: '  fr  ',
    };

    const result = validateHouseholdNotificationPreferences(input);

    assert.equal(result.valid, true);
    assert.equal(result.error, null);
    assert.deepEqual(result.preferences, {
        language: 'fr',
        darkMode: false,
        emailNotifications: false,
        pushNotifications: true,
        smsNotifications: false,
        marketingOptIn: false,
    });
    assert.deepEqual(input, {
        emailNotifications: false,
        pushNotifications: true,
        language: '  fr  ',
    });
});

test('validateHouseholdNotificationPreferences rejects malformed payloads with a typed, user-safe error', () => {
    const result = validateHouseholdNotificationPreferences({
        emailNotifications: 'yes',
    });

    assert.equal(result.valid, false);
    assert.equal(result.preferences, null);
    assert.ok(result.error instanceof HouseholdNotificationPreferencesValidationError);
    assert.equal(result.error.code, 'invalidPayload');
    assert.equal(
        result.error.message,
        'We could not read your household notification preferences. Please refresh the planner.',
    );
    assert.equal(result.error.isUserSafe, true);
});

test('normalizeHouseholdNotificationPreferencesSnapshot canonicalizes populated household member preferences', () => {
    const household = {
        owner: {
            id: 'owner-1',
            preferences: {
                emailNotifications: false,
            },
        },
        members: [
            {
                user: {
                    id: 'member-42',
                    preferences: {
                        pushNotifications: true,
                        language: '  fr  ',
                    },
                },
                role: 'MEMBER',
            },
        ],
    };

    const result = normalizeHouseholdNotificationPreferencesSnapshot(household);

    assert.equal(result, household);
    assert.deepEqual(household.owner.preferences, {
        language: 'en',
        darkMode: false,
        emailNotifications: false,
        pushNotifications: false,
        smsNotifications: false,
        marketingOptIn: false,
    });
    assert.deepEqual(household.members[0].user.preferences, {
        language: 'fr',
        darkMode: false,
        emailNotifications: true,
        pushNotifications: true,
        smsNotifications: false,
        marketingOptIn: false,
    });
});
