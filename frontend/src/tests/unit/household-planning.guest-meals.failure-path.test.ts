// @ts-nocheck
import assert from 'node:assert/strict';
import test, { mock } from 'node:test';

import Household from '../../models/Household/householdSchema';
import {
    addHouseholdGuest,
} from '../../graphql/resolvers/mutations/householdMutations';

const restoreAll = (...trackers) => {
    for (const tracker of trackers) {
        if (typeof tracker?.mock?.restore === 'function') {
            tracker.mock.restore();
        }
    }
};

const buildHouseholdFixture = () => ({
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
    updatedAt: new Date('2026-06-13T15:00:00.000Z'),
    saveCalls: 0,
    populateCalls: [],
    depopulateCalls: [],
    saveSnapshots: [],
    async save() {
        this.saveCalls += 1;
        this.saveSnapshots.push(this.guests.map((guest) => guest.name));
        return this;
    },
    async populate(paths) {
        this.populateCalls.push(paths);
        throw new Error('database unavailable while populating guest meals');
    },
    depopulate(paths) {
        this.depopulateCalls.push(paths);
    },
});

test('addHouseholdGuest rolls back a failed populate save and keeps temporary guests canonical', async () => {
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
        await assert.rejects(
            () =>
                addHouseholdGuest(
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
                ),
            (error) => {
                assert.equal(error.name, 'HouseholdGuestPersistenceError');
                assert.equal(error.code, 'householdGuestPersistenceFailed');
                assert.equal(error.reason, 'populate');
                assert.equal(
                    error.message,
                    'We could not save your temporary guest. Please try again.',
                );
                assert.equal(error.isUserSafe, true);
                assert.equal(
                    error.cause?.message,
                    'database unavailable while populating guest meals',
                );
                return true;
            },
        );

        assert.equal(findByIdMock.mock.callCount(), 1);
        assert.equal(household.saveCalls, 2);
        assert.deepEqual(household.populateCalls, ['owner members.user sharedCookbook']);
        assert.deepEqual(household.depopulateCalls, ['owner members.user sharedCookbook']);
        assert.deepEqual(household.saveSnapshots, [
            ['Visiting Cousin'],
            [],
        ]);
        assert.deepEqual(household.guests, []);
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
