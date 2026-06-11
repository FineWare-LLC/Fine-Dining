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

const MEAL_PLAN_COMPARISON_ERROR_MESSAGES = {
    invalidPayload: 'We could not read the meal plan comparison. Please refresh the planner.',
};

const MEAL_PLAN_CALENDAR_FEEDBACK_MIN_HEIGHT = 56;
const MEAL_PLAN_COMPARISON_FEEDBACK_MIN_HEIGHT = 56;
const MEAL_PLAN_COMPARISON_FEEDBACK_SURFACE_STYLES = {
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
const MEAL_PLAN_CALENDAR_FEEDBACK_SURFACE_STYLES = {
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
const MEAL_PLAN_CALENDAR_LOADING_MESSAGE = 'Loading meal plan calendars...';
const MEAL_PLAN_CALENDAR_EMPTY_MESSAGE = 'No meal plans yet. Generate one above!';
const MEAL_PLAN_COMPARISON_LOADING_MESSAGE = 'Loading meal plan comparisons...';
const MEAL_PLAN_COMPARISON_EMPTY_MESSAGE = 'Generate your first meal plan to start comparing tradeoffs.';
const MEAL_REPLACEMENT_LOADING_MESSAGE = 'Finding similar meals...';
const MEAL_REPLACEMENT_EMPTY_MESSAGE = 'No similar meals found that match your dietary preferences.';
const MEAL_REPLACEMENT_ERROR_MESSAGE = 'Could not load similar meals. Please try again.';

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

export class MealPlanComparisonValidationError extends Error {
    constructor(code, message) {
        super(message);
        this.name = 'MealPlanComparisonValidationError';
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

const createMealPlanComparisonValidationError = (code) => {
    const message = MEAL_PLAN_COMPARISON_ERROR_MESSAGES[code]
        || MEAL_PLAN_COMPARISON_ERROR_MESSAGES.invalidPayload;
    return new MealPlanComparisonValidationError(code, message);
};

const normalizeMealPlanCalendarCount = (value) => (Number.isFinite(value) ? value : 0);
const normalizeMealPlanComparisonNumber = (value) => {
    if (typeof value === 'undefined' || value === null || value === '') {
        return null;
    }

    const normalizedValue = typeof value === 'number' ? value : Number(value);
    return Number.isFinite(normalizedValue) ? normalizedValue : null;
};

const normalizeMealPlanComparisonId = (value) => {
    if (typeof value !== 'string') {
        return null;
    }

    const trimmedValue = value.trim();
    return trimmedValue ? trimmedValue : null;
};

const cloneMealPlanComparisonPlan = (plan) => {
    if (typeof structuredClone === 'function') {
        return structuredClone(plan);
    }

    return JSON.parse(JSON.stringify(plan));
};

const normalizeMealPlanComparisonPlan = (plan) => {
    if (!plan || typeof plan !== 'object' || Array.isArray(plan)) {
        return { invalid: true };
    }

    const id = normalizeMealPlanComparisonId(plan.id);
    const totalCost = normalizeMealPlanComparisonNumber(plan.totalCost);
    const totalCalories = normalizeMealPlanComparisonNumber(plan.totalCalories);
    if (!id || totalCost === null || totalCalories === null) {
        return { invalid: true };
    }

    const normalizedSolverMeta = plan.solverMeta && typeof plan.solverMeta === 'object' && !Array.isArray(plan.solverMeta)
        ? {
            ...plan.solverMeta,
            feasible: plan.solverMeta.feasible === true,
            solveTimeMs: normalizeMealPlanComparisonNumber(plan.solverMeta.solveTimeMs),
        }
        : null;
    const normalizedPlan = cloneMealPlanComparisonPlan(plan);

    return {
        invalid: false,
        plan: {
            ...normalizedPlan,
            id,
            title: typeof plan.title === 'string' ? plan.title.trim() : plan.title,
            totalCost,
            totalCalories,
            solverMeta: normalizedSolverMeta,
        },
    };
};

const compareMealPlanComparisonPlans = (left, right) => {
    const leftFeasible = left.solverMeta?.feasible === true ? 1 : 0;
    const rightFeasible = right.solverMeta?.feasible === true ? 1 : 0;
    if (leftFeasible !== rightFeasible) {
        return rightFeasible - leftFeasible;
    }

    if (left.totalCost !== right.totalCost) {
        return left.totalCost - right.totalCost;
    }

    if (left.totalCalories !== right.totalCalories) {
        return left.totalCalories - right.totalCalories;
    }

    const leftSolveTime = Number.isFinite(left.solverMeta?.solveTimeMs)
        ? left.solverMeta.solveTimeMs
        : Number.POSITIVE_INFINITY;
    const rightSolveTime = Number.isFinite(right.solverMeta?.solveTimeMs)
        ? right.solverMeta.solveTimeMs
        : Number.POSITIVE_INFINITY;
    if (leftSolveTime !== rightSolveTime) {
        return leftSolveTime - rightSolveTime;
    }

    return left.id.localeCompare(right.id);
};

const compareMealPlanComparisonByCost = (left, right) => {
    if (left.totalCost !== right.totalCost) {
        return left.totalCost - right.totalCost;
    }

    if (left.totalCalories !== right.totalCalories) {
        return left.totalCalories - right.totalCalories;
    }

    const leftSolveTime = Number.isFinite(left.solverMeta?.solveTimeMs)
        ? left.solverMeta.solveTimeMs
        : Number.POSITIVE_INFINITY;
    const rightSolveTime = Number.isFinite(right.solverMeta?.solveTimeMs)
        ? right.solverMeta.solveTimeMs
        : Number.POSITIVE_INFINITY;
    if (leftSolveTime !== rightSolveTime) {
        return leftSolveTime - rightSolveTime;
    }

    return left.id.localeCompare(right.id);
};

const compareMealPlanComparisonByCalories = (left, right) => {
    if (left.totalCalories !== right.totalCalories) {
        return left.totalCalories - right.totalCalories;
    }

    if (left.totalCost !== right.totalCost) {
        return left.totalCost - right.totalCost;
    }

    const leftSolveTime = Number.isFinite(left.solverMeta?.solveTimeMs)
        ? left.solverMeta.solveTimeMs
        : Number.POSITIVE_INFINITY;
    const rightSolveTime = Number.isFinite(right.solverMeta?.solveTimeMs)
        ? right.solverMeta.solveTimeMs
        : Number.POSITIVE_INFINITY;
    if (leftSolveTime !== rightSolveTime) {
        return leftSolveTime - rightSolveTime;
    }

    return left.id.localeCompare(right.id);
};

const formatMealPlanCalendarSuccessMessage = (planCount) => (
    planCount === 1
        ? 'Showing 1 meal plan calendar.'
        : `Showing ${planCount} meal plan calendars.`
);

const formatMealPlanCalendarIssueMessage = (invalidPlanCount) => (
    invalidPlanCount === 1
        ? '1 meal plan has a schedule issue. Please refresh the planner.'
        : `${invalidPlanCount} meal plans have schedule issues. Please refresh the planner.`
);

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

export function buildMealPlanCalendarFeedbackState({
    isLoading = false,
    errorMessage = '',
    planCount = 0,
    invalidPlanCount = 0,
    loadingMessage = MEAL_PLAN_CALENDAR_LOADING_MESSAGE,
    emptyMessage = MEAL_PLAN_CALENDAR_EMPTY_MESSAGE,
} = {}) {
    if (isLoading) {
        return {
            state: 'loading',
            message: loadingMessage,
            role: 'status',
            ariaLive: 'polite',
            minHeight: MEAL_PLAN_CALENDAR_FEEDBACK_MIN_HEIGHT,
            showSpinner: true,
        };
    }

    if (errorMessage) {
        return {
            state: 'error',
            message: errorMessage,
            role: 'alert',
            ariaLive: 'assertive',
            minHeight: MEAL_PLAN_CALENDAR_FEEDBACK_MIN_HEIGHT,
            showSpinner: false,
        };
    }

    const safeInvalidPlanCount = normalizeMealPlanCalendarCount(invalidPlanCount);
    if (safeInvalidPlanCount > 0) {
        return {
            state: 'error',
            message: formatMealPlanCalendarIssueMessage(safeInvalidPlanCount),
            role: 'alert',
            ariaLive: 'assertive',
            minHeight: MEAL_PLAN_CALENDAR_FEEDBACK_MIN_HEIGHT,
            showSpinner: false,
        };
    }

    const safePlanCount = normalizeMealPlanCalendarCount(planCount);
    if (safePlanCount > 0) {
        return {
            state: 'success',
            message: formatMealPlanCalendarSuccessMessage(safePlanCount),
            role: 'status',
            ariaLive: 'polite',
            minHeight: MEAL_PLAN_CALENDAR_FEEDBACK_MIN_HEIGHT,
            showSpinner: false,
        };
    }

    return {
        state: 'empty',
        message: emptyMessage,
        role: 'status',
        ariaLive: 'polite',
        minHeight: MEAL_PLAN_CALENDAR_FEEDBACK_MIN_HEIGHT,
        showSpinner: false,
    };
}

export function buildMealPlanComparisonFeedbackState({
    isLoading = false,
    errorMessage = '',
    comparisonState = null,
    loadingMessage = MEAL_PLAN_COMPARISON_LOADING_MESSAGE,
    emptyMessage = MEAL_PLAN_COMPARISON_EMPTY_MESSAGE,
} = {}) {
    if (errorMessage) {
        return {
            state: 'error',
            message: errorMessage,
            role: 'alert',
            ariaLive: 'assertive',
            minHeight: MEAL_PLAN_COMPARISON_FEEDBACK_MIN_HEIGHT,
            showSpinner: false,
        };
    }

    if (comparisonState?.status === 'invalid') {
        return {
            state: 'error',
            message: comparisonState.error?.message || MEAL_PLAN_COMPARISON_ERROR_MESSAGES.invalidPayload,
            role: 'alert',
            ariaLive: 'assertive',
            minHeight: MEAL_PLAN_COMPARISON_FEEDBACK_MIN_HEIGHT,
            showSpinner: false,
        };
    }

    if (isLoading) {
        return {
            state: 'loading',
            message: loadingMessage,
            role: 'status',
            ariaLive: 'polite',
            minHeight: MEAL_PLAN_COMPARISON_FEEDBACK_MIN_HEIGHT,
            showSpinner: true,
        };
    }

    if (!comparisonState || comparisonState.status === 'empty') {
        return {
            state: 'empty',
            message: emptyMessage,
            role: 'status',
            ariaLive: 'polite',
            minHeight: MEAL_PLAN_COMPARISON_FEEDBACK_MIN_HEIGHT,
            showSpinner: false,
        };
    }

    return {
        state: 'resolved',
        message: null,
        role: 'status',
        ariaLive: 'polite',
        minHeight: MEAL_PLAN_COMPARISON_FEEDBACK_MIN_HEIGHT,
        showSpinner: false,
    };
}

export function buildMealPlanComparisonFeedbackContainerStyles(state = 'empty') {
    if (state === 'success' || state === 'resolved') {
        return MEAL_PLAN_COMPARISON_FEEDBACK_SURFACE_STYLES.success;
    }

    if (state === 'error') {
        return MEAL_PLAN_COMPARISON_FEEDBACK_SURFACE_STYLES.error;
    }

    return MEAL_PLAN_COMPARISON_FEEDBACK_SURFACE_STYLES.neutral;
}

export function buildMealPlanCalendarFeedbackContainerStyles(state = 'empty') {
    if (state === 'success') {
        return MEAL_PLAN_CALENDAR_FEEDBACK_SURFACE_STYLES.success;
    }

    if (state === 'error') {
        return MEAL_PLAN_CALENDAR_FEEDBACK_SURFACE_STYLES.error;
    }

    return MEAL_PLAN_CALENDAR_FEEDBACK_SURFACE_STYLES.neutral;
}

export function buildMealReplacementFeedbackState({
    isLoading = false,
    errorMessage = '',
    similarMealCount = 0,
    loadingMessage = MEAL_REPLACEMENT_LOADING_MESSAGE,
    emptyMessage = MEAL_REPLACEMENT_EMPTY_MESSAGE,
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

    if (errorMessage) {
        return {
            state: 'error',
            message: errorMessage || MEAL_REPLACEMENT_ERROR_MESSAGE,
            role: 'alert',
            ariaLive: 'assertive',
            minHeight: ACTIVE_MEAL_PLAN_FEEDBACK_MIN_HEIGHT,
            showSpinner: false,
        };
    }

    const safeSimilarMealCount = Number.isFinite(similarMealCount) ? similarMealCount : 0;
    if (safeSimilarMealCount > 0) {
        return {
            state: 'success',
            message: safeSimilarMealCount === 1
                ? 'Showing 1 similar meal.'
                : `Showing ${safeSimilarMealCount} similar meals.`,
            role: 'status',
            ariaLive: 'polite',
            minHeight: ACTIVE_MEAL_PLAN_FEEDBACK_MIN_HEIGHT,
            showSpinner: false,
        };
    }

    return {
        state: 'empty',
        message: emptyMessage,
        role: 'status',
        ariaLive: 'polite',
        minHeight: ACTIVE_MEAL_PLAN_FEEDBACK_MIN_HEIGHT,
        showSpinner: false,
    };
}

export function buildMealReplacementFeedbackContainerStyles(state = 'empty') {
    return buildActiveMealPlanFeedbackContainerStyles(state);
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

export function resolveMealPlanComparisonState(plans = []) {
    if (typeof plans === 'undefined' || plans === null) {
        return {
            status: 'empty',
            sortedPlans: [],
            summary: null,
            error: null,
        };
    }

    if (!Array.isArray(plans)) {
        return {
            status: 'invalid',
            sortedPlans: null,
            summary: null,
            error: createMealPlanComparisonValidationError('invalidPayload'),
        };
    }

    if (plans.length === 0) {
        return {
            status: 'empty',
            sortedPlans: [],
            summary: null,
            error: null,
        };
    }

    const normalizedPlans = [];
    for (const plan of plans) {
        const normalizedPlan = normalizeMealPlanComparisonPlan(plan);
        if (normalizedPlan.invalid) {
            return {
                status: 'invalid',
                sortedPlans: null,
                summary: null,
                error: createMealPlanComparisonValidationError('invalidPayload'),
            };
        }

        normalizedPlans.push(normalizedPlan.plan);
    }

    const sortedPlans = [...normalizedPlans].sort(compareMealPlanComparisonPlans);
    let cheapestPlan = normalizedPlans[0];
    let priciestPlan = normalizedPlans[0];
    let lowestCaloriesPlan = normalizedPlans[0];
    let highestCaloriesPlan = normalizedPlans[0];

    for (let index = 1; index < normalizedPlans.length; index += 1) {
        const plan = normalizedPlans[index];

        if (compareMealPlanComparisonByCost(plan, cheapestPlan) < 0) {
            cheapestPlan = plan;
        }

        if (compareMealPlanComparisonByCost(plan, priciestPlan) > 0) {
            priciestPlan = plan;
        }

        if (compareMealPlanComparisonByCalories(plan, lowestCaloriesPlan) < 0) {
            lowestCaloriesPlan = plan;
        }

        if (compareMealPlanComparisonByCalories(plan, highestCaloriesPlan) > 0) {
            highestCaloriesPlan = plan;
        }
    }

    return {
        status: 'resolved',
        sortedPlans,
        summary: {
            planCount: sortedPlans.length,
            feasiblePlanCount: sortedPlans.filter((plan) => plan.solverMeta?.feasible === true).length,
            cheapestPlanId: cheapestPlan.id,
            highestCostPlanId: priciestPlan.id,
            lowestCaloriesPlanId: lowestCaloriesPlan.id,
            highestCaloriesPlanId: highestCaloriesPlan.id,
            costSpread: priciestPlan.totalCost - cheapestPlan.totalCost,
            calorieSpread: highestCaloriesPlan.totalCalories - lowestCaloriesPlan.totalCalories,
        },
        error: null,
    };
}

export function getPlanIdFromQuery(query = {}) {
    return resolveActiveMealPlanSelection(query).planId;
}
