// @ts-nocheck
import assert from 'node:assert/strict';
import test, { mock } from 'node:test';

import Cookbook from '../../models/Cookbook/cookbookSchema';
import { getCookbook, getCookbooksByUser } from '../../graphql/resolvers/queries/cookbookQueries';
import {
    CookbookEntryValidationError,
    validateCookbookEntryInput,
} from '../../models/Cookbook/cookbookSchema';

test('validateCookbookEntryInput accepts a valid saved recipe payload and canonicalizes its fields', () => {
    const result = validateCookbookEntryInput({
        recipeId: '  recipe-42  ',
        desiredServings: 2,
        maxTimesPerWeek: undefined,
        minTimesPerWeek: 0,
        allowedMealTypes: ['dinner', 'lunch', 'DINNER'],
        preferenceScore: 7,
        notes: '  Weeknight staple  ',
    });

    assert.equal(result.valid, true);
    assert.deepEqual(result.input, {
        recipeId: 'recipe-42',
        desiredServings: 2,
        maxTimesPerWeek: null,
        minTimesPerWeek: 0,
        allowedMealTypes: ['LUNCH', 'DINNER'],
        preferenceScore: 7,
        notes: 'Weeknight staple',
    });
});

test('validateCookbookEntryInput rejects blank recipe ids with a typed, user-safe error', () => {
    const result = validateCookbookEntryInput({
        recipeId: '   ',
        allowedMealTypes: ['DINNER'],
    });

    assert.equal(result.valid, false);
    assert.equal(result.input, null);
    assert.ok(result.error instanceof CookbookEntryValidationError);
    assert.equal(result.error.code, 'missingRecipeId');
    assert.equal(result.error.message, 'Please choose a recipe to save.');
    assert.equal(result.error.isUserSafe, true);
});

test('validateCookbookEntryInput rejects unsupported saved recipe meal types with a typed, user-safe error', () => {
    const result = validateCookbookEntryInput({
        recipeId: 'recipe-42',
        allowedMealTypes: ['DINNER', 'BRUNCH'],
    });

    assert.equal(result.valid, false);
    assert.equal(result.input, null);
    assert.ok(result.error instanceof CookbookEntryValidationError);
    assert.equal(result.error.code, 'invalidAllowedMealTypes');
    assert.equal(
        result.error.message,
        'We could not read this saved recipe entry. Please choose supported meal types.',
    );
    assert.equal(result.error.isUserSafe, true);
});

test('cookbook queries populate saved recipe entries before returning cookbook state', async () => {
    const populateCalls = [];
    const populateResult = [{ id: 'cookbook-42' }];
    const queryResult = {
        populate: async (paths) => {
            populateCalls.push(paths);
            return populateResult;
        },
    };
    const findMock = mock.method(Cookbook, 'find', () => queryResult);
    const findByIdMock = mock.method(Cookbook, 'findById', () => queryResult);

    try {
        const byUser = await getCookbooksByUser(null, { userId: 'user-42' });
        const byId = await getCookbook(null, { id: 'cookbook-42' });

        assert.equal(findMock.mock.callCount(), 1);
        assert.equal(findByIdMock.mock.callCount(), 1);
        assert.deepEqual(byUser, populateResult);
        assert.deepEqual(byId, populateResult);
        assert.deepEqual(populateCalls, [
            'entries.recipe meals recipes restaurants',
            'entries.recipe meals recipes restaurants',
        ]);
    } finally {
        findMock.mock.restore();
        findByIdMock.mock.restore();
    }
});
