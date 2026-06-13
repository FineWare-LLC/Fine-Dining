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
import { getHouseholdByInviteCode } from '../../graphql/resolvers/queries/householdQueries';
import { HouseholdInviteValidationError } from '../../graphql/resolvers/householdInvite';

const restoreAll = (...trackers) => {
    for (const tracker of trackers) {
        if (typeof tracker?.mock?.restore === 'function') {
            tracker.mock.restore();
        }
    }
};

test('createHousehold generates a hex invite code that fits the invite contract', async () => {
    const inviteCode = '123456789abc';
    const userId = '507f1f77bcf86cd799439011';
    const randomBytesMock = mock.method(crypto, 'randomBytes', (size) => {
        assert.equal(size, 6);
        return Buffer.from(inviteCode, 'hex');
    });
    const saveMock = mock.method(Household.prototype, 'save', async function saveProxy() {
        assert.equal(this.inviteCode, inviteCode);
        assert.equal(this.owner.toString(), userId);
        assert.deepEqual(
            this.members.map((member) => ({
                user: member.user.toString(),
                role: member.role,
            })),
            [
                {
                    user: userId,
                    role: 'OWNER',
                },
            ],
        );
        this._id = 'household-1';
        return this;
    });
    const populateMock = mock.method(Household.prototype, 'populate', async (paths) => {
        assert.equal(paths, 'owner members.user');
        return {
            id: 'household-1',
            inviteCode,
            owner: { id: userId },
            members: [{ user: { id: userId }, role: 'OWNER' }],
        };
    });
    const updateUserMock = mock.method(User, 'findByIdAndUpdate', async (id, update) => {
        assert.equal(id, userId);
        assert.equal(update.activeHousehold?.constructor?.name, 'ObjectId');
        assert.equal(typeof update.activeHousehold?.toString(), 'string');
        return update;
    });

    try {
        const result = await createHousehold(
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
        );

        assert.deepEqual(result, {
            id: 'household-1',
            inviteCode,
            owner: { id: userId },
            members: [{ user: { id: userId }, role: 'OWNER' }],
        });
        assert.equal(randomBytesMock.mock.callCount(), 1);
        assert.equal(saveMock.mock.callCount(), 1);
        assert.equal(populateMock.mock.callCount(), 1);
        assert.equal(updateUserMock.mock.callCount(), 1);
    } finally {
        restoreAll(randomBytesMock, saveMock, populateMock, updateUserMock);
    }
});

test('joinHouseholdByInvite accepts a trimmed invite code and adds the caller as a member', async () => {
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
        saveCalls: 0,
        async save() {
            this.saveCalls += 1;
            assert.equal(this.members.length, 2);
            assert.equal(this.members[1].user.toString(), 'member-42');
            assert.equal(this.members[1].role, 'MEMBER');
            return this;
        },
        async populate(paths) {
            assert.equal(paths, 'owner members.user sharedCookbook');
            return {
                id: 'household-2',
                inviteCode,
                owner: { id: 'owner-1' },
                members: [
                    { user: { id: 'owner-1' }, role: 'OWNER' },
                    { user: { id: 'member-42' }, role: 'MEMBER' },
                ],
                sharedCookbook: null,
            };
        },
    };
    const findOneMock = mock.method(Household, 'findOne', async (query) => {
        assert.deepEqual(query, { inviteCode });
        return household;
    });
    const updateUserMock = mock.method(User, 'findByIdAndUpdate', async (id, update) => {
        assert.equal(id, 'member-42');
        assert.deepEqual(update, { activeHousehold: 'household-2' });
        return update;
    });

    try {
        const result = await joinHouseholdByInvite(
            null,
            {
                inviteCode: ` ${inviteCode} `,
            },
            {
                user: {
                    userId: 'member-42',
                },
            },
        );

        assert.deepEqual(result, {
            id: 'household-2',
            inviteCode,
            owner: { id: 'owner-1' },
            members: [
                { user: { id: 'owner-1' }, role: 'OWNER' },
                { user: { id: 'member-42' }, role: 'MEMBER' },
            ],
            sharedCookbook: null,
        });
        assert.equal(household.saveCalls, 1);
        assert.equal(findOneMock.mock.callCount(), 1);
        assert.equal(updateUserMock.mock.callCount(), 1);
    } finally {
        restoreAll(findOneMock, updateUserMock);
    }
});

test('getHouseholdByInviteCode rejects malformed invite codes with a typed user-safe error before lookup', async () => {
    const findOneMock = mock.method(Household, 'findOne', async () => {
        throw new Error('lookup should not run for malformed invite codes');
    });

    try {
        await assert.rejects(
            () => getHouseholdByInviteCode(null, { inviteCode: 'not-an-invite' }, {}),
            (error) => {
                assert.ok(error instanceof HouseholdInviteValidationError);
                assert.equal(error.code, 'invalidInviteCode');
                assert.equal(error.message, 'Please enter a valid household invite code.');
                assert.equal(error.isUserSafe, true);
                return true;
            },
        );
        assert.equal(findOneMock.mock.callCount(), 0);
    } finally {
        restoreAll(findOneMock);
    }
});
