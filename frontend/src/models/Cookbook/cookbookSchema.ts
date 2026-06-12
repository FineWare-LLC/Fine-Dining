// @ts-nocheck
import mongoose from 'mongoose';

const { Schema } = mongoose;

const ALLOWED_MEAL_TYPES = ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK', 'DESSERT', 'SIDE'];
const ALLOWED_MEAL_TYPE_INDEX = new Map(ALLOWED_MEAL_TYPES.map((mealType, index) => [mealType, index]));
const COOKBOOK_ENTRY_ERROR_MESSAGES = {
    invalidPayload: 'We could not read this saved recipe entry. Please refresh the cookbook.',
    missingRecipeId: 'Please choose a recipe to save.',
    invalidDesiredServings: 'Please enter a valid serving amount.',
    invalidMaxTimesPerWeek: 'Please enter a valid weekly limit.',
    invalidMinTimesPerWeek: 'Please enter a valid minimum weekly limit.',
    invalidPreferenceScore: 'Please enter a valid preference score.',
    invalidAllowedMealTypes: 'We could not read this saved recipe entry. Please choose supported meal types.',
    invalidNotes: 'Please enter a valid note.',
};

const normalizeString = (value) => (typeof value === 'string' ? value.trim() : '');

const normalizeMealType = (value) => normalizeString(value).toUpperCase();

const createCookbookEntryValidationError = (code) => (
    new CookbookEntryValidationError(
        code,
        COOKBOOK_ENTRY_ERROR_MESSAGES[code] || COOKBOOK_ENTRY_ERROR_MESSAGES.invalidPayload,
    )
);

