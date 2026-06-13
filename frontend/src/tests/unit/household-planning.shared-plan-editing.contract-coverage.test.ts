// @ts-nocheck
import assert from 'node:assert/strict';
import test, { mock } from 'node:test';

import Household from '../../models/Household/householdSchema';
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

    return fixture;
};

test('updateHousehold accepts a matching expectedUpdatedAt token and saves the canonical snapshot', async () => {
    const originalUpdatedAt = new Date('2026-06-13T15:00:00.000Z');
    const household = buildHouseholdFixture(originalUpdatedAt);
    const findByIdMock = mock.method(Household, 'findById', async (id) => {
        assert.equal(id, 'household-1');
        return household;
    });

    try {
        const result = await updateHousehold(
            null,
            {
                id: 'household-1',
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

        assert.equal(result, household);
        assert.equal(household.name, 'Updated River House');
        assert.equal(household.saveCalls, 1);
        assert.deepEqual(household.populateCalls, ['owner members.user sharedCookbook']);
        assert.equal(household.updatedAt.toISOString(), '2026-06-13T15:05:00.000Z');
    } finally {
        restoreAll(findByIdMock);
    }
});

test('updateHousehold rejects a stale expectedUpdatedAt token with a typed, user-safe error before saving', async () => {
    const originalUpdatedAt = new Date('2026-06-13T15:00:00.000Z');
    const staleUpdatedAt = new Date('2026-06-13T14:55:00.000Z');
    const household = buildHouseholdFixture(originalUpdatedAt);
    const findByIdMock = mock.method(Household, 'findById', async (id) => {
        assert.equal(id, 'household-1');
        return household;
    });

    try {
        await assert.rejects(
            () =>
                updateHousehold(
                    null,
                    {
                        id: 'household-1',
                        input: {
                            name: 'Updated River House',
                            expectedUpdatedAt: staleUpdatedAt,
                        },
                    },
                    {
                        user: {
                            userId: 'owner-1',
                        },
                    },
                ),
            (error) => {
                assert.equal(error.name, 'HouseholdRevisionValidationError');
                assert.equal(error.code, 'staleHouseholdRevision');
                assert.equal(
                    error.message,
                    'This household was updated by someone else. Please refresh and try again.',
                );
                assert.equal(error.isUserSafe, true);
                return true;
            },
        );

        assert.equal(findByIdMock.mock.callCount(), 1);
        assert.equal(household.saveCalls, 0);
        assert.deepEqual(household.populateCalls, []);
        assert.equal(household.name, 'River House');
        assert.equal(household.updatedAt.toISOString(), '2026-06-13T15:00:00.000Z');
    } finally {
        restoreAll(findByIdMock);
    }
});
