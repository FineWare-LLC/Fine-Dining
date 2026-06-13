// @ts-nocheck
import assert from 'node:assert/strict';
import test from 'node:test';

import { findSimilarMeals } from '../../services/mealPlanGenerator';

const CHILD_RESTRICTION_PATTERNS = [
    'vegetarian',
    'vegan',
    'gluten_free',
    'dairy_free',
    'keto',
    'low-carb',
    'low-fat',
    'diabetes-friendly',
    'heart-healthy',
    'low-sodium',
    'mediterranean',
    'paleo',
];

const buildLargeChildRestrictions = (length = 240) => (
    Array.from({ length }, (_, index) => CHILD_RESTRICTION_PATTERNS[index % CHILD_RESTRICTION_PATTERNS.length])
);

const buildTrackedUser = () => {
    const accessedKeys = [];
    const userBase = {
        id: 'guardian-scale-1',
        name: 'Scale Boundary Guardian',
        dietaryRestrictions: buildLargeChildRestrictions(),
        questionnaire: {
            dietaryPattern: '',
        },
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

const buildTrackedMeal = (id, counts) => ({
    id,
    mealName: id,
    nutrition: {
        calories: 500,
        protein: 30,
        carbohydrates: 50,
        fat: 20,
    },
    allergens: [],
    recipe: {
        ingredients: [
            { name: 'Rice' },
            { name: 'Chicken' },
        ],
    },
    get dietaryTags() {
        counts.dietaryTagsReads += 1;
        return [
            'vegetarian',
            'vegan',
            'gluten_free',
            'dairy_free',
            'keto',
            'low-carb',
            'low-fat',
            'diabetes-friendly',
            'heart-healthy',
            'low-sodium',
            'mediterranean',
            'paleo',
        ];
    },
});

test('findSimilarMeals keeps child restrictions scale-bound by reading each meal tags collection once', async () => {
    const { accessedKeys, proxiedUser } = buildTrackedUser();
    const targetMealCounts = { dietaryTagsReads: 0 };
    const allowedMealCounts = { dietaryTagsReads: 0 };
    const targetMeal = buildTrackedMeal('target-meal', targetMealCounts);
    const allowedMeal = buildTrackedMeal('allowed-meal', allowedMealCounts);

    const responses = [
        { data: { getUser: proxiedUser } },
        {
            data: {
                getAllMeals: [targetMeal, allowedMeal],
            },
        },
    ];
    const apolloClient = {
        query: async () => responses.shift(),
    };

    const similarMeals = await findSimilarMeals(apolloClient, targetMeal, proxiedUser.id, 5);

    assert.deepEqual(similarMeals.map((meal) => meal.id), ['allowed-meal']);
    assert.equal(targetMealCounts.dietaryTagsReads, 1);
    assert.equal(allowedMealCounts.dietaryTagsReads, 1);
    assert.equal(accessedKeys.includes('ownKeys'), false);
    assert.equal(accessedKeys.some((key) => key.startsWith('extra_')), false);
    assert.equal(accessedKeys.includes('dietaryRestrictions'), true);
});
