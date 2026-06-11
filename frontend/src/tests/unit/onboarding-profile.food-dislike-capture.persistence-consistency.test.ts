// @ts-nocheck
import assert from 'node:assert/strict';
import test from 'node:test';
import { buildUpdatedAuthUserSnapshot, persistLoginInfo, resolveStoredAuthSession } from '../../context/authUtils';
import { findSimilarMeals } from '../../services/mealPlanGenerator';

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

test('buildUpdatedAuthUserSnapshot keeps cleared food dislikes out of similar meal suggestions', async () => {
    const nowSeconds = 1_700_000_000;
    const currentUser = {
        id: 'user-dislike-clear-1',
        name: 'Ada Lovelace',
        email: 'ADA@example.com',
        role: 'user',
        measurementSystem: 'metric',
        subscriptionPlan: 'PRO',
        subscriptionStatus: 'active',
    };
    const onboardingUpdate = {
        dietaryProfile: {
            diets: ['vegan'],
            allergens: ['dairy'],
            excludedIngredients: ['  cilantro  '],
            preferredCuisines: ['Mediterranean'],
        },
    };
    const token = buildToken({
        exp: nowSeconds + 60,
        userId: 'user-dislike-clear-1',
        email: 'ADA@example.com',
        role: 'user',
        subscriptionPlan: 'PRO',
        subscriptionStatus: 'active',
    });
    const storageAdapter = createStorageAdapter();

    const mergedSnapshot = buildUpdatedAuthUserSnapshot(currentUser, onboardingUpdate);
    const persisted = persistLoginInfo(token, mergedSnapshot, storageAdapter, nowSeconds);
    const refreshed = resolveStoredAuthSession(storageAdapter.state.authToken, storageAdapter.state.userInfo, nowSeconds);

    assert.equal(persisted.ok, true);
    assert.deepEqual(refreshed.user.dietaryProfile.excludedIngredients, ['cilantro']);
    assert.deepEqual(refreshed.user.dislikedIngredients, ['cilantro']);

    const responses = [
        { data: { getUser: refreshed.user } },
        {
            data: {
                getAllMeals: [
                    {
                        id: 'target-meal',
                        mealName: 'Target Meal',
                        nutrition: { calories: 500, protein: 30, carbohydrates: 50, fat: 20 },
                        allergens: [],
                        recipe: { ingredients: ['Chicken', 'Rice'] },
                    },
                    {
                        id: 'disallowed-meal',
                        mealName: 'Disallowed Meal',
                        nutrition: { calories: 505, protein: 31, carbohydrates: 49, fat: 19 },
                        allergens: [],
                        recipe: { ingredients: ['Cilantro', 'Rice'] },
                    },
                    {
                        id: 'allowed-meal',
                        mealName: 'Allowed Meal',
                        nutrition: { calories: 640, protein: 42, carbohydrates: 61, fat: 24 },
                        allergens: [],
                        recipe: { ingredients: ['Chicken', 'Rice'] },
                    },
                ],
            },
        },
    ];
    const apolloClient = {
        query: async () => responses.shift(),
    };

    const similarMeals = await findSimilarMeals(apolloClient, {
        id: 'target-meal',
        nutrition: { calories: 500, protein: 30, carbohydrates: 50, fat: 20 },
    }, refreshed.user.id, 5);

    assert.deepEqual(similarMeals.map((meal) => meal.id), ['allowed-meal']);
});
