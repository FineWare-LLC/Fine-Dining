// @ts-nocheck
import { withErrorHandling } from './baseImports';
import Cookbook, {
    COOKBOOK_ENTRY_LIMIT,
    validateCookbookEntryInput,
    validateCookbookImportEntryInput,
} from '@/models/Cookbook/cookbookSchema';
import User from '@/models/User';
import { assertResourceLimit } from '@/services/usageLimits';

const resolvePatchValue = (nextValue, currentValue) => (
    nextValue !== undefined ? nextValue : currentValue
);

const resolveRecipeId = (recipe) => recipe?._id?.toString?.() || recipe?.id || recipe?.toString?.() || '';
const snapshotCookbookEntryState = (entry) => {
    if (entry && typeof entry.toObject === 'function') {
        return entry.toObject({ depopulate: true, versionKey: false });
    }

    return entry ? { ...entry } : null;
};

const restoreCookbookEntryState = (entry, snapshot) => {
    if (!entry || !snapshot) {
        return;
    }

    if (typeof entry.set === 'function') {
        entry.set(snapshot);
        return;
    }

    Object.assign(entry, snapshot);
};

const COOKBOOK_IMPORT_PERSISTENCE_ERROR_MESSAGE = 'We could not save this recipe to your cookbook. Please try again.';
const COOKBOOK_CREATION_PERSISTENCE_ERROR_MESSAGE = 'We could not save your cookbook. Please try again.';
const COOKBOOK_ENTRY_PERSISTENCE_ERROR_MESSAGE = 'We could not save this recipe revision. Please try again.';
const COOKBOOK_IMPORT_SIZE_LIMIT_ERROR_MESSAGE = (
    `This cookbook already has the maximum of ${COOKBOOK_ENTRY_LIMIT.toLocaleString('en-US')} recipes. Remove one before importing another.`
);
const COOKBOOK_VISIBILITY_ERROR_MESSAGE = 'Please choose a valid cookbook sharing setting.';

