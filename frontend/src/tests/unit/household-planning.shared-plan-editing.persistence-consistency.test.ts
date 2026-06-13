// @ts-nocheck
import assert from 'node:assert/strict';
import test, { mock } from 'node:test';

import Household from '../../models/Household/householdSchema';
import { getHousehold } from '../../graphql/resolvers/queries/householdQueries';
import { updateHousehold } from '../../graphql/resolvers/mutations/householdMutations';

const restoreAll = (...trackers) => {
    for (const tracker of trackers) {
        if (typeof tracker?.mock?.restore === 'function') {
            tracker.mock.restore();
        }
    }
};

const buildHouseholdFixture = (updatedAt) => {
    const fixture = {
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
            budgetPerDay: 20,
            budgetPerWeek: 140,
            mealSlots: ['BREAKFAST', 'LUNCH', 'DINNER'],
        },
        headcount: 1,
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
    };

    return fixture;
};

test('updateHousehold and getHousehold keep the shared plan refresh snapshot canonical', async () => {
    const originalUpdatedAt = new Date('2026-06-13T15:00:00.000Z');
    const household = buildHouseholdFixture(originalUpdatedAt);
    const findByIdMock = mock.method(Household, 'findById', (id) => {
        assert.equal(id, 'household-1');
        return household;
    });

    try {
        const updatedHousehold = await updateHousehold(
            null,
            {
                id: 'household-1',
                input: {
                    name: 'Updated River House',
                    planningDefaults: {
                        mealsPerDay: 4,
                        planDurationDays: 5,
                        budgetPerDay: 24,
                        budgetPerWeek: 168,
                        mealSlots: ['BREAKFAST', 'DINNER'],
                    },
                    expectedUpdatedAt: originalUpdatedAt,
                },
            },
            {
                user: {
                    userId: 'owner-1',
                },
            },
        );

        const refreshedHousehold = await getHousehold(
            null,
            { id: 'household-1' },
            {
                user: {
                    userId: 'owner-1',
                },
            },
        );

        assert.equal(findByIdMock.mock.callCount(), 2);
        assert.equal(household.saveCalls, 1);
        assert.deepEqual(household.populateCalls, [
            'owner',
            'members.user',
            'sharedCookbook',
            'owner',
            'members.user',
            'sharedCookbook',
        ]);
        assert.equal(updatedHousehold, household);
        assert.equal(refreshedHousehold, household);
        assert.equal(refreshedHousehold.name, 'Updated River House');
        assert.deepEqual(refreshedHousehold.planningDefaults, {
            mealsPerDay: 4,
            planDurationDays: 5,
            budgetPerDay: 24,
            budgetPerWeek: 168,
            mealSlots: ['BREAKFAST', 'DINNER'],
        });
        assert.equal(refreshedHousehold.updatedAt.toISOString(), '2026-06-13T15:05:00.000Z');
    } finally {
        restoreAll(findByIdMock);
    }
});
