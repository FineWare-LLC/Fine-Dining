// @ts-nocheck
import assert from 'node:assert/strict';
import test from 'node:test';
import {
    buildUpdatedAuthUserSnapshot,
    persistLoginInfo,
    resolveStoredAuthSession,
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

test('buildUpdatedAuthUserSnapshot preserves untouched nutrition targets through a partial edit and refresh', () => {
    const nowSeconds = 1_700_000_000;
    const currentUser = {
        id: 'user-nutrition-4',
        name: 'Ada Lovelace',
        email: 'ADA@example.com',
        role: 'user',
        measurementSystem: 'metric',
        subscriptionPlan: 'PRO',
        subscriptionStatus: 'active',
        nutritionTargets: {
            caloriesMin: 1600,
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
    };
    const partialNutritionTargets = {
        caloriesMin: 1800,
        proteinMax: 150,
        sodiumMax: 2100,
    };
    const token = buildToken({
        exp: nowSeconds + 60,
        userId: 'user-nutrition-4',
        email: 'ADA@example.com',
        role: 'user',
        subscriptionPlan: 'PRO',
        subscriptionStatus: 'active',
    });
    const storageAdapter = createStorageAdapter();
    const expectedNutritionTargets = {
        caloriesMin: 1800,
        caloriesMax: 2200,
        proteinMin: 80,
        proteinMax: 150,
        carbohydratesMin: 180,
        carbohydratesMax: 260,
        fatMin: 50,
        fatMax: 80,
        fiberMin: 25,
        fiberMax: 40,
        sodiumMin: 1200,
        sodiumMax: 2100,
    };

    const mergedSnapshot = buildUpdatedAuthUserSnapshot(currentUser, {
        nutritionTargets: partialNutritionTargets,
    });
    const persisted = persistLoginInfo(token, mergedSnapshot, storageAdapter, nowSeconds);
    const refreshed = resolveStoredAuthSession(storageAdapter.state.authToken, storageAdapter.state.userInfo, nowSeconds);

    assert.deepEqual(mergedSnapshot, {
        id: 'user-nutrition-4',
        name: 'Ada Lovelace',
        email: 'ADA@example.com',
        role: 'USER',
        measurementSystem: 'METRIC',
        subscriptionPlan: 'PRO',
        subscriptionStatus: 'active',
        nutritionTargets: expectedNutritionTargets,
    });
    assert.equal(persisted.ok, true);
    assert.deepEqual(persisted.user.nutritionTargets, expectedNutritionTargets);
    assert.deepEqual(JSON.parse(storageAdapter.state.userInfo), persisted.user);
    assert.equal(refreshed.status, 'hydrated');
    assert.equal(refreshed.shouldClearStorage, false);
    assert.equal(refreshed.sessionNotice, '');
    assert.equal(refreshed.token, token);
    assert.deepEqual(refreshed.user.nutritionTargets, expectedNutritionTargets);
});
