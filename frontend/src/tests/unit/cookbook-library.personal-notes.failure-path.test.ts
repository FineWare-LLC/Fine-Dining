// @ts-nocheck
import assert from 'node:assert/strict';
import test, { mock } from 'node:test';

import mongoose from 'mongoose';

import Cookbook from '../../models/Cookbook/cookbookSchema';
import {
    addRecipeToCookbook,
    CookbookImportPersistenceError,
} from '../../graphql/resolvers/mutations/cookbookMutations';

const buildObjectId = () => new mongoose.Types.ObjectId().toString();

const buildCookbookFixture = () => {
    const cookbook = {
        user: {
            toString: () => 'user-42',
        },
        entries: [],
        saveCalls: 0,
        populateCalls: [],
    };

    cookbook.save = async () => {
        cookbook.saveCalls += 1;
        return cookbook;
    };

    cookbook.populate = async (paths) => {
        cookbook.populateCalls.push(paths);
        throw new Error('database unavailable while hydrating cookbook notes');
    };

    return cookbook;
};

test('addRecipeToCookbook rolls back a failed notes refresh and surfaces a recoverable error', async () => {
    const cookbook = buildCookbookFixture();
    const recipeId = buildObjectId();
    const findByIdMock = mock.method(Cookbook, 'findById', () => cookbook);

    try {
        await assert.rejects(
            addRecipeToCookbook(
                null,
                {
                    cookbookId: 'cookbook-42',
                    entry: {
                        recipeId,
                        desiredServings: 2,
                        maxTimesPerWeek: 4,
                        minTimesPerWeek: 1,
                        allowedMealTypes: ['DINNER'],
                        preferenceScore: 7,
                        notes: '  Weeknight staple  ',
                    },
                },
                { user: { userId: 'user-42' } },
            ),
            (error) => {
                assert.ok(error instanceof CookbookImportPersistenceError);
                assert.equal(error.code, 'cookbookImportPersistenceFailed');
                assert.equal(error.reason, 'populate');
                assert.equal(error.message, 'We could not save this recipe to your cookbook. Please try again.');
                assert.equal(error.isUserSafe, true);
                return true;
            },
        );

        assert.equal(findByIdMock.mock.callCount(), 1);
        assert.equal(cookbook.saveCalls, 2);
        assert.deepEqual(cookbook.entries, []);
        assert.deepEqual(cookbook.populateCalls, ['entries.recipe meals recipes restaurants']);
    } finally {
        findByIdMock.mock.restore();
    }
});
