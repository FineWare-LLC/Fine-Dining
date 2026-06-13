// @ts-nocheck
const ACTIVE_MEAL_PLAN_SELECTION_ERROR_MESSAGES = {
    missing: 'Open a meal plan link to continue.',
    invalid: 'We could not identify the selected meal plan. Please open the planner again.',
    conflict: 'Open only one meal plan link at a time.',
};

const ACTIVE_MEAL_PLAN_FEEDBACK_MIN_HEIGHT = 56;

const ACTIVE_MEAL_PLAN_FEEDBACK_SURFACE_STYLES = {
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

const ACTIVE_MEAL_PLAN_LOADING_MESSAGE = 'Checking your active meal plan...';
const ACTIVE_MEAL_PLAN_EMPTY_MESSAGE = ACTIVE_MEAL_PLAN_SELECTION_ERROR_MESSAGES.missing;

const MEAL_TYPE_ORDER = {
    BREAKFAST: 0,
    LUNCH: 1,
    DINNER: 2,
    SNACK: 3,
    DESSERT: 4,
    SIDE: 5,
};

const MEAL_PLAN_CALENDAR_ERROR_MESSAGES = {
    invalid: 'We could not read the meal plan schedule. Please refresh the planner.',
};

export class ActiveMealPlanSelectionError extends Error {
    constructor(code, message) {
        super(message);
        this.name = 'ActiveMealPlanSelectionError';
        this.code = code;
        this.isUserSafe = true;
    }
}

export class MealPlanCalendarValidationError extends Error {
    constructor(code, message) {
        super(message);
        this.name = 'MealPlanCalendarValidationError';
        this.code = code;
        this.isUserSafe = true;
    }
}

const normalizeActiveMealPlanQueryValue = (value) => {
    if (typeof value === 'undefined' || value === null) {
        return { value: null, invalid: false };
    }

    if (Array.isArray(value)) {
        return { value: null, invalid: true };
    }

    if (typeof value !== 'string') {
        return { value: null, invalid: true };
    }

    const trimmedValue = value.trim();
    if (!trimmedValue) {
        return { value: null, invalid: true };
    }

    return { value: trimmedValue, invalid: false };
};

const createActiveMealPlanSelectionError = (code) => {
    const message = ACTIVE_MEAL_PLAN_SELECTION_ERROR_MESSAGES[code]
        || ACTIVE_MEAL_PLAN_SELECTION_ERROR_MESSAGES.invalid;
    return new ActiveMealPlanSelectionError(code, message);
};

const createMealPlanCalendarValidationError = (code) => {
    const message = MEAL_PLAN_CALENDAR_ERROR_MESSAGES[code]
        || MEAL_PLAN_CALENDAR_ERROR_MESSAGES.invalid;
    return new MealPlanCalendarValidationError(code, message);
};

const normalizeMealPlanCalendarDate = (value) => {
    if (typeof value === 'undefined' || value === null) {
        return { value: null, invalid: false };
    }

    const normalizedDate = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(normalizedDate.getTime())) {
        return { value: null, invalid: true };
    }

    return { value: normalizedDate.toISOString(), invalid: false };
};

const normalizeMealPlanCalendarSlot = (slot) => {
    if (!slot || typeof slot !== 'object' || Array.isArray(slot)) {
        return { invalid: true };
    }

    const day = Number(slot.day);
    if (!Number.isInteger(day) || day < 1) {
        return { invalid: true };
    }

    const mealType = typeof slot.mealType === 'string'
        ? slot.mealType.trim().toUpperCase()
        : '';
    if (!Object.prototype.hasOwnProperty.call(MEAL_TYPE_ORDER, mealType)) {
        return { invalid: true };
    }

    const normalizedDate = normalizeMealPlanCalendarDate(slot.date);
    if (normalizedDate.invalid) {
        return { invalid: true };
    }

    return {
        invalid: false,
        day,
        slot: {
            ...slot,
            day,
            mealType,
            date: normalizedDate.value,
        },
    };
};

export function resolveActiveMealPlanSelection(query = {}) {
    const mealPlanId = normalizeActiveMealPlanQueryValue(query.mealPlanId);
    const planId = normalizeActiveMealPlanQueryValue(query.planId);

    if (mealPlanId.invalid || planId.invalid) {
        return {
            status: 'invalid',
            planId: null,
            error: createActiveMealPlanSelectionError('invalid'),
        };
    }

    if (mealPlanId.value && planId.value && mealPlanId.value !== planId.value) {
        return {
            status: 'conflict',
            planId: null,
            error: createActiveMealPlanSelectionError('conflict'),
        };
    }

    const resolvedPlanId = mealPlanId.value || planId.value || null;
    if (!resolvedPlanId) {
        return {
            status: 'empty',
            planId: null,
            error: null,
        };
    }

    return {
        status: 'resolved',
        planId: resolvedPlanId,
        error: null,
    };
}

