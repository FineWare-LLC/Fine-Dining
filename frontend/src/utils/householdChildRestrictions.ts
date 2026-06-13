// @ts-nocheck

const CHILD_RESTRICTION_ERROR_MESSAGES = {
    invalidPayload: 'We could not read your child restriction settings. Please refresh the planner.',
};

export class HouseholdChildRestrictionsValidationError extends Error {
    constructor(code, message = CHILD_RESTRICTION_ERROR_MESSAGES.invalidPayload) {
        super(message);
        this.name = 'HouseholdChildRestrictionsValidationError';
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

const createHouseholdChildRestrictionsValidationError = (code) => (
    new HouseholdChildRestrictionsValidationError(
        code,
        CHILD_RESTRICTION_ERROR_MESSAGES[code] || CHILD_RESTRICTION_ERROR_MESSAGES.invalidPayload,
    )
);

const isPlainObject = (value) => (
    value !== null
    && typeof value === 'object'
    && !Array.isArray(value)
);

const normalizeOptionalStringArray = (values) => {
    if (values === undefined) {
        return undefined;
    }

    if (values === null || !Array.isArray(values)) {
        return null;
    }

    const normalizedValues = [];

    for (const value of values) {
        if (typeof value !== 'string') {
            return null;
        }

        const trimmedValue = value.trim();
        if (trimmedValue !== '') {
            normalizedValues.push(trimmedValue);
        }
    }

    return normalizedValues;
};

const normalizeOptionalString = (value) => {
    if (value === undefined) {
        return undefined;
    }

    if (value === null) {
        return null;
    }

    if (typeof value !== 'string') {
        return null;
    }

    const trimmedValue = value.trim();
    return trimmedValue === '' ? '' : trimmedValue.toUpperCase();
};

const buildInvalidRestrictionResult = () => ({
    valid: false,
    hardRestrictions: null,
    softPreferences: null,
    error: createHouseholdChildRestrictionsValidationError('invalidPayload'),
});

export function resolveHouseholdChildRestrictionProfile(user = {}) {
    if (!isPlainObject(user)) {
        return buildInvalidRestrictionResult();
    }

    const hardRestrictions = normalizeOptionalStringArray(
        Object.prototype.hasOwnProperty.call(user, 'dietaryRestrictions')
            ? user.dietaryRestrictions
            : undefined,
    );
    if (hardRestrictions === null) {
        return buildInvalidRestrictionResult();
    }

    const questionnaire = isPlainObject(user.questionnaire) ? user.questionnaire : undefined;
    const dietaryProfile = isPlainObject(user.dietaryProfile) ? user.dietaryProfile : undefined;

    const dietaryPattern = normalizeOptionalString(
        questionnaire && Object.prototype.hasOwnProperty.call(questionnaire, 'dietaryPattern')
            ? questionnaire.dietaryPattern
            : undefined,
    );
    if (dietaryPattern === null) {
        return buildInvalidRestrictionResult();
    }

    const foodGoals = normalizeOptionalStringArray(
        Object.prototype.hasOwnProperty.call(user, 'foodGoals') ? user.foodGoals : undefined,
    );
    if (foodGoals === null) {
        return buildInvalidRestrictionResult();
    }

    const diets = normalizeOptionalStringArray(
        dietaryProfile && Object.prototype.hasOwnProperty.call(dietaryProfile, 'diets')
            ? dietaryProfile.diets
            : undefined,
    );
    if (diets === null) {
        return buildInvalidRestrictionResult();
    }

    const preferredCuisines = normalizeOptionalStringArray(
        dietaryProfile && Object.prototype.hasOwnProperty.call(dietaryProfile, 'preferredCuisines')
            ? dietaryProfile.preferredCuisines
            : undefined,
    );
    if (preferredCuisines === null) {
        return buildInvalidRestrictionResult();
    }

    return {
        valid: true,
        hardRestrictions: hardRestrictions || [],
        softPreferences: {
            dietaryPattern: dietaryPattern === undefined ? '' : dietaryPattern,
            foodGoals: foodGoals || [],
            diets: diets || [],
            preferredCuisines: preferredCuisines || [],
        },
        error: null,
    };
}
