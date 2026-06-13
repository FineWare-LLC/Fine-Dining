// @ts-nocheck
import assert from 'node:assert/strict';
import test, { mock } from 'node:test';

import Household from '../../models/Household/householdSchema';
import {
    updateHousehold,
} from '../../graphql/resolvers/mutations/householdMutations';
import { getHousehold } from '../../graphql/resolvers/queries/householdQueries';

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
    },
    members: [],
    guests: [],
    sharedCookbook: null,
    planningDefaults: {
        mealsPerDay: 3,
        planDurationDays: 7,
    },
    shoppingOwnership: {
        userId: 'owner-1',
        assignedAt: new Date('2026-06-13T15:00:00.000Z'),
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

test('shopping ownership stays canonical across update and refresh reads', async () => {
    const originalUpdatedAt = new Date('2026-06-13T15:00:00.000Z');
    const household = buildHouseholdFixture(originalUpdatedAt);
    const findByIdMock = mock.method(Household, 'findById', (id) => {
        assert.equal(id, 'household-1');
        return household;
    });

    const shoppingOwnershipInput = {
        userId: 'member-42',
        assignedAt: '2026-06-13T15:05:00.000Z',
    };

    try {
        const savedHousehold = await updateHousehold(
            null,
            {
                id: 'household-1',
                input: {
                    name: 'Updated River House',
                    shoppingOwnership: shoppingOwnershipInput,
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
        assert.deepEqual(household.shoppingOwnership, {
            userId: 'member-42',
            assignedAt: new Date('2026-06-13T15:05:00.000Z'),
        });
        assert.equal(household.updatedAt.toISOString(), '2026-06-13T15:05:00.000Z');

        household.shoppingOwnership = {
            userId: 'member-42',
            assignedAt: '2026-06-13T15:05:00.000Z',
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
        assert.deepEqual(refreshedHousehold.shoppingOwnership, {
            userId: 'member-42',
            assignedAt: new Date('2026-06-13T15:05:00.000Z'),
        });
        assert.equal(refreshedHousehold.shoppingOwnership.assignedAt.toISOString(), '2026-06-13T15:05:00.000Z');
        assert.deepEqual(shoppingOwnershipInput, {
            userId: 'member-42',
            assignedAt: '2026-06-13T15:05:00.000Z',
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
