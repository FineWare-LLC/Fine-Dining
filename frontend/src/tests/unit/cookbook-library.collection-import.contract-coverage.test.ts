// @ts-nocheck
import assert from 'node:assert/strict';
import test, { mock } from 'node:test';

import mongoose from 'mongoose';

import Cookbook, {
    CookbookEntryValidationError,
    validateCookbookImportEntryInput,
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
    };

    cookbook.populate = async (paths) => {
        cookbook.populateCalls.push(paths);
        return cookbook;
    };

    return cookbook;
};

test('validateCookbookImportEntryInput accepts a valid cookbook import payload and canonicalizes its fields', () => {
    const recipeId = buildObjectId();

    const result = validateCookbookImportEntryInput({
        recipeId: `  ${recipeId}  `,
        desiredServings: 2,
        maxTimesPerWeek: undefined,
        minTimesPerWeek: 0,
        allowedMealTypes: ['dinner', 'lunch', 'DINNER'],
        preferenceScore: 7,
        notes: '  Weeknight staple  ',
    });

    assert.equal(result.valid, true);
    assert.deepEqual(result.input, {
        recipeId,
        desiredServings: 2,
        maxTimesPerWeek: null,
        minTimesPerWeek: 0,
        allowedMealTypes: ['LUNCH', 'DINNER'],
        preferenceScore: 7,
        notes: 'Weeknight staple',
    });
});

test('validateCookbookImportEntryInput rejects malformed imported recipe ids with a typed, user-safe error', () => {
    const result = validateCookbookImportEntryInput({
        recipeId: 'recipe-42',
        allowedMealTypes: ['DINNER'],
    });

    assert.equal(result.valid, false);
    assert.equal(result.input, null);
    assert.ok(result.error instanceof CookbookEntryValidationError);
    assert.equal(result.error.code, 'invalidRecipeId');
    assert.equal(result.error.message, 'Please choose a valid recipe to add to the cookbook.');
    assert.equal(result.error.isUserSafe, true);
});

test('addRecipeToCookbook accepts canonical cookbook import payloads before persisting them', async () => {
    const cookbook = buildCookbookFixture();
    const recipeId = buildObjectId();
    const findByIdMock = mock.method(Cookbook, 'findById', () => cookbook);

    try {
        const result = await addRecipeToCookbook(
            null,
            {
                cookbookId: 'cookbook-42',
                entry: {
                    recipeId,
                    desiredServings: 2,
                    maxTimesPerWeek: 4,
                    minTimesPerWeek: 1,
                    allowedMealTypes: ['dinner', 'lunch', 'DINNER'],
                    preferenceScore: 7,
                    notes: '  Weeknight staple  ',
                },
            },
            { user: { userId: 'user-42' } },
        );

        assert.equal(findByIdMock.mock.callCount(), 1);
        assert.equal(cookbook.saveCalls, 1);
        assert.deepEqual(cookbook.populateCalls, ['entries.recipe meals recipes restaurants']);
        assert.equal(cookbook.entries.length, 1);
        assert.deepEqual(cookbook.entries[0], {
            recipe: recipeId,
            desiredServings: 2,
            maxTimesPerWeek: 4,
            minTimesPerWeek: 1,
            allowedMealTypes: ['LUNCH', 'DINNER'],
            preferenceScore: 7,
            notes: 'Weeknight staple',
        });
        assert.equal(result, cookbook);
    } finally {
        findByIdMock.mock.restore();
    }
});

test('addRecipeToCookbook rejects malformed imported recipe ids with a typed, user-safe error and does not persist partial data', async () => {
    const cookbook = buildCookbookFixture();
    const findByIdMock = mock.method(Cookbook, 'findById', () => cookbook);

    try {
        await assert.rejects(
            addRecipeToCookbook(
                null,
                {
                    cookbookId: 'cookbook-42',
                    entry: {
                        recipeId: 'recipe-42',
                        desiredServings: 2,
                        allowedMealTypes: ['DINNER'],
                    },
                },
                { user: { userId: 'user-42' } },
            ),
            (error) => {
                assert.ok(error instanceof CookbookEntryValidationError);
                assert.equal(error.code, 'invalidRecipeId');
                assert.equal(error.message, 'Please choose a valid recipe to add to the cookbook.');
                assert.equal(error.isUserSafe, true);
                return true;
            },
        );

        assert.equal(findByIdMock.mock.callCount(), 1);
        assert.equal(cookbook.saveCalls, 0);
        assert.equal(cookbook.entries.length, 0);
        assert.deepEqual(cookbook.populateCalls, []);
    } finally {
        findByIdMock.mock.restore();
    }
});
