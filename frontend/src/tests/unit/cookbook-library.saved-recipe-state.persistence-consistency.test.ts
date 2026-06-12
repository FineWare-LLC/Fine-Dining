// @ts-nocheck
import assert from 'node:assert/strict';
import test, { mock } from 'node:test';

import Cookbook from '../../models/Cookbook/cookbookSchema';
import User from '../../models/User';
import { createCookbook } from '../../graphql/resolvers/mutations/cookbookMutations';
import { getCookbook } from '../../graphql/resolvers/queries/cookbookQueries';

function restoreAll(...trackers) {
    for (const tracker of trackers) {
        if (typeof tracker?.mock?.restore === 'function') {
            tracker.mock.restore();
        }
    }
}

test('createCookbook returns the same canonical saved recipe snapshot as a refresh query', async () => {
    const canonicalCookbook = {
        id: '64b7f2a9c3d4e5f678901235',
        name: 'Weeknight Cookbook',
        description: 'Canonical cookbook snapshot',
        isPublic: false,
        entries: [],
        meals: [],
        recipes: [],
        restaurants: [],
    };

    const saveMock = mock.method(Cookbook.prototype, 'save', async function saveProxy() {
        return this;
    });
    const populateMock = mock.method(Cookbook.prototype, 'populate', async (paths) => {
        assert.equal(paths, 'entries.recipe meals recipes restaurants');
        return canonicalCookbook;
    });
    const findByIdMock = mock.method(Cookbook, 'findById', () => ({
        populate: async (paths) => {
            assert.equal(paths, 'entries.recipe meals recipes restaurants');
            return canonicalCookbook;
        },
    }));
    const findByIdUserMock = mock.method(User, 'findById', async () => ({
        _id: '64b7f2a9c3d4e5f678901234',
        cookbooks: [],
    }));
    const updateUserMock = mock.method(User, 'findByIdAndUpdate', async () => ({
        _id: '64b7f2a9c3d4e5f678901234',
        cookbooks: ['64b7f2a9c3d4e5f678901235'],
    }));
    const countDocumentsMock = mock.method(Cookbook, 'countDocuments', async () => 0);

    try {
        const createdCookbook = await createCookbook(
            null,
            {
                userId: '64b7f2a9c3d4e5f678901234',
                input: {
                    name: 'Weeknight Cookbook',
                    description: 'Canonical cookbook snapshot',
                },
            },
            {
                user: { userId: '64b7f2a9c3d4e5f678901234' },
            },
        );

        const refreshedCookbook = await getCookbook(null, { id: '64b7f2a9c3d4e5f678901235' });

        assert.deepEqual(createdCookbook, canonicalCookbook);
        assert.deepEqual(refreshedCookbook, canonicalCookbook);
    } finally {
        restoreAll(
            saveMock,
            populateMock,
            findByIdMock,
            findByIdUserMock,
            updateUserMock,
            countDocumentsMock,
        );
    }
});