export function buildActiveMealPlanFeedbackState({
    isLoading = false,
    selection = null,
    hasActiveMealPlanQuery = false,
    loadingMessage = ACTIVE_MEAL_PLAN_LOADING_MESSAGE,
    emptyMessage = ACTIVE_MEAL_PLAN_EMPTY_MESSAGE,
} = {}) {
    if (isLoading) {
        return {
            state: 'loading',
            message: loadingMessage,
            role: 'status',
            ariaLive: 'polite',
            minHeight: ACTIVE_MEAL_PLAN_FEEDBACK_MIN_HEIGHT,
            showSpinner: true,
        };
    }

    if (!hasActiveMealPlanQuery || !selection || selection.status === 'empty' || selection.status === 'missing') {
        return {
            state: 'empty',
            message: emptyMessage,
            role: 'status',
            ariaLive: 'polite',
            minHeight: ACTIVE_MEAL_PLAN_FEEDBACK_MIN_HEIGHT,
            showSpinner: false,
        };
    }

    if (selection.status === 'resolved' && selection.planId) {
        return {
            state: 'success',
            message: `Active meal plan: ${selection.planId}`,
            role: 'status',
            ariaLive: 'polite',
            minHeight: ACTIVE_MEAL_PLAN_FEEDBACK_MIN_HEIGHT,
            showSpinner: false,
        };
    }

    return {
        state: 'error',
        message: selection.status === 'conflict'
            ? ACTIVE_MEAL_PLAN_SELECTION_ERROR_MESSAGES.conflict
            : selection?.error?.message || ACTIVE_MEAL_PLAN_SELECTION_ERROR_MESSAGES.invalid,
        role: 'alert',
        ariaLive: 'assertive',
        minHeight: ACTIVE_MEAL_PLAN_FEEDBACK_MIN_HEIGHT,
        showSpinner: false,
    };
}

export function buildActiveMealPlanFeedbackContainerStyles(state = 'empty') {
    if (state === 'success') {
        return ACTIVE_MEAL_PLAN_FEEDBACK_SURFACE_STYLES.success;
    }

    if (state === 'error') {
        return ACTIVE_MEAL_PLAN_FEEDBACK_SURFACE_STYLES.error;
    }

    return ACTIVE_MEAL_PLAN_FEEDBACK_SURFACE_STYLES.neutral;
}

export function getActiveMealPlanRouteState(query = {}, { isLoading = false } = {}) {
    const selection = resolveActiveMealPlanSelection(query);
    const hasActiveMealPlanQuery = query.mealPlanId !== undefined || query.planId !== undefined;
    const feedback = buildActiveMealPlanFeedbackState({
        isLoading,
        selection,
        hasActiveMealPlanQuery,
    });
    const plannerHref = selection.status === 'resolved' && selection.planId
        ? `/planner?mealPlanId=${encodeURIComponent(selection.planId)}`
        : '/planner';

    return {
        selection,
        plannerHref,
        feedback,
        alertMessage: hasActiveMealPlanQuery ? feedback.message : null,
        alertSeverity: hasActiveMealPlanQuery
            ? (feedback.state === 'error' ? 'warning' : 'info')
            : null,
        hasActiveMealPlanQuery,
    };
}

export function resolveMealPlanCalendarState(slots = []) {
    if (typeof slots === 'undefined' || slots === null) {
        return {
            status: 'empty',
            dayGroups: {},
            error: null,
        };
    }

    if (!Array.isArray(slots)) {
        return {
            status: 'invalid',
            dayGroups: null,
            error: createMealPlanCalendarValidationError('invalid'),
        };
    }

    if (slots.length === 0) {
        return {
            status: 'empty',
            dayGroups: {},
            error: null,
        };
    }

    const groupedSlots = {};
    for (const slot of slots) {
        const normalizedSlot = normalizeMealPlanCalendarSlot(slot);
        if (normalizedSlot.invalid) {
            return {
                status: 'invalid',
                dayGroups: null,
                error: createMealPlanCalendarValidationError('invalid'),
            };
        }

        if (!groupedSlots[normalizedSlot.day]) {
            groupedSlots[normalizedSlot.day] = [];
        }

        groupedSlots[normalizedSlot.day].push(normalizedSlot.slot);
    }

    const dayGroups = Object.fromEntries(
        Object.keys(groupedSlots)
            .map((day) => Number(day))
            .sort((a, b) => a - b)
            .map((day) => [
                day,
                groupedSlots[day].sort(
                    (a, b) => (MEAL_TYPE_ORDER[a.mealType] ?? 9) - (MEAL_TYPE_ORDER[b.mealType] ?? 9),
                ),
            ]),
    );

    return {
        status: 'resolved',
        dayGroups,
        error: null,
    };
}

export function getPlanIdFromQuery(query = {}) {
    return resolveActiveMealPlanSelection(query).planId;
}
