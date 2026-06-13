// @ts-nocheck
import assert from 'node:assert/strict';
import test, { mock } from 'node:test';

import Household from '../../models/Household/householdSchema';
import { updateHousehold } from '../../graphql/resolvers/mutations/householdMutations';

const LARGE_MEMBER_COUNT = 2048;
const LARGE_GUEST_COUNT = 512;

const restoreAll = (...trackers) => {
    for (const tracker of trackers) {
        if (typeof tracker?.mock?.restore === 'function') {
            tracker.mock.restore();
        }
    }
};

const buildTrackedHouseholdFixture = (updatedAt) => {
    const counts = {
        membersReads: 0,
        guestsReads: 0,
    };

    const members = Array.from({ length: LARGE_MEMBER_COUNT }, (_, index) => ({
        user: {
            toString: () => `member-${index}`,
        },
        role: index === 0 ? 'OWNER' : 'MEMBER',
        servingMultiplier: 1,
        includeInPlanning: true,
        joinedAt: new Date('2026-06-13T14:00:00.000Z'),
    }));

    const guests = Array.from({ length: LARGE_GUEST_COUNT }, (_, index) => ({
        name: `Guest ${index + 1}`,
        servingMultiplier: 1,
    }));

    const household = {
        _id: 'household-1',
        name: 'River House',
        type: 'FAMILY',
        owner: {
            toString: () => 'owner-1',
        },
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
        async populate(paths) {
            this.populateCalls.push(paths);
            return this;
        },
    };

    Object.defineProperty(household, 'members', {
        enumerable: true,
        get() {
            counts.membersReads += 1;
            return members;
        },
    });

    Object.defineProperty(household, 'guests', {
        enumerable: true,
        get() {
            counts.guestsReads += 1;
            return guests;
        },
    });

    return {
        counts,
        household,
    };
};

test('updateHousehold keeps a large shopping ownership fixture deterministic without reading member or guest collections at the scale boundary', async () => {
    const originalUpdatedAt = new Date('2026-06-13T15:00:00.000Z');
    const { counts, household } = buildTrackedHouseholdFixture(originalUpdatedAt);
    const findByIdMock = mock.method(Household, 'findById', async (id) => {
        assert.equal(id, 'household-1');
        return household;
    });

    const shoppingOwnershipInput = {
        userId: 'member-42',
        assignedAt: '2026-06-13T15:05:00.000Z',
    };

    try {
        const result = await updateHousehold(
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

        assert.equal(result, household);
        assert.equal(findByIdMock.mock.callCount(), 1);
        assert.equal(household.saveCalls, 1);
        assert.deepEqual(household.populateCalls, ['owner', 'members.user', 'sharedCookbook']);
        assert.equal(counts.membersReads, 0);
        assert.equal(counts.guestsReads, 0);
        assert.deepEqual(household.shoppingOwnership, {
            userId: 'member-42',
            assignedAt: new Date('2026-06-13T15:05:00.000Z'),
        });
        assert.equal(household.updatedAt.toISOString(), '2026-06-13T15:05:00.000Z');
        assert.deepEqual(shoppingOwnershipInput, {
            userId: 'member-42',
            assignedAt: '2026-06-13T15:05:00.000Z',
        });
    } finally {
        restoreAll(findByIdMock);
    }
});
