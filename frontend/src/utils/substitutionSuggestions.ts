// @ts-nocheck
import { collectCanonicalAllergies, mealHasAllergenConflict } from './allergyPreferences';

const SUBSTITUTION_SUGGESTION_ERROR_MESSAGES = {
    invalidPayload: 'We could not read your substitution suggestions. Please refresh the planner.',
};

const DEFAULT_SUBSTITUTION_CURRENCY = 'USD';

export class SubstitutionSuggestionsValidationError extends Error {
    constructor(code, message) {
        super(message);
        this.name = 'SubstitutionSuggestionsValidationError';
        this.code = code;
        this.isUserSafe = true;
    }
}

const createSubstitutionSuggestionsError = (code) => (
    new SubstitutionSuggestionsValidationError(
        code,
        SUBSTITUTION_SUGGESTION_ERROR_MESSAGES[code]
            || SUBSTITUTION_SUGGESTION_ERROR_MESSAGES.invalidPayload,
    )
);

const createInvalidSuggestionsResult = () => ({
    status: 'invalid',
    missingIngredient: null,
    items: null,
    error: createSubstitutionSuggestionsError('invalidPayload'),
});

const cloneSuggestionsResult = (result) => ({
    status: result.status,
    missingIngredient: result.missingIngredient,
    items: Array.isArray(result.items)
        ? result.items.map((item) => ({ ...item }))
        : result.items,
    error: result.error,
});

const normalizeSubstitutionText = (value) => {
    if (typeof value !== 'string') {
        return '';
    }

    return value.trim().replace(/\s+/g, ' ').toLowerCase();
};

const collectIngredientTexts = (ingredientSource) => {
    if (!Array.isArray(ingredientSource)) {
        return [];
    }

    const ingredientTexts = [];

    for (const ingredient of ingredientSource) {
        if (typeof ingredient === 'string') {
            const normalizedIngredient = normalizeSubstitutionText(ingredient);
            if (normalizedIngredient) {
                ingredientTexts.push(normalizedIngredient);
            }
            continue;
        }

        if (!ingredient || typeof ingredient !== 'object' || Array.isArray(ingredient)) {
            continue;
        }

        const normalizedIngredient = normalizeSubstitutionText(
            ingredient.canonicalName ?? ingredient.name ?? ingredient.label ?? '',
        );

        if (normalizedIngredient) {
            ingredientTexts.push(normalizedIngredient);
        }
    }

    return ingredientTexts;
};

export const collectCanonicalDisallowedIngredients = (user = {}) => {
    const disallowedIngredients = new Set();
    const sources = [
        user.dislikedIngredients,
        user.questionnaire?.disallowedIngredients,
        user.dietaryProfile?.excludedIngredients,
    ];

    for (const values of sources) {
        if (!Array.isArray(values)) {
            continue;
        }

        for (const value of values) {
            const normalizedValue = normalizeSubstitutionText(value);
            if (normalizedValue) {
                disallowedIngredients.add(normalizedValue);
            }
        }
    }

    return disallowedIngredients;
};

const collectCandidateSearchText = (candidate) => {
    const candidateIngredients = [
        ...collectIngredientTexts(candidate?.ingredients),
        ...collectIngredientTexts(candidate?.recipe?.ingredients),
    ];

    return [
        candidate?.mealName,
        candidate?.meal_name,
        candidate?.recipeName,
        candidate?.recipe_name,
        candidate?.name,
        candidate?.label,
        candidate?.description,
        candidate?.sourceName,
        candidate?.source_name,
        candidate?.nutritionFacts,
        candidate?.nutrition_facts,
        candidate?.servingSize,
        candidate?.serving_size,
        ...candidateIngredients,
    ]
        .map(normalizeSubstitutionText)
        .filter(Boolean)
        .join(' ');
};

const collectCandidateAllergens = (candidate) => {
    const allergens = [];
    const sources = [candidate?.allergens, candidate?.recipe?.allergens];

    for (const source of sources) {
        if (!Array.isArray(source)) {
            continue;
        }

        for (const allergen of source) {
            const normalizedAllergen = normalizeSubstitutionText(allergen);
            if (normalizedAllergen && !allergens.includes(normalizedAllergen)) {
                allergens.push(normalizedAllergen);
            }
        }
    }

    return allergens;
};

const collectCandidateDietaryTags = (candidate) => {
    const tags = [];
    const sources = [candidate?.dietaryTags, candidate?.recipe?.tags, candidate?.tags];

    for (const source of sources) {
        if (!Array.isArray(source)) {
            continue;
        }

        for (const tag of source) {
            const normalizedTag = normalizeSubstitutionText(tag);
            if (normalizedTag && !tags.includes(normalizedTag)) {
                tags.push(normalizedTag);
            }
        }
    }

    return tags;
};

