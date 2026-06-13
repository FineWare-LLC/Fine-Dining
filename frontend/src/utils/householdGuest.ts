// @ts-nocheck

import { normalizeHouseholdServingMultiplier } from './householdMemberServings';

const HOUSEHOLD_GUEST_ERROR_MESSAGES = {
    invalidPayload: 'We could not read your temporary guest details. Please refresh the planner.',
};

export class HouseholdGuestValidationError extends Error {
    constructor(code, message = HOUSEHOLD_GUEST_ERROR_MESSAGES.invalidPayload) {
        super(message);
        this.name = 'HouseholdGuestValidationError';
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

const createHouseholdGuestValidationError = (code) => (
    new HouseholdGuestValidationError(
        code,
        HOUSEHOLD_GUEST_ERROR_MESSAGES[code]
            || HOUSEHOLD_GUEST_ERROR_MESSAGES.invalidPayload,
    )
);

const isPlainObject = (value) => (
    value !== null
    && typeof value === 'object'
    && !Array.isArray(value)
);

const normalizeRequiredString = (value) => {
    if (typeof value !== 'string') {
        return null;
    }

    const trimmedValue = value.trim();
    return trimmedValue === '' ? null : trimmedValue;
};

const normalizeOptionalString = (value, { defaultValue = '' } = {}) => {
    if (value === undefined || value === null) {
        return defaultValue;
    }

    if (typeof value !== 'string') {
        return null;
    }

    return value.trim();
};

const normalizeOptionalStringArray = (values) => {
    if (values === undefined || values === null) {
        return [];
    }

    if (!Array.isArray(values)) {
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

const INVALID_OPTIONAL_DATE = Symbol('invalidOptionalDate');

const normalizeOptionalDate = (value) => {
    if (value === undefined || value === null) {
        return null;
    }

    if (value instanceof Date) {
        const timestamp = value.getTime();
        return Number.isNaN(timestamp) ? null : new Date(timestamp);
    }

    if (typeof value === 'string' || typeof value === 'number') {
        const parsed = new Date(value);
        return Number.isNaN(parsed.getTime()) ? INVALID_OPTIONAL_DATE : parsed;
    }

    return INVALID_OPTIONAL_DATE;
};

const buildInvalidGuestResult = (code = 'invalidPayload') => ({
    valid: false,
    guest: null,
    error: createHouseholdGuestValidationError(code),
});

const normalizeHouseholdGuestList = (guests) => {
    if (!Array.isArray(guests)) {
        return guests;
    }

    const normalizedGuests = [];

    for (const guest of guests) {
        const validation = validateHouseholdGuest(guest);
        if (!validation.valid) {
            throw validation.error;
        }

        normalizedGuests.push(validation.guest);
    }

    return normalizedGuests;
};

export function validateHouseholdGuest(guest) {
    if (!isPlainObject(guest)) {
        return buildInvalidGuestResult();
    }

    const name = normalizeRequiredString(guest.name);
    if (!name) {
        return buildInvalidGuestResult();
    }

    const email = normalizeOptionalString(guest.email);
    if (email === null) {
        return buildInvalidGuestResult();
    }

    const allergens = normalizeOptionalStringArray(guest.allergens);
    if (allergens === null) {
        return buildInvalidGuestResult();
    }

    const dietaryTags = normalizeOptionalStringArray(guest.dietaryTags);
    if (dietaryTags === null) {
        return buildInvalidGuestResult();
    }

    let servingMultiplier;
    try {
        servingMultiplier = normalizeHouseholdServingMultiplier(guest.servingMultiplier);
    } catch (error) {
        return {
            valid: false,
            guest: null,
            error,
        };
    }

    const startDate = normalizeOptionalDate(guest.startDate);
    if (startDate === INVALID_OPTIONAL_DATE) {
        return buildInvalidGuestResult();
    }

    const endDate = normalizeOptionalDate(guest.endDate);
    if (endDate === INVALID_OPTIONAL_DATE) {
        return buildInvalidGuestResult();
    }

    const notes = normalizeOptionalString(guest.notes);
    if (notes === null || notes.length > 300) {
        return buildInvalidGuestResult();
    }

    return {
        valid: true,
        guest: {
            name,
            email,
            allergens,
            dietaryTags,
            servingMultiplier,
            startDate,
            endDate,
            notes,
        },
        error: null,
    };
}

export function normalizeHouseholdGuestSnapshot(household) {
    if (!household || typeof household !== 'object' || Array.isArray(household)) {
        return household;
    }

    if (!Array.isArray(household.guests)) {
        return household;
    }

    const normalizedGuests = normalizeHouseholdGuestList(household.guests);
    if (normalizedGuests !== household.guests) {
        household.guests = normalizedGuests;
    }

    return household;
}

const findGuestCollectionDescriptor = (household) => {
    let current = household;

    while (current && typeof current === 'object') {
        const descriptor = Object.getOwnPropertyDescriptor(current, 'guests');
        if (descriptor) {
            return descriptor;
        }

        current = Object.getPrototypeOf(current);
    }

    return null;
};

export function deferHouseholdGuestSnapshotNormalization(household) {
    if (!household || typeof household !== 'object' || Array.isArray(household)) {
        return household;
    }

    const descriptor = findGuestCollectionDescriptor(household);
    if (!descriptor || descriptor.configurable === false) {
        return household;
    }

    const readGuests = () => (
        typeof descriptor.get === 'function'
            ? descriptor.get.call(household)
            : descriptor.value
    );

    try {
        Object.defineProperty(household, 'guests', {
            configurable: true,
            enumerable: descriptor.enumerable ?? true,
            get() {
                const normalizedGuests = normalizeHouseholdGuestList(readGuests());
                Object.defineProperty(household, 'guests', {
                    configurable: true,
                    enumerable: descriptor.enumerable ?? true,
                    writable: true,
                    value: normalizedGuests,
                });
                return normalizedGuests;
            },
        });
    } catch {
        return household;
    }

    return household;
}
