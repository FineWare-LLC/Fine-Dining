// @ts-nocheck
import assert from 'node:assert/strict';
import test from 'node:test';
import { buildUpdatedAuthUserSnapshot } from '../../context/authUtils';

const buildTrackedLargeFixture = () => {
    const accessedKeys = [];

    const currentUserBase = {
        id: 'user-diet-ranking-1',
        name: 'Ada Lovelace',
        email: 'ADA@example.com',
        role: 'user',
        subscriptionPlan: 'PRO',
        subscriptionStatus: 'active',
        measurementSystem: ' metric ',
    };

    for (let index = 0; index < 5000; index += 1) {
        currentUserBase[`current_extra_${index}`] = `value-${index}`;
    }

    const updatedUserBase = {
        dailyCalories: 2300,
        foodGoals: Array.from({ length: 120 }, (_, index) => `  goal-${index}  `).concat('   '),
        dietaryProfile: {
            diets: Array.from({ length: 120 }, (_, index) => `  diet-${index}  `).concat('   '),
            excludedIngredients: [],
            preferredCuisines: [' Mediterranean ', '  '],
        },
    };

    for (let index = 0; index < 5000; index += 1) {
        updatedUserBase[`update_extra_${index}`] = `value-${index}`;
    }

    const trackedProxy = (base) =>
        new Proxy(base, {
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

    return {
        accessedKeys,
        currentUser: trackedProxy(currentUserBase),
        updatedUser: trackedProxy(updatedUserBase),
    };
};

test('buildUpdatedAuthUserSnapshot keeps a large diet preference ranking update canonical without enumerating unrelated properties', () => {
    const { accessedKeys, currentUser, updatedUser } = buildTrackedLargeFixture();

    const mergedSnapshot = buildUpdatedAuthUserSnapshot(currentUser, updatedUser);

    assert.deepEqual(mergedSnapshot, {
        id: 'user-diet-ranking-1',
        name: 'Ada Lovelace',
        email: 'ADA@example.com',
        role: 'USER',
        subscriptionPlan: 'PRO',
        subscriptionStatus: 'active',
        dietaryProfile: {
            diets: Array.from({ length: 120 }, (_, index) => `diet-${index}`),
            excludedIngredients: [],
            preferredCuisines: ['Mediterranean'],
        },
        measurementSystem: 'METRIC',
        dailyCalories: 2300,
        foodGoals: Array.from({ length: 120 }, (_, index) => `goal-${index}`),
    });
    assert.equal(accessedKeys.includes('ownKeys'), false);
    assert.equal(accessedKeys.some((key) => key.startsWith('current_extra_') || key.startsWith('update_extra_')), false);
    assert.deepEqual(
        new Set(accessedKeys),
        new Set([
            'id',
            'name',
            'email',
            'role',
            'subscriptionPlan',
            'subscriptionStatus',
            'measurementSystem',
            'allergies',
            'dailyCalories',
            'foodGoals',
            'questionnaire',
            'dietaryProfile',
            'loginHistory',
        ]),
    );
});
