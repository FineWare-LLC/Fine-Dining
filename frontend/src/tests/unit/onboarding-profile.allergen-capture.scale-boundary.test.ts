// @ts-nocheck
import assert from 'node:assert/strict';
import test from 'node:test';
import { collectCanonicalAllergies, mealHasAllergenConflict } from '../../utils/allergyPreferences';

const buildLargeAllergyProfile = () => {
    const profile = {
        allergies: Array.from({ length: 180 }, (_, index) => `  allergy-${index}  `).concat('  nuts  '),
        questionnaire: {
            allergies: Array.from({ length: 180 }, (_, index) => `questionnaire-${index}`).concat('   '),
        },
        dietaryProfile: {
            allergens: Array.from({ length: 180 }, (_, index) => `dietary-${index}`).concat('  dairy  ', ' dairy '),
        },
    };

    for (let index = 0; index < 5000; index += 1) {
        profile[`extra_${index}`] = `value-${index}`;
    }

    const accessedKeys = [];
    const proxiedProfile = new Proxy(profile, {
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

    return { accessedKeys, proxiedProfile };
};

test('collectCanonicalAllergies deduplicates a large allergy profile and keeps dietaryProfile allergens in play', () => {
    const { accessedKeys, proxiedProfile } = buildLargeAllergyProfile();

    const allergies = collectCanonicalAllergies(proxiedProfile);

    assert.equal(allergies.size, 542);
    assert.equal(allergies.has('nuts'), true);
    assert.equal(allergies.has('dairy'), true);
    assert.equal(mealHasAllergenConflict(['tree nuts', 'olive oil'], allergies), true);
    assert.equal(mealHasAllergenConflict(['citrus', 'olive oil'], allergies), false);
    assert.equal(accessedKeys.includes('ownKeys'), false);
    assert.equal(accessedKeys.some((key) => key.startsWith('extra_')), false);
    assert.deepEqual(new Set(accessedKeys), new Set(['allergies', 'questionnaire', 'dietaryProfile']));
});
