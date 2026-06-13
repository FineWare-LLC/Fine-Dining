// @ts-nocheck
import assert from 'node:assert/strict';
import test, { mock } from 'node:test';

import mongoose from 'mongoose';

import Cookbook from '../../models/Cookbook/cookbookSchema';
import {
    COOKBOOK_ENTRY_LIMIT,
} from '../../models/Cookbook/cookbookSchema';
import {
    CookbookImportSizeLimitError,
    addRecipeToCookbook,
} from '../../graphql/resolvers/mutations/cookbookMutations';

const buildObjectId = () => new mongoose.Types.ObjectId().toString();

const buildScaleBoundaryCookbookFixture = () => {
    const entries = Array.from({ length: COOKBOOK_ENTRY_LIMIT }, (_, index) => {
        const recipeId = `recipe-${String(index + 1).padStart(5, '0')}`;

        return {
            recipe: {
                toString: () => recipeId,
            },
        };
    });

    const cookbook = {
        user: {
            toString: () => 'user-42',
        },
        entries,
        saveCalls: 0,
        populateCalls: [],
    };

    cookbook.save = async () => {
        cookbook.saveCalls += 1;
        throw new Error('save should not be called for a full cookbook');
    };

    cookbook.populate = async (paths) => {
        cookbook.populateCalls.push(paths);
        return cookbook;
    };

    return cookbook;
};

test('addRecipeToCookbook fails fast at the cookbook entry scale boundary without mutating the collection', async () => {
    const cookbook = buildScaleBoundaryCookbookFixture();
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
                        notes: 'Weeknight staple',
                    },
                },
                { user: { userId: 'user-42' } },
            ),
            (error) => {
                assert.ok(error instanceof CookbookImportSizeLimitError);
                assert.equal(error.code, 'cookbookImportSizeLimitExceeded');
                assert.equal(error.reason, 'sizeLimit');
                assert.equal(error.limit, COOKBOOK_ENTRY_LIMIT);
                assert.equal(error.isUserSafe, true);
                assert.equal(
                    error.message,
                    'This cookbook already has the maximum of 10,000 recipes. Remove one before importing another.',
                );
                return true;
            },
        );

        assert.equal(findByIdMock.mock.callCount(), 1);
        assert.equal(cookbook.entries.length, COOKBOOK_ENTRY_LIMIT);
        assert.equal(cookbook.entries[0].recipe.toString(), 'recipe-00001');
        assert.equal(cookbook.entries[cookbook.entries.length - 1].recipe.toString(), 'recipe-10000');
        assert.equal(cookbook.saveCalls, 0);
        assert.deepEqual(cookbook.populateCalls, []);
    } finally {
        findByIdMock.mock.restore();
    }
});
