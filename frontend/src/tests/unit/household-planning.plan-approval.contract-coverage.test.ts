// @ts-nocheck
import assert from 'node:assert/strict';
import test, { mock } from 'node:test';

import Household from '../../models/Household/householdSchema';
import {
    updateHousehold,
} from '../../graphql/resolvers/mutations/householdMutations';
import {
    HouseholdPlanApprovalValidationError,
    validateHouseholdPlanApproval,
} from '../../utils/householdPlanApproval';

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
    planApproval: {
        status: 'DRAFT',
        approvedAt: null,
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
});

test('validateHouseholdPlanApproval accepts draft and approved snapshots with canonical timestamps', () => {
    const draft = validateHouseholdPlanApproval({
        status: 'draft',
    });
    assert.equal(draft.valid, true);
    assert.deepEqual(draft.planApproval, {
        status: 'DRAFT',
        approvedAt: null,
    });
    assert.equal(draft.error, null);

    const approvedAt = '2026-06-13T15:05:00.000Z';
    const approved = validateHouseholdPlanApproval({
        status: 'approved',
        approvedAt,
    });

    assert.equal(approved.valid, true);
    assert.equal(approved.error, null);
    assert.deepEqual(approved.planApproval, {
        status: 'APPROVED',
        approvedAt: new Date(approvedAt),
    });
    assert.equal(approved.planApproval.approvedAt.toISOString(), approvedAt);
});

test('updateHousehold accepts a valid approval snapshot and saves the canonical household state', async () => {
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
        const result = await updateHousehold(
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
        );

        assert.equal(result, household);
        assert.equal(household.saveCalls, 1);
        assert.deepEqual(household.populateCalls, [
            'owner',
            'members.user',
            'sharedCookbook',
        ]);
        assert.deepEqual(approvalInput, {
            status: 'approved',
            approvedAt: '2026-06-13T15:05:00.000Z',
        });
        assert.deepEqual(household.planApproval, {
            status: 'APPROVED',
            approvedAt: new Date('2026-06-13T15:05:00.000Z'),
        });
        assert.equal(household.planApproval.approvedAt.toISOString(), '2026-06-13T15:05:00.000Z');
        assert.equal(household.updatedAt.toISOString(), '2026-06-13T15:05:00.000Z');
    } finally {
        restoreAll(findByIdMock);
    }
});

test('updateHousehold rejects approved plan approval payloads without an approval timestamp before saving', async () => {
    const originalUpdatedAt = new Date('2026-06-13T15:00:00.000Z');
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
                            planApproval: {
                                status: 'approved',
                            },
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
                assert.ok(error instanceof HouseholdPlanApprovalValidationError);
                assert.equal(error.code, 'missingApprovalTimestamp');
                assert.equal(
                    error.message,
                    'Approved household plans must include an approval timestamp.',
                );
                assert.equal(error.isUserSafe, true);
                return true;
            },
        );

        assert.equal(findByIdMock.mock.callCount(), 1);
        assert.equal(household.saveCalls, 0);
        assert.deepEqual(household.populateCalls, []);
        assert.deepEqual(household.planApproval, {
            status: 'DRAFT',
            approvedAt: null,
        });
        assert.equal(household.updatedAt.toISOString(), '2026-06-13T15:00:00.000Z');
    } finally {
        restoreAll(findByIdMock);
    }
});
