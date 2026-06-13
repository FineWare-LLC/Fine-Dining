// @ts-nocheck

const HOUSEHOLD_INVITE_CODE_PATTERN = /^[a-f0-9]{12}$/;
const HOUSEHOLD_INVITE_ERROR_MESSAGE = 'Please enter a valid household invite code.';
const HOUSEHOLD_INVITE_PERSISTENCE_ERROR_MESSAGE =
    'We could not update your household membership. Please try again.';

export class HouseholdInviteValidationError extends Error {
    constructor(code, message = HOUSEHOLD_INVITE_ERROR_MESSAGE) {
        super(message);
        this.name = 'HouseholdInviteValidationError';
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

export class HouseholdInvitePersistenceError extends Error {
    constructor(reason, cause = null) {
        super(HOUSEHOLD_INVITE_PERSISTENCE_ERROR_MESSAGE);
        this.name = 'HouseholdInvitePersistenceError';
        this.code = 'householdInvitePersistenceFailed';
        this.reason = reason;
        this.isUserSafe = true;
        if (cause) {
            this.cause = cause;
        }
    }

    toJSON() {
        const serialized = {
            name: this.name,
            code: this.code,
            message: this.message,
            reason: this.reason,
            isUserSafe: this.isUserSafe,
        };

        if (Object.prototype.hasOwnProperty.call(this, 'cause')) {
            serialized.cause = this.cause;
        }

        return serialized;
    }
}

export const normalizeHouseholdInviteCode = (inviteCode) => {
    if (typeof inviteCode !== 'string') {
        throw new HouseholdInviteValidationError('invalidPayload');
    }

    const normalizedInviteCode = inviteCode.trim().toLowerCase();
    if (!HOUSEHOLD_INVITE_CODE_PATTERN.test(normalizedInviteCode)) {
        throw new HouseholdInviteValidationError('invalidInviteCode');
    }

    return normalizedInviteCode;
};
