// @ts-nocheck

const RESTAURANT_CRAWLER_RUN_LIMIT_MIN = 1;
const RESTAURANT_CRAWLER_RUN_LIMIT_MAX = 200;

const RESTAURANT_CRAWLER_RUN_ERROR_MESSAGES = {
    invalidPayload: 'Restaurant crawler run request is invalid. Please refresh.',
};

export class RestaurantCrawlerRunValidationError extends Error {
    constructor(code, message) {
        super(message);
        this.name = 'RestaurantCrawlerRunValidationError';
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

function createRestaurantCrawlerRunValidationError(code) {
    return new RestaurantCrawlerRunValidationError(
        code,
        RESTAURANT_CRAWLER_RUN_ERROR_MESSAGES[code] || RESTAURANT_CRAWLER_RUN_ERROR_MESSAGES.invalidPayload,
    );
}

function normalizeLimitPerSource(limitPerSource) {
    if (typeof limitPerSource === 'number' && Number.isFinite(limitPerSource)) {
        return Math.trunc(limitPerSource);
    }

    if (typeof limitPerSource === 'string' && limitPerSource.trim()) {
        const parsed = Number(limitPerSource);
        if (Number.isFinite(parsed)) {
            return Math.trunc(parsed);
        }
    }

    return Number.NaN;
}

function isNonEmptyString(value) {
    return typeof value === 'string' && value.trim().length > 0;
}

function isValidRestaurantCrawlerRunPayload(payload) {
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
        return false;
    }

    if ('sourceIds' in payload) {
        if (!Array.isArray(payload.sourceIds) || payload.sourceIds.some(sourceId => !isNonEmptyString(sourceId))) {
            return false;
        }
    }

    if ('dryRun' in payload && typeof payload.dryRun !== 'boolean') {
        return false;
    }

    if (
        'includeAggregators' in payload
        && typeof payload.includeAggregators !== 'boolean'
        && payload.includeAggregators !== undefined
    ) {
        return false;
    }

    const normalizedLimit = normalizeLimitPerSource(payload.limitPerSource ?? 50);
    if (!Number.isInteger(normalizedLimit)) {
        return false;
    }

    if (
        normalizedLimit < RESTAURANT_CRAWLER_RUN_LIMIT_MIN
        || normalizedLimit > RESTAURANT_CRAWLER_RUN_LIMIT_MAX
    ) {
        return false;
    }

    return true;
}

export function validateRestaurantCrawlerRunRequest(payload = {}) {
    if (!isValidRestaurantCrawlerRunPayload(payload)) {
        return {
            valid: false,
            error: createRestaurantCrawlerRunValidationError('invalidPayload'),
        };
    }

    const sourceIds = Array.isArray(payload.sourceIds)
        ? payload.sourceIds.map(sourceId => sourceId.trim())
        : [];

    return {
        valid: true,
        payload: {
            source_ids: sourceIds,
            dry_run: payload.dryRun ?? true,
            limit_per_source: normalizeLimitPerSource(payload.limitPerSource ?? 50),
            include_aggregators: payload.includeAggregators,
        },
    };
}
