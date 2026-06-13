// @ts-nocheck
import assert from 'node:assert/strict';
import test, { mock } from 'node:test';

import mongoose from 'mongoose';

import Cookbook, {
    CookbookEntryValidationError,
    validateCookbookEntryInput,
} from '../../models/Cookbook/cookbookSchema';
import { addRecipeToCookbook } from '../../graphql/resolvers/mutations/cookbookMutations';

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
        return cookbook;
    };

    return cookbook;
};

test('validateCookbookEntryInput keeps personal notes trimmed while preserving the canonical recipe payload', () => {
    const result = validateCookbookEntryInput({
        recipeId: 'recipe-42',
        desiredServings: 2,
        maxTimesPerWeek: undefined,
        minTimesPerWeek: 0,
        allowedMealTypes: ['DINNER'],
        preferenceScore: 7,
        notes: '  Weeknight staple  ',
    });

    assert.equal(result.valid, true);
    assert.deepEqual(result.input, {
        recipeId: 'recipe-42',
        desiredServings: 2,
        maxTimesPerWeek: null,
        minTimesPerWeek: 0,
        allowedMealTypes: ['DINNER'],
        preferenceScore: 7,
        notes: 'Weeknight staple',
    });
});

test('addRecipeToCookbook rejects oversized personal notes with a typed user-safe error before save', async () => {
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
                        allowedMealTypes: ['DINNER'],
                        preferenceScore: 7,
                        notes: 'x'.repeat(501),
                    },
                },
                { user: { userId: 'user-42' } },
            ),
            (error) => {
                assert.ok(error instanceof CookbookEntryValidationError);
                assert.equal(error.code, 'invalidNotes');
                assert.equal(error.message, 'Please enter a valid note.');
                assert.equal(error.isUserSafe, true);
                return true;
            },
        );

        assert.equal(findByIdMock.mock.callCount(), 1);
        assert.equal(cookbook.saveCalls, 0);
        assert.deepEqual(cookbook.entries, []);
        assert.deepEqual(cookbook.populateCalls, []);
    } finally {
        findByIdMock.mock.restore();
    }
});
