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

const snapshotPlanningDefaults = (planningDefaults) => {
    if (!planningDefaults) {
        return planningDefaults;
    }

    const snapshot = {
        ...planningDefaults,
    };

    if (Array.isArray(planningDefaults.mealSlots)) {
        snapshot.mealSlots = [...planningDefaults.mealSlots];
    } else if (planningDefaults.mealSlots !== undefined) {
        snapshot.mealSlots = planningDefaults.mealSlots;
    } else {
        delete snapshot.mealSlots;
    }

    return snapshot;
};

const buildHouseholdFixture = (updatedAt) => {
    const originalPlanningDefaults = {
        mealsPerDay: 3,
        planDurationDays: 7,
        budgetPerDay: 20,
        budgetPerWeek: 140,
    };

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
            ...originalPlanningDefaults,
        },
        headcount: 1,
        updatedAt,
        saveCalls: 0,
        populateCalls: [],
        saveSnapshots: [],
        async save() {
            this.saveCalls += 1;
            this.saveSnapshots.push({
                name: this.name,
                planningDefaults: snapshotPlanningDefaults(this.planningDefaults),
                updatedAt: this.updatedAt.toISOString(),
            });

            this.updatedAt = this.saveCalls === 1
                ? new Date('2026-06-13T15:05:00.000Z')
                : new Date('2026-06-13T15:00:00.000Z');

            return this;
        },
        async populate(paths) {
            this.populateCalls.push(paths);
            if (paths === 'sharedCookbook') {
                throw new Error('database unavailable while loading the populated shared plan');
            }

            return this;
        },
    };

    return {
        household: fixture,
        originalPlanningDefaults,
    };
};

test('updateHousehold rolls back a failed populated save and keeps the stored household canonical', async () => {
    const originalUpdatedAt = new Date('2026-06-13T15:00:00.000Z');
    const { household, originalPlanningDefaults } = buildHouseholdFixture(originalUpdatedAt);
    const updatedPlanningDefaults = {
        mealsPerDay: 4,
        planDurationDays: 5,
        budgetPerDay: 24,
        budgetPerWeek: 168,
    };
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
                            planningDefaults: updatedPlanningDefaults,
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
                assert.equal(error.name, 'HouseholdPlanPersistenceError');
                assert.equal(error.code, 'householdPlanPersistenceFailed');
                assert.equal(error.reason, 'populate');
                assert.equal(
                    error.message,
                    'We could not save your household plan. Please try again.',
                );
                assert.equal(error.isUserSafe, true);
                assert.equal(
                    error.cause?.message,
                    'database unavailable while loading the populated shared plan',
                );
                return true;
            },
        );

        assert.equal(findByIdMock.mock.callCount(), 1);
        assert.equal(household.saveCalls, 2);
        assert.deepEqual(household.populateCalls, ['owner', 'members.user', 'sharedCookbook']);
        assert.deepEqual(household.saveSnapshots, [
            {
                name: 'Updated River House',
                planningDefaults: updatedPlanningDefaults,
                updatedAt: '2026-06-13T15:00:00.000Z',
            },
            {
                name: 'River House',
                planningDefaults: originalPlanningDefaults,
                updatedAt: '2026-06-13T15:00:00.000Z',
            },
        ]);
        assert.equal(household.name, 'River House');
        assert.deepEqual(household.planningDefaults, originalPlanningDefaults);
        assert.equal(household.updatedAt.toISOString(), '2026-06-13T15:00:00.000Z');
    } finally {
        restoreAll(findByIdMock);
    }
});
