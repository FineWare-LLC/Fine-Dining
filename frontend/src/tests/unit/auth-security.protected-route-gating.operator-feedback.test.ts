// @ts-nocheck
import assert from 'node:assert/strict';
import test from 'node:test';
import { resolveAuthContextValue } from '../../context/AuthContext';
import {
    buildProtectedRouteFeedbackState,
    resolveProtectedRouteState,
} from '../../context/authUtils';

test('buildProtectedRouteFeedbackState reports loading feedback with a stable layout surface', () => {
    const routeState = resolveProtectedRouteState({
        loading: true,
        isAuthenticated: false,
        userRole: null,
        allowedRoles: ['USER', 'ADMIN'],
        sessionNotice: '',
    });

    assert.deepEqual(buildProtectedRouteFeedbackState(routeState), {
        state: 'loading',
        message: 'Checking your session...',
        role: 'status',
        ariaLive: 'polite',
        minHeight: 56,
        showSpinner: true,
    });
});

test('buildProtectedRouteFeedbackState reports session errors as alerts without exposing private content', () => {
    const fallback = resolveAuthContextValue(null);
    const routeState = resolveProtectedRouteState({
        loading: false,
        isAuthenticated: false,
        userRole: null,
        allowedRoles: ['USER'],
        sessionNotice: fallback.sessionNotice,
    });

    assert.deepEqual(buildProtectedRouteFeedbackState(routeState), {
        state: 'error',
        message: fallback.sessionNotice,
        role: 'alert',
        ariaLive: 'assertive',
        minHeight: 56,
        showSpinner: false,
    });
});

test('buildProtectedRouteFeedbackState keeps redirect feedback neutral and readable', () => {
    const routeState = resolveProtectedRouteState({
        loading: false,
        isAuthenticated: true,
        userRole: 'USER',
        allowedRoles: ['ADMIN'],
        sessionNotice: '',
    });

    assert.deepEqual(buildProtectedRouteFeedbackState(routeState), {
        state: 'empty',
        message: 'Redirecting to the dashboard...',
        role: 'status',
        ariaLive: 'polite',
        minHeight: 56,
        showSpinner: false,
    });
});

test('buildProtectedRouteFeedbackState reports allowed routes as success feedback', () => {
    const routeState = resolveProtectedRouteState({
        loading: false,
        isAuthenticated: true,
        userRole: 'ADMIN',
        allowedRoles: ['ADMIN'],
        sessionNotice: '',
    });

    assert.deepEqual(buildProtectedRouteFeedbackState(routeState), {
        state: 'success',
        message: 'Access granted.',
        role: 'status',
        ariaLive: 'polite',
        minHeight: 56,
        showSpinner: false,
    });
});
