// @ts-nocheck
import assert from 'node:assert/strict';
import test, { mock } from 'node:test';

import Cookbook from '../../models/Cookbook/cookbookSchema';
import User from '../../models/User';
import {
    CookbookCreationPersistenceError,
    createCookbook,
} from '../../graphql/resolvers/mutations/cookbookMutations';

function restoreAll(...trackers) {
    for (const tracker of trackers) {
        if (typeof tracker?.mock?.restore === 'function') {
            tracker.mock.restore();
        }
    }
}

test('createCookbook wraps private cookbook save failures in a user-safe recovery error', async () => {
    const saveMock = mock.method(Cookbook.prototype, 'save', async function saveProxy() {
        assert.equal(this.isPublic, false);
        throw new Error('database unavailable while saving private cookbook');
    });
    const populateMock = mock.method(Cookbook.prototype, 'populate', async () => {
        throw new Error('populate should not run after save failure');
    });
    const findByIdMock = mock.method(User, 'findById', async () => ({
        _id: 'user-42',
        cookbooks: [],
    }));
    const updateUserMock = mock.method(User, 'findByIdAndUpdate', async () => {
        throw new Error('linkage should not run after save failure');
    });
    const countDocumentsMock = mock.method(Cookbook, 'countDocuments', async () => 0);

    try {
        await assert.rejects(
            createCookbook(
                null,
                {
                    userId: 'user-42',
                    input: {
                        name: 'Weeknight Cookbook',
                        description: 'Canonical private cookbook snapshot',
                    },
                },
                {
                    user: { userId: 'user-42' },
                },
            ),
            (error) => {
                assert.ok(error instanceof CookbookCreationPersistenceError);
                assert.equal(error.code, 'cookbookCreationPersistenceFailed');
                assert.equal(error.reason, 'save');
                assert.equal(error.message, 'We could not save your cookbook. Please try again.');
                assert.equal(error.isUserSafe, true);
                return true;
            },
        );

        assert.equal(saveMock.mock.callCount(), 1);
        assert.equal(populateMock.mock.callCount(), 0);
        assert.equal(findByIdMock.mock.callCount(), 1);
        assert.equal(updateUserMock.mock.callCount(), 0);
        assert.equal(countDocumentsMock.mock.callCount(), 1);
    } finally {
        restoreAll(
            saveMock,
            populateMock,
            findByIdMock,
            updateUserMock,
            countDocumentsMock,
        );
    }
});
