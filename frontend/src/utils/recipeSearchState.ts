// @ts-nocheck

import storage from './storage';

const RECIPE_SEARCH_STORAGE_KEY = 'fineDining.recipeSearchFilters';

const createDefaultRecipeSearchFilters = () => ({
    diets: [],
    allergenExclusions: [],
    cuisines: [],
    mealTypes: [],
    maxPrepTime: null,
    maxDifficulty: null,
});

export const DEFAULT_RECIPE_SEARCH_FILTERS = Object.freeze(createDefaultRecipeSearchFilters());

const normalizeSearchText = (value, { uppercase = false } = {}) => {
    if (typeof value !== 'string') {
        return '';
    }

    const normalizedValue = value.trim();
    if (!normalizedValue) {
        return '';
    }

    return uppercase ? normalizedValue.toUpperCase() : normalizedValue;
};

const normalizeSearchList = (value, { uppercase = false } = {}) => {
    if (!Array.isArray(value)) {
        return [];
    }

    const seenValues = new Set();
    const normalizedValues = [];

    for (const entry of value) {
        const normalizedEntry = normalizeSearchText(entry, { uppercase });
        if (!normalizedEntry) {
            continue;
        }

        if (!seenValues.has(normalizedEntry)) {
            seenValues.add(normalizedEntry);
            normalizedValues.push(normalizedEntry);
        }
    }

    return normalizedValues;
};

const normalizeRecipeSearchPrepTime = (value) => {
    if (value === undefined || value === null || value === '') {
        return null;
    }

    const numericValue = Number(value);
    if (!Number.isFinite(numericValue)) {
        return null;
    }

    return Math.max(0, Math.trunc(numericValue));
};

const normalizeRecipeSearchDifficulty = (value) => {
    const normalizedValue = normalizeSearchText(value, { uppercase: true });
    return normalizedValue || null;
};

export function normalizeRecipeSearchFilters(filters = {}) {
    return {
        diets: normalizeSearchList(filters.diets, { uppercase: true }),
        allergenExclusions: normalizeSearchList(filters.allergenExclusions, { uppercase: true }),
        cuisines: normalizeSearchList(filters.cuisines),
        mealTypes: normalizeSearchList(filters.mealTypes, { uppercase: true }),
        maxPrepTime: normalizeRecipeSearchPrepTime(filters.maxPrepTime),
        maxDifficulty: normalizeRecipeSearchDifficulty(filters.maxDifficulty),
    };
}

export function hydrateRecipeSearchFilters(rawValue, fallbackFilters = DEFAULT_RECIPE_SEARCH_FILTERS) {
    if (typeof rawValue !== 'string' || rawValue.trim() === '') {
        return normalizeRecipeSearchFilters(fallbackFilters);
    }

    try {
        const parsedValue = JSON.parse(rawValue);
        if (!parsedValue || typeof parsedValue !== 'object' || Array.isArray(parsedValue)) {
            return normalizeRecipeSearchFilters(fallbackFilters);
        }

        return normalizeRecipeSearchFilters({
            ...fallbackFilters,
            ...parsedValue,
        });
    } catch (_error) {
        return normalizeRecipeSearchFilters(fallbackFilters);
    }
}

export function loadRecipeSearchFilters(storageAdapter = storage.localStorage, fallbackFilters = DEFAULT_RECIPE_SEARCH_FILTERS) {
    if (!storageAdapter || typeof storageAdapter.getItem !== 'function') {
        return normalizeRecipeSearchFilters(fallbackFilters);
    }

    try {
        return hydrateRecipeSearchFilters(storageAdapter.getItem(RECIPE_SEARCH_STORAGE_KEY), fallbackFilters);
    } catch (_error) {
        return normalizeRecipeSearchFilters(fallbackFilters);
    }
}

export function persistRecipeSearchFilters(storageAdapter = storage.localStorage, filters = DEFAULT_RECIPE_SEARCH_FILTERS) {
    const canonicalFilters = normalizeRecipeSearchFilters(filters);

    if (!storageAdapter || typeof storageAdapter.setItem !== 'function') {
        return null;
    }

    try {
        const writeResult = storageAdapter.setItem(
            RECIPE_SEARCH_STORAGE_KEY,
            JSON.stringify(canonicalFilters),
        );

        if (writeResult === false) {
            return null;
        }
    } catch (_error) {
        return null;
    }

    return canonicalFilters;
}
