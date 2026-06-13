import { parse as parseCsv } from 'csv-parse/sync';

const DEFAULT_ERROR_MESSAGE = 'We could not read processed meal data. Please refresh the pipeline.';
const ALLERGEN_ERROR_MESSAGE = 'We could not read processed meal allergens. Please refresh the pipeline.';

const NUMERIC_FIELDS = [
    'price',
    'calories',
    'protein',
    'carbohydrates',
    'fat',
    'sodium',
    'protein_density',
    'carb_protein_ratio',
    'sodium_per_calorie',
    'price_per_protein',
    'health_score',
];

export class ProcessedMealsLoadError extends Error {
    constructor(code, message = DEFAULT_ERROR_MESSAGE) {
        super(message);
        this.name = 'ProcessedMealsLoadError';
        this.code = code;
        this.isUserSafe = true;
    }
}

const createProcessedMealsError = (code, message = DEFAULT_ERROR_MESSAGE) => (
    new ProcessedMealsLoadError(code, message)
);

const normalizeText = (value) => {
    if (typeof value !== 'string') {
        return value;
    }

    return value.trim();
};

const normalizeNumericField = (value, fieldName) => {
    if (value === undefined || value === null || value === '') {
        return null;
    }

    const numericValue = Number(value);

    if (!Number.isFinite(numericValue)) {
        throw createProcessedMealsError(
            'invalidPayload',
            `We could not read processed meal ${fieldName}. Please refresh the pipeline.`,
        );
    }

    return numericValue;
};

const normalizeAllergens = (value) => {
    if (value === undefined || value === null || value === '') {
        return [];
    }

    if (Array.isArray(value)) {
        return value.map(normalizeText).filter(Boolean);
    }

    if (typeof value !== 'string') {
        throw createProcessedMealsError('invalidPayload', ALLERGEN_ERROR_MESSAGE);
    }

    const trimmedValue = value.trim();
    if (!trimmedValue) {
        return [];
    }

    try {
        const parsedValue = JSON.parse(trimmedValue);

        if (Array.isArray(parsedValue)) {
            return parsedValue.map(normalizeText).filter(Boolean);
        }

        if (typeof parsedValue === 'string') {
            return normalizeAllergens(parsedValue);
        }
    } catch {
        // Fall through to the typed user-safe error below.
    }

    throw createProcessedMealsError('invalidPayload', ALLERGEN_ERROR_MESSAGE);
};

const normalizeProcessedMealRecord = (record, index = 0) => {
    if (!record || typeof record !== 'object' || Array.isArray(record)) {
        throw createProcessedMealsError(
            'invalidPayload',
            `We could not read processed meal row ${index + 1}. Please refresh the pipeline.`,
        );
    }

    const normalizedRecord = { ...record };

    for (const field of NUMERIC_FIELDS) {
        if (field in normalizedRecord) {
            normalizedRecord[field] = normalizeNumericField(normalizedRecord[field], field);
        }
    }

    normalizedRecord.allergens = normalizeAllergens(normalizedRecord.allergens);

    if (typeof normalizedRecord.chain !== 'string' || !normalizedRecord.chain.trim()) {
        throw createProcessedMealsError(
            'invalidPayload',
            `We could not read processed meal row ${index + 1}. Please refresh the pipeline.`,
        );
    }

    if (typeof normalizedRecord.meal_name !== 'string' || !normalizedRecord.meal_name.trim()) {
        throw createProcessedMealsError(
            'invalidPayload',
            `We could not read processed meal row ${index + 1}. Please refresh the pipeline.`,
        );
    }

    return normalizedRecord;
};

const normalizeProcessedMealRows = (rows) => {
    if (!Array.isArray(rows)) {
        throw createProcessedMealsError('invalidPayload');
    }

    return rows.map((row, index) => normalizeProcessedMealRecord(row, index));
};

export function parseProcessedMealsJson(content) {
    if (typeof content !== 'string' || !content.trim()) {
        throw createProcessedMealsError('invalidPayload');
    }

    try {
        const parsedContent = JSON.parse(content);
        return normalizeProcessedMealRows(parsedContent);
    } catch (error) {
        if (error instanceof ProcessedMealsLoadError) {
            throw error;
        }

        throw createProcessedMealsError('invalidPayload');
    }
}

export function parseProcessedMealsCsv(content) {
    if (typeof content !== 'string' || !content.trim()) {
        throw createProcessedMealsError('invalidPayload');
    }

    try {
        const parsedRows = parseCsv(content, {
            columns: true,
            skip_empty_lines: true,
            trim: true,
        });

        return normalizeProcessedMealRows(parsedRows);
    } catch (error) {
        if (error instanceof ProcessedMealsLoadError) {
            throw error;
        }

        throw createProcessedMealsError('invalidPayload');
    }
}
