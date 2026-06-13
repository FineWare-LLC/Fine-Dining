// @ts-nocheck
import assert from 'node:assert/strict';
import test from 'node:test';

import {
    buildUpdatedAuthUserSnapshot,
    persistLoginInfo,
    resolveStoredAuthSession,
} from '../../context/authUtils';
import { findSimilarMeals } from '../../services/mealPlanGenerator';
import { resolveHouseholdChildRestrictionProfile } from '../../utils/householdChildRestrictions';

const buildApolloClient = (responses) => ({
    query: async () => responses.shift(),
});

const buildMeal = (overrides = {}) => ({
    id: 'meal-target',
    mealName: 'Target meal',
    nutrition: {
        calories: 500,
        protein: 30,
        carbohydrates: 50,
        fat: 20,
    },
    allergens: [],
    dietaryTags: ['gluten_free'],
    recipe: {
        ingredients: [
            { name: 'Rice' },
            { name: 'Chicken' },
        ],
        tags: ['gluten_free'],
    },
    ...overrides,
});

const buildToken = (payload) => {
    const json = JSON.stringify(payload);
    const base64 = Buffer.from(json, 'utf8').toString('base64');
    const encoded = base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
    return `header.${encoded}.signature`;
};

const createStorageAdapter = (initialState = {}) => {
    const state = { ...initialState };

    return {
        state,
        setItem(key, value) {
            state[key] = value;
            return true;
        },
        removeItem(key) {
            delete state[key];
            return true;
        },
    };
};

test('persisted gluten_free child restrictions stay canonical across refresh and meal filtering', async () => {
    const nowSeconds = 1_700_000_000;
    const token = buildToken({
        exp: nowSeconds + 60,
        userId: 'guardian-1',
        email: 'guardian@example.com',
        role: 'user',
        subscriptionPlan: 'PRO',
        subscriptionStatus: 'active',
    });
    const currentUser = {
        id: 'guardian-1',
        name: 'Guardian One',
        email: 'guardian@example.com',
        role: 'user',
        measurementSystem: 'metric',
        subscriptionPlan: 'PRO',
        subscriptionStatus: 'active',
        dietaryRestrictions: ['Legacy gluten_free'],
    };
    const updatedUser = {
        dietaryRestrictions: [' gluten_free '],
    };
    const storageAdapter = createStorageAdapter();

    const mergedSnapshot = buildUpdatedAuthUserSnapshot(currentUser, updatedUser);
    const persisted = persistLoginInfo(token, mergedSnapshot, storageAdapter, nowSeconds);
    const refreshed = resolveStoredAuthSession(storageAdapter.state.authToken, storageAdapter.state.userInfo, nowSeconds);
    const resolvedProfile = resolveHouseholdChildRestrictionProfile(refreshed.user);

    assert.equal(persisted.ok, true);
    assert.deepEqual(mergedSnapshot.dietaryRestrictions, ['gluten_free']);
    assert.deepEqual(refreshed.user.dietaryRestrictions, ['gluten_free']);
    assert.equal(resolvedProfile.valid, true);
    assert.deepEqual(resolvedProfile.hardRestrictions, ['gluten_free']);

    const targetMeal = buildMeal({
        id: 'meal-target',
        mealName: 'Target meal',
        dietaryTags: ['gluten_free'],
        recipe: {
            ingredients: [
                { name: 'Rice' },
                { name: 'Chicken' },
            ],
            tags: ['gluten_free'],
        },
    });
    const blockedMeal = buildMeal({
        id: 'meal-blocked',
        mealName: 'Blocked meal',
        dietaryTags: ['vegetarian'],
        recipe: {
            ingredients: [
                { name: 'Bread' },
                { name: 'Tomato' },
            ],
            tags: ['vegetarian'],
        },
    });
    const allowedMeal = buildMeal({
        id: 'meal-allowed',
        mealName: 'Allowed meal',
        dietaryTags: ['gluten_free'],
        recipe: {
            ingredients: [
                { name: 'Rice' },
                { name: 'Beans' },
            ],
            tags: ['gluten_free'],
        },
    });

    const apolloClient = buildApolloClient([
        {
            data: {
                getUser: refreshed.user,
            },
        },
        {
            data: {
                getAllMeals: [targetMeal, blockedMeal, allowedMeal],
            },
        },
    ]);

    const similarMeals = await findSimilarMeals(apolloClient, targetMeal, 'guardian-1', 5, {
        returnEmptyOnError: false,
    });

    assert.deepEqual(similarMeals.map((meal) => meal.id), ['meal-allowed']);
});
