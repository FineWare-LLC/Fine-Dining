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

const snapshotPlanApproval = (planApproval) => {
    if (!planApproval) {
        return planApproval;
    }

    return {
        ...planApproval,
        approvedAt: planApproval.approvedAt instanceof Date
            ? new Date(planApproval.approvedAt.getTime())
            : planApproval.approvedAt,
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
    planApproval: {
        status: 'DRAFT',
        approvedAt: null,
    },
    headcount: 1,
    updatedAt,
    saveCalls: 0,
    populateCalls: [],
    saveSnapshots: [],
    async save() {
        this.saveCalls += 1;
        this.saveSnapshots.push({
            planApproval: snapshotPlanApproval(this.planApproval),
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
            throw new Error('database unavailable while loading the approved plan');
        }

        return this;
    },
});

test('updateHousehold rolls back a failed populated approval save and keeps the stored household canonical', async () => {
    const originalUpdatedAt = new Date('2026-06-13T15:00:00.000Z');
    const household = buildHouseholdFixture(originalUpdatedAt);
    const findByIdMock = mock.method(Household, 'findById', async (id) => {
        assert.equal(id, 'household-1');
        return household;
    });

    const approvalInput = {
        status: 'approved',
        approvedAt: '2026-06-13T15:05:00.000Z',
    };

    try {
        await assert.rejects(
            () =>
                updateHousehold(
                    null,
                    {
                        id: 'household-1',
                        input: {
                            planApproval: approvalInput,
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
                assert.equal(error.reason, 'populate');
                assert.equal(
                    error.message,
                    'We could not save your household plan. Please try again.',
                );
                assert.equal(error.isUserSafe, true);
                assert.equal(
                    error.cause?.message,
                    'database unavailable while loading the approved plan',
                );
                return true;
            },
        );

        assert.equal(findByIdMock.mock.callCount(), 1);
        assert.equal(household.saveCalls, 2);
        assert.deepEqual(household.populateCalls, [
            'owner',
            'members.user',
            'sharedCookbook',
        ]);
        assert.deepEqual(household.saveSnapshots, [
            {
                planApproval: {
                    status: 'APPROVED',
                    approvedAt: new Date('2026-06-13T15:05:00.000Z'),
                },
                updatedAt: '2026-06-13T15:00:00.000Z',
            },
            {
                planApproval: {
                    status: 'DRAFT',
                    approvedAt: null,
                },
                updatedAt: '2026-06-13T15:00:00.000Z',
            },
        ]);
        assert.deepEqual(household.planApproval, {
            status: 'DRAFT',
            approvedAt: null,
        });
        assert.equal(household.updatedAt.toISOString(), '2026-06-13T15:00:00.000Z');
        assert.deepEqual(approvalInput, {
            status: 'approved',
            approvedAt: '2026-06-13T15:05:00.000Z',
        });
    } finally {
        restoreAll(findByIdMock);
    }
});
