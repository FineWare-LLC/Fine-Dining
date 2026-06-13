// @ts-nocheck
import assert from 'node:assert/strict';
import test from 'node:test';
import {
    AuthSignupValidationError,
    persistLoginInfo,
    resolveStoredAuthSession,
    validateSignupInput,
} from '../../context/authUtils';

const buildToken = (payload) => {
    const json = JSON.stringify(payload);
    const base64 = Buffer.from(json, 'utf8').toString('base64');
    const encoded = base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
    return `header.${encoded}.signature`;
};

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

const buildSignupInput = (foodGoals) => ({
    name: '  Ada Lovelace  ',
    email: ' Ada@Example.com ',
    password: 'Ab1!cdef',
    gender: 'other',
    measurementSystem: 'metric',
    foodGoals,
});

test('validateSignupInput accepts a valid diet goal ranking payload and preserves goal order for persistence', () => {
    const result = validateSignupInput(buildSignupInput(['  High protein  ', 'Low carb', 'Balanced diet', '   ']));

    assert.equal(result.valid, true);
    assert.deepEqual(result.input, {
        name: 'Ada Lovelace',
        email: 'ada@example.com',
        password: 'Ab1!cdef',
        gender: 'OTHER',
        measurementSystem: 'METRIC',
        foodGoals: ['High protein', 'Low carb', 'Balanced diet'],
    });
});

test('validateSignupInput rejects malformed diet goal payloads with a typed, user-safe error', () => {
    const result = validateSignupInput(buildSignupInput(['High protein', 42]));

    assert.equal(result.valid, false);
    assert.ok(result.error instanceof AuthSignupValidationError);
    assert.equal(result.error.code, 'invalidFoodGoals');
    assert.equal(result.error.message, 'Please choose valid diet goals.');
});

test('persistLoginInfo and resolveStoredAuthSession keep diet goals canonical across refresh', () => {
    const nowSeconds = 1_700_000_000;
    const storageAdapter = createStorageAdapter();
    const token = buildToken({
        exp: nowSeconds + 60,
        userId: 'user-diet-goals-1',
        email: 'Ada@Example.com ',
        role: 'user',
        subscriptionPlan: 'PRO',
        subscriptionStatus: 'active',
    });
    const rawUser = {
        id: 'legacy-user-diet-goals-1',
        name: 'Ada Lovelace',
        email: 'ADA@example.com',
        role: 'user',
        subscriptionPlan: 'PRO',
        subscriptionStatus: 'active',
        foodGoals: ['  High protein  ', 'Low carb', '   Balanced diet   '],
    };

    const persisted = persistLoginInfo(token, rawUser, storageAdapter, nowSeconds);
    const refreshed = resolveStoredAuthSession(storageAdapter.state.authToken, storageAdapter.state.userInfo, nowSeconds);

    assert.equal(persisted.ok, true);
    assert.deepEqual(persisted.user, {
        id: 'user-diet-goals-1',
        name: 'Ada Lovelace',
        email: 'ada@example.com',
        role: 'USER',
        subscriptionPlan: 'PRO',
        subscriptionStatus: 'active',
        foodGoals: ['High protein', 'Low carb', 'Balanced diet'],
    });
    assert.deepEqual(JSON.parse(storageAdapter.state.userInfo), persisted.user);
    assert.equal(refreshed.status, 'hydrated');
    assert.equal(refreshed.shouldClearStorage, false);
    assert.equal(refreshed.sessionNotice, '');
    assert.equal(refreshed.token, token);
    assert.deepEqual(refreshed.user, persisted.user);
    assert.deepEqual(refreshed.user.foodGoals, ['High protein', 'Low carb', 'Balanced diet']);
});
