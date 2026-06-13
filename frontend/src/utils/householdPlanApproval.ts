// @ts-nocheck

const HOUSEHOLD_PLAN_APPROVAL_ERROR_MESSAGES = {
    invalidPayload: 'We could not read your household plan approval. Please refresh the planner.',
    invalidApprovalStatus: 'Household plan approval must be draft or approved.',
    missingApprovalTimestamp: 'Approved household plans must include an approval timestamp.',
    draftApprovalTimestamp: 'Draft household plans cannot include an approval timestamp.',
};

export class HouseholdPlanApprovalValidationError extends Error {
    constructor(code, message = HOUSEHOLD_PLAN_APPROVAL_ERROR_MESSAGES.invalidPayload) {
        super(message);
        this.name = 'HouseholdPlanApprovalValidationError';
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

const createHouseholdPlanApprovalValidationError = (code) => (
    new HouseholdPlanApprovalValidationError(
        code,
        HOUSEHOLD_PLAN_APPROVAL_ERROR_MESSAGES[code]
            || HOUSEHOLD_PLAN_APPROVAL_ERROR_MESSAGES.invalidPayload,
    )
);

const isPlainObject = (value) => (
    value !== null
    && typeof value === 'object'
    && !Array.isArray(value)
);

const normalizeApprovalStatus = (value) => {
    if (typeof value !== 'string') {
        return null;
    }

    const normalizedValue = value.trim().toUpperCase();
    if (normalizedValue !== 'DRAFT' && normalizedValue !== 'APPROVED') {
        return null;
    }

    return normalizedValue;
};

const normalizeApprovalTimestamp = (value) => {
    if (value === undefined || value === null) {
        return null;
    }

    const normalizedValue = value instanceof Date ? new Date(value.getTime()) : new Date(value);
    if (Number.isNaN(normalizedValue.getTime())) {
        return null;
    }

    return normalizedValue;
};

const buildInvalidPlanApprovalResult = (code = 'invalidPayload') => ({
    valid: false,
    planApproval: null,
    error: createHouseholdPlanApprovalValidationError(code),
});

export function validateHouseholdPlanApproval(planApproval) {
    if (!isPlainObject(planApproval)) {
        return buildInvalidPlanApprovalResult();
    }

    const status = normalizeApprovalStatus(planApproval.status);
    if (!status) {
        return buildInvalidPlanApprovalResult(
            typeof planApproval.status === 'string'
                ? 'invalidApprovalStatus'
                : 'invalidPayload',
        );
    }

    const approvedAt = normalizeApprovalTimestamp(planApproval.approvedAt);

    if (status === 'APPROVED') {
        if (!approvedAt) {
            return buildInvalidPlanApprovalResult('missingApprovalTimestamp');
        }

        return {
            valid: true,
            planApproval: {
                status,
                approvedAt,
            },
            error: null,
        };
    }

    if (planApproval.approvedAt !== undefined && planApproval.approvedAt !== null) {
        return buildInvalidPlanApprovalResult('draftApprovalTimestamp');
    }

    return {
        valid: true,
        planApproval: {
            status,
            approvedAt: null,
        },
        error: null,
    };
}
