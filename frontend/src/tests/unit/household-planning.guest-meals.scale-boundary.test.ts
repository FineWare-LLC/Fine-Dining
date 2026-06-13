// @ts-nocheck
import assert from 'node:assert/strict';
import test, { mock } from 'node:test';

import Household from '../../models/Household/householdSchema';
import { addHouseholdGuest } from '../../graphql/resolvers/mutations/householdMutations';

const LARGE_GUEST_COUNT = 2048;

const restoreAll = (...trackers) => {
    for (const tracker of trackers) {
        if (typeof tracker?.mock?.restore === 'function') {
            tracker.mock.restore();
        }
    }
};

const buildTrackedHouseholdFixture = (updatedAt = new Date('2026-06-13T15:00:00.000Z')) => {
    const counts = {
        guestsReads: 0,
        guestIterations: 0,
    };

    const guests = new Proxy(
        Array.from({ length: LARGE_GUEST_COUNT }, (_, index) => ({
            name: `Guest ${index + 1}`,
            email: `guest-${index + 1}@example.test`,
            allergens: [],
            dietaryTags: [],
            servingMultiplier: 1,
            startDate: null,
            endDate: null,
            notes: '',
        })),
        {
            get(target, prop, receiver) {
                if (prop === Symbol.iterator) {
                    counts.guestIterations += 1;
                }

                return Reflect.get(target, prop, receiver);
            },
        },
    );

    const household = {
        _id: 'household-guest-scale-1',
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
    };

    Object.defineProperty(household, 'guests', {
        enumerable: true,
        get() {
            counts.guestsReads += 1;
            return guests;
        },
    });

    return {
        counts,
        guests,
        household,
    };
};

test('addHouseholdGuest keeps a large guest fixture deterministic without copying the existing guest collection at the scale boundary', async () => {
    const { counts, guests, household } = buildTrackedHouseholdFixture();
    const findByIdMock = mock.method(Household, 'findById', (id) => {
        assert.equal(id, 'household-guest-scale-1');
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
                householdId: 'household-guest-scale-1',
                guest: guestInput,
            },
            {
                user: {
                    userId: 'owner-1',
                },
            },
        );

        assert.equal(result, household);
        assert.equal(findByIdMock.mock.callCount(), 1);
        assert.equal(household.saveCalls, 1);
        assert.deepEqual(household.populateCalls, ['owner members.user sharedCookbook']);
        assert.equal(counts.guestsReads, 1);
        assert.equal(counts.guestIterations, 0);
        assert.equal(guests.length, LARGE_GUEST_COUNT + 1);
        assert.deepEqual(guests[LARGE_GUEST_COUNT], {
            name: 'Visiting Cousin',
            email: 'cousin@example.test',
            allergens: ['peanut', 'dairy'],
            dietaryTags: ['vegan', 'late night'],
            servingMultiplier: 2.5,
            startDate: new Date('2026-06-13T18:00:00.000Z'),
            endDate: new Date('2026-06-14T18:00:00.000Z'),
            notes: 'Needs quiet seating',
        });
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