export class CookbookEntryValidationError extends Error {
    constructor(code, message = COOKBOOK_ENTRY_ERROR_MESSAGES.invalidPayload) {
        super(message);
        this.name = 'CookbookEntryValidationError';
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

const normalizeOptionalNumber = (value, defaultValue) => {
    if (value === undefined || value === null || value === '') {
        return { hasValue: false, value: defaultValue };
    }

    const numericValue = Number(value);
    if (!Number.isFinite(numericValue)) {
        return { hasValue: true, value: Number.NaN };
    }

    return { hasValue: true, value: numericValue };
};

export function validateCookbookEntryInput(input) {
    if (!input || typeof input !== 'object' || Array.isArray(input)) {
        return {
            valid: false,
            input: null,
            error: createCookbookEntryValidationError('invalidPayload'),
        };
    }

    const recipeId = normalizeString(input.recipeId);
    if (!recipeId) {
        return {
            valid: false,
            input: null,
            error: createCookbookEntryValidationError('missingRecipeId'),
        };
    }

    const desiredServings = normalizeOptionalNumber(input.desiredServings, 1);
    const resolvedDesiredServings = desiredServings.hasValue ? desiredServings.value : 1;
    if (!Number.isFinite(resolvedDesiredServings) || resolvedDesiredServings < 0.5 || resolvedDesiredServings > 50) {
        return {
            valid: false,
            input: null,
            error: createCookbookEntryValidationError('invalidDesiredServings'),
        };
    }

    const maxTimesPerWeek = normalizeOptionalNumber(input.maxTimesPerWeek, null);
    if (maxTimesPerWeek.hasValue && (!Number.isFinite(maxTimesPerWeek.value) || maxTimesPerWeek.value < 0)) {
        return {
            valid: false,
            input: null,
            error: createCookbookEntryValidationError('invalidMaxTimesPerWeek'),
        };
    }

    const minTimesPerWeek = normalizeOptionalNumber(input.minTimesPerWeek, 0);
    const resolvedMinTimesPerWeek = minTimesPerWeek.hasValue ? minTimesPerWeek.value : 0;
    if (!Number.isFinite(resolvedMinTimesPerWeek) || resolvedMinTimesPerWeek < 0) {
        return {
            valid: false,
            input: null,
            error: createCookbookEntryValidationError('invalidMinTimesPerWeek'),
        };
    }

    const preferenceScore = normalizeOptionalNumber(input.preferenceScore, 5);
    const resolvedPreferenceScore = preferenceScore.hasValue ? preferenceScore.value : 5;
    if (!Number.isFinite(resolvedPreferenceScore) || resolvedPreferenceScore < 1 || resolvedPreferenceScore > 10) {
        return {
            valid: false,
            input: null,
            error: createCookbookEntryValidationError('invalidPreferenceScore'),
        };
    }

    let allowedMealTypes = [];
    if (input.allowedMealTypes !== undefined && input.allowedMealTypes !== null && input.allowedMealTypes !== '') {
        if (!Array.isArray(input.allowedMealTypes)) {
            return {
                valid: false,
                input: null,
                error: createCookbookEntryValidationError('invalidAllowedMealTypes'),
            };
        }

        const seenMealTypes = new Set();
        const normalizedMealTypes = [];
        for (const mealType of input.allowedMealTypes) {
            const normalizedMealType = normalizeMealType(mealType);
            if (!normalizedMealType || !ALLOWED_MEAL_TYPE_INDEX.has(normalizedMealType)) {
                return {
                    valid: false,
                    input: null,
                    error: createCookbookEntryValidationError('invalidAllowedMealTypes'),
                };
            }

            if (!seenMealTypes.has(normalizedMealType)) {
                seenMealTypes.add(normalizedMealType);
                normalizedMealTypes.push(normalizedMealType);
            }
        }

        allowedMealTypes = normalizedMealTypes.sort(
            (a, b) => ALLOWED_MEAL_TYPE_INDEX.get(a) - ALLOWED_MEAL_TYPE_INDEX.get(b),
        );
    }

    const notes = input.notes === undefined || input.notes === null || input.notes === ''
        ? ''
        : typeof input.notes === 'string'
            ? input.notes.trim()
            : null;

    if (notes === null) {
        return {
            valid: false,
            input: null,
            error: createCookbookEntryValidationError('invalidNotes'),
        };
    }

    return {
        valid: true,
        input: {
            recipeId,
            desiredServings: resolvedDesiredServings,
            maxTimesPerWeek: maxTimesPerWeek.hasValue ? maxTimesPerWeek.value : null,
            minTimesPerWeek: resolvedMinTimesPerWeek,
            allowedMealTypes,
            preferenceScore: resolvedPreferenceScore,
            notes,
        },
        error: null,
    };
}

/**
 * Sub-schema: a recipe entry in a cookbook with user-specific serving preferences
 * and frequency constraints for the LP solver.
 */
const cookbookEntrySchema = new Schema(
    {
        recipe: {
            type: Schema.Types.ObjectId,
            ref: 'Recipe',
            required: true,
        },
        /** How many servings the user wants when this recipe appears in a plan */
        desiredServings: {
            type: Number,
            default: 1,
            min: [0.5, 'Minimum 0.5 servings'],
            max: [50, 'Maximum 50 servings per entry'],
        },
        /** LP constraint: max times this recipe can appear per plan period */
        maxTimesPerWeek: {
            type: Number,
            default: null, // null = no limit
            min: 0,
        },
        /** LP constraint: min times this recipe should appear per plan period */
        minTimesPerWeek: {
            type: Number,
            default: 0,
            min: 0,
        },
        /** Which meal slots this recipe is allowed in */
        allowedMealTypes: [{
            type: String,
            enum: ALLOWED_MEAL_TYPES,
        }],
        /** User's personal rating / preference score (used as LP objective weight) */
        preferenceScore: {
            type: Number,
            default: 5,
            min: 1,
            max: 10,
        },
        /** Personal notes */
        notes: {
            type: String,
            default: '',
            maxlength: [500, 'Notes cannot exceed 500 characters'],
        },
        addedAt: {
            type: Date,
            default: Date.now,
        },
    },
    { _id: true },
);

/**
 * @class Cookbook
 * @classdesc A user-curated collection of recipes that serves as the allowed
 *            meal pool for the LP solver when generating meal plans.
 *            Each entry carries user-specific serving preferences and frequency
 *            constraints that become LP variables/constraints.
 */
export const cookbookSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        name: {
            type: String,
            required: [true, 'Cookbook name is required'],
            trim: true,
            maxlength: [100, 'Cookbook name cannot exceed 100 characters'],
        },
        description: {
            type: String,
            trim: true,
            maxlength: [500, 'Description cannot exceed 500 characters'],
        },
        isPublic: {
            type: Boolean,
            default: false,
        },
        /** Primary content: recipes with per-entry LP constraints */
        entries: [cookbookEntrySchema],

        /** Legacy refs kept for backward compat — prefer entries[] for new code */
        meals: [{
            type: Schema.Types.ObjectId,
            ref: 'Meal',
        }],
        recipes: [{
            type: Schema.Types.ObjectId,
            ref: 'Recipe',
        }],
        restaurants: [{
            type: Schema.Types.ObjectId,
            ref: 'Restaurant',
        }],
    },
    {
        timestamps: true,
    },
);

// Fail-Shut: Prevent cookbook from growing unreasonably large
cookbookSchema.pre('validate', function (next) {
    if (this.entries.length > 10000 || this.meals.length > 10000 || this.recipes.length > 10000) {
        const error = new Error('FAIL-SHUT: Cookbook size limit exceeded. Operation aborted.');
        if (typeof next === 'function') {
            return next(error);
        }
        throw error;
    }
    if (typeof next === 'function') {
        return next();
    }
    return undefined;
});

export default mongoose.models.Cookbook || mongoose.model('Cookbook', cookbookSchema);