const normalizeDietaryPattern = (value) => {
    if (typeof value !== 'string') {
        return '';
    }

    return value.trim().toUpperCase();
};

const normalizeMissingIngredient = (value) => {
    if (typeof value === 'string') {
        return normalizeSubstitutionText(value);
    }

    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        return '';
    }

    return normalizeSubstitutionText(value.canonicalName ?? value.name ?? value.label ?? '');
};

const collectCandidateSnapshot = (candidate) => {
    const recipe = candidate?.recipe;
    const recipeSnapshot = recipe && typeof recipe === 'object' && !Array.isArray(recipe)
        ? {
            ingredients: recipe.ingredients,
            allergens: recipe.allergens,
            dietaryTags: recipe.dietaryTags,
            tags: recipe.tags,
            currency: recipe.currency,
        }
        : recipe;

    return {
        id: candidate?.id,
        mealName: candidate?.mealName,
        meal_name: candidate?.meal_name,
        recipeName: candidate?.recipeName,
        recipe_name: candidate?.recipe_name,
        name: candidate?.name,
        label: candidate?.label,
        description: candidate?.description,
        sourceName: candidate?.sourceName,
        source_name: candidate?.source_name,
        nutritionFacts: candidate?.nutritionFacts,
        nutrition_facts: candidate?.nutrition_facts,
        servingSize: candidate?.servingSize,
        serving_size: candidate?.serving_size,
        ingredients: candidate?.ingredients,
        allergens: candidate?.allergens,
        dietaryTags: candidate?.dietaryTags,
        tags: candidate?.tags,
        nutrition: candidate?.nutrition,
        nutritionPerServing: candidate?.nutritionPerServing,
        calories: candidate?.calories,
        protein: candidate?.protein,
        carbohydrates: candidate?.carbohydrates,
        fat: candidate?.fat,
        fiber: candidate?.fiber,
        sugar: candidate?.sugar,
        sodium: candidate?.sodium,
        price: candidate?.price,
        estimatedPrice: candidate?.estimatedPrice,
        estimatedCost: candidate?.estimatedCost,
        costPerServing: candidate?.costPerServing,
        priceCurrency: candidate?.priceCurrency,
        currency: candidate?.currency,
        sourceType: candidate?.sourceType,
        source_type: candidate?.source_type,
        sourceKey: candidate?.sourceKey,
        recipe: recipeSnapshot,
    };
};

const hasMalformedCandidateCollections = (candidate) => {
    if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) {
        return true;
    }

    const topLevelCollectionFields = ['ingredients', 'allergens', 'dietaryTags', 'tags'];

    for (const field of topLevelCollectionFields) {
        if (candidate[field] !== undefined && !Array.isArray(candidate[field])) {
            return true;
        }
    }

    if (candidate.recipe !== undefined) {
        if (!candidate.recipe || typeof candidate.recipe !== 'object' || Array.isArray(candidate.recipe)) {
            return true;
        }

        for (const field of topLevelCollectionFields) {
            if (candidate.recipe[field] !== undefined && !Array.isArray(candidate.recipe[field])) {
                return true;
            }
        }
    }

    return false;
};

const normalizeCandidateSourceType = (candidate) => {
    if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) {
        return 'unknown';
    }

    const normalizedSourceType = normalizeSubstitutionText(candidate.sourceType ?? candidate.source_type ?? '');
    if (normalizedSourceType) {
        if (['menuitem', 'menu item', 'menu_item', 'menu'].includes(normalizedSourceType)) {
            return 'menuItem';
        }

        if (normalizedSourceType === 'recipe') {
            return 'recipe';
        }

        if (normalizedSourceType === 'unknown') {
            return 'unknown';
        }
    }

    if (typeof candidate.recipeName === 'string' && candidate.recipeName.trim() && !candidate.mealName) {
        return 'recipe';
    }

    if (
        (typeof candidate.mealName === 'string' && candidate.mealName.trim())
        || (typeof candidate.meal_name === 'string' && candidate.meal_name.trim())
    ) {
        return 'menuItem';
    }

    if (candidate.recipe && typeof candidate.recipe === 'object' && !Array.isArray(candidate.recipe)) {
        return 'recipe';
    }

    return 'unknown';
};

