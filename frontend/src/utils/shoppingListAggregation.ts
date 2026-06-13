// @ts-nocheck
const GROCERY_LIST_ERROR_MESSAGES = {
    invalidPayload: 'We could not read your grocery list. Please refresh the planner.',
};

const DEFAULT_GROCERY_UNIT = 'each';
const groceryListAggregationCache = new WeakMap();
const groceryListExportCache = new WeakMap();

const GROCERY_LIST_EXPORT_ERROR_MESSAGES = {
    invalidPayload: 'We could not build your grocery list. Please refresh the planner.',
};

const GROCERY_UNIT_ALIASES = new Map([
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

export class GroceryListAggregationValidationError extends Error {
    constructor(code, message) {
        super(message);
        this.name = 'GroceryListAggregationValidationError';
        this.code = code;
        this.isUserSafe = true;
    }
}

export class GroceryListExportValidationError extends Error {
    constructor(code, message) {
        super(message);
        this.name = 'GroceryListExportValidationError';
        this.code = code;
        this.isUserSafe = true;
    }
}

const createGroceryListAggregationError = (code) => (
    new GroceryListAggregationValidationError(
        code,
        GROCERY_LIST_ERROR_MESSAGES[code] || GROCERY_LIST_ERROR_MESSAGES.invalidPayload,
    )
);

const createInvalidAggregationResult = () => ({
    status: 'invalid',
    items: null,
    error: createGroceryListAggregationError('invalidPayload'),
});

const createGroceryListExportError = (code) => (
    new GroceryListExportValidationError(
        code,
        GROCERY_LIST_EXPORT_ERROR_MESSAGES[code] || GROCERY_LIST_EXPORT_ERROR_MESSAGES.invalidPayload,
    )
);

const createInvalidExportResult = () => ({
    status: 'invalid',
    items: null,
    error: createGroceryListExportError('invalidPayload'),
});

const cloneGroceryListAggregationResult = (result) => ({
    status: result.status,
    items: Array.isArray(result.items)
        ? result.items.map((item) => ({ ...item }))
        : result.items,
    error: result.error,
});

const normalizeShoppingListText = (value) => {
    if (typeof value !== 'string') {
        return '';
    }

    return value.trim().replace(/\s+/g, ' ').toLowerCase();
};

const normalizeShoppingListExportText = (value) => {
    if (value === undefined || value === null) {
        return '';
    }

    if (typeof value !== 'string') {
        return null;
    }

    return value.trim().replace(/\s+/g, ' ');
};

const singularizeShoppingListWord = (value) => {
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

const normalizeShoppingListName = (value) => {
    const normalizedText = normalizeShoppingListText(value);
    if (!normalizedText) {
        return '';
    }

    const parts = normalizedText.split(' ');
    const lastIndex = parts.length - 1;
    parts[lastIndex] = singularizeShoppingListWord(parts[lastIndex]);
    return parts.join(' ');
};

const formatShoppingListDisplayName = (normalizedName) => (
    normalizedName
        .split(' ')
        .filter(Boolean)
        .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
        .join(' ')
);

const normalizeShoppingListUnit = (value) => {
    const normalizedUnit = normalizeShoppingListText(value);
    if (!normalizedUnit) {
        return DEFAULT_GROCERY_UNIT;
    }

    return GROCERY_UNIT_ALIASES.get(normalizedUnit) || normalizedUnit;
};

const normalizeShoppingListQuantity = (value) => {
    const numericValue = Number(value);

    if (!Number.isFinite(numericValue) || numericValue < 0) {
        return null;
    }

    return numericValue;
};

const normalizeShoppingListExportQuantity = (value) => {
    if (value === undefined || value === null || value === '') {
        return 1;
    }

    const numericValue = Number(value);

    if (!Number.isFinite(numericValue) || numericValue < 0) {
        return null;
    }

    return numericValue;
};

const normalizeShoppingListServings = (value) => {
    const numericValue = Number(value);

    if (!Number.isFinite(numericValue) || numericValue <= 0) {
        return 1;
    }

    return numericValue;
};

const readIngredientList = (meal) => {
    if (!meal || typeof meal !== 'object' || Array.isArray(meal)) {
        return { invalid: true };
    }

    if (meal.ingredients !== undefined) {
        if (!Array.isArray(meal.ingredients)) {
            return { invalid: true };
        }

        if (meal.ingredients.length > 0) {
            return { invalid: false, ingredients: meal.ingredients };
        }
    }

    if (meal.recipe?.ingredients !== undefined) {
        if (!Array.isArray(meal.recipe.ingredients)) {
            return { invalid: true };
        }

        if (meal.recipe.ingredients.length > 0) {
            return { invalid: false, ingredients: meal.recipe.ingredients };
        }
    }

    return { invalid: false, ingredients: [] };
};

const normalizeShoppingListIngredient = (ingredient) => {
    if (!ingredient || typeof ingredient !== 'object' || Array.isArray(ingredient)) {
        return null;
    }

    const normalizedName = normalizeShoppingListName(
        ingredient.canonicalName ?? ingredient.name ?? ingredient.label ?? '',
    );
    const quantity = normalizeShoppingListQuantity(ingredient.quantity);
    const unit = normalizeShoppingListUnit(ingredient.unit);

    if (!normalizedName || quantity === null) {
        return null;
    }

    const displayName = formatShoppingListDisplayName(normalizedName);

    return {
        name: displayName,
        normalizedName,
        unit,
        quantity,
        sourceCount: 1,
    };
};

const normalizeShoppingListExportIngredient = (meal, ingredient, mealNotes) => {
    if (typeof ingredient === 'string') {
        const normalizedName = normalizeShoppingListName(ingredient);
        if (!normalizedName) {
            return null;
        }

        const notes = mealNotes === undefined
            ? normalizeShoppingListExportText(meal?.notes)
            : mealNotes;
        if (notes === null) {
            return null;
        }

        return {
            name: formatShoppingListDisplayName(normalizedName),
            normalizedName,
            unit: DEFAULT_GROCERY_UNIT,
            quantity: 1,
            sourceCount: 1,
            category: '',
            notes,
        };
    }

    if (!ingredient || typeof ingredient !== 'object' || Array.isArray(ingredient)) {
        return null;
    }

    const normalizedName = normalizeShoppingListName(
        ingredient.canonicalName ?? ingredient.name ?? ingredient.label ?? '',
    );
    const quantity = normalizeShoppingListExportQuantity(ingredient.quantity);
    const unit = normalizeShoppingListUnit(ingredient.unit);
    const category = normalizeShoppingListExportText(ingredient.category);
    const ingredientNotes = normalizeShoppingListExportText(ingredient.notes);
    const normalizedMealNotes = mealNotes === undefined
        ? normalizeShoppingListExportText(meal?.notes)
        : mealNotes;

    if (!normalizedName || quantity === null || category === null || ingredientNotes === null || normalizedMealNotes === null) {
        return null;
    }

    const notes = ingredientNotes || normalizedMealNotes;
    const displayName = formatShoppingListDisplayName(normalizedName);

    return {
        name: displayName,
        normalizedName,
        unit,
        quantity,
        sourceCount: 1,
        category,
        notes,
    };
};

const compareShoppingListItems = (a, b) => {
    const nameComparison = a.normalizedName.localeCompare(b.normalizedName);
    if (nameComparison !== 0) {
        return nameComparison;
    }

    const unitComparison = a.unit.localeCompare(b.unit);
    if (unitComparison !== 0) {
        return unitComparison;
    }

    return a.name.localeCompare(b.name);
};

export function resolveGroceryListAggregation(selectedMeals = []) {
    if (typeof selectedMeals === 'undefined' || selectedMeals === null) {
        return {
            status: 'empty',
            items: [],
            error: null,
        };
    }

    if (!Array.isArray(selectedMeals)) {
        return createInvalidAggregationResult();
    }

    const cachedAggregation = groceryListAggregationCache.get(selectedMeals);
    if (cachedAggregation) {
        return cloneGroceryListAggregationResult(cachedAggregation);
    }

    if (selectedMeals.length === 0) {
        const emptyResult = {
            status: 'empty',
            items: [],
            error: null,
        };
        groceryListAggregationCache.set(selectedMeals, emptyResult);
        return cloneGroceryListAggregationResult(emptyResult);
    }

    const aggregatedItems = new Map();
    let sawIngredient = false;

    for (const meal of selectedMeals) {
        const ingredientList = readIngredientList(meal);
        if (ingredientList.invalid) {
            return createInvalidAggregationResult();
        }

        const servings = normalizeShoppingListServings(meal?.servings);

        for (const ingredient of ingredientList.ingredients) {
            const normalizedIngredient = normalizeShoppingListIngredient(ingredient);
            if (!normalizedIngredient) {
                const invalidResult = createInvalidAggregationResult();
                groceryListAggregationCache.set(selectedMeals, invalidResult);
                return cloneGroceryListAggregationResult(invalidResult);
            }

            sawIngredient = true;
            const key = `${normalizedIngredient.normalizedName}|${normalizedIngredient.unit}`;
            const existing = aggregatedItems.get(key);

            if (existing) {
                existing.quantity += normalizedIngredient.quantity * servings;
                existing.sourceCount += 1;
                continue;
            }

            aggregatedItems.set(key, {
                ...normalizedIngredient,
                quantity: normalizedIngredient.quantity * servings,
            });
        }
    }

    if (!sawIngredient || aggregatedItems.size === 0) {
        return {
            status: 'empty',
            items: [],
            error: null,
        };
    }

    const items = [...aggregatedItems.values()].sort(compareShoppingListItems);

    const resolvedResult = {
        status: 'resolved',
        items,
        error: null,
    };

    groceryListAggregationCache.set(selectedMeals, resolvedResult);
    return cloneGroceryListAggregationResult(resolvedResult);
}

const cloneGroceryListExportResult = (result) => ({
    status: result.status,
    items: Array.isArray(result.items)
        ? result.items.map((item) => ({ ...item }))
        : result.items,
    error: result.error,
});

const compareGroceryListExportMeals = (a, b) => {
    const idComparison = String(a?.id ?? a?._id ?? '').localeCompare(String(b?.id ?? b?._id ?? ''));
    if (idComparison !== 0) {
        return idComparison;
    }

    return String(a?.mealName ?? '').localeCompare(String(b?.mealName ?? ''));
};

export function resolveGroceryListExport(selectedMeals = []) {
    if (typeof selectedMeals === 'undefined' || selectedMeals === null) {
        return {
            status: 'empty',
            items: [],
            error: null,
        };
    }

    if (!Array.isArray(selectedMeals)) {
        return createInvalidExportResult();
    }

    const cachedExport = groceryListExportCache.get(selectedMeals);
    if (cachedExport) {
        return cloneGroceryListExportResult(cachedExport);
    }

    if (selectedMeals.length === 0) {
        const emptyResult = {
            status: 'empty',
            items: [],
            error: null,
        };
        groceryListExportCache.set(selectedMeals, emptyResult);
        return cloneGroceryListExportResult(emptyResult);
    }

    // Keep export canonical when hydrated meal order changes across refreshes.
    const mealsToExport = [...selectedMeals].sort(compareGroceryListExportMeals);
    const aggregatedItems = new Map();
    let sawIngredient = false;

    for (const meal of mealsToExport) {
        const ingredientList = readIngredientList(meal);
        if (ingredientList.invalid) {
            return createInvalidExportResult();
        }

        const servings = normalizeShoppingListServings(meal?.servings);
        const mealNotes = normalizeShoppingListExportText(meal?.notes);

        for (const ingredient of ingredientList.ingredients) {
            const normalizedIngredient = normalizeShoppingListExportIngredient(meal, ingredient, mealNotes);
            if (!normalizedIngredient) {
                return createInvalidExportResult();
            }

            sawIngredient = true;
            const key = `${normalizedIngredient.normalizedName}|${normalizedIngredient.unit}`;
            const existing = aggregatedItems.get(key);

            if (existing) {
                existing.quantity += normalizedIngredient.quantity * servings;
                existing.sourceCount += 1;

                if (!existing.category && normalizedIngredient.category) {
                    existing.category = normalizedIngredient.category;
                }

                if (!existing.notes && normalizedIngredient.notes) {
                    existing.notes = normalizedIngredient.notes;
                }

                continue;
            }

            aggregatedItems.set(key, {
                ...normalizedIngredient,
                quantity: normalizedIngredient.quantity * servings,
            });
        }
    }

    if (!sawIngredient || aggregatedItems.size === 0) {
        return {
            status: 'empty',
            items: [],
            error: null,
        };
    }

    const items = [...aggregatedItems.values()].sort(compareShoppingListItems);

    const resolvedResult = {
        status: 'resolved',
        items,
        error: null,
    };

    groceryListExportCache.set(selectedMeals, resolvedResult);
    return cloneGroceryListExportResult(resolvedResult);
}
