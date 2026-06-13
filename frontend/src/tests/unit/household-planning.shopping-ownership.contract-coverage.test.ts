// @ts-nocheck
import assert from 'node:assert/strict';
import test, { mock } from 'node:test';

import Household from '../../models/Household/householdSchema';
import {
    updateHousehold,
} from '../../graphql/resolvers/mutations/householdMutations';
import { getHousehold } from '../../graphql/resolvers/queries/householdQueries';
import {
    HouseholdShoppingOwnershipValidationError,
    validateHouseholdShoppingOwnership,
} from '../../utils/householdShoppingOwnership';

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
    async populate(paths) {
        this.populateCalls.push(paths);
        return this;
    },
});

test('validateHouseholdShoppingOwnership accepts canonical shopping assignment metadata', () => {
    const result = validateHouseholdShoppingOwnership({
        userId: 'member-42',
        assignedAt: '2026-06-13T15:05:00.000Z',
    });

    assert.equal(result.valid, true);
    assert.equal(result.error, null);
    assert.deepEqual(result.shoppingOwnership, {
        userId: 'member-42',
        assignedAt: new Date('2026-06-13T15:05:00.000Z'),
    });
});

test('updateHousehold accepts shopping ownership metadata and saves the canonical household state', async () => {
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
        assert.equal(household.name, 'Updated River House');
        assert.equal(household.saveCalls, 1);
        assert.deepEqual(household.populateCalls, ['owner', 'members.user', 'sharedCookbook']);
        assert.deepEqual(shoppingOwnershipInput, {
            userId: 'member-42',
            assignedAt: '2026-06-13T15:05:00.000Z',
        });
        assert.deepEqual(household.shoppingOwnership, {
            userId: 'member-42',
            assignedAt: new Date('2026-06-13T15:05:00.000Z'),
        });
        assert.equal(household.updatedAt.toISOString(), '2026-06-13T15:05:00.000Z');
    } finally {
        restoreAll(findByIdMock);
    }
});

test('getHousehold keeps shopping ownership metadata canonical across refreshes', async () => {
    const originalUpdatedAt = new Date('2026-06-13T15:00:00.000Z');
    const household = buildHouseholdFixture(originalUpdatedAt);
    household.shoppingOwnership = {
        userId: 'member-42',
        assignedAt: '2026-06-13T15:05:00.000Z',
    };
    household.populate = function populate(paths) {
        this.populateCalls.push(paths);
        return this;
    };
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
        assert.deepEqual(household.populateCalls, ['owner', 'members.user', 'sharedCookbook']);
        assert.deepEqual(refreshedHousehold.shoppingOwnership, {
            userId: 'member-42',
            assignedAt: new Date('2026-06-13T15:05:00.000Z'),
        });
        assert.equal(refreshedHousehold.shoppingOwnership.assignedAt.toISOString(), '2026-06-13T15:05:00.000Z');
        assert.equal(refreshedHousehold.updatedAt.toISOString(), '2026-06-13T15:00:00.000Z');
    } finally {
        restoreAll(findByIdMock);
    }
});

test('updateHousehold rejects malformed shopping ownership payloads with a typed, user-safe error before saving', async () => {
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
                            shoppingOwnership: {
                                userId: 'member-42',
                                assignedAt: 'not-a-date',
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
                assert.ok(error instanceof HouseholdShoppingOwnershipValidationError);
                assert.equal(error.code, 'invalidPayload');
                assert.equal(
                    error.message,
                    'We could not read your shopping ownership assignment. Please refresh the planner.',
                );
                assert.equal(error.isUserSafe, true);
                return true;
            },
        );

        assert.equal(findByIdMock.mock.callCount(), 1);
        assert.equal(household.saveCalls, 0);
        assert.deepEqual(household.populateCalls, []);
        assert.deepEqual(household.shoppingOwnership, {
            userId: 'owner-1',
            assignedAt: new Date('2026-06-13T15:00:00.000Z'),
        });
        assert.equal(household.updatedAt.toISOString(), '2026-06-13T15:00:00.000Z');
    } finally {
        restoreAll(findByIdMock);
    }
});
