// @ts-nocheck
import assert from 'node:assert/strict';
import fs from 'node:fs';
import test, { mock } from 'node:test';
import { fileURLToPath } from 'node:url';

import mongoose from 'mongoose';

import Cookbook, {
    CookbookEntryValidationError,
    validateCookbookEntryInput,
} from '../../models/Cookbook/cookbookSchema';
import {
    addRecipeToCookbook,
} from '../../graphql/resolvers/mutations/cookbookMutations';
import {
    createCookbookImportEntry,
} from '../../utils/cookbookImport';

const cookbookPagePath = fileURLToPath(new URL('../../pages/cookbook.tsx', import.meta.url));
const recipesPagePath = fileURLToPath(new URL('../../pages/recipes.tsx', import.meta.url));

const cookbookPageSource = fs.readFileSync(cookbookPagePath, 'utf8');
const recipesPageSource = fs.readFileSync(recipesPagePath, 'utf8');

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

test('validateCookbookEntryInput accepts a recipe version timestamp and canonicalizes it', () => {
    const result = validateCookbookEntryInput({
        recipeId: 'recipe-42',
        desiredServings: 2,
        preferenceScore: 7,
        recipeVersion: '2026-06-13T07:31:43.000Z',
    });

    assert.equal(result.valid, true);
    assert.deepEqual(result.input, {
        recipeId: 'recipe-42',
        desiredServings: 2,
        maxTimesPerWeek: null,
        minTimesPerWeek: 0,
        allowedMealTypes: [],
        preferenceScore: 7,
        notes: '',
        recipeVersion: '2026-06-13T07:31:43.000Z',
    });
});

test('validateCookbookEntryInput rejects malformed recipe version timestamps with a typed, user-safe error', () => {
    const result = validateCookbookEntryInput({
        recipeId: 'recipe-42',
        recipeVersion: 'not-a-date',
    });

    assert.equal(result.valid, false);
    assert.equal(result.input, null);
    assert.ok(result.error instanceof CookbookEntryValidationError);
    assert.equal(result.error.code, 'invalidRecipeVersion');
    assert.equal(result.error.message, 'Please enter a valid recipe version timestamp.');
    assert.equal(result.error.isUserSafe, true);
});

test('createCookbookImportEntry includes the recipe version when one is available from the recipe search payload', () => {
    const recipeId = 'recipe-42';
    const recipeVersion = '2026-06-13T07:31:43.000Z';

    assert.deepEqual(createCookbookImportEntry(recipeId, recipeVersion), {
        recipeId,
        desiredServings: 1,
        preferenceScore: 5,
        recipeVersion,
    });
});

test('addRecipeToCookbook stores the recipe version without disturbing the rest of the saved entry payload', async () => {
    const cookbook = buildCookbookFixture();
    const recipeId = buildObjectId();
    const recipeVersion = '2026-06-13T07:31:43.000Z';
    const findByIdMock = mock.method(Cookbook, 'findById', () => cookbook);

    try {
        const result = await addRecipeToCookbook(
            null,
            {
                cookbookId: 'cookbook-42',
                entry: {
                    recipeId,
                    desiredServings: 2,
                    preferenceScore: 7,
                    recipeVersion,
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
            maxTimesPerWeek: null,
            minTimesPerWeek: 0,
            allowedMealTypes: [],
            preferenceScore: 7,
            notes: '',
            recipeVersion,
        });
        assert.equal(result, cookbook);
    } finally {
        findByIdMock.mock.restore();
    }
});

test('recipe versioning pages wire the version timestamp through the import and cookbook history surfaces', () => {
    assert.match(recipesPageSource, /updatedAt/);
    assert.match(recipesPageSource, /recipeVersion: selectedRecipe\.updatedAt/);
    assert.match(cookbookPageSource, /recipeVersion/);
    assert.match(cookbookPageSource, /Saved from recipe version/);
});
