// @ts-nocheck
import assert from 'node:assert/strict';
import test, { mock } from 'node:test';

import Household from '../../models/Household/householdSchema';
import { updateHousehold } from '../../graphql/resolvers/mutations/householdMutations';
import { getHousehold } from '../../graphql/resolvers/queries/householdQueries';

const restoreAll = (...trackers) => {
    for (const tracker of trackers) {
        if (typeof tracker?.mock?.restore === 'function') {
            tracker.mock.restore();
        }
    }
};

const buildHouseholdFixture = (updatedAt = new Date('2026-06-13T15:00:00.000Z')) => ({
    _id: 'household-guest-1',
    name: 'River House',
    type: 'FAMILY',
    owner: {
        toString: () => 'owner-1',
    },
    members: [
        {
            user: {
                toString: () => 'owner-1',
            },
            role: 'OWNER',
        },
    ],
    guests: [
        {
            name: '  Visiting Cousin  ',
            email: ' cousin@example.test ',
            allergens: [' peanut ', ' dairy '],
            dietaryTags: [' vegan ', ' late night '],
            servingMultiplier: 2.5,
            startDate: '2026-06-13T18:00:00.000Z',
            endDate: new Date('2026-06-14T18:00:00.000Z'),
            notes: '  Needs quiet seating  ',
        },
    ],
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
        return this;
    },
    populate(paths) {
        this.populateCalls.push(paths);
        return this;
    },
});

test('updateHousehold keeps guest meals canonical across save and refresh reads', async () => {
    const originalUpdatedAt = new Date('2026-06-13T15:00:00.000Z');
    const household = buildHouseholdFixture(originalUpdatedAt);
    const findByIdMock = mock.method(Household, 'findById', (id) => {
        assert.equal(id, 'household-guest-1');
        return household;
    });

    try {
        const result = await updateHousehold(
            null,
            {
                id: 'household-guest-1',
                input: {
                    name: 'Updated River House',
                    expectedUpdatedAt: originalUpdatedAt,
                },
            },
            {
                user: {
                    userId: 'owner-1',
                },
            },
        );

        assert.equal(household.saveCalls, 1);
        assert.equal(result, household);
        assert.deepEqual(result.guests[0], {
            name: 'Visiting Cousin',
            email: 'cousin@example.test',
            allergens: ['peanut', 'dairy'],
            dietaryTags: ['vegan', 'late night'],
            servingMultiplier: 2.5,
            startDate: new Date('2026-06-13T18:00:00.000Z'),
            endDate: new Date('2026-06-14T18:00:00.000Z'),
            notes: 'Needs quiet seating',
        });

        const refreshedHousehold = await getHousehold(
            null,
            { id: 'household-guest-1' },
            {
                user: {
                    userId: 'owner-1',
                },
            },
        );

        assert.equal(refreshedHousehold, household);
        assert.equal(findByIdMock.mock.callCount(), 2);
        assert.deepEqual(household.populateCalls, [
            'owner',
            'members.user',
            'sharedCookbook',
            'owner',
            'members.user',
            'sharedCookbook',
        ]);
        assert.deepEqual(refreshedHousehold.guests[0], {
            name: 'Visiting Cousin',
            email: 'cousin@example.test',
            allergens: ['peanut', 'dairy'],
            dietaryTags: ['vegan', 'late night'],
            servingMultiplier: 2.5,
            startDate: new Date('2026-06-13T18:00:00.000Z'),
            endDate: new Date('2026-06-14T18:00:00.000Z'),
            notes: 'Needs quiet seating',
        });
    } finally {
        restoreAll(findByIdMock);
    }
});
