// @ts-nocheck
import assert from 'node:assert/strict';
import test from 'node:test';
import { resolveProfileCompletenessStep } from '../../context/authUtils';

const buildLargeTextArray = (prefix, length) =>
    Array.from({ length }, (_, index) => (index === 0 ? `  ${prefix}-${index}  ` : '   '));

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

test('resolveProfileCompletenessStep evaluates a large household profile without enumerating extra nutrition target fields', () => {
    const topLevelAccessedKeys = [];
    const dietaryAccessedKeys = [];
    const nutritionAccessedKeys = [];

    const dietaryProfileBase = {
        diets: buildLargeTextArray('diet', 250),
        allergens: buildLargeTextArray('allergen', 250),
        excludedIngredients: buildLargeTextArray('exclude', 250),
        preferredCuisines: buildLargeTextArray('cuisine', 250),
    };

    for (let index = 0; index < 5000; index += 1) {
        dietaryProfileBase[`dietary_extra_${index}`] = `value-${index}`;
    }

    const nutritionTargetsBase = {
        caloriesMin: 1800,
    };

    for (let index = 0; index < 5000; index += 1) {
        nutritionTargetsBase[`nutrition_extra_${index}`] = index;
    }

    const trackedDietaryProfile = buildTrackedProxy(dietaryProfileBase, dietaryAccessedKeys);
    const trackedNutritionTargets = buildTrackedProxy(nutritionTargetsBase, nutritionAccessedKeys);
    const trackedHouseholdSetup = buildTrackedProxy(
        {
            dietaryProfile: trackedDietaryProfile,
            nutritionTargets: trackedNutritionTargets,
        },
        topLevelAccessedKeys,
    );

    const step = resolveProfileCompletenessStep(trackedHouseholdSetup);

    assert.equal(step, 4);
    assert.equal(topLevelAccessedKeys.includes('ownKeys'), false);
    assert.equal(dietaryAccessedKeys.includes('ownKeys'), false);
    assert.equal(nutritionAccessedKeys.includes('ownKeys'), false);
    assert.equal(topLevelAccessedKeys.some((key) => key.startsWith('dietary_extra_') || key.startsWith('nutrition_extra_')), false);
    assert.equal(dietaryAccessedKeys.some((key) => key.startsWith('dietary_extra_')), false);
    assert.equal(nutritionAccessedKeys.some((key) => key.startsWith('nutrition_extra_')), false);
    assert.deepEqual(new Set(topLevelAccessedKeys), new Set(['dietaryProfile', 'nutritionTargets']));
    assert.deepEqual(new Set(dietaryAccessedKeys), new Set(['diets', 'allergens', 'preferredCuisines']));
    assert.deepEqual(nutritionAccessedKeys, ['caloriesMin']);
});
