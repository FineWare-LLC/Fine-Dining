// @ts-nocheck
import assert from 'node:assert/strict';
import test, { mock } from 'node:test';

import Household from '../../models/Household/householdSchema';
import User from '../../models/User';
import {
    HouseholdDeletionValidationError,
    deleteHousehold,
} from '../../graphql/resolvers/mutations/householdMutations';

const restoreAll = (...trackers) => {
    for (const tracker of trackers) {
        if (typeof tracker?.mock?.restore === 'function') {
            tracker.mock.restore();
        }
    }
};

const householdId = '507f1f77bcf86cd799439011';

const buildHouseholdFixture = () => ({
    _id: householdId,
    owner: {
        toString: () => 'owner-1',
    },
});

test('deleteHousehold accepts a valid owner request, clears active household ownership, and deletes the household', async () => {
    const household = buildHouseholdFixture();
    const findByIdMock = mock.method(Household, 'findById', async (id) => {
        assert.equal(id, householdId);
        return household;
    });
    const updateManyMock = mock.method(User, 'updateMany', async (query, update) => {
        assert.deepEqual(query, { activeHousehold: householdId });
        assert.deepEqual(update, { activeHousehold: null });
        return { acknowledged: true, modifiedCount: 3 };
    });
    const deleteMock = mock.method(Household, 'findByIdAndDelete', async (id) => {
        assert.equal(id, householdId);
        return household;
    });

    try {
        const result = await deleteHousehold(
            null,
            { id: householdId },
            {
                user: {
                    userId: 'owner-1',
                },
            },
        );

        assert.equal(result, true);
        assert.equal(findByIdMock.mock.callCount(), 1);
        assert.equal(updateManyMock.mock.callCount(), 1);
        assert.equal(deleteMock.mock.callCount(), 1);
    } finally {
        restoreAll(findByIdMock, updateManyMock, deleteMock);
    }
});

test('deleteHousehold rejects malformed household ids with a typed, user-safe error before lookup', async () => {
    const findByIdMock = mock.method(Household, 'findById', async () => {
        throw new Error('lookup should not run for malformed household ids');
    });
    const updateManyMock = mock.method(User, 'updateMany', async () => {
        throw new Error('ownership cleanup should not run for malformed household ids');
    });
    const deleteMock = mock.method(Household, 'findByIdAndDelete', async () => {
        throw new Error('deletion should not run for malformed household ids');
    });

    try {
        await assert.rejects(
            () =>
                deleteHousehold(
                    null,
                    { id: 'not-a-valid-object-id' },
                    {
                        user: {
                            userId: 'owner-1',
                        },
                    },
                ),
            (error) => {
                assert.ok(error instanceof HouseholdDeletionValidationError);
                assert.equal(error.code, 'invalidPayload');
                assert.equal(
                    error.message,
                    'We could not read the household to delete. Please refresh the planner.',
                );
                assert.equal(error.isUserSafe, true);
                return true;
            },
        );

        assert.equal(findByIdMock.mock.callCount(), 0);
        assert.equal(updateManyMock.mock.callCount(), 0);
        assert.equal(deleteMock.mock.callCount(), 0);
    } finally {
        restoreAll(findByIdMock, updateManyMock, deleteMock);
    }
});
