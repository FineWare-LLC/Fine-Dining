// @ts-nocheck
import storage from '@/utils/storage';

export class AuthTokenValidationError extends Error {
    constructor(code, message) {
        super(message);
        this.name = 'AuthTokenValidationError';
        this.code = code;
    }
}

export class AuthSessionStorageError extends Error {
    constructor(code, message) {
        super(message);
        this.name = 'AuthSessionStorageError';
        this.code = code;
    }
}

const AUTH_TOKEN_ERROR_MESSAGES = {
    missing: 'Your session is no longer available. Please sign in again.',
    malformed: 'Your session is no longer valid. Please sign in again.',
    invalidPayload: 'Your session is no longer valid. Please sign in again.',
    expired: 'Your session has expired. Please sign in again.',
};

const AUTH_SESSION_ERROR_MESSAGES = {
    storageUnavailable: 'Unable to save your session. Please try again.',
};

const AUTH_FEEDBACK_MIN_HEIGHT = 56;

const createAuthTokenValidationError = (code) => {
    const message = AUTH_TOKEN_ERROR_MESSAGES[code] || AUTH_TOKEN_ERROR_MESSAGES.malformed;
    return new AuthTokenValidationError(code, message);
};

const createAuthSessionStorageError = (code) => {
    const message = AUTH_SESSION_ERROR_MESSAGES[code] || AUTH_SESSION_ERROR_MESSAGES.storageUnavailable;
    return new AuthSessionStorageError(code, message);
};

const buildStoredUserInfo = (userData) => ({
    id: userData.id,
    name: userData.name,
    email: userData.email,
    role: userData.role,
    subscriptionPlan: userData.subscriptionPlan || 'FREE',
    subscriptionStatus: userData.subscriptionStatus || 'inactive',
    ...(userData.dailyCalories === undefined ? {} : { dailyCalories: userData.dailyCalories }),
});

const decodeBase64Url = (value) => {
    const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
    const padding = '='.repeat((4 - (normalized.length % 4)) % 4);
    const base64 = `${normalized}${padding}`;

    if (typeof globalThis.atob === 'function') {
        return globalThis.atob(base64);
    }

    if (typeof Buffer !== 'undefined') {
        return Buffer.from(base64, 'base64').toString('utf8');
    }

    throw new Error('Base64 decoding is not available in this environment.');
};

export function validateStoredAuthToken(token, nowSeconds = Math.floor(Date.now() / 1000)) {
    if (typeof token !== 'string' || token.trim() === '') {
        return { valid: false, error: createAuthTokenValidationError('missing') };
    }

    const parts = token.split('.');
    if (parts.length < 2) {
        return { valid: false, error: createAuthTokenValidationError('malformed') };
    }

    try {
        const payload = JSON.parse(decodeBase64Url(parts[1]));

        if (!payload || typeof payload !== 'object') {
            return { valid: false, error: createAuthTokenValidationError('invalidPayload') };
        }

        const expiresAt = Number(payload.exp);
        if (!Number.isFinite(expiresAt)) {
            return { valid: false, error: createAuthTokenValidationError('invalidPayload') };
        }

        if (expiresAt <= nowSeconds) {
            return { valid: false, error: createAuthTokenValidationError('expired') };
        }

        return { valid: true, payload: { ...payload, exp: expiresAt } };
    } catch (error) {
        return { valid: false, error: createAuthTokenValidationError('invalidPayload') };
    }
}

export function persistLoginInfo(token, userData, storageAdapter = storage) {
    const basicUserInfo = buildStoredUserInfo(userData);
    const tokenStored = storageAdapter.setItem('authToken', token);
    const userStored = storageAdapter.setItem('userInfo', JSON.stringify(basicUserInfo));

    if (!tokenStored || !userStored) {
        storageAdapter.removeItem('authToken');
        storageAdapter.removeItem('userInfo');
        return {
            ok: false,
            user: null,
            error: createAuthSessionStorageError('storageUnavailable'),
        };
    }

    return {
        ok: true,
        user: basicUserInfo,
        error: null,
    };
}

export function saveLoginInfo(token, userData) {
    const result = persistLoginInfo(token, userData);
    return result.ok ? result.user : null;
}

export function buildAuthFeedbackState({
    isLoading = false,
    errorMessage = '',
    sessionNotice = '',
    successMessage = '',
    emptyMessage = 'Ready to sign in.',
} = {}) {
    if (isLoading) {
        return {
            state: 'loading',
            message: 'Checking your session...',
            role: 'status',
            ariaLive: 'polite',
            minHeight: AUTH_FEEDBACK_MIN_HEIGHT,
            showSpinner: true,
        };
    }

    if (errorMessage) {
        return {
            state: 'error',
            message: errorMessage,
            role: 'alert',
            ariaLive: 'assertive',
            minHeight: AUTH_FEEDBACK_MIN_HEIGHT,
            showSpinner: false,
        };
    }

    if (sessionNotice) {
        return {
            state: 'error',
            message: sessionNotice,
            role: 'alert',
            ariaLive: 'assertive',
            minHeight: AUTH_FEEDBACK_MIN_HEIGHT,
            showSpinner: false,
        };
    }

    if (successMessage) {
        return {
            state: 'success',
            message: successMessage,
            role: 'status',
            ariaLive: 'polite',
            minHeight: AUTH_FEEDBACK_MIN_HEIGHT,
            showSpinner: false,
        };
    }

    return {
        state: 'empty',
        message: emptyMessage,
        role: 'status',
        ariaLive: 'polite',
        minHeight: AUTH_FEEDBACK_MIN_HEIGHT,
        showSpinner: false,
    };
}
