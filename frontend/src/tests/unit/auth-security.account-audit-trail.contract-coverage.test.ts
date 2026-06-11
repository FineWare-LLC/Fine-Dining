// @ts-nocheck
import assert from 'node:assert/strict';
import test from 'node:test';
import { AuthTokenValidationError, persistLoginInfo, resolveStoredAuthSession } from '../../context/authUtils';

const encodePayload = (payload) => {
    const json = JSON.stringify(payload);
    const base64 = Buffer.from(json, 'utf8').toString('base64');
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
};

const buildToken = (payload) => `header.${encodePayload(payload)}.signature`;

const createStorageAdapter = (initialState = {}) => {
    const state = { ...initialState };
    const writes = [];
    const removals = [];

    return {
        state,
        writes,
        removals,
        setItem(key, value) {
            writes.push([key, value]);
            state[key] = value;
            return true;
        },
        removeItem(key) {
            removals.push(key);
            delete state[key];
            return true;
        },
    };
};

test('persistLoginInfo and resolveStoredAuthSession preserve a canonical login history audit trail', () => {
    const nowSeconds = 1_700_000_000;
    const storageAdapter = createStorageAdapter();
    const token = buildToken({
        exp: nowSeconds + 60,
        userId: 'user-audit-1',
        email: 'Ada@Example.com ',
        role: 'admin',
        subscriptionPlan: 'PRO',
        subscriptionStatus: 'active',
    });
    const rawUser = {
        id: 'legacy-user-1',
        name: 'Ada Lovelace',
        email: 'ADA@example.com',
        role: 'admin',
        subscriptionPlan: 'PRO',
        subscriptionStatus: 'active',
        loginHistory: [
            {
                ip: '203.0.113.10',
                userAgent: 'Mozilla/5.0',
                timestamp: '2026-06-11T18:55:00.000Z',
            },
        ],
    };

    const persisted = persistLoginInfo(token, rawUser, storageAdapter, nowSeconds);
    const refreshed = resolveStoredAuthSession(storageAdapter.state.authToken, storageAdapter.state.userInfo, nowSeconds);

    assert.equal(persisted.ok, true);
    assert.deepEqual(persisted.user, {
        id: 'user-audit-1',
        name: 'Ada Lovelace',
        email: 'ada@example.com',
        role: 'ADMIN',
        subscriptionPlan: 'PRO',
        subscriptionStatus: 'active',
        loginHistory: [
            {
                ip: '203.0.113.10',
                userAgent: 'Mozilla/5.0',
                timestamp: '2026-06-11T18:55:00.000Z',
            },
        ],
    });
    assert.deepEqual(JSON.parse(storageAdapter.state.userInfo), persisted.user);
    assert.equal(refreshed.status, 'hydrated');
    assert.equal(refreshed.shouldClearStorage, false);
    assert.equal(refreshed.sessionNotice, '');
    assert.equal(refreshed.token, token);
    assert.deepEqual(refreshed.user, persisted.user);
});

test('persistLoginInfo rejects malformed login history entries with a typed validation error', () => {
    const nowSeconds = 1_700_000_000;
    const storageAdapter = createStorageAdapter({
        authToken: 'stale-token',
        userInfo: '{"stale":true}',
    });
    const token = buildToken({
        exp: nowSeconds + 60,
        userId: 'user-audit-2',
        email: 'ada@example.com',
        role: 'admin',
    });
    const rawUser = {
        id: 'legacy-user-2',
        name: 'Ada Lovelace',
        email: 'ada@example.com',
        role: 'admin',
        subscriptionPlan: 'PRO',
        subscriptionStatus: 'active',
        loginHistory: [
            {
                ip: 123,
                userAgent: 'Mozilla/5.0',
                timestamp: 'not-a-date',
            },
        ],
    };

    const result = persistLoginInfo(token, rawUser, storageAdapter, nowSeconds);

    assert.equal(result.ok, false);
    assert.ok(result.error instanceof AuthTokenValidationError);
    assert.equal(result.error.code, 'invalidPayload');
    assert.equal(result.error.message, 'Your session is no longer valid. Please sign in again.');
    assert.deepEqual(storageAdapter.state, {});
    assert.deepEqual(storageAdapter.removals, ['authToken', 'userInfo']);
});

test('resolveStoredAuthSession rejects malformed stored login history before hydration', () => {
    const nowSeconds = 1_700_000_000;
    const token = buildToken({
        exp: nowSeconds + 60,
        userId: 'user-audit-3',
        email: 'ada@example.com',
        role: 'admin',
    });
    const storedUser = JSON.stringify({
        id: 'legacy-user-3',
        name: 'Ada Lovelace',
        email: 'ada@example.com',
        role: 'ADMIN',
        subscriptionPlan: 'PRO',
        subscriptionStatus: 'active',
        loginHistory: [
            {
                ip: '203.0.113.11',
                userAgent: 'Mozilla/5.0',
                timestamp: 'not-a-date',
            },
        ],
    });

    const refreshed = resolveStoredAuthSession(token, storedUser, nowSeconds);

    assert.equal(refreshed.status, 'invalid-user');
    assert.equal(refreshed.token, null);
    assert.equal(refreshed.user, null);
    assert.equal(refreshed.sessionNotice, 'Your saved session could not be read. Please sign in again.');
    assert.equal(refreshed.shouldClearStorage, true);
    assert.equal(refreshed.tokenValidation.valid, true);
});