export class CookbookVisibilityValidationError extends Error {
    constructor(code, message = COOKBOOK_VISIBILITY_ERROR_MESSAGE) {
        super(message);
        this.name = 'CookbookVisibilityValidationError';
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

const createCookbookVisibilityValidationError = (code) => (
    new CookbookVisibilityValidationError(code)
);

const validateCreateCookbookInput = (input) => {
    if (!input || typeof input !== 'object' || Array.isArray(input)) {
        return {
            valid: false,
            input: null,
            error: createCookbookVisibilityValidationError('invalidPayload'),
        };
    }

    if (input.isPublic !== undefined && typeof input.isPublic !== 'boolean') {
        return {
            valid: false,
            input: null,
            error: createCookbookVisibilityValidationError('invalidIsPublic'),
        };
    }

    return {
        valid: true,
        input: {
            ...input,
            isPublic: input.isPublic === undefined ? false : input.isPublic,
        },
        error: null,
    };
};

const restoreCookbookEntries = (cookbook, originalEntries) => {
    if (!cookbook || !Array.isArray(originalEntries)) {
        return;
    }

    if (Array.isArray(cookbook.entries) && typeof cookbook.entries.splice === 'function') {
        cookbook.entries.splice(0, cookbook.entries.length, ...originalEntries);
        return;
    }

    cookbook.entries = [...originalEntries];
};

export class CookbookImportPersistenceError extends Error {
    constructor(reason, cause = null) {
        super(COOKBOOK_IMPORT_PERSISTENCE_ERROR_MESSAGE);
        this.name = 'CookbookImportPersistenceError';
        this.code = 'cookbookImportPersistenceFailed';
        this.reason = reason;
        this.isUserSafe = true;

        if (cause) {
            this.cause = cause;
        }
    }

    toJSON() {
        const serialized = {
            name: this.name,
            code: this.code,
            message: this.message,
            reason: this.reason,
            isUserSafe: this.isUserSafe,
        };

        if (Object.prototype.hasOwnProperty.call(this, 'cause')) {
            serialized.cause = this.cause;
        }

        return serialized;
    }
}

export class CookbookCreationPersistenceError extends Error {
    constructor(reason, cause = null) {
        super(COOKBOOK_CREATION_PERSISTENCE_ERROR_MESSAGE);
        this.name = 'CookbookCreationPersistenceError';
        this.code = 'cookbookCreationPersistenceFailed';
        this.reason = reason;
        this.isUserSafe = true;

        if (cause) {
            this.cause = cause;
        }
    }

    toJSON() {
        const serialized = {
            name: this.name,
            code: this.code,
            message: this.message,
            reason: this.reason,
            isUserSafe: this.isUserSafe,
        };

        if (Object.prototype.hasOwnProperty.call(this, 'cause')) {
            serialized.cause = this.cause;
        }

        return serialized;
    }
}

export class CookbookEntryPersistenceError extends Error {
    constructor(reason, cause = null) {
        super(COOKBOOK_ENTRY_PERSISTENCE_ERROR_MESSAGE);
        this.name = 'CookbookEntryPersistenceError';
        this.code = 'cookbookEntryPersistenceFailed';
        this.reason = reason;
        this.isUserSafe = true;

        if (cause) {
            this.cause = cause;
        }
    }

    toJSON() {
        const serialized = {
            name: this.name,
            code: this.code,
            message: this.message,
            reason: this.reason,
            isUserSafe: this.isUserSafe,
        };

        if (Object.prototype.hasOwnProperty.call(this, 'cause')) {
            serialized.cause = this.cause;
        }

        return serialized;
    }
}

export class CookbookImportSizeLimitError extends Error {
    constructor(limit = COOKBOOK_ENTRY_LIMIT) {
        super(COOKBOOK_IMPORT_SIZE_LIMIT_ERROR_MESSAGE);
        this.name = 'CookbookImportSizeLimitError';
        this.code = 'cookbookImportSizeLimitExceeded';
        this.reason = 'sizeLimit';
        this.limit = limit;
        this.isUserSafe = true;
    }

    toJSON() {
        return {
            name: this.name,
            code: this.code,
            message: this.message,
            reason: this.reason,
            limit: this.limit,
            isUserSafe: this.isUserSafe,
        };
    }
}

export const createCookbook = withErrorHandling(async (_, { userId, input }, context) => {
    if (!context.user?.userId || context.user.userId !== userId) {
        throw new Error('Authentication required');
    }
    const validatedInput = validateCreateCookbookInput(input);
    if (!validatedInput.valid) {
        throw validatedInput.error;
    }
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');
    await assertResourceLimit({
        user,
        model: Cookbook,
        filter: { user: userId },
        limitName: 'cookbooks',
        action: 'create cookbook',
    });
    const cookbook = new Cookbook({
        user: userId,
        ...validatedInput.input,
    });
    try {
        await cookbook.save();
    } catch (error) {
        if (error?.isUserSafe) {
            throw error;
        }

        throw new CookbookCreationPersistenceError('save', error);
    }

    try {
        await User.findByIdAndUpdate(userId, { $push: { cookbooks: cookbook._id } });
    } catch (error) {
        await Cookbook.findByIdAndDelete(cookbook._id).catch((rollbackError) => {
            console.error('Cookbook rollback failed:', rollbackError);
        });
        throw error;
    }

    return await cookbook.populate('entries.recipe meals recipes restaurants');
});

export const updateCookbook = withErrorHandling(async (_, { id, input }, context) => {
    if (!context.user?.userId) throw new Error('Authentication required');
    const cookbook = await Cookbook.findById(id);
    if (!cookbook || cookbook.user.toString() !== context.user.userId) {
        throw new Error('Cookbook not found or unauthorized');
    }
    Object.assign(cookbook, input);
    await cookbook.save();
    return cookbook.populate('entries.recipe meals recipes restaurants');
});

export const addRecipeToCookbook = withErrorHandling(async (_, { cookbookId, entry }, context) => {
    if (!context.user?.userId) throw new Error('Authentication required');
    const cookbook = await Cookbook.findById(cookbookId);
    if (!cookbook || cookbook.user.toString() !== context.user.userId) {
        throw new Error('Cookbook not found or unauthorized');
    }

    const validatedEntry = validateCookbookImportEntryInput(entry);
    if (!validatedEntry.valid) throw validatedEntry.error;

    const alreadyExists = cookbook.entries.some(
        (e) => e.recipe.toString() === validatedEntry.input.recipeId,
    );
    if (alreadyExists) throw new Error('Recipe already in cookbook');

    const cookbookEntryCount = Array.isArray(cookbook.entries) ? cookbook.entries.length : 0;
    if (cookbookEntryCount >= COOKBOOK_ENTRY_LIMIT) {
        throw new CookbookImportSizeLimitError();
    }

    const originalEntries = cookbook.entries.slice();
    cookbook.entries.push({
        recipe: validatedEntry.input.recipeId,
        desiredServings: validatedEntry.input.desiredServings,
        maxTimesPerWeek: validatedEntry.input.maxTimesPerWeek,
        minTimesPerWeek: validatedEntry.input.minTimesPerWeek,
        allowedMealTypes: validatedEntry.input.allowedMealTypes,
        preferenceScore: validatedEntry.input.preferenceScore,
        notes: validatedEntry.input.notes,
    });
    try {
        await cookbook.save();
    } catch (error) {
        restoreCookbookEntries(cookbook, originalEntries);

        if (error?.isUserSafe) {
            throw error;
        }

        throw new CookbookImportPersistenceError('save', error);
    }

    try {
        return await cookbook.populate('entries.recipe meals recipes restaurants');
    } catch (error) {
        restoreCookbookEntries(cookbook, originalEntries);

        try {
            await cookbook.save();
        } catch (rollbackError) {
            console.error('Cookbook import rollback failed:', rollbackError);
        }

        if (error?.isUserSafe) {
            throw error;
        }

        throw new CookbookImportPersistenceError('populate', error);
    }
});

export const removeRecipeFromCookbook = withErrorHandling(async (_, { cookbookId, entryId }, context) => {
    if (!context.user?.userId) throw new Error('Authentication required');
    const cookbook = await Cookbook.findById(cookbookId);
    if (!cookbook || cookbook.user.toString() !== context.user.userId) {
        throw new Error('Cookbook not found or unauthorized');
    }

    cookbook.entries = cookbook.entries.filter((e) => e._id.toString() !== entryId);
    await cookbook.save();
    return cookbook.populate('entries.recipe meals recipes restaurants');
});

export const updateCookbookEntry = withErrorHandling(async (_, { cookbookId, entryId, entry }, context) => {
    if (!context.user?.userId) throw new Error('Authentication required');
    const cookbook = await Cookbook.findById(cookbookId);
    if (!cookbook || cookbook.user.toString() !== context.user.userId) {
        throw new Error('Cookbook not found or unauthorized');
    }

    const existing = cookbook.entries.id(entryId);
    if (!existing) throw new Error('Entry not found');
    const originalEntryState = snapshotCookbookEntryState(existing);

    const validatedEntry = validateCookbookEntryInput({
        recipeId: resolveRecipeId(existing.recipe),
        desiredServings: resolvePatchValue(entry.desiredServings, existing.desiredServings),
        maxTimesPerWeek: resolvePatchValue(entry.maxTimesPerWeek, existing.maxTimesPerWeek),
        minTimesPerWeek: resolvePatchValue(entry.minTimesPerWeek, existing.minTimesPerWeek),
        allowedMealTypes: resolvePatchValue(entry.allowedMealTypes, existing.allowedMealTypes),
        preferenceScore: resolvePatchValue(entry.preferenceScore, existing.preferenceScore),
        notes: resolvePatchValue(entry.notes, existing.notes),
    });
    if (!validatedEntry.valid) throw validatedEntry.error;

    existing.desiredServings = validatedEntry.input.desiredServings;
    existing.maxTimesPerWeek = validatedEntry.input.maxTimesPerWeek;
    existing.minTimesPerWeek = validatedEntry.input.minTimesPerWeek;
    existing.allowedMealTypes = validatedEntry.input.allowedMealTypes;
    existing.preferenceScore = validatedEntry.input.preferenceScore;
    existing.notes = validatedEntry.input.notes;

    try {
        await cookbook.save();
    } catch (error) {
        restoreCookbookEntryState(existing, originalEntryState);

        if (error?.isUserSafe) {
            throw error;
        }

        throw new CookbookEntryPersistenceError('save', error);
    }

    try {
        return await cookbook.populate('entries.recipe meals recipes restaurants');
    } catch (error) {
        restoreCookbookEntryState(existing, originalEntryState);

        try {
            await cookbook.save();
        } catch (rollbackError) {
            console.error('Cookbook entry rollback failed:', rollbackError);
        }

        if (error?.isUserSafe) {
            throw error;
        }

        throw new CookbookEntryPersistenceError('populate', error);
    }
});

export const addMealToCookbook = withErrorHandling(async (_, { cookbookId, mealId }, context) => {
    if (!context.user?.userId) {
        throw new Error('Authentication required');
    }
    const cookbook = await Cookbook.findById(cookbookId);
    if (!cookbook || cookbook.user.toString() !== context.user.userId) {
        throw new Error('Cookbook not found or unauthorized');
    }

    if (!cookbook.meals.includes(mealId)) {
        cookbook.meals.push(mealId);
        await cookbook.save();
    }
    return await cookbook.populate('entries.recipe meals recipes restaurants');
});
