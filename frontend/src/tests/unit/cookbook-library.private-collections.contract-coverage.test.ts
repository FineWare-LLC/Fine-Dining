// @ts-nocheck
import assert from 'node:assert/strict';
import test, { mock } from 'node:test';

import Cookbook from '../../models/Cookbook/cookbookSchema';
import User from '../../models/User';
import {
    CookbookVisibilityValidationError,
    createCookbook,
} from '../../graphql/resolvers/mutations/cookbookMutations';

const restoreAll = (...trackers) => {
    for (const tracker of trackers) {
        if (typeof tracker?.mock?.restore === 'function') {
            tracker.mock.restore();
        }
    }
};

test('createCookbook keeps new cookbooks private by default before persistence', async () => {
    const canonicalCookbook = {
        id: 'cookbook-42',
        name: 'Weeknight Cookbook',
        description: 'Canonical private cookbook snapshot',
        isPublic: false,
        entries: [],
        meals: [],
        recipes: [],
        restaurants: [],
    };

    const saveMock = mock.method(Cookbook.prototype, 'save', async function saveProxy() {
        assert.equal(this.isPublic, false);
        return this;
    });
    const populateMock = mock.method(Cookbook.prototype, 'populate', async (paths) => {
        assert.equal(paths, 'entries.recipe meals recipes restaurants');
        return canonicalCookbook;
    });
    const findByIdMock = mock.method(User, 'findById', async () => ({
        _id: 'user-42',
        cookbooks: [],
    }));
    const updateUserMock = mock.method(User, 'findByIdAndUpdate', async () => ({
        _id: 'user-42',
        cookbooks: ['cookbook-42'],
    }));
    const countDocumentsMock = mock.method(Cookbook, 'countDocuments', async () => 0);

    try {
        const createdCookbook = await createCookbook(
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
        );

        assert.deepEqual(createdCookbook, canonicalCookbook);
        assert.equal(saveMock.mock.callCount(), 1);
        assert.equal(populateMock.mock.callCount(), 1);
        assert.equal(findByIdMock.mock.callCount(), 1);
        assert.equal(updateUserMock.mock.callCount(), 1);
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

test('createCookbook rejects malformed visibility payloads with a typed user-safe error before persistence', async () => {
    const saveMock = mock.method(Cookbook.prototype, 'save', async () => {
        throw new Error('save should not run for malformed cookbook visibility');
    });
    const populateMock = mock.method(Cookbook.prototype, 'populate', async () => {
        throw new Error('populate should not run for malformed cookbook visibility');
    });
    const findByIdMock = mock.method(User, 'findById', async () => ({
        _id: 'user-42',
        cookbooks: [],
    }));
    const updateUserMock = mock.method(User, 'findByIdAndUpdate', async () => ({
        _id: 'user-42',
        cookbooks: [],
    }));
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
                        isPublic: 'true',
                    },
                },
                {
                    user: { userId: 'user-42' },
                },
            ),
            (error) => {
                assert.ok(error instanceof CookbookVisibilityValidationError);
                assert.equal(error.code, 'invalidIsPublic');
                assert.equal(
                    error.message,
                    'Please choose a valid cookbook sharing setting.',
                );
                assert.equal(error.isUserSafe, true);
                return true;
            },
        );

        assert.equal(saveMock.mock.callCount(), 0);
        assert.equal(populateMock.mock.callCount(), 0);
        assert.equal(findByIdMock.mock.callCount(), 0);
        assert.equal(updateUserMock.mock.callCount(), 0);
        assert.equal(countDocumentsMock.mock.callCount(), 0);
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
