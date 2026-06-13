// @ts-nocheck
import assert from 'node:assert/strict';
import test, { mock } from 'node:test';

import Household from '../../models/Household/householdSchema';
import { updateHousehold } from '../../graphql/resolvers/mutations/householdMutations';

const LARGE_MEMBER_COUNT = 2048;
const LARGE_GUEST_COUNT = 512;

const restoreAll = (...trackers) => {
    for (const tracker of trackers) {
        if (typeof tracker?.mock?.restore === 'function') {
            tracker.mock.restore();
        }
    }
};

const buildTrackedCollection = (items, counts, key) => new Proxy(items, {
    get(target, prop, receiver) {
        if (prop === Symbol.iterator) {
            counts[key] += 1;
        }

        return Reflect.get(target, prop, receiver);
    },
});

const buildHouseholdFixture = (updatedAt) => {
    const counts = {
        members: 0,
        guests: 0,
    };

    const members = buildTrackedCollection(
        Array.from({ length: LARGE_MEMBER_COUNT }, (_, index) => ({
            user: { toString: () => `member-${index}` },
            role: index === 0 ? 'OWNER' : 'MEMBER',
            includeInPlanning: index % 5 !== 0,
            servingMultiplier: 1,
        })),
        counts,
        'members',
    );

    const guests = buildTrackedCollection(
        Array.from({ length: LARGE_GUEST_COUNT }, (_, index) => ({
            name: `Guest ${index}`,
            servingMultiplier: 1,
        })),
        counts,
        'guests',
    );

    const household = {
        _id: 'household-1',
        name: 'River House',
        type: 'FAMILY',
        owner: {
            toString: () => 'owner-1',
        },
        members,
        guests,
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
        async save() {
            this.saveCalls += 1;
            this.updatedAt = new Date('2026-06-13T15:05:00.000Z');
            return this;
        },
        async populate(paths) {
            this.populateCalls.push(paths);
            return this;
        },
    };

    return {
        counts,
        household,
    };
};

test('updateHousehold keeps a large plan approval fixture deterministic without copying member or guest collections at the scale boundary', async () => {
    const originalUpdatedAt = new Date('2026-06-13T15:00:00.000Z');
    const { counts, household } = buildHouseholdFixture(originalUpdatedAt);
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
        assert.equal(counts.members, 0);
        assert.equal(counts.guests, 0);
        assert.deepEqual(household.planApproval, {
            status: 'APPROVED',
            approvedAt: new Date('2026-06-13T15:05:00.000Z'),
        });
        assert.equal(household.planApproval.approvedAt.toISOString(), '2026-06-13T15:05:00.000Z');
        assert.equal(household.updatedAt.toISOString(), '2026-06-13T15:05:00.000Z');
        assert.deepEqual(approvalInput, {
            status: 'approved',
            approvedAt: '2026-06-13T15:05:00.000Z',
        });
    } finally {
        restoreAll(findByIdMock);
    }
});
