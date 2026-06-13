// @ts-nocheck

const CRAWLER_QUEUE_FEEDBACK_MIN_HEIGHT = 56;

const CRAWLER_QUEUE_FEEDBACK_SURFACE_STYLES = {
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

const FULL_MEAL_COMPLETENESS_FAILURE_PATTERN = /expected at least \d+ ingredients for a full meal/i;
const NUTRITION_COMPLETENESS_FAILURE_PATTERN = /nutritionperserving\.|ingredients\[\d+\]\.nutrition\./i;
const INGREDIENT_NORMALIZATION_FAILURE_PATTERN = /ingredients\[\d+\]\.(?:quantity|unit|gramWeight)/i;
const DUPLICATE_DETECTION_FAILURE_PATTERN = /duplicate\s+(?:ingredient row|recipe\s*name|recipe source|key error)/i;
const INSTRUCTION_STRUCTURE_FAILURE_PATTERN = /instructions\.structure/i;

const CRAWLER_QUEUE_STATUS_ERROR_MESSAGES = {
    invalidPayload: 'Recipe crawler status is invalid. Please refresh.',
};

export class CrawlerQueueStatusValidationError extends Error {
    constructor(code, message) {
        super(message);
        this.name = 'CrawlerQueueStatusValidationError';
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

const createCrawlerQueueStatusValidationError = (code) => (
    new CrawlerQueueStatusValidationError(
        code,
        CRAWLER_QUEUE_STATUS_ERROR_MESSAGES[code] || CRAWLER_QUEUE_STATUS_ERROR_MESSAGES.invalidPayload,
    )
);

const isNonNegativeInteger = (value) => Number.isInteger(value) && value >= 0;

function isValidCrawlerQueueStatusPayload(recipeStatus) {
    if (!recipeStatus || typeof recipeStatus !== 'object' || Array.isArray(recipeStatus)) {
        return false;
    }

    const booleanFields = ['running', 'llm_available'];
    for (const field of booleanFields) {
        if (Object.prototype.hasOwnProperty.call(recipeStatus, field) && typeof recipeStatus[field] !== 'boolean') {
            return false;
        }
    }

    const stringFields = ['current_url', 'last_error', 'llm_model', 'started_at'];
    for (const field of stringFields) {
        if (
            Object.prototype.hasOwnProperty.call(recipeStatus, field)
            && recipeStatus[field] !== null
            && typeof recipeStatus[field] !== 'string'
        ) {
            return false;
        }
    }

    const integerFields = [
        'pages_crawled',
        'recipes_found',
        'searches_done',
        'errors',
        'total_recipes',
        'queue_pending',
        'queue_processing',
        'queue_done',
        'queue_failed',
    ];

    for (const field of integerFields) {
        if (Object.prototype.hasOwnProperty.call(recipeStatus, field) && !isNonNegativeInteger(recipeStatus[field])) {
            return false;
        }
    }

    return true;
}

export function validateCrawlerQueueStatusPayload(recipeStatus = {}) {
    if (!isValidCrawlerQueueStatusPayload(recipeStatus)) {
        return {
            valid: false,
            error: createCrawlerQueueStatusValidationError('invalidPayload'),
        };
    }

    return {
        valid: true,
        payload: recipeStatus,
    };
}

function normalizeCount(value) {
    return Number.isFinite(value) ? value : 0;
}

function formatQueueSummary(recipeStatus = {}) {
    const pending = normalizeCount(recipeStatus.queue_pending);
    const processing = normalizeCount(recipeStatus.queue_processing);
    const done = normalizeCount(recipeStatus.queue_done);
    const failed = normalizeCount(recipeStatus.queue_failed);
    const running = Boolean(recipeStatus.running);

    return {
        pending,
        processing,
        done,
        failed,
        running,
        total: pending + processing + done + failed,
    };
}

function pluralize(count, singular, plural) {
    return count === 1 ? singular : plural;
}

function isNutritionCompletenessFailure(lastError = '') {
    return NUTRITION_COMPLETENESS_FAILURE_PATTERN.test(String(lastError));
}

function isIngredientNormalizationFailure(lastError = '') {
    return INGREDIENT_NORMALIZATION_FAILURE_PATTERN.test(String(lastError));
}

function isDuplicateDetectionFailure(lastError = '') {
    return DUPLICATE_DETECTION_FAILURE_PATTERN.test(String(lastError));
}

function isInstructionStructureFailure(lastError = '') {
    return INSTRUCTION_STRUCTURE_FAILURE_PATTERN.test(String(lastError));
}

function isFullMealCompletenessFailure(lastError = '') {
    return FULL_MEAL_COMPLETENESS_FAILURE_PATTERN.test(String(lastError));
}

export function buildCrawlerQueueFeedbackState({
    isLoading = false,
    recipeStatus = null,
    errorMessage = '',
} = {}) {
    if (isLoading) {
        return {
            state: 'loading',
            message: 'Loading recipe queue status...',
            role: 'status',
            ariaLive: 'polite',
            minHeight: CRAWLER_QUEUE_FEEDBACK_MIN_HEIGHT,
            showSpinner: true,
        };
    }

    if (errorMessage) {
        return {
            state: 'error',
            message: errorMessage,
            role: 'alert',
            ariaLive: 'assertive',
            minHeight: CRAWLER_QUEUE_FEEDBACK_MIN_HEIGHT,
            showSpinner: false,
        };
    }

    if (!recipeStatus) {
        return {
            state: 'error',
            message: 'Could not load recipe queue status. Please try again.',
            role: 'alert',
            ariaLive: 'assertive',
            minHeight: CRAWLER_QUEUE_FEEDBACK_MIN_HEIGHT,
            showSpinner: false,
        };
    }

    const queueStatusValidation = validateCrawlerQueueStatusPayload(recipeStatus);
    if (!queueStatusValidation.valid) {
        return {
            state: 'error',
            message: queueStatusValidation.error.message,
            role: 'alert',
            ariaLive: 'assertive',
            minHeight: CRAWLER_QUEUE_FEEDBACK_MIN_HEIGHT,
            showSpinner: false,
        };
    }

    const summary = formatQueueSummary(queueStatusValidation.payload);
    const failedRecipes = Math.max(
        normalizeCount(queueStatusValidation.payload.queue_failed),
        normalizeCount(queueStatusValidation.payload.errors),
    );
    const lastError = typeof queueStatusValidation.payload.last_error === 'string'
        ? queueStatusValidation.payload.last_error
        : '';

    if (failedRecipes > 0) {
        const failureMessage = isDuplicateDetectionFailure(lastError)
            ? `Recipe crawler reported ${failedRecipes} failed recipes. Review duplicate title, ingredient, and source checks.`
            : isInstructionStructureFailure(lastError)
            ? `Recipe crawler reported ${failedRecipes} failed recipes. Review instruction structure and extraction details.`
            : isNutritionCompletenessFailure(lastError)
            ? `Recipe crawler reported ${failedRecipes} failed recipes. Review nutrition completeness and extraction details.`
            : isIngredientNormalizationFailure(lastError)
                ? `Recipe crawler reported ${failedRecipes} failed recipes. Review ingredient normalization and extraction details.`
                : isFullMealCompletenessFailure(lastError)
                    ? `Recipe crawler reported ${failedRecipes} failed recipes. Review full-meal completeness and extraction details.`
                : `Recipe crawler reported ${failedRecipes} failed recipes. Review paraphrase quality and extraction details.`;

        return {
            state: 'error',
            message: failureMessage,
            role: 'alert',
            ariaLive: 'assertive',
            minHeight: CRAWLER_QUEUE_FEEDBACK_MIN_HEIGHT,
            showSpinner: false,
        };
    }

    if (summary.total === 0 && !summary.running) {
        return {
            state: 'empty',
            message: 'No recipe crawl jobs are queued yet.',
            role: 'status',
            ariaLive: 'polite',
            minHeight: CRAWLER_QUEUE_FEEDBACK_MIN_HEIGHT,
            showSpinner: false,
        };
    }

    const mode = summary.running ? 'running' : 'idle';

    return {
        state: 'success',
        message: `Recipe crawler is ${mode} with ${summary.pending} ${pluralize(summary.pending, 'queued', 'queued')}, ${summary.processing} ${pluralize(summary.processing, 'processing', 'processing')}, ${summary.done} ${pluralize(summary.done, 'complete', 'complete')}, and ${summary.failed} ${pluralize(summary.failed, 'failed', 'failed')}.`,
        role: 'status',
        ariaLive: 'polite',
        minHeight: CRAWLER_QUEUE_FEEDBACK_MIN_HEIGHT,
        showSpinner: false,
    };
}

export function buildCrawlerQueueFeedbackContainerStyles(state = 'empty') {
    if (state === 'success') {
        return CRAWLER_QUEUE_FEEDBACK_SURFACE_STYLES.success;
    }

    if (state === 'error') {
        return CRAWLER_QUEUE_FEEDBACK_SURFACE_STYLES.error;
    }

    return CRAWLER_QUEUE_FEEDBACK_SURFACE_STYLES.neutral;
}
