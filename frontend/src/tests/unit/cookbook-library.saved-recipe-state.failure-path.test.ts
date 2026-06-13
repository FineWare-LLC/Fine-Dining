// @ts-nocheck
import assert from 'node:assert/strict';
import test from 'node:test';

import {
    CookbookLibraryFeedbackValidationError,
    buildCookbookLibraryFeedbackState,
} from '../../utils/cookbookFeedback';

test('buildCookbookLibraryFeedbackState reports a recoverable error when saved recipe loading fails', () => {
    const state = buildCookbookLibraryFeedbackState({
        error: new Error('Network error: Failed to fetch'),
    });

    assert.equal(state.state, 'error');
    assert.equal(state.title, 'Cookbooks unavailable');
    assert.equal(
        state.message,
        'We could not read your saved recipe state. Please refresh the cookbook.',
    );
    assert.equal(state.actionLabel, 'Try again');
    assert.equal(state.actionKind, 'retry-cookbooks');
    assert.equal(state.role, 'alert');
    assert.equal(state.ariaLive, 'assertive');
    assert.equal(state.minHeight, 72);
    assert.equal(state.showSpinner, false);
    assert.ok(state.error instanceof Error);
});

test('buildCookbookLibraryFeedbackState keeps the empty cookbook state distinct from failure', () => {
    const state = buildCookbookLibraryFeedbackState({
        cookbooks: [],
    });

    assert.equal(state.state, 'empty');
    assert.equal(state.title, 'No cookbooks yet');
    assert.equal(state.message, 'Create a cookbook to start saving recipes.');
    assert.equal(state.actionLabel, 'Create cookbook');
    assert.equal(state.actionKind, 'open-create-cookbook');
    assert.equal(state.role, 'status');
    assert.equal(state.ariaLive, 'polite');
    assert.equal(state.minHeight, 72);
    assert.equal(state.showSpinner, false);
    assert.equal(state.error, null);
});

test('buildCookbookLibraryFeedbackState fails shut on malformed cookbook payloads', () => {
    const state = buildCookbookLibraryFeedbackState({
        cookbooks: { length: 1 },
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

test('buildCookbookLibraryFeedbackState reports loading before cookbook data arrives', () => {
    const state = buildCookbookLibraryFeedbackState({
        isLoading: true,
    });

    assert.equal(state.state, 'loading');
    assert.equal(state.message, 'Loading your saved recipes...');
    assert.equal(state.ariaBusy, 'true');
    assert.equal(state.showSpinner, true);
    assert.equal(state.error, null);
});
