// @ts-nocheck
import assert from 'node:assert/strict';
import test, { mock } from 'node:test';

import Cookbook from '../../models/Cookbook/cookbookSchema';
import User from '../../models/User';
import { createCookbook } from '../../graphql/resolvers/mutations/cookbookMutations';

function restoreAll(...trackers) {
    for (const tracker of trackers) {
        if (typeof tracker?.mock?.restore === 'function') {
            tracker.mock.restore();
        }
    }
}

test('createCookbook rolls back the cookbook when sharing linkage fails', async () => {
    const saveMock = mock.method(Cookbook.prototype, 'save', async function saveProxy() {
        return this;
    });
    const populateMock = mock.method(Cookbook.prototype, 'populate', async () => {
        throw new Error('populate should not run after linkage failure');
    });
    const deleteMock = mock.method(Cookbook, 'findByIdAndDelete', async () => null);
    const findByIdMock = mock.method(Cookbook, 'findById', () => ({
        populate: async () => {
            throw new Error('refresh lookup should not run after rollback');
        },
    }));
    const findByIdUserMock = mock.method(User, 'findById', async () => ({
        _id: '64b7f2a9c3d4e5f678901234',
        cookbooks: [],
    }));
    const updateUserMock = mock.method(User, 'findByIdAndUpdate', async () => {
        throw new Error('database unavailable while linking cookbook to user');
    });
    const countDocumentsMock = mock.method(Cookbook, 'countDocuments', async () => 0);

    try {
        await assert.rejects(
            createCookbook(
                null,
                {
                    userId: '64b7f2a9c3d4e5f678901234',
                    input: {
                        name: 'Weeknight Cookbook',
                        description: 'Rollback check',
                        isPublic: true,
                    },
                },
                {
                    user: { userId: '64b7f2a9c3d4e5f678901234' },
                },
            ),
            /database unavailable while linking cookbook to user/,
        );

        assert.equal(deleteMock.mock.callCount(), 1);
        assert.equal(populateMock.mock.callCount(), 0);
        assert.equal(findByIdMock.mock.callCount(), 0);
    } finally {
        restoreAll(
            saveMock,
            populateMock,
            deleteMock,
            findByIdMock,
            findByIdUserMock,
            updateUserMock,
            countDocumentsMock,
        );
    }
});
