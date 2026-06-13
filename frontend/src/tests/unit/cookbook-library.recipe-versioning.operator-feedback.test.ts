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
const cookbookPageSource = fs.readFileSync(cookbookPagePath, 'utf8');

test('buildCookbookLibraryFeedbackState keeps recipe revision shells accessible and layout-stable', () => {
    assert.equal(COOKBOOK_LIBRARY_RESOLVED_MESSAGE, 'Cookbooks loaded.');

    assert.deepEqual(buildCookbookLibraryFeedbackState({
        isLoading: true,
        loadingMessage: 'Loading your cookbook revisions...',
    }), {
        state: 'loading',
        title: null,
        message: 'Loading your cookbook revisions...',
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

    assert.deepEqual(buildCookbookLibraryFeedbackContainerStyles('resolved'), {
        backgroundColor: 'rgba(76, 175, 80, 0.08)',
        border: '1px solid rgba(76, 175, 80, 0.2)',
    });

    assert.deepEqual(buildCookbookLibraryFeedbackContainerStyles('error'), {
        backgroundColor: 'rgba(244, 67, 54, 0.08)',
        border: '1px solid rgba(244, 67, 54, 0.2)',
    });
});

test('cookbook page keeps revision feedback accessible and dismissible', () => {
    assert.match(cookbookPageSource, /cookbookFeedback\.state === 'loading'/);
    assert.match(cookbookPageSource, /cookbookFeedback\.state === 'empty'/);
    assert.match(cookbookPageSource, /cookbookFeedback\.state === 'resolved'/);
    assert.match(cookbookPageSource, /cookbookFeedback\.state === 'error'/);
    assert.match(cookbookPageSource, /buildCookbookLibraryFeedbackContainerStyles\(cookbookFeedback\.state\)/);
    assert.match(cookbookPageSource, /COOKBOOK_LIBRARY_RESOLVED_MESSAGE/);
    assert.match(cookbookPageSource, /sx=\{srOnly\}/);
    assert.match(cookbookPageSource, /<Snackbar open=\{snackbar\.open\} autoHideDuration=\{4000\} onClose=\{\(\) => setSnackbar\(\{ \.\.\.snackbar, open: false \}\)\}>/);
    assert.match(
        cookbookPageSource,
        /<Alert severity=\{snackbar\.severity\} onClose=\{\(\) => setSnackbar\(\{ \.\.\.snackbar, open: false \}\)\}>\{snackbar\.message\}<\/Alert>/,
    );
    assert.match(cookbookPageSource, /handleUpdateEntry/);
    assert.match(cookbookPageSource, /updateCookbookEntryAndRefresh/);
});
