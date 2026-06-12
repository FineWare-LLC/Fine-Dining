// @ts-nocheck
import assert from 'node:assert/strict';
import test, { mock } from 'node:test';

import { createRecipe, updateRecipe } from '../../graphql/resolvers/mutations/recipeMutations';
import { RecipeModel } from '../../models/Recipe';

const buildRecipeInput = (overrides = {}) => ({
    recipeName: 'Tag Management Test',
    ingredients: ['1 cup rice'],
    instructions: 'Cook the rice.',
    prepTime: 15,
    difficulty: 'EASY',
    ...overrides,
});

const restoreMock = (tracker) => {
    tracker?.mock?.restore?.();
};

test('createRecipe rolls back the created recipe when author population fails', async () => {
    let deletedRecipeId = null;

    const createMock = mock.method(RecipeModel, 'create', async (payload) => ({
        _id: 'recipe-123',
        ...payload,
        populate: async () => {
            throw new Error('author lookup unavailable');
        },
    }));
    const deleteMock = mock.method(RecipeModel, 'findByIdAndDelete', async (recipeId) => {
        deletedRecipeId = recipeId;
        return null;
    });

    try {
        await assert.rejects(
            () => createRecipe(
                null,
                buildRecipeInput({
                    tags: ['Quick Meals', 'Family Friendly'],
                }),
                { user: { userId: 'user-42' } },
            ),
            /Internal server error\./,
        );

        assert.equal(deleteMock.mock.callCount(), 1);
        assert.equal(deletedRecipeId, 'recipe-123');
    } finally {
        restoreMock(createMock);
        restoreMock(deleteMock);
    }
});

test('updateRecipe restores the original tags when author population fails after save', async () => {
    const recipe = {
        _id: 'recipe-1',
        author: 'user-42',
        recipeName: 'Original Recipe',
        ingredients: ['1 cup rice'],
        instructions: 'Cook the rice.',
        prepTime: 15,
        difficulty: 'EASY',
        tags: ['Family Friendly'],
        saveCount: 0,
        save: async function saveProxy() {
            this.saveCount += 1;
            return this;
        },
        populate: async function populateProxy(paths) {
            assert.equal(paths, 'author');
            throw new Error('author lookup unavailable');
        },
        toObject: function toObjectProxy() {
            return {
                _id: this._id,
                author: this.author,
                recipeName: this.recipeName,
                ingredients: [...this.ingredients],
                instructions: this.instructions,
                prepTime: this.prepTime,
                difficulty: this.difficulty,
                tags: [...this.tags],
            };
        },
        set: function setProxy(snapshot) {
            Object.assign(this, snapshot);
        },
    };

    const findByIdMock = mock.method(RecipeModel, 'findById', async () => recipe);

    try {
        await assert.rejects(
            () => updateRecipe(
                null,
                {
                    id: 'recipe-1',
                    tags: ['  Quick Meals  ', 'Comfort Food'],
                },
                { user: { userId: 'user-42', role: 'USER' } },
            ),
            /Internal server error\./,
        );

        assert.deepEqual(recipe.tags, ['Family Friendly']);
        assert.equal(recipe.saveCount, 2);
    } finally {
        restoreMock(findByIdMock);
    }
});
