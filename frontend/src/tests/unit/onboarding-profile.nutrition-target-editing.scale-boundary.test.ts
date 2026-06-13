// @ts-nocheck
import assert from 'node:assert/strict';
import test, { mock } from 'node:test';
import { updateUser } from '../../graphql/resolvers/mutations/userMutations';
import User from '../../models/User/index';

const canonicalNutritionTargets = {
    caloriesMin: 1800,
    caloriesMax: 2200,
    proteinMin: 80,
    proteinMax: 140,
    carbohydratesMin: 180,
    carbohydratesMax: 260,
    fatMin: 50,
    fatMax: 80,
    fiberMin: 25,
    fiberMax: 40,
    sugarMax: 60,
    sodiumMin: 1200,
    sodiumMax: 2300,
    cholesterolMax: 300,
    saturatedFatMax: 20,
    ironMin: 18,
    calciumMin: 1000,
    vitaminCMin: 90,
    vitaminDMin: 15,
    vitaminB12Min: 2.4,
    potassiumMin: 3400,
    magnesiumMin: 400,
    zincMin: 11,
    folateMin: 400,
    omega3Min: 1.6,
};

const canonicalNutritionTargetFields = Object.keys(canonicalNutritionTargets);

const buildTrackedProxy = (base, accessedKeys) =>
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

const buildLargeNutritionTargets = (overrides, extraFieldCount, extraFieldPrefix, accessedKeys) => {
    const base = {
        ...canonicalNutritionTargets,
        ...overrides,
    };

    for (let index = 0; index < extraFieldCount; index += 1) {
        base[`${extraFieldPrefix}_${index}`] = index;
    }

    return buildTrackedProxy(base, accessedKeys);
};

test('updateUser keeps a large nutrition target edit canonical without enumerating unrelated properties', async () => {
    const accessedKeys = [];
    const currentNutritionAccessedKeys = [];
    const updatedNutritionAccessedKeys = [];

    const currentNutritionTargets = buildLargeNutritionTargets(
        {
            caloriesMin: 1700,
            proteinMax: 135,
            sodiumMax: 2100,
            omega3Min: 1.2,
        },
        5000,
        'current_nutrition_extra',
        currentNutritionAccessedKeys,
    );
    const updatedNutritionTargets = buildLargeNutritionTargets(
        {
            caloriesMin: 1900,
            proteinMax: 150,
            sodiumMax: 2400,
            omega3Min: 2.0,
        },
        5000,
        'updated_nutrition_extra',
        updatedNutritionAccessedKeys,
    );

    const currentSnapshotBase = {
        id: 'user-nutrition-scale-1',
        name: 'Scale Boundary User',
        email: 'scale.boundary@example.com',
        role: 'user',
        subscriptionPlan: 'PRO',
        subscriptionStatus: 'active',
        measurementSystem: ' metric ',
        nutritionTargets: currentNutritionTargets,
    };

    for (let index = 0; index < 5000; index += 1) {
        currentSnapshotBase[`current_extra_${index}`] = `value-${index}`;
    }

    const currentUser = {
        toObject() {
            return buildTrackedProxy(currentSnapshotBase, accessedKeys);
        },
    };

    const findByIdMock = mock.method(User, 'findById', async (id) => {
        assert.equal(id, 'user-nutrition-scale-1');
        return currentUser;
    });

    let capturedUpdate = null;
    const findByIdAndUpdateMock = mock.method(User, 'findByIdAndUpdate', async (id, update, options) => {
        assert.equal(id, 'user-nutrition-scale-1');
        capturedUpdate = update;
        assert.deepEqual(options, { new: true, runValidators: true });
        return update;
    });

    try {
        const result = await updateUser(
            null,
            {
                id: 'user-nutrition-scale-1',
                input: {
                    nutritionTargets: updatedNutritionTargets,
                },
            },
            {
                user: {
                    userId: 'user-nutrition-scale-1',
                    role: 'USER',
                },
            },
        );

        assert.deepEqual(capturedUpdate, {
            name: 'Scale Boundary User',
            email: 'scale.boundary@example.com',
            role: 'USER',
            subscriptionPlan: 'PRO',
            subscriptionStatus: 'active',
            measurementSystem: 'METRIC',
            nutritionTargets: {
                ...canonicalNutritionTargets,
                caloriesMin: 1900,
                proteinMax: 150,
                sodiumMax: 2400,
                omega3Min: 2.0,
            },
        });
        assert.deepEqual(result, capturedUpdate);

        assert.equal(accessedKeys.includes('ownKeys'), false);
        assert.equal(
            accessedKeys.some((key) => key.startsWith('current_extra_') || key.startsWith('current_nutrition_extra_')),
            false,
        );
        assert.equal(
            accessedKeys.some((key) => key.startsWith('updated_nutrition_extra_')),
            false,
        );
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
                'nutritionTargets',
                'loginHistory',
            ]),
        );

        assert.equal(currentNutritionAccessedKeys.includes('ownKeys'), false);
        assert.equal(updatedNutritionAccessedKeys.includes('ownKeys'), false);
        assert.equal(
            currentNutritionAccessedKeys.some((key) => key.startsWith('current_nutrition_extra_')),
            false,
        );
        assert.equal(
            updatedNutritionAccessedKeys.some((key) => key.startsWith('updated_nutrition_extra_')),
            false,
        );
        assert.deepEqual(currentNutritionAccessedKeys, canonicalNutritionTargetFields);
        assert.deepEqual(updatedNutritionAccessedKeys, canonicalNutritionTargetFields);
    } finally {
        findByIdMock.mock.restore();
        findByIdAndUpdateMock.mock.restore();
    }
});
