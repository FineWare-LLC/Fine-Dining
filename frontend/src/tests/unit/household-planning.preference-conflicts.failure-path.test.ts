// @ts-nocheck
import assert from 'node:assert/strict';
import test, { mock } from 'node:test';

import Household from '../../models/Household/householdSchema';
import {
    updateHousehold,
} from '../../graphql/resolvers/mutations/householdMutations';
import { HouseholdPlanningPreferencesValidationError } from '../../utils/householdPlanningPreferences';

const restoreAll = (...trackers) => {
    for (const tracker of trackers) {
        if (typeof tracker?.mock?.restore === 'function') {
            tracker.mock.restore();
        }
    }
};

test('updateHousehold rejects conflicting planning defaults before mutating the household', async () => {
    const ownerId = '507f1f77bcf86cd799439011';
    const initialPlanningDefaults = {
        mealsPerDay: 3,
        planDurationDays: 7,
        budgetPerDay: 20,
        budgetPerWeek: 140,
    };
    const conflictingPlanningDefaults = {
        mealsPerDay: 3,
        planDurationDays: 7,
        budgetPerDay: 20,
        budgetPerWeek: 100,
    };
    const household = {
        _id: 'household-1',
        owner: {
            toString: () => ownerId,
        },
        planningDefaults: {
            ...initialPlanningDefaults,
        },
        saveCalls: 0,
        populateCalls: 0,
        async save() {
            this.saveCalls += 1;
            throw new Error('save should not run after planning conflict validation fails');
        },
        async populate(paths) {
            this.populateCalls += 1;
            throw new Error(`populate should not run after planning conflict validation fails: ${paths}`);
        },
    };
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
                            planningDefaults: conflictingPlanningDefaults,
                        },
                    },
                    {
                        user: {
                            userId: ownerId,
                        },
                    },
                ),
            (error) => {
                assert.ok(error instanceof HouseholdPlanningPreferencesValidationError);
                assert.equal(error.code, 'conflictingBudgetPreferences');
                assert.equal(
                    error.message,
                    'Daily and weekly household budget preferences must agree.',
                );
                assert.equal(error.isUserSafe, true);
                return true;
            },
        );

        assert.equal(findByIdMock.mock.callCount(), 1);
        assert.equal(household.saveCalls, 0);
        assert.equal(household.populateCalls, 0);
        assert.deepEqual(household.planningDefaults, initialPlanningDefaults);
    } finally {
        restoreAll(findByIdMock);
    }
});
