// @ts-nocheck
import assert from 'node:assert/strict';
import test from 'node:test';
import { AuthTokenValidationError, persistLoginInfo } from '../../context/authUtils';

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

test('persistLoginInfo rejects malformed ranked diet preferences with a typed user-safe error', () => {
    const nowSeconds = 1_700_000_000;
    const storageAdapter = createStorageAdapter({
        authToken: 'stale-token',
        userInfo: '{"stale":true}',
    });
    const token = buildToken({
        exp: nowSeconds + 60,
        userId: 'user-diet-1',
        email: 'ada@example.com',
        role: 'USER',
        subscriptionPlan: 'FREE',
        subscriptionStatus: 'inactive',
    });
    const rawUser = {
        id: 'user-diet-1',
        name: 'Ada Lovelace',
        email: 'ADA@example.com',
        role: 'USER',
        subscriptionPlan: 'FREE',
        subscriptionStatus: 'inactive',
        foodGoals: ['High protein', 'Mediterranean'],
        dietaryProfile: {
            diets: ['HIGH_PROTEIN', 42],
            excludedIngredients: [],
            preferredCuisines: ['Mediterranean'],
        },
    };

    const result = persistLoginInfo(token, rawUser, storageAdapter, nowSeconds);

    assert.equal(result.ok, false);
    assert.ok(result.error instanceof AuthTokenValidationError);
    assert.equal(result.error.code, 'invalidPayload');
    assert.equal(result.error.message, 'Your session is no longer valid. Please sign in again.');
    assert.deepEqual(storageAdapter.state, {});
    assert.deepEqual(storageAdapter.writes, []);
    assert.deepEqual(storageAdapter.removals, ['authToken', 'userInfo']);
});
