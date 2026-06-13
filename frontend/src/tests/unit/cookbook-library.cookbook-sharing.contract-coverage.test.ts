// @ts-nocheck
import assert from 'node:assert/strict';
import test from 'node:test';

import {
    CookbookLibraryFeedbackValidationError,
    buildCookbookLibraryFeedbackState,
} from '../../utils/cookbookFeedback';

const sharedCookbook = {
    id: 'cookbook-42',
    name: 'Household Favorites',
    isPublic: true,
    entries: [],
};

test('buildCookbookLibraryFeedbackState accepts cookbook payloads with explicit sharing flags', () => {
    const state = buildCookbookLibraryFeedbackState({
        cookbooks: [sharedCookbook],
    });

    assert.equal(state.state, 'resolved');
    assert.equal(state.error, null);
});

test('buildCookbookLibraryFeedbackState rejects cookbook payloads that do not carry a boolean sharing flag', () => {
    const state = buildCookbookLibraryFeedbackState({
        cookbooks: [{ ...sharedCookbook, isPublic: 'true' }],
    });

    assert.equal(state.state, 'error');
    assert.ok(state.error instanceof CookbookLibraryFeedbackValidationError);
    assert.equal(state.error.code, 'invalidPayload');
    assert.equal(
        state.error.message,
        'We could not read your saved recipe state. Please refresh the cookbook.',
    );
    assert.equal(state.error.isUserSafe, true);
});
