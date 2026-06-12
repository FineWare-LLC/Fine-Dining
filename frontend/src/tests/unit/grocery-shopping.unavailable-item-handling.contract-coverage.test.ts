// @ts-nocheck
import assert from 'node:assert/strict';
import test from 'node:test';

import { MenuItemModel } from '../../models/MenuItem/index';
import { RecipeModel } from '../../models/Recipe/index';
import {
    SubstitutionSuggestionsValidationError,
    resolveSubstitutionSuggestions,
} from '../../utils/substitutionSuggestions';

test('resolveSubstitutionSuggestions normalizes hydrated recipe and menu item candidates into plain unavailable-item alternatives', () => {
    const result = resolveSubstitutionSuggestions({
        missingIngredient: 'Milk',
        user: {
            allergies: [],
            questionnaire: {
                disallowedIngredients: [],
                dietaryPattern: '',
            },
        },
        candidates: [
            MenuItemModel.hydrate({
                mealName: 'Cafe wrap',
                price: 8.5,
                allergens: [],
                dietaryTags: ['vegetarian'],
                sourceType: 'restaurant-menu',
                sourceKey: 'menu-cafe-wrap',
            }),
            RecipeModel.hydrate({
                recipeName: 'Silken tofu',
                ingredients: [
                    { name: 'Soybeans' },
                    { name: 'Water' },
                ],
                allergens: [],
                dietaryTags: ['vegan'],
            }),
        ],
    });

    assert.equal(result.status, 'resolved');
    assert.equal(result.error, null);
    assert.equal(result.items.length, 2);
    assert.deepEqual(
        result.items.map(({ name, normalizedName, sourceType }) => ({
            name,
            normalizedName,
            sourceType,
        })),
        [
            {
                name: 'Cafe wrap',
                normalizedName: 'cafe wrap',
                sourceType: 'menuItem',
            },
            {
                name: 'Silken tofu',
                normalizedName: 'silken tofu',
                sourceType: 'recipe',
            },
        ],
    );

    const recipeItem = result.items.find((item) => item.sourceType === 'recipe');
    assert.ok(recipeItem);
    assert.ok(
        !Object.keys(recipeItem.nutrition).some((key) => key.startsWith('$') || key.startsWith('_')),
        'Hydrated recipe nutrition should be normalized to a plain object',
    );
    assert.equal(recipeItem.nutrition.calories, 0);
    assert.equal(recipeItem.nutrition.protein, 0);
    assert.equal(recipeItem.nutrition.carbohydrates, 0);
});

test('resolveSubstitutionSuggestions rejects malformed unavailable-item payloads with a typed user-safe error', () => {
    const result = resolveSubstitutionSuggestions({
        missingIngredient: 'Milk',
        user: {
            allergies: [],
            questionnaire: {
                disallowedIngredients: [],
                dietaryPattern: '',
            },
        },
        candidates: [
            {
                mealName: 'Broken tofu',
                allergens: [],
                dietaryTags: ['vegan'],
                recipe: {
                    ingredients: 'bad',
                },
            },
        ],
    });

    assert.equal(result.status, 'invalid');
    assert.equal(result.items, null);
    assert.ok(result.error instanceof SubstitutionSuggestionsValidationError);
    assert.equal(result.error.code, 'invalidPayload');
    assert.equal(
        result.error.message,
        'We could not read your substitution suggestions. Please refresh the planner.',
    );
    assert.equal(result.error.isUserSafe, true);
});
