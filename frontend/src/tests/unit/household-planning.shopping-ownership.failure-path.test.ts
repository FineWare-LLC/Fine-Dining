// @ts-nocheck
import assert from 'node:assert/strict';
import test, { mock } from 'node:test';

import Household from '../../models/Household/householdSchema';
import {
    HouseholdPlanPersistenceError,
    updateHousehold,
} from '../../graphql/resolvers/mutations/householdMutations';

const restoreAll = (...trackers) => {
    for (const tracker of trackers) {
        if (typeof tracker?.mock?.restore === 'function') {
            tracker.mock.restore();
        }
    }
};

const snapshotShoppingOwnership = (shoppingOwnership) => {
    if (!shoppingOwnership) {
        return shoppingOwnership;
    }

    return {
        ...shoppingOwnership,
        assignedAt: shoppingOwnership.assignedAt instanceof Date
            ? new Date(shoppingOwnership.assignedAt.getTime())
            : shoppingOwnership.assignedAt,
    };
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
    saveSnapshots: [],
    async save() {
        this.saveCalls += 1;
        this.saveSnapshots.push({
            shoppingOwnership: snapshotShoppingOwnership(this.shoppingOwnership),
            updatedAt: this.updatedAt.toISOString(),
        });

        this.updatedAt = new Date('2026-06-13T15:05:00.000Z');
        throw new Error('database unavailable while saving shopping ownership');
    },
    async populate(paths) {
        this.populateCalls.push(paths);
        return this;
    },
});

test('updateHousehold rolls back a failed shopping ownership save and keeps the stored household canonical', async () => {
    const originalUpdatedAt = new Date('2026-06-13T15:00:00.000Z');
    const household = buildHouseholdFixture(originalUpdatedAt);
    const findByIdMock = mock.method(Household, 'findById', async (id) => {
        assert.equal(id, 'household-1');
        return household;
    });

    const shoppingOwnershipInput = {
        userId: 'member-42',
        assignedAt: '2026-06-13T15:05:00.000Z',
    };

    try {
        await assert.rejects(
            () =>
                updateHousehold(
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
                ),
            (error) => {
                assert.ok(error instanceof HouseholdPlanPersistenceError);
                assert.equal(error.code, 'householdPlanPersistenceFailed');
                assert.equal(error.reason, 'save');
                assert.equal(
                    error.message,
                    'We could not save your household plan. Please try again.',
                );
                assert.equal(error.isUserSafe, true);
                assert.equal(
                    error.cause?.message,
                    'database unavailable while saving shopping ownership',
                );
                return true;
            },
        );

        assert.equal(findByIdMock.mock.callCount(), 1);
        assert.equal(household.saveCalls, 1);
        assert.deepEqual(household.populateCalls, []);
        assert.deepEqual(household.saveSnapshots, [
            {
                shoppingOwnership: {
                    userId: 'member-42',
                    assignedAt: new Date('2026-06-13T15:05:00.000Z'),
                },
                updatedAt: '2026-06-13T15:00:00.000Z',
            },
        ]);
        assert.deepEqual(household.shoppingOwnership, {
            userId: 'owner-1',
            assignedAt: new Date('2026-06-13T15:00:00.000Z'),
        });
        assert.equal(household.updatedAt.toISOString(), '2026-06-13T15:00:00.000Z');
        assert.deepEqual(shoppingOwnershipInput, {
            userId: 'member-42',
            assignedAt: '2026-06-13T15:05:00.000Z',
        });
    } finally {
        restoreAll(findByIdMock);
    }
});
