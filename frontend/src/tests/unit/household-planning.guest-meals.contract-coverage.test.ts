// @ts-nocheck
import assert from 'node:assert/strict';
import test, { mock } from 'node:test';

import Household from '../../models/Household/householdSchema';
import {
    addHouseholdGuest,
} from '../../graphql/resolvers/mutations/householdMutations';
import {
    getHousehold,
} from '../../graphql/resolvers/queries/householdQueries';
import {
    HouseholdGuestValidationError,
    validateHouseholdGuest,
} from '../../utils/householdGuest';

const restoreAll = (...trackers) => {
    for (const tracker of trackers) {
        if (typeof tracker?.mock?.restore === 'function') {
            tracker.mock.restore();
        }
    }
};

const buildHouseholdFixture = (updatedAt = new Date('2026-06-13T15:00:00.000Z')) => ({
    _id: 'household-guest-1',
    name: 'River House',
    type: 'FAMILY',
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
    guests: [],
    sharedCookbook: null,
    planningDefaults: {
        mealsPerDay: 3,
        planDurationDays: 7,
    },
    updatedAt,
    saveCalls: 0,
    populateCalls: [],
    async save() {
        this.saveCalls += 1;
        return this;
    },
    populate(paths) {
        this.populateCalls.push(paths);
        return this;
    },
});

test('validateHouseholdGuest canonicalizes temporary guest constraints', () => {
    const input = {
        name: '  Visiting Cousin  ',
        email: ' cousin@example.test ',
        allergens: [' peanut ', ' dairy ', ''],
        dietaryTags: [' vegan ', ' late night '],
        servingMultiplier: 2.5,
        startDate: '2026-06-13T18:00:00.000Z',
        endDate: new Date('2026-06-14T18:00:00.000Z'),
        notes: '  Needs quiet seating  ',
    };

    const result = validateHouseholdGuest(input);

    assert.equal(result.valid, true);
    assert.equal(result.error, null);
    assert.deepEqual(result.guest, {
        name: 'Visiting Cousin',
        email: 'cousin@example.test',
        allergens: ['peanut', 'dairy'],
        dietaryTags: ['vegan', 'late night'],
        servingMultiplier: 2.5,
        startDate: new Date('2026-06-13T18:00:00.000Z'),
        endDate: new Date('2026-06-14T18:00:00.000Z'),
        notes: 'Needs quiet seating',
    });
    assert.deepEqual(input, {
        name: '  Visiting Cousin  ',
        email: ' cousin@example.test ',
        allergens: [' peanut ', ' dairy ', ''],
        dietaryTags: [' vegan ', ' late night '],
        servingMultiplier: 2.5,
        startDate: '2026-06-13T18:00:00.000Z',
        endDate: new Date('2026-06-14T18:00:00.000Z'),
        notes: '  Needs quiet seating  ',
    });
});

test('addHouseholdGuest accepts a canonical guest payload and persists the normalized snapshot', async () => {
    const household = buildHouseholdFixture();
    const findByIdMock = mock.method(Household, 'findById', (id) => {
        assert.equal(id, 'household-guest-1');
        return household;
    });

    const guestInput = {
        name: '  Visiting Cousin  ',
        email: ' cousin@example.test ',
        allergens: [' peanut ', ' dairy '],
        dietaryTags: [' vegan ', ' late night '],
        servingMultiplier: 2.5,
        startDate: '2026-06-13T18:00:00.000Z',
        endDate: '2026-06-14T18:00:00.000Z',
        notes: '  Needs quiet seating  ',
    };

    try {
        const result = await addHouseholdGuest(
            null,
            {
                householdId: 'household-guest-1',
                guest: guestInput,
            },
            {
                user: {
                    userId: 'owner-1',
                },
            },
        );

        assert.equal(findByIdMock.mock.callCount(), 1);
        assert.equal(household.saveCalls, 1);
        assert.deepEqual(household.populateCalls, ['owner members.user sharedCookbook']);
        assert.equal(household.guests.length, 1);
        assert.deepEqual(household.guests[0], {
            name: 'Visiting Cousin',
            email: 'cousin@example.test',
            allergens: ['peanut', 'dairy'],
            dietaryTags: ['vegan', 'late night'],
            servingMultiplier: 2.5,
            startDate: new Date('2026-06-13T18:00:00.000Z'),
            endDate: new Date('2026-06-14T18:00:00.000Z'),
            notes: 'Needs quiet seating',
        });
        assert.equal(result, household);
        assert.deepEqual(guestInput, {
            name: '  Visiting Cousin  ',
            email: ' cousin@example.test ',
            allergens: [' peanut ', ' dairy '],
            dietaryTags: [' vegan ', ' late night '],
            servingMultiplier: 2.5,
            startDate: '2026-06-13T18:00:00.000Z',
            endDate: '2026-06-14T18:00:00.000Z',
            notes: '  Needs quiet seating  ',
        });
    } finally {
        restoreAll(findByIdMock);
    }
});

