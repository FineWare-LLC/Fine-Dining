// @ts-nocheck
import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import {
    buildCookbookLibraryFeedbackState,
} from '../../utils/cookbookFeedback';

const cookbookPagePath = fileURLToPath(new URL('../../pages/cookbook.tsx', import.meta.url));
const recipesPagePath = fileURLToPath(new URL('../../pages/recipes.tsx', import.meta.url));

const cookbookPageSource = fs.readFileSync(cookbookPagePath, 'utf8');
const recipesPageSource = fs.readFileSync(recipesPagePath, 'utf8');

test('buildCookbookLibraryFeedbackState keeps collection import loading, empty, success, and error states accessible', () => {
    assert.deepEqual(buildCookbookLibraryFeedbackState({
        isLoading: true,
        loadingMessage: 'Loading your cookbooks...',
    }), {
        state: 'loading',
        title: null,
        message: 'Loading your cookbooks...',
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
        emptyMessage: 'Create one from your cookbook page to start saving recipes.',
        emptyActionLabel: 'Open cookbooks',
        emptyActionKind: 'open-cookbooks-page',
    }), {
        state: 'empty',
        title: 'No cookbooks yet',
        message: 'Create one from your cookbook page to start saving recipes.',
        actionLabel: 'Open cookbooks',
        actionKind: 'open-cookbooks-page',
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

test('collection import pages keep the cookbook feedback shells distinct and layout-stable', () => {
    assert.match(recipesPageSource, /emptyActionKind: 'open-cookbooks-page'/);
    assert.match(recipesPageSource, /Create one from your cookbook page to start saving recipes\./);
    assert.match(recipesPageSource, /We could not read your saved recipe state\. Please refresh the page\./);
    assert.match(recipesPageSource, /cookbookFeedback\.state === 'resolved'/);
    assert.match(recipesPageSource, /COOKBOOK_LIBRARY_RESOLVED_MESSAGE/);
    assert.match(recipesPageSource, /sx=\{srOnly\}/);

    assert.match(cookbookPageSource, /cookbookFeedback\.state === 'resolved'/);
    assert.match(cookbookPageSource, /COOKBOOK_LIBRARY_RESOLVED_MESSAGE/);
    assert.match(cookbookPageSource, /sx=\{srOnly\}/);
    assert.match(cookbookPageSource, /buildCookbookLibraryFeedbackContainerStyles\(cookbookFeedback\.state\)/);
});
