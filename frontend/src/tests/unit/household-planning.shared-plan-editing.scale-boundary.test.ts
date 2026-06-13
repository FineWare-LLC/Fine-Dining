// @ts-nocheck
import assert from 'node:assert/strict';
import test, { mock } from 'node:test';

import Household from '../../models/Household/householdSchema';
import {
    getHousehold,
} from '../../graphql/resolvers/queries/householdQueries';
import { updateHousehold } from '../../graphql/resolvers/mutations/householdMutations';

const LARGE_MEMBER_COUNT = 1024;
const LARGE_GUEST_COUNT = 256;
const CURRENT_UPDATED_AT = new Date('2026-06-13T15:00:00.000Z');
const NEXT_UPDATED_AT = new Date('2026-06-13T15:05:00.000Z');

const restoreAll = (...trackers) => {
    for (const tracker of trackers) {
        if (typeof tracker?.mock?.restore === 'function') {
            tracker.mock.restore();
        }
    }
};

const createMember = (index, snapshotCounts) => {
    const member = {
        role: index % 9 === 0 ? 'ADMIN' : 'MEMBER',
        servingMultiplier: index % 4 === 0 ? 0.5 : 1,
        includeInPlanning: true,
        joinedAt: new Date('2026-06-13T14:00:00.000Z'),
    };

    if (snapshotCounts && index === 0) {
        Object.defineProperty(member, 'user', {
            enumerable: true,
            get() {
                snapshotCounts.memberReads += 1;
                return {
                    toString: () => `member-${index}`,
                };
            },
        });
        return member;
    }

    member.user = {
        toString: () => `member-${index}`,
    };

    return member;
};

const createGuest = (index) => ({
    name: `Guest ${index + 1}`,
    email: `guest-${index + 1}@example.test`,
    allergens: index % 2 === 0 ? ['milk'] : [],
    dietaryTags: ['flexitarian'],
    servingMultiplier: 1,
    startDate: null,
    endDate: null,
    notes: `Visiting guest ${index + 1}`,
});

const buildLargeHouseholdFixture = ({
    updatedAt,
    snapshotCounts = null,
}) => {
    const planningDefaults = {
        mealsPerDay: 3,
        planDurationDays: 7,
        budgetPerDay: 20,
        budgetPerWeek: 140,
        mealSlots: ['BREAKFAST', 'LUNCH', 'DINNER'],
    };

    const fixture = {
        _id: 'household-1',
        name: 'River House',
        type: 'FAMILY',
        owner: {
            toString: () => 'owner-1',
        },
        members: Array.from({ length: LARGE_MEMBER_COUNT }, (_, index) => createMember(index, snapshotCounts)),
        guests: Array.from({ length: LARGE_GUEST_COUNT }, (_, index) => createGuest(index)),
        sharedCookbook: null,
        headcount: 1,
        updatedAt,
        saveCalls: 0,
        populateCalls: [],
        async save() {
            this.saveCalls += 1;
            this.headcount = Math.max(
                1,
                this.members.filter((member) => member.includeInPlanning).length + this.guests.length,
            );
            this.updatedAt = NEXT_UPDATED_AT;
            return this;
        },
        populate(paths) {
            this.populateCalls.push(paths);
            return this;
        },
    };

    if (snapshotCounts) {
        Object.defineProperty(fixture, 'planningDefaults', {
            enumerable: true,
            get() {
                snapshotCounts.planningDefaultsReads += 1;
                return planningDefaults;
            },
            set(value) {
                planningDefaults.mealsPerDay = value.mealsPerDay;
                planningDefaults.planDurationDays = value.planDurationDays;
                planningDefaults.budgetPerDay = value.budgetPerDay;
                planningDefaults.budgetPerWeek = value.budgetPerWeek;
                planningDefaults.mealSlots = Array.isArray(value.mealSlots)
                    ? [...value.mealSlots]
                    : value.mealSlots;
            },
        });
    } else {
        fixture.planningDefaults = planningDefaults;
    }

    return fixture;
};

const summarizeHousehold = (household) => ({
    name: household.name,
    updatedAt: household.updatedAt.toISOString(),
    planningDefaults: household.planningDefaults,
    headcount: household.headcount,
    members: household.members.length,
    guests: household.guests.length,
    populateCalls: household.populateCalls,
    saveCalls: household.saveCalls,
});

