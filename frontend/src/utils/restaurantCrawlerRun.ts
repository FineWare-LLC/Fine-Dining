// @ts-nocheck

import storage from './storage';

const RESTAURANT_CRAWLER_RUN_LIMIT_MIN = 1;
const RESTAURANT_CRAWLER_RUN_LIMIT_MAX = 200;
const RESTAURANT_CRAWLER_RUN_DEFAULT_LIMIT = 40;
export const RESTAURANT_CRAWLER_RUN_DRAFT_STORAGE_KEY = 'fineDining.restaurantCrawlerRunDraft';
const RESTAURANT_CRAWLER_RUN_FALLBACK_ERROR_MESSAGE = 'Restaurant crawler failed. Please refresh.';

export const DEFAULT_RESTAURANT_CRAWLER_RUN_DRAFT = Object.freeze({
    selectedSourceIds: [],
    dryRun: true,
    includeAggregators: true,
    limitPerSource: RESTAURANT_CRAWLER_RUN_DEFAULT_LIMIT,
});

const RESTAURANT_CRAWLER_RUN_ERROR_MESSAGES = {
    invalidPayload: 'Restaurant crawler run request is invalid. Please refresh.',
    invalidResponse: RESTAURANT_CRAWLER_RUN_FALLBACK_ERROR_MESSAGE,
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

export class RestaurantCrawlerRunResponseError extends Error {
    constructor(code, message = RESTAURANT_CRAWLER_RUN_FALLBACK_ERROR_MESSAGE) {
        super(message);
        this.name = 'RestaurantCrawlerRunResponseError';
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

function createRestaurantCrawlerRunResponseError(code, message) {
    return new RestaurantCrawlerRunResponseError(
        code,
        message || RESTAURANT_CRAWLER_RUN_ERROR_MESSAGES[code] || RESTAURANT_CRAWLER_RUN_FALLBACK_ERROR_MESSAGE,
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

function normalizeCrawlerDraftLimit(limitPerSource, fallback = RESTAURANT_CRAWLER_RUN_DEFAULT_LIMIT) {
    const normalizedLimit = normalizeLimitPerSource(limitPerSource);

    if (
        !Number.isInteger(normalizedLimit)
        || normalizedLimit < RESTAURANT_CRAWLER_RUN_LIMIT_MIN
        || normalizedLimit > RESTAURANT_CRAWLER_RUN_LIMIT_MAX
    ) {
        return fallback;
    }

    return normalizedLimit;
}

function isNonEmptyString(value) {
    return typeof value === 'string' && value.trim().length > 0;
}

function normalizeCrawlerDraftSourceIds(sourceIds) {
    if (!Array.isArray(sourceIds)) {
        return [];
    }

    const seenIds = new Set();
    const normalizedSourceIds = [];

    for (const sourceId of sourceIds) {
        if (!isNonEmptyString(sourceId)) {
            continue;
        }

        const trimmedSourceId = sourceId.trim();
        if (seenIds.has(trimmedSourceId)) {
            continue;
        }

        seenIds.add(trimmedSourceId);
        normalizedSourceIds.push(trimmedSourceId);
    }

    return normalizedSourceIds;
}

function normalizeCrawlerSourceCatalog(sourceCatalog = []) {
    if (!Array.isArray(sourceCatalog)) {
        return {
            availableSourceIds: [],
            officialSourceIds: [],
        };
    }

    const availableIds = new Set();
    const officialIds = [];

    for (const source of sourceCatalog) {
        if (!source || typeof source !== 'object') {
            continue;
        }

        const sourceId = typeof source.id === 'string' ? source.id.trim() : '';
        if (!sourceId || availableIds.has(sourceId)) {
            continue;
        }

        availableIds.add(sourceId);
        if (source.source_type === 'official') {
            officialIds.push(sourceId);
        }
    }

    return {
        availableSourceIds: Array.from(availableIds),
        officialSourceIds: officialIds,
    };
}

function isPlainObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function normalizeCrawlerDraftBoolean(value, fallback) {
    if (typeof value === 'boolean') {
        return value;
    }

    return fallback;
}

export function normalizeRestaurantCrawlerRunDraft(draft = {}) {
    const normalizedDraft = isPlainObject(draft) ? draft : {};

    return {
        selectedSourceIds: normalizeCrawlerDraftSourceIds(normalizedDraft.selectedSourceIds ?? normalizedDraft.sourceIds),
        dryRun: normalizeCrawlerDraftBoolean(
            normalizedDraft.dryRun,
            DEFAULT_RESTAURANT_CRAWLER_RUN_DRAFT.dryRun,
        ),
        includeAggregators: normalizeCrawlerDraftBoolean(
            normalizedDraft.includeAggregators,
            DEFAULT_RESTAURANT_CRAWLER_RUN_DRAFT.includeAggregators,
        ),
        limitPerSource: normalizeCrawlerDraftLimit(
            normalizedDraft.limitPerSource,
            DEFAULT_RESTAURANT_CRAWLER_RUN_DRAFT.limitPerSource,
        ),
    };
}

export function resolveRestaurantCrawlerRunDraft(draft = {}, sourceCatalog = []) {
    const canonicalDraft = normalizeRestaurantCrawlerRunDraft(draft);
    const { availableSourceIds, officialSourceIds } = normalizeCrawlerSourceCatalog(sourceCatalog);

    if (availableSourceIds.length === 0) {
        return canonicalDraft;
    }

    const availableSourceIdSet = new Set(availableSourceIds);
    const filteredSourceIds = canonicalDraft.selectedSourceIds.filter(sourceId => availableSourceIdSet.has(sourceId));

    return {
        ...canonicalDraft,
        selectedSourceIds: filteredSourceIds.length > 0 ? filteredSourceIds : officialSourceIds,
    };
}

export function parseRestaurantCrawlerRunDraft(serializedDraft, sourceCatalog = []) {
    if (typeof serializedDraft !== 'string' || !serializedDraft.trim()) {
        return resolveRestaurantCrawlerRunDraft(DEFAULT_RESTAURANT_CRAWLER_RUN_DRAFT, sourceCatalog);
    }

    try {
        const parsedDraft = JSON.parse(serializedDraft);
        return resolveRestaurantCrawlerRunDraft(parsedDraft, sourceCatalog);
    } catch {
        return resolveRestaurantCrawlerRunDraft(DEFAULT_RESTAURANT_CRAWLER_RUN_DRAFT, sourceCatalog);
    }
}

export function loadRestaurantCrawlerRunDraft(storageAdapter = storage.localStorage, sourceCatalog = []) {
    if (!storageAdapter || typeof storageAdapter.getItem !== 'function') {
        return resolveRestaurantCrawlerRunDraft(DEFAULT_RESTAURANT_CRAWLER_RUN_DRAFT, sourceCatalog);
    }

    try {
        return parseRestaurantCrawlerRunDraft(
            storageAdapter.getItem(RESTAURANT_CRAWLER_RUN_DRAFT_STORAGE_KEY),
            sourceCatalog,
        );
    } catch {
        return resolveRestaurantCrawlerRunDraft(DEFAULT_RESTAURANT_CRAWLER_RUN_DRAFT, sourceCatalog);
    }
}

export function persistRestaurantCrawlerRunDraft(
    storageAdapter = storage.localStorage,
    draft = DEFAULT_RESTAURANT_CRAWLER_RUN_DRAFT,
    sourceCatalog = [],
) {
    const canonicalDraft = resolveRestaurantCrawlerRunDraft(draft, sourceCatalog);

    if (!storageAdapter || typeof storageAdapter.setItem !== 'function') {
        return canonicalDraft;
    }

    try {
        const writeResult = storageAdapter.setItem(
            RESTAURANT_CRAWLER_RUN_DRAFT_STORAGE_KEY,
            JSON.stringify(canonicalDraft),
        );

        if (writeResult === false) {
            return canonicalDraft;
        }
    } catch {
        return canonicalDraft;
    }

    return canonicalDraft;
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

function normalizeRestaurantCrawlerRunFailureDetail(detail) {
    if (typeof detail !== 'string') {
        return RESTAURANT_CRAWLER_RUN_FALLBACK_ERROR_MESSAGE;
    }

    const trimmedDetail = detail.trim();
    return trimmedDetail || RESTAURANT_CRAWLER_RUN_FALLBACK_ERROR_MESSAGE;
}

async function readRestaurantCrawlerRunResponseBody(response) {
    if (!response || typeof response.json !== 'function') {
        return null;
    }

    try {
        return await response.json();
    } catch {
        return null;
    }
}

export async function readRestaurantCrawlerRunResponse(response) {
    if (!response || typeof response !== 'object') {
        throw createRestaurantCrawlerRunResponseError('invalidResponse');
    }

    const body = await readRestaurantCrawlerRunResponseBody(response);

    if (!response.ok) {
        const detail = normalizeRestaurantCrawlerRunFailureDetail(body?.detail ?? body?.message);
        throw createRestaurantCrawlerRunResponseError('invalidResponse', detail);
    }

    if (!body || typeof body !== 'object' || Array.isArray(body)) {
        throw createRestaurantCrawlerRunResponseError('invalidResponse');
    }

    return body;
}
