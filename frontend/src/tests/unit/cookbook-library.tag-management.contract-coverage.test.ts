// @ts-nocheck
import assert from 'node:assert/strict';
import test, { mock } from 'node:test';

import { createRecipe, updateRecipe } from '../../graphql/resolvers/mutations/recipeMutations';
import {
    RecipeModel,
    RecipeTagValidationError,
    validateRecipeTagsInput,
} from '../../models/Recipe';

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

test('validateRecipeTagsInput canonicalizes valid recipe tags and rejects malformed payloads', () => {
    const valid = validateRecipeTagsInput([
        '  Quick Meals  ',
        'Family Friendly',
        'quick meals',
        'Family Friendly',
    ]);

    assert.equal(valid.valid, true);
    assert.deepEqual(valid.input, ['Quick Meals', 'Family Friendly']);
    assert.equal(valid.error, null);

    const invalid = validateRecipeTagsInput(['Dinner', '   ', 42]);

    assert.equal(invalid.valid, false);
    assert.equal(invalid.input, null);
    assert.ok(invalid.error instanceof RecipeTagValidationError);
    assert.equal(invalid.error.code, 'invalidPayload');
    assert.equal(
        invalid.error.message,
        'We could not read this recipe tag payload. Please refresh the recipe editor.',
    );
    assert.equal(invalid.error.isUserSafe, true);
});

test('createRecipe normalizes tags before persistence and fails shut on malformed tags', async () => {
    let capturedCreateArgs = null;
    const createMock = mock.method(RecipeModel, 'create', async (payload) => {
        capturedCreateArgs = payload;
        return {
            populate: async (paths) => {
                assert.equal(paths, 'author');
                return {
                    ...payload,
                    author: { id: 'user-42', name: 'Chef' },
                };
            },
        };
    });

    try {
        const createdRecipe = await createRecipe(
            null,
            {
                ...buildRecipeInput({
                    tags: ['  Quick Meals  ', 'Family Friendly', 'quick meals'],
                }),
            },
            { user: { userId: 'user-42' } },
        );

        assert.deepEqual(capturedCreateArgs.tags, ['Quick Meals', 'Family Friendly']);
        assert.deepEqual(createdRecipe.tags, ['Quick Meals', 'Family Friendly']);
        assert.equal(capturedCreateArgs.author, 'user-42');
    } finally {
        restoreMock(createMock);
    }

    let called = false;
    const invalidCreateMock = mock.method(RecipeModel, 'create', async () => {
        called = true;
        return {
            populate: async () => null,
        };
    });

    try {
        await assert.rejects(
            () => createRecipe(
                null,
                buildRecipeInput({
                    tags: ['Dinner', '   ', 42],
                }),
                { user: { userId: 'user-42' } },
            ),
            (error) => {
                assert.ok(error instanceof RecipeTagValidationError);
                assert.equal(error.code, 'invalidPayload');
                assert.equal(
                    error.message,
                    'We could not read this recipe tag payload. Please refresh the recipe editor.',
                );
                assert.equal(error.isUserSafe, true);
                return true;
            },
        );

        assert.equal(called, false);
    } finally {
        restoreMock(invalidCreateMock);
    }
});

test('updateRecipe preserves omitted tags and normalizes explicit tag edits before save', async () => {
    const findByIdMock = mock.method(RecipeModel, 'findById', async () => ({
        author: 'user-42',
        recipeName: 'Original Recipe',
        ingredients: ['1 cup rice'],
        instructions: 'Cook the rice.',
        prepTime: 15,
        tags: ['Family Friendly'],
        save: async function saveProxy() {
            return this;
        },
        populate: async function populateProxy(paths) {
            assert.equal(paths, 'author');
            return this;
        },
    }));

    try {
        const unchangedRecipe = await updateRecipe(
            null,
            {
                id: 'recipe-1',
                recipeName: 'Updated Recipe',
                prepTime: 20,
            },
            { user: { userId: 'user-42', role: 'USER' } },
        );

        assert.deepEqual(unchangedRecipe.tags, ['Family Friendly']);
    } finally {
        restoreMock(findByIdMock);
    }

    const normalizedFindByIdMock = mock.method(RecipeModel, 'findById', async () => ({
        author: 'user-42',
        recipeName: 'Original Recipe',
        ingredients: ['1 cup rice'],
        instructions: 'Cook the rice.',
        prepTime: 15,
        tags: ['Family Friendly'],
        save: async function saveProxy() {
            return this;
        },
        populate: async function populateProxy(paths) {
            assert.equal(paths, 'author');
            return this;
        },
    }));

    try {
        const updatedRecipe = await updateRecipe(
            null,
            {
                id: 'recipe-1',
                tags: ['  Quick Meals  ', 'quick meals', 'Comfort Food'],
            },
            { user: { userId: 'user-42', role: 'USER' } },
        );

        assert.deepEqual(updatedRecipe.tags, ['Quick Meals', 'Comfort Food']);
    } finally {
        restoreMock(normalizedFindByIdMock);
    }
});
