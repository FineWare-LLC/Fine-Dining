// @ts-nocheck
import assert from 'node:assert/strict';
import test, { mock } from 'node:test';

import Household from '../../models/Household/householdSchema';
import User from '../../models/User';
import { addHouseholdMember } from '../../graphql/resolvers/mutations/householdMutations';
import { HouseholdInvitePersistenceError } from '../../graphql/resolvers/householdInvite';

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

test('addHouseholdMember rolls back a failed user link and surfaces a recoverable error', async () => {
    const household = buildHouseholdFixture();
    const findByIdMock = mock.method(Household, 'findById', async (id) => {
        assert.equal(id, 'household-1');
        return household;
    });
    const updateUserMock = mock.method(User, 'findByIdAndUpdate', async (id, update) => {
        assert.equal(id, 'member-42');
        assert.deepEqual(update, { activeHousehold: 'household-1' });
        throw new Error('user linkage unavailable');
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
                            servingMultiplier: 0.5,
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
                assert.ok(error instanceof HouseholdInvitePersistenceError);
                assert.equal(error.code, 'householdInvitePersistenceFailed');
                assert.equal(error.reason, 'linkUser');
                assert.equal(
                    error.message,
                    'We could not update your household membership. Please try again.',
                );
                assert.equal(error.isUserSafe, true);
                return true;
            },
        );

        assert.equal(findByIdMock.mock.callCount(), 1);
        assert.equal(updateUserMock.mock.callCount(), 1);
        assert.equal(household.saveCalls, 2);
        assert.equal(household.members.length, 1);
        assert.equal(household.members[0].role, 'OWNER');
        assert.deepEqual(household.populateCalls, []);
    } finally {
        restoreAll(findByIdMock, updateUserMock);
    }
});