test('updateHousehold keeps a large shared plan refresh deterministic across identical fixtures', async () => {
    const originalUpdatedAt = CURRENT_UPDATED_AT;
    const firstHousehold = buildLargeHouseholdFixture({ updatedAt: originalUpdatedAt });
    const secondHousehold = buildLargeHouseholdFixture({ updatedAt: originalUpdatedAt });
    let findByIdCalls = 0;
    const findByIdMock = mock.method(Household, 'findById', (id) => {
        assert.equal(id, 'household-1');
        findByIdCalls += 1;
        return findByIdCalls <= 2 ? firstHousehold : secondHousehold;
    });

    try {
        const firstUpdatedHousehold = await updateHousehold(
            null,
            {
                id: 'household-1',
                input: {
                    name: 'Updated River House',
                    planningDefaults: {
                        mealsPerDay: 4,
                        planDurationDays: 5,
                        budgetPerDay: 24,
                        budgetPerWeek: 168,
                        mealSlots: ['BREAKFAST', 'DINNER'],
                    },
                    expectedUpdatedAt: originalUpdatedAt,
                },
            },
            {
                user: {
                    userId: 'owner-1',
                },
            },
        );

        const firstRefreshedHousehold = await getHousehold(
            null,
            { id: 'household-1' },
            {
                user: {
                    userId: 'owner-1',
                },
            },
        );

        const secondUpdatedHousehold = await updateHousehold(
            null,
            {
                id: 'household-1',
                input: {
                    name: 'Updated River House',
                    planningDefaults: {
                        mealsPerDay: 4,
                        planDurationDays: 5,
                        budgetPerDay: 24,
                        budgetPerWeek: 168,
                        mealSlots: ['BREAKFAST', 'DINNER'],
                    },
                    expectedUpdatedAt: originalUpdatedAt,
                },
            },
            {
                user: {
                    userId: 'owner-1',
                },
            },
        );

        const secondRefreshedHousehold = await getHousehold(
            null,
            { id: 'household-1' },
            {
                user: {
                    userId: 'owner-1',
                },
            },
        );

        assert.equal(findByIdMock.mock.callCount(), 4);
        assert.equal(firstUpdatedHousehold, firstHousehold);
        assert.equal(firstRefreshedHousehold, firstHousehold);
        assert.equal(secondUpdatedHousehold, secondHousehold);
        assert.equal(secondRefreshedHousehold, secondHousehold);
        assert.deepEqual(summarizeHousehold(firstRefreshedHousehold), {
            name: 'Updated River House',
            updatedAt: NEXT_UPDATED_AT.toISOString(),
            planningDefaults: {
                mealsPerDay: 4,
                planDurationDays: 5,
                budgetPerDay: 24,
                budgetPerWeek: 168,
                mealSlots: ['BREAKFAST', 'DINNER'],
            },
            headcount: LARGE_MEMBER_COUNT + LARGE_GUEST_COUNT,
            members: LARGE_MEMBER_COUNT,
            guests: LARGE_GUEST_COUNT,
            populateCalls: [
                'owner',
                'members.user',
                'sharedCookbook',
                'owner',
                'members.user',
                'sharedCookbook',
            ],
            saveCalls: 1,
        });
        assert.deepEqual(summarizeHousehold(secondRefreshedHousehold), summarizeHousehold(firstRefreshedHousehold));
    } finally {
        restoreAll(findByIdMock);
    }
});

test('updateHousehold rejects a stale expectedUpdatedAt token before walking a large household snapshot', async () => {
    const snapshotCounts = {
        memberReads: 0,
        planningDefaultsReads: 0,
    };
    const household = buildLargeHouseholdFixture({
        updatedAt: CURRENT_UPDATED_AT,
        snapshotCounts,
    });
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
                            planningDefaults: {
                                mealsPerDay: 4,
                                planDurationDays: 5,
                                budgetPerDay: 24,
                                budgetPerWeek: 168,
                                mealSlots: ['BREAKFAST', 'DINNER'],
                            },
                            expectedUpdatedAt: new Date('2026-06-13T14:55:00.000Z'),
                        },
                    },
                    {
                        user: {
                            userId: 'owner-1',
                        },
                    },
                ),
            (error) => {
                assert.equal(error.name, 'HouseholdRevisionValidationError');
                assert.equal(error.code, 'staleHouseholdRevision');
                assert.equal(
                    error.message,
                    'This household was updated by someone else. Please refresh and try again.',
                );
                assert.equal(error.isUserSafe, true);
                return true;
            },
        );

        assert.equal(findByIdMock.mock.callCount(), 1);
        assert.equal(snapshotCounts.memberReads, 0);
        assert.equal(snapshotCounts.planningDefaultsReads, 0);
        assert.equal(household.saveCalls, 0);
        assert.deepEqual(household.populateCalls, []);
        assert.equal(household.name, 'River House');
        assert.equal(household.updatedAt.toISOString(), CURRENT_UPDATED_AT.toISOString());
    } finally {
        restoreAll(findByIdMock);
    }
});
