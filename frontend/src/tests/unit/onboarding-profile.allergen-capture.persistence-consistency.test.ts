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

test('buildUpdatedAuthUserSnapshot keeps onboarding allergies canonical for the active auth session', () => {
    const currentUser = {
        id: 'user-allergy-1',
        name: 'Ada Lovelace',
        email: 'ADA@example.com',
        role: 'USER',
        measurementSystem: 'metric',
        subscriptionPlan: 'PRO',
        subscriptionStatus: 'active',
    };

    const onboardingUpdate = {
        dailyCalories: 2300,
        allergies: ['  dairy  ', ' peanuts ', '   '],
        dietaryProfile: {
            diets: ['HIGH_PROTEIN'],
            excludedIngredients: [],
            preferredCuisines: ['Italian'],
        },
    };

    const mergedSnapshot = buildUpdatedAuthUserSnapshot(currentUser, onboardingUpdate);

    assert.deepEqual(mergedSnapshot, {
        id: 'user-allergy-1',
        name: 'Ada Lovelace',
        email: 'ADA@example.com',
        role: 'USER',
        measurementSystem: 'METRIC',
        subscriptionPlan: 'PRO',
        subscriptionStatus: 'active',
        dailyCalories: 2300,
        allergies: ['dairy', 'peanuts'],
    });
});

test('buildUpdatedAuthUserSnapshot round-trips through session persistence without drifting allergies', () => {
    const nowSeconds = 1_700_000_000;
    const currentUser = {
        id: 'user-allergy-2',
        name: 'Grace Hopper',
        email: 'grace@example.com',
        role: 'ADMIN',
        measurementSystem: 'IMPERIAL',
        subscriptionPlan: 'FREE',
        subscriptionStatus: 'inactive',
    };
    const onboardingUpdate = {
        dailyCalories: 2100,
        allergies: ['shellfish', '  soy '],
        foodGoals: ['High protein', 'Maintain weight'],
    };
    const token = buildToken({
        exp: nowSeconds + 60,
        userId: 'user-allergy-2',
        email: 'grace@example.com',
        role: 'admin',
        subscriptionPlan: 'FREE',
        subscriptionStatus: 'inactive',
    });
    const storageAdapter = createStorageAdapter();

    const mergedSnapshot = buildUpdatedAuthUserSnapshot(currentUser, onboardingUpdate);
    const persisted = persistLoginInfo(token, mergedSnapshot, storageAdapter, nowSeconds);
    const refreshed = resolveStoredAuthSession(storageAdapter.state.authToken, storageAdapter.state.userInfo, nowSeconds);

    assert.equal(persisted.ok, true);
    assert.deepEqual(persisted.user, {
        id: 'user-allergy-2',
        name: 'Grace Hopper',
        email: 'grace@example.com',
        role: 'ADMIN',
        measurementSystem: 'IMPERIAL',
        subscriptionPlan: 'FREE',
        subscriptionStatus: 'inactive',
        dailyCalories: 2100,
        allergies: ['shellfish', 'soy'],
        foodGoals: ['High protein', 'Maintain weight'],
    });
    assert.deepEqual(JSON.parse(storageAdapter.state.userInfo), persisted.user);
    assert.equal(refreshed.status, 'hydrated');
    assert.equal(refreshed.shouldClearStorage, false);
    assert.equal(refreshed.sessionNotice, '');
    assert.deepEqual(refreshed.user, persisted.user);
    assert.deepEqual(refreshed.user.allergies, ['shellfish', 'soy']);
    assert.deepEqual(refreshed.user.foodGoals, ['High protein', 'Maintain weight']);
});
