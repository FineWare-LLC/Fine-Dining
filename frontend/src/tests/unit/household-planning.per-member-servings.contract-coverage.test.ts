// @ts-nocheck
import assert from 'node:assert/strict';
import test, { mock } from 'node:test';

import Household from '../../models/Household/householdSchema';
import User from '../../models/User';
import { addHouseholdMember } from '../../graphql/resolvers/mutations/householdMutations';
import { HouseholdServingMultiplierValidationError } from '../../utils/householdMemberServings';

const restoreAll = (...trackers) => {
    for (const tracker of trackers) {
        if (typeof tracker?.mock?.restore === 'function') {
            tracker.mock.restore();
        }
    }
};

const buildHouseholdFixture = () => {
    const fixture = {
        _id: 'household-1',
        owner: {
            toString: () => 'owner-1',
        },
        members: [
            {
                user: {
                    toString: () => 'owner-1',
                },
                role: 'OWNER',
                servingMultiplier: 1,
                includeInPlanning: true,
            },
        ],
        saveCalls: 0,
        populateCalls: [],
        async save() {
            this.saveCalls += 1;
            return this;
        },
        async populate(paths) {
            this.populateCalls.push(paths);
            return {
                id: this._id,
                owner: { id: 'owner-1' },
                members: this.members.map((member) => ({
                    user: { id: member.user.toString() },
                    role: member.role,
                    servingMultiplier: member.servingMultiplier,
                    includeInPlanning: member.includeInPlanning,
                })),
            };
        },
    };

    return fixture;
};

test('addHouseholdMember accepts a fractional serving multiplier and persists the canonical member snapshot', async () => {
    const household = buildHouseholdFixture();
    const findByIdMock = mock.method(Household, 'findById', async (id) => {
        assert.equal(id, 'household-1');
        return household;
    });
    const updateUserMock = mock.method(User, 'findByIdAndUpdate', async (id, update) => {
        assert.equal(id, 'member-42');
        assert.deepEqual(update, { activeHousehold: 'household-1' });
        return update;
    });

    try {
        const result = await addHouseholdMember(
            null,
            {
                householdId: 'household-1',
                member: {
                    userId: 'member-42',
                    role: 'MEMBER',
                    servingMultiplier: 0.5,
                    includeInPlanning: true,
                },
            },
            {
                user: {
                    userId: 'owner-1',
                },
            },
        );

        assert.equal(findByIdMock.mock.callCount(), 1);
        assert.equal(updateUserMock.mock.callCount(), 1);
        assert.equal(household.saveCalls, 1);
        assert.deepEqual(household.populateCalls, ['owner members.user sharedCookbook']);
        assert.equal(household.members[1].servingMultiplier, 0.5);
        assert.equal(result.members[1].servingMultiplier, 0.5);
        assert.equal(result.members[1].includeInPlanning, true);
    } finally {
        restoreAll(findByIdMock, updateUserMock);
    }
});

test('addHouseholdMember rejects malformed serving multipliers with a typed, user-safe error before persistence', async () => {
    const household = buildHouseholdFixture();
    const findByIdMock = mock.method(Household, 'findById', async (id) => {
        assert.equal(id, 'household-1');
        return household;
    });
    const updateUserMock = mock.method(User, 'findByIdAndUpdate', async () => {
        throw new Error('user linkage should not run when the multiplier is invalid');
    });

    try {
        await assert.rejects(
            () =>
                addHouseholdMember(
                    null,
                    {
                        householdId: 'household-1',
                        member: {
                            userId: 'member-42',
                            role: 'MEMBER',
                            servingMultiplier: 0,
                            includeInPlanning: true,
                        },
                    },
                    {
                        user: {
                            userId: 'owner-1',
                        },
                    },
                ),
            (error) => {
                assert.ok(error instanceof HouseholdServingMultiplierValidationError);
                assert.equal(error.code, 'invalidServingMultiplier');
                assert.equal(
                    error.message,
                    'Per-member serving multipliers must be between 0.1 and 10.',
                );
                assert.equal(error.isUserSafe, true);
                return true;
            },
        );

        assert.equal(findByIdMock.mock.callCount(), 1);
        assert.equal(updateUserMock.mock.callCount(), 0);
        assert.equal(household.saveCalls, 0);
        assert.deepEqual(household.populateCalls, []);
        assert.equal(household.members.length, 1);
    } finally {
        restoreAll(findByIdMock, updateUserMock);
    }
});
