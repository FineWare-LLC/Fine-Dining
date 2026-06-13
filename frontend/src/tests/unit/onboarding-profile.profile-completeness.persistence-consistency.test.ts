// @ts-nocheck
import assert from 'node:assert/strict';
import test from 'node:test';
import {
    buildUpdatedAuthUserSnapshot,
    persistLoginInfo,
    resolveStoredAuthSession,
} from '../../context/authUtils';
import { collectCanonicalAllergies } from '../../utils/allergyPreferences';

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

test('buildUpdatedAuthUserSnapshot keeps partial questionnaire edits canonical across refresh', () => {
    const nowSeconds = 1_700_000_000;
    const currentUser = {
        id: 'user-profile-3',
        name: 'Ada Lovelace',
        email: 'ADA@example.com',
        role: 'user',
        measurementSystem: 'metric',
        subscriptionPlan: 'PRO',
        subscriptionStatus: 'active',
        allergies: ['shellfish'],
        questionnaire: {
            allergies: ['shellfish'],
            disallowedIngredients: ['  refined sugar  '],
            dietaryPattern: '  Mediterranean  ',
            activityLevel: 2,
        },
    };
    const onboardingUpdate = {
        dailyCalories: 2300,
        questionnaire: {
            allergies: ['  peanuts  '],
            activityLevel: 4,
        },
    };
    const token = buildToken({
        exp: nowSeconds + 60,
        userId: 'user-profile-3',
        email: 'ADA@example.com',
        role: 'user',
        subscriptionPlan: 'PRO',
        subscriptionStatus: 'active',
    });
    const storageAdapter = createStorageAdapter();

    const mergedSnapshot = buildUpdatedAuthUserSnapshot(currentUser, onboardingUpdate);
    const persisted = persistLoginInfo(token, mergedSnapshot, storageAdapter, nowSeconds);
    const refreshed = resolveStoredAuthSession(storageAdapter.state.authToken, storageAdapter.state.userInfo, nowSeconds);
    const canonicalAllergies = collectCanonicalAllergies(refreshed.user);

    assert.deepEqual(mergedSnapshot, {
        id: 'user-profile-3',
        name: 'Ada Lovelace',
        email: 'ADA@example.com',
        role: 'USER',
        measurementSystem: 'METRIC',
        subscriptionPlan: 'PRO',
        subscriptionStatus: 'active',
        allergies: ['peanuts'],
        questionnaire: {
            allergies: ['peanuts'],
            disallowedIngredients: ['refined sugar'],
            dietaryPattern: 'Mediterranean',
            activityLevel: 4,
        },
        dailyCalories: 2300,
    });
    assert.equal(persisted.ok, true);
    assert.deepEqual(persisted.user, {
        id: 'user-profile-3',
        name: 'Ada Lovelace',
        email: 'ada@example.com',
        role: 'USER',
        measurementSystem: 'METRIC',
        subscriptionPlan: 'PRO',
        subscriptionStatus: 'active',
        allergies: ['peanuts'],
        questionnaire: {
            allergies: ['peanuts'],
            disallowedIngredients: ['refined sugar'],
            dietaryPattern: 'Mediterranean',
            activityLevel: 4,
        },
        dailyCalories: 2300,
    });
    assert.deepEqual(JSON.parse(storageAdapter.state.userInfo), persisted.user);
    assert.equal(refreshed.status, 'hydrated');
    assert.equal(refreshed.shouldClearStorage, false);
    assert.equal(refreshed.sessionNotice, '');
    assert.equal(refreshed.token, token);
    assert.deepEqual(refreshed.user, persisted.user);
    assert.deepEqual(refreshed.user.questionnaire, persisted.user.questionnaire);
    assert.equal(canonicalAllergies.has('peanuts'), true);
    assert.equal(canonicalAllergies.has('shellfish'), false);
});
