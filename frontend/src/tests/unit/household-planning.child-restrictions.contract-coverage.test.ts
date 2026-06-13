// @ts-nocheck
import assert from 'node:assert/strict';
import test from 'node:test';

import {
    HouseholdChildRestrictionsValidationError,
    resolveHouseholdChildRestrictionProfile,
} from '../../utils/householdChildRestrictions';
import { findSimilarMeals } from '../../services/mealPlanGenerator';

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
    dietaryTags: ['vegetarian'],
    recipe: {
        ingredients: [
            { name: 'Chicken' },
            { name: 'Rice' },
        ],
        tags: ['vegetarian'],
    },
    ...overrides,
});

test('resolveHouseholdChildRestrictionProfile separates hard child restrictions from soft preferences', () => {
    const result = resolveHouseholdChildRestrictionProfile({
        dietaryRestrictions: [' Vegetarian ', '  gluten_free '],
        questionnaire: {
            dietaryPattern: ' mediterranean ',
        },
        dietaryProfile: {
            diets: [' vegan '],
            preferredCuisines: [' Italian '],
        },
        foodGoals: ['High protein'],
    });

    assert.equal(result.valid, true);
    assert.equal(result.error, null);
    assert.deepEqual(result.hardRestrictions, ['Vegetarian', 'gluten_free']);
    assert.deepEqual(result.softPreferences, {
        dietaryPattern: 'MEDITERRANEAN',
        foodGoals: ['High protein'],
        diets: ['vegan'],
        preferredCuisines: ['Italian'],
    });
});

test('resolveHouseholdChildRestrictionProfile rejects malformed child restriction payloads with a typed, user-safe error', () => {
    const result = resolveHouseholdChildRestrictionProfile({
        dietaryRestrictions: ['vegetarian', 42],
    });

    assert.equal(result.valid, false);
    assert.equal(result.hardRestrictions, null);
    assert.equal(result.softPreferences, null);
    assert.ok(result.error instanceof HouseholdChildRestrictionsValidationError);
    assert.equal(result.error.code, 'invalidPayload');
    assert.equal(
        result.error.message,
        'We could not read your child restriction settings. Please refresh the planner.',
    );
    assert.equal(result.error.isUserSafe, true);
});

test('findSimilarMeals excludes meals that violate hard child restrictions and rejects malformed restriction payloads', async () => {
    const targetMeal = buildMeal({
        id: 'meal-target',
        mealName: 'Target meal',
        dietaryTags: ['vegetarian'],
        recipe: {
            ingredients: [
                { name: 'Tofu' },
                { name: 'Rice' },
            ],
            tags: ['vegetarian'],
        },
    });
    const restrictedMeal = buildMeal({
        id: 'meal-restricted',
        mealName: 'Restricted meal',
        dietaryTags: ['beef'],
        recipe: {
            ingredients: [
                { name: 'Beef' },
                { name: 'Potatoes' },
            ],
            tags: ['beef'],
        },
    });
    const untaggedMeal = buildMeal({
        id: 'meal-untagged',
        mealName: 'Untagged meal',
        dietaryTags: [],
        recipe: {
            ingredients: [
                { name: 'Vegetable broth' },
                { name: 'Rice' },
            ],
        },
    });
    const allowedMeal = buildMeal({
        id: 'meal-allowed',
        mealName: 'Allowed meal',
        dietaryTags: ['vegetarian', 'mediterranean'],
        nutrition: {
            calories: 540,
            protein: 34,
            carbohydrates: 48,
            fat: 18,
        },
        recipe: {
            ingredients: [
                { name: 'Tofu' },
                { name: 'Rice' },
            ],
            tags: ['vegetarian', 'mediterranean'],
        },
    });

    const validResponses = [
        {
            data: {
                getUser: {
                    id: 'user-1',
                    dietaryRestrictions: [' vegetarian '],
                    questionnaire: {
                        dietaryPattern: ' mediterranean ',
                    },
                    dietaryProfile: {
                        diets: [' vegan '],
                        preferredCuisines: [' Italian '],
                    },
                    foodGoals: ['High protein'],
                },
            },
        },
        {
            data: {
                getAllMeals: [targetMeal, restrictedMeal, untaggedMeal, allowedMeal],
            },
        },
    ];
    const apolloClient = buildApolloClient(validResponses);

    const similarMeals = await findSimilarMeals(apolloClient, targetMeal, 'user-1', 5);

    assert.deepEqual(similarMeals.map((meal) => meal.id), ['meal-allowed']);

    const invalidResponses = [
        {
            data: {
                getUser: {
                    id: 'user-2',
                    dietaryRestrictions: ['vegetarian', 42],
                },
            },
        },
        {
            data: {
                getAllMeals: [targetMeal, allowedMeal],
            },
        },
    ];
    const invalidApolloClient = buildApolloClient(invalidResponses);

    await assert.rejects(
        () => findSimilarMeals(
            invalidApolloClient,
            targetMeal,
            'user-2',
            5,
            { returnEmptyOnError: false },
        ),
        (error) => {
            assert.ok(error instanceof HouseholdChildRestrictionsValidationError);
            assert.equal(error.code, 'invalidPayload');
            assert.equal(
                error.message,
                'We could not read your child restriction settings. Please refresh the planner.',
            );
            assert.equal(error.isUserSafe, true);
            return true;
        },
    );
});
