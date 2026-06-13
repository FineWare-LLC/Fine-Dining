// @ts-nocheck
import assert from 'node:assert/strict';
import test, { mock } from 'node:test';

import Household from '../../models/Household/householdSchema';
import {
    getHousehold,
} from '../../graphql/resolvers/queries/householdQueries';
import {
    updateHousehold,
} from '../../graphql/resolvers/mutations/householdMutations';

const restoreAll = (...trackers) => {
    for (const tracker of trackers) {
        if (typeof tracker?.mock?.restore === 'function') {
            tracker.mock.restore();
        }
    }
};

const buildHouseholdFixture = (updatedAt) => ({
    _id: 'household-1',
    name: 'River House',
    type: 'FAMILY',
    owner: {
        toString: () => 'owner-1',
        preferences: {
            emailNotifications: false,
        },
    },
    members: [
        {
            user: {
                toString: () => 'member-42',
                preferences: {
                    pushNotifications: true,
                    language: '  fr  ',
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
    updatedAt,
    saveCalls: 0,
    populateCalls: [],
    async save() {
        this.saveCalls += 1;
        this.updatedAt = new Date('2026-06-13T15:05:00.000Z');
        return this;
    },
    populate(paths) {
        this.populateCalls.push(paths);
        return this;
    },
});

test('notification preferences stay canonical across update and refresh reads', async () => {
    const originalUpdatedAt = new Date('2026-06-13T15:00:00.000Z');
    const household = buildHouseholdFixture(originalUpdatedAt);
    const findByIdMock = mock.method(Household, 'findById', (id) => {
        assert.equal(id, 'household-1');
        return household;
    });

    const updateInput = {
        name: 'Updated River House',
    };

    try {
        const savedHousehold = await updateHousehold(
            null,
            {
                id: 'household-1',
                input: {
                    ...updateInput,
                    expectedUpdatedAt: originalUpdatedAt,
                },
            },
            {
                user: {
                    userId: 'owner-1',
                },
            },
        );

        assert.equal(savedHousehold, household);
        assert.equal(household.saveCalls, 1);
        assert.equal(household.name, 'Updated River House');
        assert.deepEqual(household.owner.preferences, {
            language: 'en',
            darkMode: false,
            emailNotifications: false,
            pushNotifications: false,
            smsNotifications: false,
            marketingOptIn: false,
        });

        household.owner.preferences = {
            emailNotifications: false,
        };
        household.members[0].user.preferences = {
            pushNotifications: true,
            language: '  fr  ',
        };

        const refreshedHousehold = await getHousehold(
            null,
            { id: 'household-1' },
            {
                user: {
                    userId: 'owner-1',
                },
            },
        );

        assert.equal(refreshedHousehold, household);
        assert.deepEqual(refreshedHousehold.owner.preferences, {
            language: 'en',
            darkMode: false,
            emailNotifications: false,
            pushNotifications: false,
            smsNotifications: false,
            marketingOptIn: false,
        });
        assert.deepEqual(refreshedHousehold.members[0].user.preferences, {
            language: 'fr',
            darkMode: false,
            emailNotifications: true,
            pushNotifications: true,
            smsNotifications: false,
            marketingOptIn: false,
        });
        assert.deepEqual(updateInput, {
            name: 'Updated River House',
        });
        assert.deepEqual(household.populateCalls, [
            'owner',
            'members.user',
            'sharedCookbook',
            'owner',
            'members.user',
            'sharedCookbook',
        ]);
    } finally {
        restoreAll(findByIdMock);
    }
});