test('addHouseholdGuest rejects malformed guest payloads with a typed, user-safe error before persistence', async () => {
    const household = buildHouseholdFixture();
    const findByIdMock = mock.method(Household, 'findById', (id) => {
        assert.equal(id, 'household-guest-1');
        return household;
    });

    try {
        await assert.rejects(
            () =>
                addHouseholdGuest(
                    null,
                    {
                        householdId: 'household-guest-1',
                        guest: {
                            name: 'Visiting Cousin',
                            allergens: [' peanut ', ' dairy '],
                            dietaryTags: ['vegan', 7],
                            servingMultiplier: 1,
                            notes: 'This payload is malformed.',
                        },
                    },
                    {
                        user: {
                            userId: 'owner-1',
                        },
                    },
                ),
            (error) => {
                assert.ok(error instanceof HouseholdGuestValidationError);
                assert.equal(error.code, 'invalidPayload');
                assert.equal(
                    error.message,
                    'We could not read your temporary guest details. Please refresh the planner.',
                );
                assert.equal(error.isUserSafe, true);
                return true;
            },
        );

        assert.equal(findByIdMock.mock.callCount(), 1);
        assert.equal(household.saveCalls, 0);
        assert.deepEqual(household.populateCalls, []);
        assert.equal(household.guests.length, 0);
    } finally {
        restoreAll(findByIdMock);
    }
});

test('getHousehold keeps guest data canonical across refreshes', async () => {
    const household = buildHouseholdFixture();
    household.guests = [
        {
            name: '  Visiting Cousin  ',
            email: ' cousin@example.test ',
            allergens: [' peanut ', ' dairy '],
            dietaryTags: [' vegan ', ' late night '],
            servingMultiplier: 2.5,
            startDate: '2026-06-13T18:00:00.000Z',
            endDate: '2026-06-14T18:00:00.000Z',
            notes: '  Needs quiet seating  ',
        },
    ];
    const findByIdMock = mock.method(Household, 'findById', (id) => {
        assert.equal(id, 'household-guest-1');
        return household;
    });

    try {
        const refreshedHousehold = await getHousehold(
            null,
            { id: 'household-guest-1' },
            {
                user: {
                    userId: 'owner-1',
                },
            },
        );

        assert.equal(refreshedHousehold, household);
        assert.deepEqual(household.populateCalls, ['owner', 'members.user', 'sharedCookbook']);
        assert.deepEqual(refreshedHousehold.guests[0], {
            name: 'Visiting Cousin',
            email: 'cousin@example.test',
            allergens: ['peanut', 'dairy'],
            dietaryTags: ['vegan', 'late night'],
            servingMultiplier: 2.5,
            startDate: new Date('2026-06-13T18:00:00.000Z'),
            endDate: new Date('2026-06-14T18:00:00.000Z'),
            notes: 'Needs quiet seating',
        });
    } finally {
        restoreAll(findByIdMock);
    }
});
