// @ts-nocheck
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import test, { mock } from 'node:test';

import Household from '../../models/Household/householdSchema';
import User from '../../models/User';
import {
    createHousehold,
    joinHouseholdByInvite,
} from '../../graphql/resolvers/mutations/householdMutations';
import { HouseholdInvitePersistenceError } from '../../graphql/resolvers/householdInvite';

const restoreAll = (...trackers) => {
    for (const tracker of trackers) {
        if (typeof tracker?.mock?.restore === 'function') {
            tracker.mock.restore();
        }
    }
};

test('createHousehold rolls back the created household when linking the owner fails', async () => {
    const inviteCode = '123456789abc';
    const userId = '507f1f77bcf86cd799439011';
    let createdHouseholdId = null;
    const randomBytesMock = mock.method(crypto, 'randomBytes', (size) => {
        assert.equal(size, 6);
        return Buffer.from(inviteCode, 'hex');
    });
    const saveMock = mock.method(Household.prototype, 'save', async function saveProxy() {
        assert.equal(this.inviteCode, inviteCode);
        assert.equal(this.owner.toString(), userId);
        this._id = 'household-creation-1';
        createdHouseholdId = this._id;
        return this;
    });
    const populateMock = mock.method(Household.prototype, 'populate', async () => {
        throw new Error('populate should not run after linkage failure');
    });
    const deleteMock = mock.method(Household, 'findByIdAndDelete', async (id) => {
        assert.equal(id.toString(), createdHouseholdId.toString());
        return null;
    });
    const updateUserMock = mock.method(User, 'findByIdAndUpdate', async () => {
        throw new Error('database unavailable while linking household owner');
    });

    try {
        await assert.rejects(
            () =>
                createHousehold(
                    null,
                    {
                        input: {
                            name: 'River House',
                        },
                    },
                    {
                        user: {
                            userId,
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
                assert.equal(error.cause?.message, 'database unavailable while linking household owner');
                return true;
            },
        );

        assert.equal(saveMock.mock.callCount(), 1);
        assert.equal(populateMock.mock.callCount(), 0);
        assert.equal(deleteMock.mock.callCount(), 1);
        assert.equal(updateUserMock.mock.callCount(), 1);
    } finally {
        restoreAll(randomBytesMock, saveMock, populateMock, deleteMock, updateUserMock);
    }
});

test('joinHouseholdByInvite rolls back the member write when linking the user fails', async () => {
    const inviteCode = 'abcdef123abc';
    const household = {
        _id: 'household-2',
        owner: {
            toString: () => 'owner-1',
        },
        members: [
            {
                user: {
                    toString: () => 'owner-1',
                },
                role: 'OWNER',
            },
        ],
        saveSnapshots: [],
        async save() {
            this.saveSnapshots.push(this.members.map((member) => member.user.toString()));
            return this;
        },
        async populate() {
            throw new Error('populate should not run after linkage failure');
        },
    };
    const findOneMock = mock.method(Household, 'findOne', async (query) => {
        assert.deepEqual(query, { inviteCode });
        return household;
    });
    const updateUserMock = mock.method(User, 'findByIdAndUpdate', async () => {
        throw new Error('database unavailable while linking invited user');
    });

    try {
        await assert.rejects(
            () =>
                joinHouseholdByInvite(
                    null,
                    {
                        inviteCode: ` ${inviteCode} `,
                    },
                    {
                        user: {
                            userId: 'member-42',
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
                assert.equal(error.cause?.message, 'database unavailable while linking invited user');
                return true;
            },
        );

        assert.equal(findOneMock.mock.callCount(), 1);
        assert.equal(updateUserMock.mock.callCount(), 1);
        assert.deepEqual(household.saveSnapshots, [
            ['owner-1', 'member-42'],
            ['owner-1'],
        ]);
        assert.deepEqual(
            household.members.map((member) => member.user.toString()),
            ['owner-1'],
        );
    } finally {
        restoreAll(findOneMock, updateUserMock);
    }
});
