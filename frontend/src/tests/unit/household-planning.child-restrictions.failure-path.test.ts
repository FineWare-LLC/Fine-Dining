// @ts-nocheck
import assert from 'node:assert/strict';
import test from 'node:test';

import { findSimilarMeals } from '../../services/mealPlanGenerator';
import { HouseholdChildRestrictionsValidationError } from '../../utils/householdChildRestrictions';

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

test('findSimilarMeals surfaces malformed child restrictions instead of returning a silent empty list', async () => {
    const targetMeal = buildMeal();
    const apolloClient = buildApolloClient([
        {
            data: {
                getUser: {
                    id: 'user-1',
                    dietaryRestrictions: ['vegetarian', 42],
                },
            },
        },
        {
            data: {
                getAllMeals: [targetMeal],
            },
        },
    ]);

    await assert.rejects(
        () => findSimilarMeals(apolloClient, targetMeal, 'user-1', 5),
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
