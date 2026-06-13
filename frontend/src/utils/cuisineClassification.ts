// @ts-nocheck

export const CuisineClassificationErrorCodes = {
    INVALID_PAYLOAD: 'E_CUISINE_CLASSIFICATION_INVALID_PAYLOAD',
};

export class CuisineClassificationError extends Error {
    constructor(code, message, cause = null) {
        super(message);
        this.name = 'CuisineClassificationError';
        this.code = code;
        this.isUserSafe = true;
        this.extensions = { code };
        if (cause) {
            this.cause = cause;
        }
    }
}

export function createCuisineClassificationError(code, message, cause = null) {
    return new CuisineClassificationError(code, message, cause);
}

const INVALID_CUISINE_PAYLOAD_MESSAGE =
    'Please provide cuisine labels as strings or string arrays.';

const GENERIC_CUISINE_WORDS = new Set([
    'restaurant',
    'restaurants',
    'food',
    'food court',
    'court',
    'cafe',
    'cafes',
    'bar',
    'bars',
    'grill',
    'grills',
    'kitchen',
    'kitchens',
    'eatery',
    'eateries',
    'diner',
    'diners',
    'house',
    'houses',
    'place',
    'places',
    'spot',
    'spots',
]);

const DELIMITER_PATTERN = /[;,/|]+/g;

function titleCaseCuisineLabel(value) {
    return value
        .split(/\s+/)
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
}

function normalizeCuisineSegment(segment) {
    if (typeof segment !== 'string') {
        throw createCuisineClassificationError(
            CuisineClassificationErrorCodes.INVALID_PAYLOAD,
            INVALID_CUISINE_PAYLOAD_MESSAGE,
        );
    }

    let normalized = segment.trim();
    if (!normalized) {
        return null;
    }

    normalized = normalized
        .replace(/[_-]+/g, ' ')
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .trim();

    if (!normalized) {
        return null;
    }

    for (const genericWord of GENERIC_CUISINE_WORDS) {
        const pattern = new RegExp(`\\b${genericWord.replace(/\s+/g, '\\s+')}\\b`, 'g');
        normalized = normalized.replace(pattern, ' ');
    }

    normalized = normalized.replace(/\s+/g, ' ').trim();

    if (!normalized) {
        return null;
    }

    return titleCaseCuisineLabel(normalized);
}

function addCuisineTokens(targetSet, value) {
    if (typeof value !== 'string') {
        throw createCuisineClassificationError(
            CuisineClassificationErrorCodes.INVALID_PAYLOAD,
            INVALID_CUISINE_PAYLOAD_MESSAGE,
        );
    }

    for (const segment of value.split(DELIMITER_PATTERN)) {
        const normalized = normalizeCuisineSegment(segment);
        if (normalized) {
            targetSet.add(normalized);
        }
    }
}

export function normalizeCuisineCategories(payload) {
    const categories = new Set();

    if (payload == null) {
        return [];
    }

    if (typeof payload === 'string') {
        addCuisineTokens(categories, payload);
    } else if (Array.isArray(payload)) {
        for (const value of payload) {
            addCuisineTokens(categories, value);
        }
    } else {
        throw createCuisineClassificationError(
            CuisineClassificationErrorCodes.INVALID_PAYLOAD,
            INVALID_CUISINE_PAYLOAD_MESSAGE,
        );
    }

    return [...categories].sort((left, right) => left.localeCompare(right));
}
