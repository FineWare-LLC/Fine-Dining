// @ts-nocheck

const HOUSEHOLD_MEMBER_SERVING_MULTIPLIER_ERROR_MESSAGE =
    'Per-member serving multipliers must be between 0.1 and 10.';

export class HouseholdServingMultiplierValidationError extends Error {
    constructor(code, message = HOUSEHOLD_MEMBER_SERVING_MULTIPLIER_ERROR_MESSAGE) {
        super(message);
        this.name = 'HouseholdServingMultiplierValidationError';
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

const createHouseholdServingMultiplierValidationError = (code) => (
    new HouseholdServingMultiplierValidationError(
        code,
        HOUSEHOLD_MEMBER_SERVING_MULTIPLIER_ERROR_MESSAGE,
    )
);

const isFiniteNumber = (value) => typeof value === 'number' && Number.isFinite(value);

export const normalizeHouseholdServingMultiplier = (servingMultiplier) => {
    if (servingMultiplier === undefined || servingMultiplier === null) {
        return 1;
    }

    if (!isFiniteNumber(servingMultiplier)) {
        throw createHouseholdServingMultiplierValidationError('invalidServingMultiplier');
    }

    if (servingMultiplier < 0.1 || servingMultiplier > 10) {
        throw createHouseholdServingMultiplierValidationError('invalidServingMultiplier');
    }

    return servingMultiplier;
};
