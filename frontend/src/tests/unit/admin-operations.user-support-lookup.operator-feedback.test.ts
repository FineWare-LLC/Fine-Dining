// @ts-nocheck
import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import {
    buildUserSearchFeedbackContainerStyles,
    buildUserSearchFeedbackState,
} from '../../utils/userSearchFeedback.ts';

const userManagementPath = fileURLToPath(
    new URL('../../components/legacy/Admin/UserManagement.tsx', import.meta.url),
);
const adminDashboardPath = fileURLToPath(new URL('../../pages/admin.tsx', import.meta.url));
const userManagementSource = fs.readFileSync(userManagementPath, 'utf8');
const adminDashboardSource = fs.readFileSync(adminDashboardPath, 'utf8');

test('buildUserSearchFeedbackState keeps user support lookup accessible and layout-stable', () => {
    assert.deepEqual(buildUserSearchFeedbackState({
        isLoading: true,
    }), {
        state: 'loading',
        message: 'Loading user lookup...',
        role: 'status',
        ariaLive: 'polite',
        ariaBusy: 'true',
        minHeight: 72,
        showSpinner: true,
    });

    assert.deepEqual(buildUserSearchFeedbackState({
        users: [],
        searchKeyword: '',
    }), {
        state: 'empty',
        message: 'Search for a user by name or email.',
        role: 'status',
        ariaLive: 'polite',
        ariaBusy: 'false',
        minHeight: 72,
        showSpinner: false,
    });

    assert.deepEqual(buildUserSearchFeedbackState({
        users: [],
        searchKeyword: ' ada@example.com ',
    }), {
        state: 'empty',
        message: 'No users found for "ada@example.com".',
        role: 'status',
        ariaLive: 'polite',
        ariaBusy: 'false',
        minHeight: 72,
        showSpinner: false,
    });

    assert.deepEqual(buildUserSearchFeedbackState({
        users: [
            { id: 'user-1', name: 'Ada Lovelace' },
            { id: 'user-2', name: 'Grace Hopper' },
        ],
        searchKeyword: ' ada@example.com ',
    }), {
        state: 'success',
        message: 'Found 2 users for "ada@example.com".',
        role: 'status',
        ariaLive: 'polite',
        ariaBusy: 'false',
        minHeight: 72,
        showSpinner: false,
    });

    assert.deepEqual(buildUserSearchFeedbackState({
        errorMessage: 'We could not read this user lookup. Please refresh the admin page.',
    }), {
        state: 'error',
        message: 'We could not read this user lookup. Please refresh the admin page.',
        role: 'alert',
        ariaLive: 'assertive',
        ariaBusy: 'false',
        minHeight: 72,
        showSpinner: false,
    });
});

test('buildUserSearchFeedbackContainerStyles keeps user lookup feedback visually distinct without layout shift', () => {
    assert.deepEqual(buildUserSearchFeedbackContainerStyles('loading'), {
        bgcolor: 'transparent',
        border: '1px solid transparent',
    });

    assert.deepEqual(buildUserSearchFeedbackContainerStyles('empty'), {
        bgcolor: 'transparent',
        border: '1px solid transparent',
    });

    assert.deepEqual(buildUserSearchFeedbackContainerStyles('success'), {
        bgcolor: 'rgba(76, 175, 80, 0.08)',
        border: '1px solid rgba(76, 175, 80, 0.2)',
    });

    assert.deepEqual(buildUserSearchFeedbackContainerStyles('error'), {
        bgcolor: 'rgba(244, 67, 54, 0.08)',
        border: '1px solid rgba(244, 67, 54, 0.2)',
    });
});

test('UserManagement wires user support lookup feedback and the admin dashboard links to the users surface', () => {
    assert.match(userManagementSource, /buildUserSearchFeedbackState/);
    assert.match(userManagementSource, /buildUserSearchFeedbackContainerStyles/);
    assert.match(userManagementSource, /searchUsers/);
    assert.match(userManagementSource, /Search users/);
    assert.match(userManagementSource, /userSearchFeedback\.role/);
    assert.match(userManagementSource, /userSearchFeedback\.ariaLive/);
    assert.match(userManagementSource, /userSearchFeedback\.ariaBusy/);
    assert.match(userManagementSource, /userSearchFeedback\.showSpinner/);
    assert.match(adminDashboardSource, /router\.push\('\/admin\/users'\)/);
});
