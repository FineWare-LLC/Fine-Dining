// @ts-nocheck
import assert from 'node:assert/strict';
import test, { mock } from 'node:test';

import Household from '../../models/Household/householdSchema';
import User from '../../models/User';
import { addHouseholdMember } from '../../graphql/resolvers/mutations/householdMutations';

const LARGE_MEMBER_COUNT = 1024;

const restoreAll = (...trackers) => {
    for (const tracker of trackers) {
        if (typeof tracker?.mock?.restore === 'function') {
            tracker.mock.restore();
        }
    }
};

const createTrackedMember = (index, counts) => {
    const userId = index === 0 ? 'owner-1' : `member-${index}`;

    const member = {};
    Object.defineProperties(member, {
        user: {
            enumerable: true,
            get() {
                counts.memberReads += 1;
                return {
                    toString: () => userId,
                };
            },
        },
        role: {
            enumerable: true,
            get() {
                counts.memberReads += 1;
                return index === 0 ? 'OWNER' : 'MEMBER';
            },
        },
        servingMultiplier: {
            enumerable: true,
            get() {
                counts.memberReads += 1;
                return 1;
            },
        },
        includeInPlanning: {
            enumerable: true,
            get() {
                counts.memberReads += 1;
                return true;
            },
        },
        joinedAt: {
            enumerable: true,
            get() {
                counts.memberReads += 1;
                return new Date('2026-06-13T14:00:00.000Z');
            },
        },
    });

    return member;
};

const buildHouseholdFixture = (counts) => ({
    _id: 'household-1',
    owner: {
        toString: () => 'owner-1',
    },
    members: Array.from({ length: LARGE_MEMBER_COUNT }, (_, index) => createTrackedMember(index, counts)),
    guests: [],
    headcount: 1,
    saveCalls: 0,
    populateCalls: [],
    async save() {
        this.saveCalls += 1;
        this.headcount = LARGE_MEMBER_COUNT + 1;
        return this;
    },
    async populate(paths) {
        this.populateCalls.push(paths);
        return this;
    },
});

test('addHouseholdMember keeps a large per-member snapshot shallow enough to stay within the scale budget', async () => {
    const counts = {
        memberReads: 0,
    };
    const household = buildHouseholdFixture(counts);
    const findByIdMock = mock.method(Household, 'findById', async (id) => {
        assert.equal(id, 'household-1');
        return household;
    });
    const updateUserMock = mock.method(User, 'findByIdAndUpdate', async (id, update) => {
        assert.equal(id, 'member-1025');
        assert.deepEqual(update, { activeHousehold: 'household-1' });
        return update;
    });

    try {
        const result = await addHouseholdMember(
            null,
            {
                householdId: 'household-1',
                member: {
                    userId: 'member-1025',
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
        assert.equal(household.headcount, LARGE_MEMBER_COUNT + 1);
        assert.equal(result.headcount, LARGE_MEMBER_COUNT + 1);
        assert.equal(household.members.length, LARGE_MEMBER_COUNT + 1);
        assert.equal(result.members.length, LARGE_MEMBER_COUNT + 1);
        assert.deepEqual(household.populateCalls, ['owner members.user sharedCookbook']);
        assert.ok(
            counts.memberReads <= LARGE_MEMBER_COUNT + 10,
            `Expected the large household snapshot to stay shallow, saw ${counts.memberReads} member field reads`,
        );
    } finally {
        restoreAll(findByIdMock, updateUserMock);
    }
});
