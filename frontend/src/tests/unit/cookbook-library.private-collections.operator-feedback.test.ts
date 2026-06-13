// @ts-nocheck
import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import {
    COOKBOOK_LIBRARY_RESOLVED_MESSAGE,
    buildCookbookLibraryFeedbackContainerStyles,
    buildCookbookLibraryFeedbackState,
} from '../../utils/cookbookFeedback';

const cookbookPagePath = fileURLToPath(new URL('../../pages/cookbook.tsx', import.meta.url));
const recipesPagePath = fileURLToPath(new URL('../../pages/recipes.tsx', import.meta.url));

const cookbookPageSource = fs.readFileSync(cookbookPagePath, 'utf8');
const recipesPageSource = fs.readFileSync(recipesPagePath, 'utf8');

// Keep the page-wiring assertion separate from the shared helper contract.
test('buildCookbookLibraryFeedbackState keeps private collections loading, empty, success, and error states accessible', () => {
    assert.equal(COOKBOOK_LIBRARY_RESOLVED_MESSAGE, 'Cookbooks loaded.');
    assert.deepEqual(buildCookbookLibraryFeedbackState({
        isLoading: true,
        loadingMessage: 'Loading your private cookbooks...',
    }), {
        state: 'loading',
        title: null,
        message: 'Loading your private cookbooks...',
        actionLabel: null,
        actionKind: null,
        role: 'status',
        ariaLive: 'polite',
        ariaBusy: 'true',
        minHeight: 72,
        showSpinner: true,
        error: null,
    });

    assert.deepEqual(buildCookbookLibraryFeedbackState({
        cookbooks: [],
        emptyTitle: 'No cookbooks yet',
        emptyMessage: 'Create a cookbook to start saving recipes.',
        emptyActionLabel: 'Create cookbook',
        emptyActionKind: 'open-create-cookbook',
    }), {
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
        cookbooks: [{
            id: 'cookbook-42',
            name: 'Weeknight Wins',
            isPublic: false,
            entries: [],
        }],
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
        error: new Error('Network error'),
    });

    assert.equal(errorState.state, 'error');
    assert.equal(errorState.title, 'Cookbooks unavailable');
    assert.equal(errorState.message, 'We could not read your saved recipe state. Please refresh the cookbook.');
    assert.equal(errorState.actionLabel, 'Try again');
    assert.equal(errorState.actionKind, 'retry-cookbooks');
    assert.equal(errorState.role, 'alert');
    assert.equal(errorState.ariaLive, 'assertive');
    assert.equal(errorState.ariaBusy, 'false');
    assert.equal(errorState.minHeight, 72);
    assert.equal(errorState.showSpinner, false);
});

test('private collection pages keep the resolved announcement and cookbook loading copy accessible', () => {
    assert.match(cookbookPageSource, /loadingMessage: 'Loading your private cookbooks\.\.\.'/);
    assert.match(cookbookPageSource, /cookbookFeedback\.state === 'resolved'/);
    assert.match(cookbookPageSource, /buildCookbookLibraryFeedbackContainerStyles\(cookbookFeedback\.state\)/);
    assert.match(cookbookPageSource, /sx=\{srOnly\}/);

    assert.match(recipesPageSource, /cookbookFeedback\.state === 'resolved'/);
    assert.match(recipesPageSource, /COOKBOOK_LIBRARY_RESOLVED_MESSAGE/);
    assert.match(recipesPageSource, /sx=\{srOnly\}/);
    assert.match(recipesPageSource, /buildCookbookLibraryFeedbackContainerStyles\(cookbookFeedback\.state\)/);

    assert.deepEqual(buildCookbookLibraryFeedbackContainerStyles('resolved'), {
        backgroundColor: 'rgba(76, 175, 80, 0.08)',
        border: '1px solid rgba(76, 175, 80, 0.2)',
    });
});
