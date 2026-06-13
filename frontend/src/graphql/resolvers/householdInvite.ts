// @ts-nocheck

const HOUSEHOLD_INVITE_CODE_PATTERN = /^[a-f0-9]{12}$/;
const HOUSEHOLD_INVITE_ERROR_MESSAGE = 'Please enter a valid household invite code.';

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
