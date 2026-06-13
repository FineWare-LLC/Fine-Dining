// @ts-nocheck
const PANTRY_AWARE_GROCERY_LIST_ERROR_MESSAGES = {
    invalidPayload: 'We could not read your pantry-aware grocery list. Please refresh the planner.',
};

const DEFAULT_PANTRY_UNIT = 'each';

const PANTRY_UNIT_ALIASES = new Map([
    ['cup', 'cup'],
    ['cups', 'cup'],
    ['tablespoon', 'tbsp'],
    ['tablespoons', 'tbsp'],
    ['tbsp', 'tbsp'],
    ['tbsps', 'tbsp'],
    ['tablespoonful', 'tbsp'],
    ['teaspoon', 'tsp'],
    ['teaspoons', 'tsp'],
    ['tsp', 'tsp'],
    ['tsps', 'tsp'],
    ['ounce', 'oz'],
    ['ounces', 'oz'],
    ['oz', 'oz'],
    ['pound', 'lb'],
    ['pounds', 'lb'],
    ['lb', 'lb'],
    ['lbs', 'lb'],
    ['gram', 'g'],
    ['grams', 'g'],
    ['g', 'g'],
    ['kilogram', 'kg'],
    ['kilograms', 'kg'],
    ['kg', 'kg'],
    ['milliliter', 'ml'],
    ['milliliters', 'ml'],
    ['ml', 'ml'],
    ['liter', 'l'],
    ['liters', 'l'],
    ['l', 'l'],
    ['piece', 'each'],
    ['pieces', 'each'],
    ['count', 'each'],
    ['item', 'each'],
    ['items', 'each'],
    ['each', 'each'],
    ['whole', 'each'],
]);

export class PantryAwareGroceryListValidationError extends Error {
    constructor(code, message) {
        super(message);
        this.name = 'PantryAwareGroceryListValidationError';
        this.code = code;
        this.isUserSafe = true;
    }
}

const createPantryAwareGroceryListError = (code) => (
    new PantryAwareGroceryListValidationError(
        code,
        PANTRY_AWARE_GROCERY_LIST_ERROR_MESSAGES[code] || PANTRY_AWARE_GROCERY_LIST_ERROR_MESSAGES.invalidPayload,
    )
);

const createInvalidPantryAwareGroceryListResult = () => ({
    status: 'invalid',
    items: null,
    error: createPantryAwareGroceryListError('invalidPayload'),
});

const clonePantryAwareGroceryListResult = (result) => ({
    status: result.status,
    items: Array.isArray(result.items)
        ? result.items.map((item) => ({ ...item }))
        : result.items,
    error: result.error,
});

const normalizePantryAwareText = (value) => {
    if (typeof value !== 'string') {
        return '';
    }

    return value.trim().replace(/\s+/g, ' ').toLowerCase();
};

const singularizePantryAwareWord = (value) => {
    if (value.endsWith('ies') && value.length > 3) {
        return `${value.slice(0, -3)}y`;
    }

    if (/(?:oes|ses|xes|zes|ches|shes)$/.test(value) && value.length > 3) {
        return value.slice(0, -2);
    }

    if (value.endsWith('s') && !value.endsWith('ss') && !value.endsWith('us') && !value.endsWith('is') && value.length > 3) {
        return value.slice(0, -1);
    }

    return value;
};

const normalizePantryAwareName = (value) => {
    const normalizedText = normalizePantryAwareText(value);
    if (!normalizedText) {
        return '';
    }

    const parts = normalizedText.split(' ');
    const lastIndex = parts.length - 1;
    parts[lastIndex] = singularizePantryAwareWord(parts[lastIndex]);
    return parts.join(' ');
};

const formatPantryAwareDisplayName = (normalizedName) => (
    normalizedName
        .split(' ')
        .filter(Boolean)
        .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
        .join(' ')
);

const normalizePantryAwareUnit = (value) => {
    const normalizedUnit = normalizePantryAwareText(value);
    if (!normalizedUnit) {
        return DEFAULT_PANTRY_UNIT;
    }

    return PANTRY_UNIT_ALIASES.get(normalizedUnit) || normalizedUnit;
};

const normalizePantryAwareQuantity = (value) => {
    if (value === undefined || value === null) {
        return 1;
    }

    const numericValue = Number(value);

    if (!Number.isFinite(numericValue) || numericValue <= 0) {
        return null;
    }

    return numericValue;
};

const normalizePantryAwareItem = (item) => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
        if (typeof item !== 'string') {
            return null;
        }

        const normalizedName = normalizePantryAwareName(item);
        if (!normalizedName) {
            return null;
        }

        return {
            name: formatPantryAwareDisplayName(normalizedName),
            normalizedName,
            unit: DEFAULT_PANTRY_UNIT,
            quantity: 1,
        };
    }

    const normalizedName = normalizePantryAwareName(
        item.canonicalName ?? item.name ?? item.label ?? '',
    );
    const quantity = normalizePantryAwareQuantity(item.quantity);
    const unit = normalizePantryAwareUnit(item.unit);

    if (!normalizedName || quantity === null) {
        return null;
    }

    return {
        name: formatPantryAwareDisplayName(normalizedName),
        normalizedName,
        unit,
        quantity,
    };
};

export function resolvePantryAwareGroceryList(groceryItems = [], pantryItems = []) {
    if (!Array.isArray(groceryItems) || !Array.isArray(pantryItems)) {
        return createInvalidPantryAwareGroceryListResult();
    }

    if (groceryItems.length === 0) {
        return {
            status: 'empty',
            items: [],
            error: null,
        };
    }

    const aggregatedItems = new Map();

    for (const item of groceryItems) {
        const normalizedItem = normalizePantryAwareItem(item);
        if (!normalizedItem) {
            return createInvalidPantryAwareGroceryListResult();
        }

        const key = `${normalizedItem.normalizedName}|${normalizedItem.unit}`;
        const existing = aggregatedItems.get(key);

        if (existing) {
            existing.quantity += normalizedItem.quantity;
            existing.sourceCount += 1;
            continue;
        }

        aggregatedItems.set(key, {
            ...normalizedItem,
            sourceCount: 1,
        });
    }

    if (aggregatedItems.size === 0) {
        return {
            status: 'empty',
            items: [],
            error: null,
        };
    }

    for (const item of pantryItems) {
        const normalizedItem = normalizePantryAwareItem(item);
        if (!normalizedItem) {
            return createInvalidPantryAwareGroceryListResult();
        }

        const key = `${normalizedItem.normalizedName}|${normalizedItem.unit}`;
        const existing = aggregatedItems.get(key);

        if (!existing) {
            continue;
        }

        existing.quantity = Math.max(0, existing.quantity - normalizedItem.quantity);
    }

    const items = [...aggregatedItems.values()]
        .filter((item) => item.quantity > 0);

    if (items.length === 0) {
        return {
            status: 'empty',
            items: [],
            error: null,
        };
    }

    const resolvedResult = {
        status: 'resolved',
        items,
        error: null,
    };

    return clonePantryAwareGroceryListResult(resolvedResult);
}
