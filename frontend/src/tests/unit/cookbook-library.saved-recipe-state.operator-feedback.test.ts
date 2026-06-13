// @ts-nocheck
import assert from 'node:assert/strict';
import test from 'node:test';

import {
    CookbookLibraryFeedbackValidationError,
    buildCookbookLibraryFeedbackContainerStyles,
    buildCookbookLibraryFeedbackState,
} from '../../utils/cookbookFeedback';

const canonicalCookbooks = [
    {
        id: 'cookbook-42',
        name: 'Weeknight Wins',
        isPublic: false,
        entries: [],
    },
];

test('buildCookbookLibraryFeedbackState exposes loading, empty, success, and error states with stable spacing', () => {
    assert.deepEqual(buildCookbookLibraryFeedbackState({ isLoading: true }), {
        state: 'loading',
        title: null,
        message: 'Loading your saved recipes...',
        actionLabel: null,
        actionKind: null,
        role: 'status',
        ariaLive: 'polite',
        ariaBusy: 'true',
        minHeight: 72,
        showSpinner: true,
        error: null,
    });

    assert.deepEqual(buildCookbookLibraryFeedbackState({ cookbooks: [] }), {
        state: 'empty',
        title: 'No cookbooks yet',
        message: 'Create a cookbook to start saving recipes.',
        actionLabel: 'Create cookbook',
        actionKind: 'open-create-cookbook',
        role: 'status',
        ariaLive: 'polite',
        ariaBusy: 'false',
        minHeight: 72,
        showSpinner: false,
        error: null,
    });

    assert.deepEqual(buildCookbookLibraryFeedbackState({
        cookbooks: canonicalCookbooks,
    }), {
        state: 'resolved',
        title: null,
        message: null,
        actionLabel: null,
        actionKind: null,
        role: 'status',
        ariaLive: 'polite',
        ariaBusy: 'false',
        minHeight: 72,
        showSpinner: false,
        error: null,
    });

    const errorState = buildCookbookLibraryFeedbackState({
        cookbooks: [{ ...canonicalCookbooks[0], entries: {} }],
    });

    assert.equal(errorState.state, 'error');
    assert.equal(errorState.title, 'Cookbooks unavailable');
    assert.equal(
        errorState.message,
        'We could not read your saved recipe state. Please refresh the cookbook.',
    );
    assert.equal(errorState.actionLabel, 'Try again');
    assert.equal(errorState.actionKind, 'retry-cookbooks');
    assert.equal(errorState.role, 'alert');
    assert.equal(errorState.ariaLive, 'assertive');
    assert.equal(errorState.ariaBusy, 'false');
    assert.equal(errorState.minHeight, 72);
    assert.equal(errorState.showSpinner, false);
    assert.ok(errorState.error instanceof CookbookLibraryFeedbackValidationError);
    assert.equal(errorState.error.code, 'invalidPayload');
    assert.equal(
        errorState.error.message,
        'We could not read your saved recipe state. Please refresh the cookbook.',
    );
    assert.equal(errorState.error.isUserSafe, true);
});

test('buildCookbookLibraryFeedbackState fails shut on malformed cookbook arrays', () => {
    const state = buildCookbookLibraryFeedbackState({
        cookbooks: [{ ...canonicalCookbooks[0], entries: {} }],
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

test('buildCookbookLibraryFeedbackContainerStyles keeps cookbook feedback visually distinct without layout shift', () => {
    assert.deepEqual(buildCookbookLibraryFeedbackContainerStyles('loading'), {
        backgroundColor: 'transparent',
        border: '1px solid transparent',
    });

    assert.deepEqual(buildCookbookLibraryFeedbackContainerStyles('empty'), {
        backgroundColor: 'transparent',
        border: '1px solid transparent',
    });

    assert.deepEqual(buildCookbookLibraryFeedbackContainerStyles('resolved'), {
        backgroundColor: 'rgba(76, 175, 80, 0.08)',
        border: '1px solid rgba(76, 175, 80, 0.2)',
    });

    assert.deepEqual(buildCookbookLibraryFeedbackContainerStyles('error'), {
        backgroundColor: 'rgba(244, 67, 54, 0.08)',
        border: '1px solid rgba(244, 67, 54, 0.2)',
    });
});
