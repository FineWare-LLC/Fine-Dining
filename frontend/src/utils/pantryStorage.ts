// @ts-nocheck

export const PANTRY_STORAGE_KEY = 'fineDining.pantryItems';

export const DEFAULT_PANTRY_ITEMS = Object.freeze([
    'Greek yogurt',
    'Chicken breast',
    'Brown rice',
    'Spinach',
]);

const normalizePantryItemLabel = (value) => {
    if (typeof value !== 'string') {
        return '';
    }

    return value.trim().replace(/\s+/g, ' ');
};

export const normalizePantryItems = (items) => {
    if (!Array.isArray(items)) {
        return [];
    }

    return items
        .map((item) => normalizePantryItemLabel(item))
        .filter(Boolean);
};

export const serializePantryItems = (items) => (
    JSON.stringify(normalizePantryItems(items))
);

export const hydratePantryItems = (rawValue, fallbackItems = DEFAULT_PANTRY_ITEMS) => {
    if (typeof rawValue !== 'string' || rawValue.trim() === '') {
        return [...fallbackItems];
    }

    try {
        const parsedValue = JSON.parse(rawValue);

        if (!Array.isArray(parsedValue)) {
            return [...fallbackItems];
        }

        return normalizePantryItems(parsedValue);
    } catch (_error) {
        return [...fallbackItems];
    }
};

export const getPantryStorageAdapter = () => {
    try {
        if (typeof window !== 'undefined') {
            return window.localStorage;
        }
    } catch (_error) {
        return null;
    }

    return null;
};

export const loadPantryItems = (storageAdapter, fallbackItems = DEFAULT_PANTRY_ITEMS) => {
    if (!storageAdapter || typeof storageAdapter.getItem !== 'function') {
        return [...fallbackItems];
    }

    try {
        return hydratePantryItems(storageAdapter.getItem(PANTRY_STORAGE_KEY), fallbackItems);
    } catch (_error) {
        return [...fallbackItems];
    }
};

export const persistPantryItems = (storageAdapter, pantryItems) => {
    if (!storageAdapter || typeof storageAdapter.setItem !== 'function') {
        return false;
    }

    try {
        storageAdapter.setItem(PANTRY_STORAGE_KEY, serializePantryItems(pantryItems));
        return true;
    } catch (_error) {
        return false;
    }
};

export const savePantryItems = (pantryItems, storageAdapter = getPantryStorageAdapter()) => {
    const canonicalPantryItems = normalizePantryItems(pantryItems);

    if (!storageAdapter || typeof storageAdapter.setItem !== 'function') {
        return null;
    }

    try {
        const writeResult = storageAdapter.setItem(PANTRY_STORAGE_KEY, serializePantryItems(canonicalPantryItems));
        if (writeResult === false) {
            return null;
        }
    } catch (_error) {
        return null;
    }

    return canonicalPantryItems;
};