const cloneNutrition = (candidate) => {
    const nutritionSource = candidate?.nutrition ?? candidate?.nutritionPerServing;

    if (nutritionSource && typeof nutritionSource === 'object' && !Array.isArray(nutritionSource)) {
        const plainNutritionSource = typeof nutritionSource.toObject === 'function'
            ? nutritionSource.toObject({ depopulate: true, versionKey: false })
            : nutritionSource;

        return Object.fromEntries(
            Object.entries(plainNutritionSource)
                .filter(([key]) => !key.startsWith('$') && !key.startsWith('_'))
                .map(([key, value]) => {
                    const numericValue = Number(value);
                    return [key, Number.isFinite(numericValue) ? numericValue : value];
                }),
        );
    }

    const topLevelNutritionFields = [
        'calories',
        'protein',
        'carbohydrates',
        'fat',
        'fiber',
        'sugar',
        'sodium',
    ];
    const nutrition = {};

    for (const field of topLevelNutritionFields) {
        if (candidate?.[field] === undefined) {
            continue;
        }

        const numericValue = Number(candidate[field]);
        nutrition[field] = Number.isFinite(numericValue) ? numericValue : candidate[field];
    }

    return Object.keys(nutrition).length > 0 ? nutrition : null;
};

const normalizeCandidatePrice = (candidate) => {
    const priceSources = [
        candidate?.price,
        candidate?.estimatedPrice,
        candidate?.estimatedCost,
        candidate?.costPerServing,
    ];

    for (const priceSource of priceSources) {
        if (priceSource === undefined || priceSource === null || priceSource === '') {
            continue;
        }

        const numericPrice = Number(priceSource);
        if (Number.isFinite(numericPrice) && numericPrice >= 0) {
            return numericPrice;
        }
    }

    return 0;
};

const normalizeCandidateCurrency = (candidate) => {
    const currencySource = candidate?.priceCurrency ?? candidate?.currency ?? candidate?.recipe?.currency;

    if (typeof currencySource !== 'string') {
        return DEFAULT_SUBSTITUTION_CURRENCY;
    }

    const normalizedCurrency = currencySource.trim().toUpperCase();
    return normalizedCurrency || DEFAULT_SUBSTITUTION_CURRENCY;
};

const normalizeCandidateName = (candidate) => {
    const candidateName = candidate?.mealName
        ?? candidate?.meal_name
        ?? candidate?.recipeName
        ?? candidate?.recipe_name
        ?? candidate?.name
        ?? candidate?.label
        ?? '';
    return typeof candidateName === 'string' ? candidateName.trim() : '';
};

const normalizeSubstitutionCandidate = (candidate) => {
    const candidateSnapshot = collectCandidateSnapshot(candidate);

    if (hasMalformedCandidateCollections(candidateSnapshot)) {
        return null;
    }

    const name = normalizeCandidateName(candidateSnapshot);
    const normalizedName = normalizeSubstitutionText(name);

    if (!normalizedName) {
        return null;
    }

    const sourceKey = typeof candidateSnapshot.sourceKey === 'string' && candidateSnapshot.sourceKey.trim()
        ? candidateSnapshot.sourceKey.trim()
        : '';
    const id = typeof candidateSnapshot.id === 'string' && candidateSnapshot.id.trim()
        ? candidateSnapshot.id.trim()
        : sourceKey || normalizedName;

    return {
        item: {
            id,
            name,
            normalizedName,
            sourceType: normalizeCandidateSourceType(candidateSnapshot),
            price: normalizeCandidatePrice(candidateSnapshot),
            currency: normalizeCandidateCurrency(candidateSnapshot),
            allergens: collectCandidateAllergens(candidateSnapshot),
            dietaryTags: collectCandidateDietaryTags(candidateSnapshot),
            nutrition: cloneNutrition(candidateSnapshot),
        },
        snapshot: candidateSnapshot,
    };
};

export const candidateHasIngredientConflict = (candidate, disallowedIngredients) => {
    if (!(disallowedIngredients instanceof Set) || disallowedIngredients.size === 0) {
        return false;
    }

    const searchableText = collectCandidateSearchText(candidate);
    if (!searchableText) {
        return false;
    }

    for (const ingredient of disallowedIngredients) {
        if (searchableText.includes(ingredient)) {
            return true;
        }
    }

    return false;
};

