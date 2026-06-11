// @ts-nocheck
import assert from 'node:assert/strict';
import test from 'node:test';
import {
    AuthRouteGuardError,
    buildAuthFeedbackState,
    resolveProtectedRouteState,
} from '../../context/authUtils';
import {
    AUTH_CONTEXT_FALLBACK,
    resolveAuthContextValue,
} from '../../context/AuthContext';

test('resolveAuthContextValue falls back to a fail-closed auth state when the provider is unavailable', () => {
    const fallback = resolveAuthContextValue(null);

    assert.strictEqual(fallback, AUTH_CONTEXT_FALLBACK);
    assert.equal(fallback.loading, false);
    assert.equal(fallback.isAuthenticated, false);
    assert.equal(fallback.user, null);
    assert.equal(fallback.token, null);
    assert.equal(typeof fallback.login, 'function');
    assert.equal(typeof fallback.logout, 'function');

    const loginResult = fallback.login();
    assert.equal(loginResult.ok, false);
    assert.equal(loginResult.user, null);
    assert.equal(loginResult.error.message, fallback.sessionNotice);
    assert.equal(typeof fallback.logout(), 'object');

    const feedback = buildAuthFeedbackState({ sessionNotice: fallback.sessionNotice });
    assert.equal(feedback.state, 'error');
    assert.equal(feedback.message, fallback.sessionNotice);
});

test('resolveProtectedRouteState surfaces a session notice instead of exposing private content', () => {
    const fallback = resolveAuthContextValue(null);

    const loadingView = resolveProtectedRouteState({
        loading: true,
        isAuthenticated: false,
        userRole: null,
        allowedRoles: ['USER', 'ADMIN'],
        sessionNotice: '',
    });

    assert.equal(loadingView.state, 'loading');
    assert.equal(loadingView.canRender, false);
    assert.equal(loadingView.redirectTo, null);
    assert.equal(loadingView.error, null);
    assert.equal(loadingView.message, 'Checking your session...');

    const errorView = resolveProtectedRouteState({
        loading: false,
        isAuthenticated: false,
        userRole: null,
        allowedRoles: ['USER', 'ADMIN'],
        sessionNotice: fallback.sessionNotice,
    });

    assert.equal(errorView.state, 'error');
    assert.equal(errorView.canRender, false);
    assert.equal(errorView.redirectTo, '/login');
    assert.ok(errorView.error instanceof AuthRouteGuardError);
    assert.equal(errorView.error.code, 'sessionUnavailable');
    assert.equal(errorView.error.message, fallback.sessionNotice);
    assert.equal(errorView.message, fallback.sessionNotice);
});

test('resolveProtectedRouteState still preserves the normal authenticated redirect flow', () => {
    const allowedView = resolveProtectedRouteState({
        loading: false,
        isAuthenticated: true,
        userRole: 'USER',
        allowedRoles: ['USER', 'PREMIUM', 'PRO', 'ADMIN'],
        sessionNotice: '',
    });

    assert.equal(allowedView.state, 'allowed');
    assert.equal(allowedView.canRender, true);
    assert.equal(allowedView.redirectTo, null);
    assert.equal(allowedView.error, null);
    assert.equal(allowedView.message, '');

    const deniedView = resolveProtectedRouteState({
        loading: false,
        isAuthenticated: true,
        userRole: 'USER',
        allowedRoles: ['ADMIN'],
        sessionNotice: '',
    });

    assert.equal(deniedView.state, 'redirect');
    assert.equal(deniedView.canRender, false);
    assert.equal(deniedView.redirectTo, '/dashboard');
    assert.ok(deniedView.error instanceof AuthRouteGuardError);
    assert.equal(deniedView.error.code, 'unauthorizedRole');
    assert.equal(deniedView.error.message, 'You do not have access to this page.');
    assert.equal(deniedView.message, 'Redirecting to the dashboard...');
});
