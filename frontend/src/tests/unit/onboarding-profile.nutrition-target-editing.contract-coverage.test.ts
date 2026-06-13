// @ts-nocheck
import assert from 'node:assert/strict';
import test, { mock } from 'node:test';
import { AuthTokenValidationError, buildUpdatedAuthUserSnapshot, persistLoginInfo, resolveStoredAuthSession } from '../../context/authUtils';
import { updateUser } from '../../graphql/resolvers/mutations/userMutations';
import User from '../../models/User/index';

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

test('buildUpdatedAuthUserSnapshot keeps nutrition target edits canonical across refresh', () => {
    const nowSeconds = 1_700_000_000;
    const currentUser = {
        id: 'user-nutrition-1',
        name: 'Ada Lovelace',
        email: 'ADA@example.com',
        role: 'user',
        measurementSystem: 'metric',
        subscriptionPlan: 'PRO',
        subscriptionStatus: 'active',
    };
    const nutritionTargets = {
        caloriesMin: 1800,
        caloriesMax: 2200,
        proteinMin: 80,
        proteinMax: 140,
        carbohydratesMin: 180,
        carbohydratesMax: 260,
        fatMin: 50,
        fatMax: 80,
        fiberMin: 25,
        fiberMax: 40,
        sodiumMin: 1200,
        sodiumMax: 2300,
    };
    const token = buildToken({
        exp: nowSeconds + 60,
        userId: 'user-nutrition-1',
        email: 'ADA@example.com',
        role: 'user',
        subscriptionPlan: 'PRO',
        subscriptionStatus: 'active',
    });
    const storageAdapter = createStorageAdapter();

    const mergedSnapshot = buildUpdatedAuthUserSnapshot(currentUser, { nutritionTargets });
    const persisted = persistLoginInfo(token, mergedSnapshot, storageAdapter, nowSeconds);
    const refreshed = resolveStoredAuthSession(storageAdapter.state.authToken, storageAdapter.state.userInfo, nowSeconds);

    assert.deepEqual(mergedSnapshot, {
        id: 'user-nutrition-1',
        name: 'Ada Lovelace',
        email: 'ADA@example.com',
        role: 'USER',
        subscriptionPlan: 'PRO',
        subscriptionStatus: 'active',
        measurementSystem: 'METRIC',
        nutritionTargets,
    });
    assert.equal(persisted.ok, true);
    assert.deepEqual(persisted.user, {
        id: 'user-nutrition-1',
        name: 'Ada Lovelace',
        email: 'ada@example.com',
        role: 'USER',
        subscriptionPlan: 'PRO',
        subscriptionStatus: 'active',
        measurementSystem: 'METRIC',
        nutritionTargets,
    });
    assert.deepEqual(JSON.parse(storageAdapter.state.userInfo), persisted.user);
    assert.equal(refreshed.status, 'hydrated');
    assert.equal(refreshed.shouldClearStorage, false);
    assert.equal(refreshed.sessionNotice, '');
    assert.equal(refreshed.token, token);
    assert.deepEqual(refreshed.user, persisted.user);
    assert.deepEqual(refreshed.user.nutritionTargets, nutritionTargets);
});

test('buildUpdatedAuthUserSnapshot rejects malformed nutrition target ranges with a typed user-safe error', () => {
    const nowSeconds = 1_700_000_000;
    const currentUser = {
        id: 'user-nutrition-2',
        name: 'Grace Hopper',
        email: 'grace@example.com',
        role: 'user',
        measurementSystem: 'imperial',
        subscriptionPlan: 'PRO',
        subscriptionStatus: 'active',
    };
    const storageAdapter = createStorageAdapter({
        authToken: 'stale-token',
        userInfo: '{"stale":true}',
    });
    const token = buildToken({
        exp: nowSeconds + 60,
        userId: 'user-nutrition-2',
        email: 'grace@example.com',
        role: 'user',
        subscriptionPlan: 'PRO',
        subscriptionStatus: 'active',
    });

    const mergedSnapshot = buildUpdatedAuthUserSnapshot(currentUser, {
        nutritionTargets: {
            caloriesMin: 2400,
            caloriesMax: 2200,
            proteinMin: 80,
            proteinMax: 140,
        },
    });
    const result = persistLoginInfo(token, mergedSnapshot, storageAdapter, nowSeconds);

    assert.equal(mergedSnapshot, null);
    assert.equal(result.ok, false);
    assert.ok(result.error instanceof AuthTokenValidationError);
    assert.equal(result.error.code, 'invalidPayload');
    assert.equal(result.error.message, 'Your session is no longer valid. Please sign in again.');
    assert.deepEqual(storageAdapter.state, {});
    assert.deepEqual(storageAdapter.writes, []);
    assert.deepEqual(storageAdapter.removals, ['authToken', 'userInfo']);
});

test('updateUser accepts nutrition target edits and persists the canonical snapshot', async () => {
    const currentUser = {
        id: 'user-nutrition-3',
        name: 'Grace Hopper',
        email: 'grace@example.com',
        role: 'USER',
        measurementSystem: 'metric',
        subscriptionPlan: 'PRO',
        subscriptionStatus: 'active',
        toObject() {
            return {
                id: 'user-nutrition-3',
                name: 'Grace Hopper',
                email: 'grace@example.com',
                role: 'USER',
                measurementSystem: 'metric',
                subscriptionPlan: 'PRO',
                subscriptionStatus: 'active',
            };
        },
    };
    const findByIdMock = mock.method(User, 'findById', async (id) => {
        assert.equal(id, 'user-nutrition-3');
        return currentUser;
    });
    let capturedUpdate = null;
    const findByIdAndUpdateMock = mock.method(User, 'findByIdAndUpdate', async (id, update, options) => {
        assert.equal(id, 'user-nutrition-3');
        capturedUpdate = update;
        assert.deepEqual(options, { new: true, runValidators: true });
        return update;
    });

    try {
        const result = await updateUser(
            null,
            {
                id: 'user-nutrition-3',
                input: {
                    nutritionTargets: {
                        caloriesMin: 1800,
                        caloriesMax: 2200,
                        proteinMin: 80,
                        proteinMax: 140,
                        carbohydratesMin: 180,
                        carbohydratesMax: 260,
                        fatMin: 50,
                        fatMax: 80,
                        fiberMin: 25,
                        fiberMax: 40,
                        sodiumMin: 1200,
                        sodiumMax: 2300,
                    },
                },
            },
            {
                user: {
                    userId: 'user-nutrition-3',
                    role: 'USER',
                },
            },
        );

        assert.deepEqual(capturedUpdate, {
            name: 'Grace Hopper',
            email: 'grace@example.com',
            role: 'USER',
            subscriptionPlan: 'PRO',
            subscriptionStatus: 'active',
            measurementSystem: 'METRIC',
            nutritionTargets: {
                caloriesMin: 1800,
                caloriesMax: 2200,
                proteinMin: 80,
                proteinMax: 140,
                carbohydratesMin: 180,
                carbohydratesMax: 260,
                fatMin: 50,
                fatMax: 80,
                fiberMin: 25,
                fiberMax: 40,
                sodiumMin: 1200,
                sodiumMax: 2300,
            },
        });
        assert.deepEqual(result, capturedUpdate);
    } finally {
        findByIdMock.mock.restore();
        findByIdAndUpdateMock.mock.restore();
    }
});
