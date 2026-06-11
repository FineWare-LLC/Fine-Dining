// @ts-nocheck
import assert from 'node:assert/strict';
import test from 'node:test';
import { findSimilarMeals } from '../../services/mealPlanGenerator';

const buildLargeDislikedIngredients = (length = 240) =>
    Array.from({ length }, (_, index) => `  dislike-${index}  `).concat('  cilantro  ');

const buildTrackedUser = () => {
    const accessedKeys = [];
    const userBase = {
        id: 'user-dislike-scale-1',
        name: 'Scale Boundary Diner',
        allergies: [],
        questionnaire: {
            allergies: [],
            disallowedIngredients: ['   '],
        },
        dislikedIngredients: buildLargeDislikedIngredients(),
    };

    for (let index = 0; index < 5000; index += 1) {
        userBase[`extra_${index}`] = `value-${index}`;
    }

    const proxiedUser = new Proxy(userBase, {
        get(target, prop, receiver) {
            if (typeof prop === 'string') {
                accessedKeys.push(prop);
            }

            return Reflect.get(target, prop, receiver);
        },
        ownKeys(target) {
            accessedKeys.push('ownKeys');
            return Reflect.ownKeys(target);
        },
    });

    return { accessedKeys, proxiedUser };
};

const buildMeal = (id, ingredients, caloriesOffset = 0) => ({
    id,
    mealName: id,
    nutrition: {
        calories: 500 + caloriesOffset,
        protein: 30,
        carbohydrates: 50,
        fat: 20,
    },
    allergens: [],
    recipe: {
        ingredients,
    },
});

test('findSimilarMeals keeps a large food-dislike profile canonical without enumerating unrelated user fields', async () => {
    const { accessedKeys, proxiedUser } = buildTrackedUser();
    const targetMeal = buildMeal('target-meal', ['Chicken', 'Rice']);
    const disallowedMeal = buildMeal('disallowed-meal', buildLargeDislikedIngredients(120));
    const allowedMeal = buildMeal('allowed-meal', ['Chicken', 'Rice'], 140);

    const responses = [
        { data: { getUser: proxiedUser } },
        {
            data: {
                getAllMeals: [targetMeal, disallowedMeal, allowedMeal],
            },
        },
    ];
    const apolloClient = {
        query: async () => responses.shift(),
    };

    const similarMeals = await findSimilarMeals(apolloClient, targetMeal, proxiedUser.id, 5);

    assert.deepEqual(similarMeals.map((meal) => meal.id), ['allowed-meal']);
    assert.equal(accessedKeys.includes('ownKeys'), false);
    assert.equal(accessedKeys.some((key) => key.startsWith('extra_')), false);
    assert.equal(accessedKeys.includes('dislikedIngredients'), true);
});