export const candidateMatchesDietaryPattern = (
    candidate,
    dietaryPattern,
    { failClosedOnMissingTags = false } = {},
) => {
    const normalizedPattern = normalizeDietaryPattern(dietaryPattern);
    if (!normalizedPattern) {
        return true;
    }

    const tags = collectCandidateDietaryTags(candidate);
    if (tags.length === 0) {
        return !failClosedOnMissingTags;
    }

    switch (normalizedPattern) {
        case 'VEGETARIAN':
            return tags.includes('vegetarian') || !tags.some((tag) => (
                ['meat', 'chicken', 'beef', 'pork', 'fish', 'seafood'].includes(tag)
            ));
        case 'VEGAN':
            return tags.includes('vegan') || (
                tags.includes('vegetarian')
                && !tags.some((tag) => ['dairy', 'cheese', 'milk', 'egg'].includes(tag))
            );
        case 'KETO':
            return tags.includes('keto') || tags.includes('low-carb');
        case 'PALEO':
            return tags.includes('paleo');
        case 'MEDITERRANEAN':
            return tags.includes('mediterranean');
        case 'LOW_CARB':
            return tags.includes('low-carb') || tags.includes('keto');
        case 'LOW_FAT':
            return tags.includes('low-fat');
        case 'DIABETES_FRIENDLY':
            return tags.includes('diabetes-friendly') || tags.includes('low-sugar');
        case 'HEART_HEALTHY':
            return tags.includes('heart-healthy') || tags.includes('low-sodium');
        case 'GLUTEN_FREE':
            return tags.includes('gluten_free') || tags.includes('gluten-free');
        case 'DAIRY_FREE':
            return tags.includes('dairy_free') || tags.includes('dairy-free');
        default:
            return true;
    }
};

export function resolveSubstitutionSuggestions({
    missingIngredient = null,
    candidates = [],
    user = {},
} = {}) {
    if (
        missingIngredient === null
        || missingIngredient === undefined
        || !Array.isArray(candidates)
        || !user
        || typeof user !== 'object'
        || Array.isArray(user)
    ) {
        return createInvalidSuggestionsResult();
    }

    const normalizedMissingIngredient = normalizeMissingIngredient(missingIngredient);
    if (!normalizedMissingIngredient) {
        return createInvalidSuggestionsResult();
    }

    const userAllergies = collectCanonicalAllergies(user);
    const disallowedIngredients = collectCanonicalDisallowedIngredients(user);
    const dietaryPattern = user.questionnaire?.dietaryPattern;

    const items = [];

    for (const candidate of candidates) {
        const normalizedCandidate = normalizeSubstitutionCandidate(candidate);
        if (!normalizedCandidate) {
            return createInvalidSuggestionsResult();
        }

        const { item, snapshot } = normalizedCandidate;
        const candidateAllergens = item.allergens;
        if (mealHasAllergenConflict(candidateAllergens, userAllergies)) {
            continue;
        }

        if (candidateHasIngredientConflict(snapshot, disallowedIngredients)) {
            continue;
        }

        if (!candidateMatchesDietaryPattern(snapshot, dietaryPattern)) {
            continue;
        }

        items.push(item);
    }

    if (items.length === 0) {
        return cloneSuggestionsResult({
            status: 'empty',
            missingIngredient: normalizedMissingIngredient,
            items: [],
            error: null,
        });
    }

    return cloneSuggestionsResult({
        status: 'resolved',
        missingIngredient: normalizedMissingIngredient,
        items,
        error: null,
    });
}

const SUBSTITUTION_SUGGESTION_FEEDBACK_MIN_HEIGHT = 56;
const SUBSTITUTION_SUGGESTION_FEEDBACK_SURFACE_STYLES = {
    error: {
        backgroundColor: 'rgba(244, 67, 54, 0.08)',
        border: '1px solid rgba(244, 67, 54, 0.2)',
    },
    success: {
        backgroundColor: 'rgba(76, 175, 80, 0.08)',
        border: '1px solid rgba(76, 175, 80, 0.2)',
    },
    neutral: {
        backgroundColor: 'transparent',
        border: '1px solid transparent',
    },
};

const SUBSTITUTION_SUGGESTION_LOADING_MESSAGE = 'Finding substitution suggestions...';
const SUBSTITUTION_SUGGESTION_EMPTY_PROMPT_TITLE = 'No ingredient selected yet.';
const SUBSTITUTION_SUGGESTION_EMPTY_PROMPT_MESSAGE = 'Enter a missing ingredient to see substitution suggestions.';
const SUBSTITUTION_SUGGESTION_EMPTY_TITLE = 'No substitution suggestions found.';
const SUBSTITUTION_SUGGESTION_EMPTY_MESSAGE = (missingIngredient = '') => (
    missingIngredient
        ? `No substitution suggestions found for "${missingIngredient}".`
        : SUBSTITUTION_SUGGESTION_EMPTY_PROMPT_MESSAGE
);
const SUBSTITUTION_SUGGESTION_SUCCESS_TITLE = 'Substitution suggestions ready.';
const SUBSTITUTION_SUGGESTION_SUCCESS_MESSAGE = (count = 0, missingIngredient = '') => (
    count === 1
        ? `Showing 1 substitution suggestion for "${missingIngredient}".`
        : `Showing ${count} substitution suggestions for "${missingIngredient}".`
);
const SUBSTITUTION_SUGGESTION_ERROR_TITLE = 'Substitution suggestions unavailable.';

