// @ts-nocheck

const RECIPE_SEARCH_ERROR_MESSAGE = 'We could not read this recipe search. Please refresh the recipes page.';

export class RecipeSearchValidationError extends Error {
    constructor(code, message = RECIPE_SEARCH_ERROR_MESSAGE) {
        super(message);
        this.name = 'RecipeSearchValidationError';
        this.code = code;
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

const createRecipeSearchValidationError = () => (
    new RecipeSearchValidationError('invalidPayload')
);

export function validateRecipeSearchInput(keyword) {
    if (typeof keyword !== 'string') {
        return {
            valid: false,
            input: null,
            error: createRecipeSearchValidationError(),
        };
    }

    const normalizedKeyword = keyword.trim();
    if (!normalizedKeyword) {
        return {
            valid: true,
            input: {
                keyword: '',
                filter: {},
            },
            error: null,
        };
    }

    const searchRegex = new RegExp(normalizedKeyword, 'i');
    const orClauses = [
        { recipeName: searchRegex },
        { cuisine: searchRegex },
        { tags: searchRegex },
        { dietaryTags: searchRegex },
        { 'ingredients.name': searchRegex },
        { 'ingredients.canonicalName': searchRegex },
    ];

    const numericKeyword = Number(normalizedKeyword);
    if (Number.isFinite(numericKeyword)) {
        orClauses.push(
            { prepTime: { $lte: numericKeyword } },
            { totalTime: { $lte: numericKeyword } },
        );
    }

    return {
        valid: true,
        input: {
            keyword: normalizedKeyword,
            filter: {
                $or: orClauses,
            },
        },
        error: null,
    };
}
