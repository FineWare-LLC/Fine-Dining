// @ts-nocheck
import assert from 'node:assert/strict';
import test from 'node:test';

import {
    normalizeHouseholdNotificationPreferencesSnapshot,
} from '../../utils/householdNotificationPreferences';

const LARGE_MEMBER_COUNT = 2048;

test('normalizeHouseholdNotificationPreferencesSnapshot keeps a large household deterministic without rereading members at the scale boundary', () => {
    const counts = {
        membersReads: 0,
    };

    const members = Array.from({ length: LARGE_MEMBER_COUNT }, (_, index) => ({
        user: {
            id: `member-${index}`,
            preferences: {
                emailNotifications: index % 2 === 0,
                pushNotifications: index % 3 === 0,
                language: '  fr  ',
            },
        },
        role: index === 0 ? 'OWNER' : 'MEMBER',
    }));

    const household = {
        owner: {
            id: 'owner-1',
            preferences: {
                emailNotifications: false,
            },
        },
        get members() {
            counts.membersReads += 1;
            return members;
        },
    };

    const result = normalizeHouseholdNotificationPreferencesSnapshot(household);

    assert.equal(result, household);
    assert.equal(counts.membersReads, 1);
    assert.deepEqual(members[0].user.preferences, {
        language: 'fr',
        darkMode: false,
        emailNotifications: true,
        pushNotifications: true,
        smsNotifications: false,
        marketingOptIn: false,
    });
    assert.deepEqual(members[LARGE_MEMBER_COUNT - 1].user.preferences, {
        language: 'fr',
        darkMode: false,
        emailNotifications: false,
        pushNotifications: false,
        smsNotifications: false,
        marketingOptIn: false,
    });
    assert.deepEqual(household.owner.preferences, {
        language: 'en',
        darkMode: false,
        emailNotifications: false,
        pushNotifications: false,
        smsNotifications: false,
        marketingOptIn: false,
    });
});
