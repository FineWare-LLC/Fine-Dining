// @ts-nocheck
import assert from 'node:assert/strict';
import test, { mock } from 'node:test';

import Household from '../../models/Household/householdSchema';
import {
    HouseholdNotificationPreferencesValidationError,
} from '../../utils/householdNotificationPreferences';
import {
    getHousehold,
} from '../../graphql/resolvers/queries/householdQueries';

const restoreAll = (...trackers) => {
    for (const tracker of trackers) {
        if (typeof tracker?.mock?.restore === 'function') {
            tracker.mock.restore();
        }
    }
};

const buildHouseholdFixture = () => ({
    _id: 'household-1',
    name: 'River House',
    type: 'FAMILY',
    owner: {
        id: 'owner-1',
        preferences: {
            emailNotifications: 'yes',
        },
    },
    members: [
        {
            user: {
                id: 'member-42',
                preferences: {
                    emailNotifications: false,
                },
            },
            role: 'MEMBER',
        },
    ],
    guests: [],
    sharedCookbook: null,
    planningDefaults: {
        mealsPerDay: 3,
        planDurationDays: 7,
    },
    updatedAt: new Date('2026-06-13T15:00:00.000Z'),
    populateCalls: [],
    populate(paths) {
        this.populateCalls.push(paths);
        return this;
    },
});

test('getHousehold rejects malformed notification preferences with a typed user-safe error', async () => {
    const household = buildHouseholdFixture();
    const findByIdMock = mock.method(Household, 'findById', (id) => {
        assert.equal(id, 'household-1');
        return household;
    });

    try {
        await assert.rejects(
            () =>
                getHousehold(
                    null,
                    { id: 'household-1' },
                    {
                        user: {
                            userId: 'owner-1',
                        },
                    },
                ),
            (error) => {
                assert.ok(error instanceof HouseholdNotificationPreferencesValidationError);
                assert.equal(error.code, 'invalidPayload');
                assert.equal(
                    error.message,
                    'We could not read your household notification preferences. Please refresh the planner.',
                );
                assert.equal(error.isUserSafe, true);
                return true;
            },
        );

        assert.equal(findByIdMock.mock.callCount(), 1);
        assert.deepEqual(household.populateCalls, ['owner', 'members.user', 'sharedCookbook']);
        assert.deepEqual(household.owner.preferences, {
            emailNotifications: 'yes',
        });
        assert.deepEqual(household.members[0].user.preferences, {
            emailNotifications: false,
        });
    } finally {
        restoreAll(findByIdMock);
    }
});
