// @ts-nocheck

const HOUSEHOLD_SHOPPING_OWNERSHIP_ERROR_MESSAGES = {
    invalidPayload: 'We could not read your shopping ownership assignment. Please refresh the planner.',
};

export class HouseholdShoppingOwnershipValidationError extends Error {
    constructor(code, message = HOUSEHOLD_SHOPPING_OWNERSHIP_ERROR_MESSAGES.invalidPayload) {
        super(message);
        this.name = 'HouseholdShoppingOwnershipValidationError';
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

const createHouseholdShoppingOwnershipValidationError = (code) => (
    new HouseholdShoppingOwnershipValidationError(
        code,
        HOUSEHOLD_SHOPPING_OWNERSHIP_ERROR_MESSAGES[code]
            || HOUSEHOLD_SHOPPING_OWNERSHIP_ERROR_MESSAGES.invalidPayload,
    )
);

const isPlainObject = (value) => (
    value !== null
    && typeof value === 'object'
    && !Array.isArray(value)
);

const normalizeShoppingOwnershipUserId = (value) => {
    if (typeof value === 'string') {
        const normalizedValue = value.trim();
        return normalizedValue || null;
    }

    if (value === null || value === undefined) {
        return null;
    }

    if (typeof value === 'object' && typeof value.toString === 'function') {
        const normalizedValue = value.toString().trim();
        return normalizedValue && normalizedValue !== '[object Object]'
            ? normalizedValue
            : null;
    }

    return null;
};

const normalizeShoppingOwnershipTimestamp = (value) => {
    if (value === undefined) {
        return undefined;
    }

    if (value === null) {
        return null;
    }

    if (value instanceof Date) {
        const timestamp = value.getTime();
        return Number.isNaN(timestamp) ? null : new Date(timestamp);
    }

    if (typeof value === 'string' || typeof value === 'number') {
        const parsed = new Date(value);
        return Number.isNaN(parsed.getTime()) ? null : parsed;
    }

    return null;
};

const cloneShoppingOwnershipTimestamp = (value) => {
    if (value instanceof Date) {
        const timestamp = value.getTime();
        return Number.isNaN(timestamp) ? value : new Date(timestamp);
    }

    if (typeof value === 'string' || typeof value === 'number') {
        const parsed = new Date(value);
        return Number.isNaN(parsed.getTime()) ? value : parsed;
    }

    return value;
};

const buildInvalidShoppingOwnershipResult = () => ({
    valid: false,
    shoppingOwnership: null,
    error: createHouseholdShoppingOwnershipValidationError('invalidPayload'),
});

export function validateHouseholdShoppingOwnership(shoppingOwnership) {
    if (shoppingOwnership === null) {
        return {
            valid: true,
            shoppingOwnership: null,
            error: null,
        };
    }

    if (!isPlainObject(shoppingOwnership)) {
        return buildInvalidShoppingOwnershipResult();
    }

    const normalizedUserId = normalizeShoppingOwnershipUserId(
        Object.prototype.hasOwnProperty.call(shoppingOwnership, 'userId')
            ? shoppingOwnership.userId
            : shoppingOwnership.user,
    );
    if (!normalizedUserId) {
        return buildInvalidShoppingOwnershipResult();
    }

    const normalizedAssignedAt = normalizeShoppingOwnershipTimestamp(shoppingOwnership.assignedAt);
    if (normalizedAssignedAt === null) {
        return buildInvalidShoppingOwnershipResult();
    }

    return {
        valid: true,
        shoppingOwnership: {
            userId: normalizedUserId,
            ...(normalizedAssignedAt === undefined ? {} : { assignedAt: normalizedAssignedAt }),
        },
        error: null,
    };
}

export function normalizeHouseholdShoppingOwnership(shoppingOwnership) {
    if (shoppingOwnership === null || shoppingOwnership === undefined) {
        return shoppingOwnership;
    }

    if (!isPlainObject(shoppingOwnership)) {
        return shoppingOwnership;
    }

    return {
        ...shoppingOwnership,
        assignedAt: cloneShoppingOwnershipTimestamp(shoppingOwnership.assignedAt),
    };
}
