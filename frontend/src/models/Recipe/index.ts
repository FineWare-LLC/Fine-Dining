// @ts-nocheck
/**
 * @file index.js
 * @description Imports and re-exports the recipe schema and model.
 *              This is the main entry point for the "Recipe" folder.
 */

import RecipeModel from './recipe.model';
import recipeSchema from './recipe.schema';

const RECIPE_TAG_ERROR_MESSAGE = 'We could not read this recipe tag payload. Please refresh the recipe editor.';

const normalizeRecipeTagText = (value) => {
    if (typeof value !== 'string') {
        return '';
    }

    return value.trim().replace(/\s+/g, ' ');
};

export class RecipeTagValidationError extends Error {
    constructor(message = RECIPE_TAG_ERROR_MESSAGE) {
        super(message);
        this.name = 'RecipeTagValidationError';
        this.code = 'invalidPayload';
        this.isUserSafe = true;
    }

    toJSON() {
        return {
            name: this.name,
            code: this.code,
            message: this.message,
            isUserSafe: this.isUserSafe,
        };
    }
}

const createRecipeTagValidationError = () => new RecipeTagValidationError();

export function validateRecipeTagsInput(input) {
    if (input === undefined || input === null) {
        return {
            valid: true,
            input: [],
            error: null,
        };
    }

    if (!Array.isArray(input)) {
        return {
            valid: false,
            input: null,
            error: createRecipeTagValidationError(),
        };
    }

    const seenTags = new Set();
    const normalizedTags = [];

    for (const tag of input) {
        const normalizedTag = normalizeRecipeTagText(tag);
        if (!normalizedTag) {
            return {
                valid: false,
                input: null,
                error: createRecipeTagValidationError(),
            };
        }

        const dedupeKey = normalizedTag.toLowerCase();
        if (!seenTags.has(dedupeKey)) {
            seenTags.add(dedupeKey);
            normalizedTags.push(normalizedTag);
        }
    }

    return {
        valid: true,
        input: normalizedTags,
        error: null,
    };
}

/**
 * @module Recipe
 * @description
 * A convenient barrel file that groups recipe-related exports in one place.
 *
 * @property {Schema} recipeSchema - Mongoose Schema for the Recipe model.
 * @property {Model} RecipeModel - Mongoose Model for the Recipe collection.
 */
export {
    recipeSchema,
    RecipeModel,
    RecipeTagValidationError,
    validateRecipeTagsInput,
};

export default RecipeModel;
