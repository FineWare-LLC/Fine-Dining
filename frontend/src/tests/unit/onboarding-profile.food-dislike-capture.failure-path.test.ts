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

test('buildUpdatedAuthUserSnapshot keeps food dislike exclusions canonical when a legacy top-level field is malformed', () => {
    const nowSeconds = 1_700_000_000;
    const currentUser = {
        id: 'user-dislike-legacy-1',
        name: 'Grace Hopper',
        email: 'GRACE@example.com',
        role: 'user',
        measurementSystem: 'metric',
        subscriptionPlan: 'PRO',
        subscriptionStatus: 'active',
        dislikedIngredients: ['  stale celery  ', 42],
        dietaryProfile: {
            diets: [' vegan '],
            excludedIngredients: ['  cilantro  ', ' mushrooms '],
            preferredCuisines: [' Mediterranean '],
        },
    };
    const onboardingUpdate = {
        dailyCalories: 2200,
    };
    const token = buildToken({
        exp: nowSeconds + 60,
        userId: 'user-dislike-legacy-1',
        email: 'grace@example.com',
        role: 'user',
        subscriptionPlan: 'PRO',
        subscriptionStatus: 'active',
    });
    const storageAdapter = createStorageAdapter();

    const mergedSnapshot = buildUpdatedAuthUserSnapshot(currentUser, onboardingUpdate);
    const persisted = persistLoginInfo(token, mergedSnapshot, storageAdapter, nowSeconds);
    const refreshed = resolveStoredAuthSession(storageAdapter.state.authToken, storageAdapter.state.userInfo, nowSeconds);

    assert.deepEqual(mergedSnapshot, {
        id: 'user-dislike-legacy-1',
        name: 'Grace Hopper',
        email: 'GRACE@example.com',
        role: 'USER',
        measurementSystem: 'METRIC',
        subscriptionPlan: 'PRO',
        subscriptionStatus: 'active',
        dislikedIngredients: ['cilantro', 'mushrooms'],
        dietaryProfile: {
            diets: ['vegan'],
            excludedIngredients: ['cilantro', 'mushrooms'],
            preferredCuisines: ['Mediterranean'],
        },
        dailyCalories: 2200,
    });
    assert.equal(persisted.ok, true);
    assert.deepEqual(persisted.user, {
        id: 'user-dislike-legacy-1',
        name: 'Grace Hopper',
        email: 'grace@example.com',
        role: 'USER',
        measurementSystem: 'METRIC',
        subscriptionPlan: 'PRO',
        subscriptionStatus: 'active',
        dislikedIngredients: ['cilantro', 'mushrooms'],
        dietaryProfile: {
            diets: ['vegan'],
            excludedIngredients: ['cilantro', 'mushrooms'],
            preferredCuisines: ['Mediterranean'],
        },
        dailyCalories: 2200,
    });
    assert.deepEqual(JSON.parse(storageAdapter.state.userInfo), persisted.user);
    assert.equal(refreshed.status, 'hydrated');
    assert.equal(refreshed.shouldClearStorage, false);
    assert.equal(refreshed.sessionNotice, '');
    assert.equal(refreshed.token, token);
    assert.deepEqual(refreshed.user, persisted.user);
});

test('buildUpdatedAuthUserSnapshot still rejects malformed food dislike payloads when no canonical source can be recovered', () => {
    const currentUser = {
        id: 'user-dislike-legacy-2',
        name: 'Ada Lovelace',
        email: 'ada@example.com',
        role: 'USER',
        measurementSystem: 'METRIC',
        subscriptionPlan: 'PRO',
        subscriptionStatus: 'active',
        dislikedIngredients: [42],
    };

    const mergedSnapshot = buildUpdatedAuthUserSnapshot(currentUser, {
        dailyCalories: 2300,
    });

    assert.equal(mergedSnapshot, null);
});