const isUserSafeError = (error) => (
    Boolean(
        error
        && typeof error === 'object'
        && error.isUserSafe === true
        && typeof error.message === 'string'
        && error.message.trim(),
    )
);

const createSubstitutionSuggestionsFeedbackState = ({
    state,
    title = null,
    message = null,
    actionLabel = null,
    actionKind = null,
    role = 'status',
    ariaLive = 'polite',
    ariaBusy = 'false',
    showSpinner = false,
    error = null,
}) => ({
    state,
    title,
    message,
    actionLabel,
    actionKind,
    role,
    ariaLive,
    ariaBusy,
    minHeight: SUBSTITUTION_SUGGESTION_FEEDBACK_MIN_HEIGHT,
    showSpinner,
    error,
});

const getNormalizedSubstitutionMissingIngredient = (suggestionsState, missingIngredient) => (
    normalizeSubstitutionText(
        suggestionsState?.missingIngredient
        ?? missingIngredient
        ?? '',
    )
);

const getSubstitutionSuggestionsErrorMessage = (error) => (
    isUserSafeError(error)
        ? error.message.trim()
        : SUBSTITUTION_SUGGESTION_ERROR_MESSAGES.invalidPayload
);

const getSubstitutionSuggestionCount = (suggestionsState) => (
    Array.isArray(suggestionsState?.items) ? suggestionsState.items.length : 0
);

export function buildSubstitutionSuggestionsFeedbackState({
    isLoading = false,
    suggestionsState = null,
    missingIngredient = '',
} = {}) {
    if (isLoading) {
        return createSubstitutionSuggestionsFeedbackState({
            state: 'loading',
            message: SUBSTITUTION_SUGGESTION_LOADING_MESSAGE,
            ariaBusy: 'true',
            showSpinner: true,
        });
    }

    const normalizedMissingIngredient = getNormalizedSubstitutionMissingIngredient(
        suggestionsState,
        missingIngredient,
    );

    if (!suggestionsState || suggestionsState.status === 'empty') {
        return createSubstitutionSuggestionsFeedbackState({
            state: 'empty',
            title: normalizedMissingIngredient
                ? SUBSTITUTION_SUGGESTION_EMPTY_TITLE
                : SUBSTITUTION_SUGGESTION_EMPTY_PROMPT_TITLE,
            message: SUBSTITUTION_SUGGESTION_EMPTY_MESSAGE(normalizedMissingIngredient),
        });
    }

    if (suggestionsState.status === 'invalid') {
        return createSubstitutionSuggestionsFeedbackState({
            state: 'error',
            title: SUBSTITUTION_SUGGESTION_ERROR_TITLE,
            message: getSubstitutionSuggestionsErrorMessage(suggestionsState.error),
            role: 'alert',
            ariaLive: 'assertive',
            error: suggestionsState.error || null,
        });
    }

    if (suggestionsState.status === 'resolved') {
        const substitutionCount = getSubstitutionSuggestionCount(suggestionsState);
        return createSubstitutionSuggestionsFeedbackState({
            state: 'success',
            title: SUBSTITUTION_SUGGESTION_SUCCESS_TITLE,
            message: SUBSTITUTION_SUGGESTION_SUCCESS_MESSAGE(
                substitutionCount,
                normalizedMissingIngredient || 'the ingredient',
            ),
        });
    }

    return createSubstitutionSuggestionsFeedbackState({
        state: 'empty',
        title: SUBSTITUTION_SUGGESTION_EMPTY_PROMPT_TITLE,
        message: SUBSTITUTION_SUGGESTION_EMPTY_PROMPT_MESSAGE,
    });
}

export function buildSubstitutionSuggestionsFeedbackContainerStyles(state = 'empty') {
    if (state === 'success') {
        return SUBSTITUTION_SUGGESTION_FEEDBACK_SURFACE_STYLES.success;
    }

    if (state === 'error') {
        return SUBSTITUTION_SUGGESTION_FEEDBACK_SURFACE_STYLES.error;
    }

    return SUBSTITUTION_SUGGESTION_FEEDBACK_SURFACE_STYLES.neutral;
}
