// @ts-nocheck

const PLANNER_GENERATION_OBJECTIVES = new Set([
    'minimize_cost',
    'maximize_preference',
    'balanced',
]);

const PLANNER_GENERATION_ERROR_MESSAGES = {
    invalidStartDate: 'Choose a valid start date.',
    invalidDays: 'Choose at least one planning day.',
    invalidObjective: 'Choose a valid planning objective.',
};

export class PlannerGenerationValidationError extends Error {
    constructor(code, message) {
        super(message);
        this.name = 'PlannerGenerationValidationError';
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

const createPlannerGenerationValidationError = (code) => (
    new PlannerGenerationValidationError(
        code,
        PLANNER_GENERATION_ERROR_MESSAGES[code] || PLANNER_GENERATION_ERROR_MESSAGES.invalidStartDate,
    )
);

const normalizeString = (value) => (typeof value === 'string' ? value.trim() : '');

const normalizeDate = (value) => {
    if (typeof value === 'undefined' || value === null) {
        return { invalid: true };
    }

    const parsedDate = value instanceof Date ? new Date(value) : new Date(value);
    if (Number.isNaN(parsedDate.getTime())) {
        return { invalid: true };
    }

    return {
        invalid: false,
        value: parsedDate.toISOString(),
    };
};

const normalizeDays = (value) => {
    const parsedDays = Number(value);
    if (!Number.isFinite(parsedDays) || !Number.isInteger(parsedDays) || parsedDays < 1) {
        return { invalid: true };
    }

    return {
        invalid: false,
        value: parsedDays,
    };
};

export function resolvePlannerGenerationRequest({
    cookbookId,
    startDate,
    days,
    objective = 'minimize_cost',
    title = '',
} = {}) {
    const normalizedCookbookId = normalizeString(cookbookId);
    if (!normalizedCookbookId) {
        return {
            status: 'empty',
            request: null,
            error: null,
        };
    }

    const normalizedStartDate = normalizeDate(startDate);
    if (normalizedStartDate.invalid) {
        return {
            status: 'invalid',
            request: null,
            error: createPlannerGenerationValidationError('invalidStartDate'),
        };
    }

    const normalizedDays = normalizeDays(days);
    if (normalizedDays.invalid) {
        return {
            status: 'invalid',
            request: null,
            error: createPlannerGenerationValidationError('invalidDays'),
        };
    }

    const normalizedObjective = normalizeString(objective) || 'minimize_cost';
    if (!PLANNER_GENERATION_OBJECTIVES.has(normalizedObjective)) {
        return {
            status: 'invalid',
            request: null,
            error: createPlannerGenerationValidationError('invalidObjective'),
        };
    }

    const resolvedTitle = normalizeString(title) || `Meal Plan (${normalizedDays.value} days)`;
    const endDate = new Date(normalizedStartDate.value);
    endDate.setDate(endDate.getDate() + normalizedDays.value);

    return {
        status: 'resolved',
        request: {
            cookbookId: normalizedCookbookId,
            startDate: normalizedStartDate.value,
            endDate: endDate.toISOString(),
            title: resolvedTitle,
            objective: normalizedObjective,
        },
        error: null,
    };
}
