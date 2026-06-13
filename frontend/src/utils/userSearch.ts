// @ts-nocheck

const USER_SEARCH_ERROR_MESSAGE = 'We could not read this user search. Please refresh the admin page.';
const USER_SEARCH_MAX_LENGTH = 128;

export class UserSearchValidationError extends Error {
    constructor(code, message = USER_SEARCH_ERROR_MESSAGE) {
        super(message);
        this.name = 'UserSearchValidationError';
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

function createUserSearchValidationError(code) {
    return new UserSearchValidationError(code, USER_SEARCH_ERROR_MESSAGE);
}

function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function normalizeUserSearchKeyword(keyword) {
    if (typeof keyword !== 'string') {
        return null;
    }

    const normalizedKeyword = keyword.trim();
    if (!normalizedKeyword || normalizedKeyword.length > USER_SEARCH_MAX_LENGTH) {
        return null;
    }

    return normalizedKeyword;
}

export function validateUserSearchInput(keyword) {
    const normalizedKeyword = normalizeUserSearchKeyword(keyword);

    if (!normalizedKeyword) {
        return {
            valid: false,
            input: null,
            error: createUserSearchValidationError('invalidPayload'),
        };
    }

    const escapedKeyword = escapeRegExp(normalizedKeyword);
    const searchRegex = new RegExp(escapedKeyword, 'i');

    return {
        valid: true,
        input: {
            keyword: normalizedKeyword,
            filter: {
                $or: [
                    { name: searchRegex },
                    { email: searchRegex },
                ],
            },
            sort: { name: 1, email: 1, _id: 1 },
        },
        error: null,
    };
}
