// @ts-nocheck
import assert from 'node:assert/strict';
import test, { mock } from 'node:test';

import Household from '../../models/Household/householdSchema';
import { getHousehold } from '../../graphql/resolvers/queries/householdQueries';

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
        toString: () => 'owner-1',
    },
    members: [],
    guests: [],
    sharedCookbook: null,
    planningDefaults: {
        mealsPerDay: 3,
        planDurationDays: 7,
    },
    planApproval: {
        status: 'approved',
        approvedAt: '2026-06-13T15:05:00.000Z',
    },
    headcount: 1,
    populateCalls: [],
    populate(paths) {
        this.populateCalls.push(paths);
        return this;
    },
});

test('getHousehold keeps plan approval refresh snapshots canonical', async () => {
    const household = buildHouseholdFixture();
    const findByIdMock = mock.method(Household, 'findById', (id) => {
        assert.equal(id, 'household-1');
        return household;
    });

    try {
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
        assert.deepEqual(household.populateCalls, [
            'owner',
            'members.user',
            'sharedCookbook',
        ]);
        assert.deepEqual(refreshedHousehold.planApproval, {
            status: 'APPROVED',
            approvedAt: new Date('2026-06-13T15:05:00.000Z'),
        });
        assert.equal(refreshedHousehold.planApproval.approvedAt.toISOString(), '2026-06-13T15:05:00.000Z');
    } finally {
        restoreAll(findByIdMock);
    }
});
