// @ts-nocheck
import assert from 'node:assert/strict';
import test from 'node:test';

import {
    addRecipeToCookbookAndRefresh,
    createCookbookImportEntry,
} from '../../utils/cookbookImport';

test('createCookbookImportEntry keeps the canonical cookbook import payload stable across refresh snapshots', () => {
    const recipeId = 'recipe-42';
    const expectedEntry = {
        recipeId,
        desiredServings: 1,
        preferenceScore: 5,
    };

    assert.deepEqual(createCookbookImportEntry(recipeId), expectedEntry);
    assert.deepEqual(createCookbookImportEntry(recipeId), expectedEntry);
});

test('addRecipeToCookbookAndRefresh refreshes cookbooks after a successful import', async () => {
    const mutationCalls = [];
    const refetchCalls = [];

    const addRecipeMutation = async ({ variables }) => {
        mutationCalls.push(variables);
        assert.equal(refetchCalls.length, 0);
        return {
            data: {
                addRecipeToCookbook: {
                    id: 'cookbook-42',
                },
            },
        };
    };

    const refetchCookbooks = async () => {
        assert.equal(mutationCalls.length, 1);
        refetchCalls.push('called');
        return {
            data: {
                getCookbooksByUser: [],
            },
        };
    };

    await addRecipeToCookbookAndRefresh({
        addRecipeMutation,
        refetchCookbooks,
        cookbookId: 'cookbook-42',
        recipeId: 'recipe-42',
    });

    assert.deepEqual(mutationCalls, [{
        cookbookId: 'cookbook-42',
        entry: {
            recipeId: 'recipe-42',
            desiredServings: 1,
            preferenceScore: 5,
        },
    }]);
    assert.equal(refetchCalls.length, 1);
});
