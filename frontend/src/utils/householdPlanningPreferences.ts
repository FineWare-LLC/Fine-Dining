// @ts-nocheck

const HOUSEHOLD_PLANNING_PREFERENCES_ERROR_MESSAGES = {
    invalidPayload: 'We could not read your household planning preferences. Please refresh the planner.',
    conflictingBudgetPreferences: 'Daily and weekly household budget preferences must agree.',
};

export class HouseholdPlanningPreferencesValidationError extends Error {
    constructor(code, message = HOUSEHOLD_PLANNING_PREFERENCES_ERROR_MESSAGES.invalidPayload) {
        super(message);
        this.name = 'HouseholdPlanningPreferencesValidationError';
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

const createHouseholdPlanningPreferencesValidationError = (code) => (
    new HouseholdPlanningPreferencesValidationError(
        code,
        HOUSEHOLD_PLANNING_PREFERENCES_ERROR_MESSAGES[code]
            || HOUSEHOLD_PLANNING_PREFERENCES_ERROR_MESSAGES.invalidPayload,
    )
);

const isPlainObject = (value) => (
    value !== null
    && typeof value === 'object'
    && !Array.isArray(value)
);

const isFiniteNumber = (value) => typeof value === 'number' && Number.isFinite(value);

const buildInvalidPlanningPreferencesResult = (code = 'invalidPayload') => ({
    valid: false,
    planningDefaults: null,
    error: createHouseholdPlanningPreferencesValidationError(code),
});

const planningPreferencesResult = (planningDefaults) => ({
    valid: true,
    planningDefaults: {
        ...planningDefaults,
    },
    error: null,
});

export function validateHouseholdPlanningPreferences(planningDefaults) {
    if (!isPlainObject(planningDefaults)) {
        return buildInvalidPlanningPreferencesResult();
    }

    const { budgetPerDay, budgetPerWeek } = planningDefaults;

    if ((budgetPerDay !== undefined && budgetPerDay !== null && !isFiniteNumber(budgetPerDay))
        || (budgetPerWeek !== undefined && budgetPerWeek !== null && !isFiniteNumber(budgetPerWeek))) {
        return buildInvalidPlanningPreferencesResult();
    }

    if (isFiniteNumber(budgetPerDay) && isFiniteNumber(budgetPerWeek)) {
        const normalizedDailyBudget = Math.round(budgetPerDay * 100);
        const normalizedWeeklyBudget = Math.round(budgetPerWeek * 100);

        if (normalizedDailyBudget * 7 !== normalizedWeeklyBudget) {
            return buildInvalidPlanningPreferencesResult('conflictingBudgetPreferences');
        }
    }

    return planningPreferencesResult(planningDefaults);
}
