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

export class AuthSignupValidationError extends Error {
    constructor(code, message) {
        super(message);
        this.name = 'AuthSignupValidationError';
        this.code = code;
    }
}

export class AuthLoginValidationError extends Error {
    constructor(code, message) {
        super(message);
        this.name = 'AuthLoginValidationError';
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

const AUTH_STORED_SESSION_ERROR_MESSAGE = 'Your saved session could not be read. Please sign in again.';

const AUTH_LOGIN_ERROR_MESSAGES = {
    invalidPayload: 'Please enter your email address and password.',
    missingEmail: 'Please enter your email address.',
    invalidEmail: 'Please enter a valid email address.',
    missingPassword: 'Please enter your password.',
};

const AUTH_LOGIN_RECOVERY_MESSAGE = 'Login failed. Please check your email and password.';
const AUTH_LOGIN_SAFE_ERROR_MESSAGES = new Map([
    ['invalid credentials', 'Invalid credentials'],
    ['email and password are required.', AUTH_LOGIN_ERROR_MESSAGES.invalidPayload],
    ['please enter your email address.', AUTH_LOGIN_ERROR_MESSAGES.missingEmail],
    ['please enter a valid email address.', AUTH_LOGIN_ERROR_MESSAGES.invalidEmail],
    ['please enter your password.', AUTH_LOGIN_ERROR_MESSAGES.missingPassword],
    [
        'too many login attempts from this ip. please try again in 15 minutes.',
        'Too many login attempts from this IP. Please try again in 15 minutes.',
    ],
    [
        'too many login attempts for this account. please try again in 15 minutes.',
        'Too many login attempts for this account. Please try again in 15 minutes.',
    ],
]);

const AUTH_SIGNUP_ERROR_MESSAGES = {
    invalidPayload: 'Please review the signup details and try again.',
    missingName: 'Please enter your name.',
    missingEmail: 'Please enter your email address.',
    invalidEmail: 'Please enter a valid email address.',
    missingPassword: 'Please enter a password.',
    weakPasswordLength: 'Password must be at least 8 characters long.',
    weakPasswordUppercase: 'Password must contain at least one uppercase letter.',
    weakPasswordLowercase: 'Password must contain at least one lowercase letter.',
    weakPasswordNumber: 'Password must contain at least one number.',
    weakPasswordSymbol: 'Password must contain at least one special character.',
    missingGender: 'Please select a gender.',
    invalidGender: 'Please choose a valid gender.',
    missingMeasurementSystem: 'Please select a measurement system.',
    invalidMeasurementSystem: 'Please choose a valid measurement system.',
    invalidWeightGoal: 'Please choose a valid weight goal.',
    invalidDailyCalories: 'Please enter a valid daily calorie target.',
};

const SIGNUP_EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SIGNUP_ALLOWED_GENDERS = new Set(['MALE', 'FEMALE', 'OTHER']);
const SIGNUP_ALLOWED_MEASUREMENT_SYSTEMS = new Set(['METRIC', 'IMPERIAL']);
const SIGNUP_ALLOWED_WEIGHT_GOALS = new Set(['LOSE', 'GAIN', 'MAINTAIN']);
const AUTH_ALLOWED_ROLES = new Set(['ADMIN', 'USER', 'PREMIUM', 'PRO', 'CREATOR', 'INFLUENCER']);

const AUTH_FEEDBACK_MIN_HEIGHT = 56;
const AUTH_FEEDBACK_SURFACE_STYLES = {
    error: {
        bgcolor: 'rgba(244, 67, 54, 0.08)',
        border: '1px solid rgba(244, 67, 54, 0.2)',
    },
    success: {
        bgcolor: 'rgba(76, 175, 80, 0.08)',
        border: '1px solid rgba(76, 175, 80, 0.2)',
    },
    neutral: {
        bgcolor: 'transparent',
        border: '1px solid transparent',
    },
};

const createAuthTokenValidationError = (code) => {
    const message = AUTH_TOKEN_ERROR_MESSAGES[code] || AUTH_TOKEN_ERROR_MESSAGES.malformed;
    return new AuthTokenValidationError(code, message);
};

const createAuthSessionStorageError = (code) => {
    const message = AUTH_SESSION_ERROR_MESSAGES[code] || AUTH_SESSION_ERROR_MESSAGES.storageUnavailable;
    return new AuthSessionStorageError(code, message);
};

const createAuthLoginValidationError = (code) => {
    const message = AUTH_LOGIN_ERROR_MESSAGES[code] || AUTH_LOGIN_ERROR_MESSAGES.invalidPayload;
    return new AuthLoginValidationError(code, message);
};

export class AuthRouteGuardError extends Error {
    constructor(code, message) {
        super(message);
        this.name = 'AuthRouteGuardError';
        this.code = code;
    }
}

const AUTH_ROUTE_GUARD_ERROR_MESSAGES = {
    unauthenticated: 'Please sign in to continue.',
    sessionUnavailable: 'Your session could not be verified. Please sign in again.',
    unauthorizedRole: 'You do not have access to this page.',
};

const createAuthRouteGuardError = (code, customMessage) => {
    const message = customMessage || AUTH_ROUTE_GUARD_ERROR_MESSAGES[code] || AUTH_ROUTE_GUARD_ERROR_MESSAGES.unauthenticated;
    return new AuthRouteGuardError(code, message);
};

export function getLoginErrorMessage(message) {
    if (typeof message !== 'string') {
        return AUTH_LOGIN_RECOVERY_MESSAGE;
    }

    const normalizedMessage = message.replace(/^(GraphQL|Network) error:\s*/i, '').trim();

    if (!normalizedMessage) {
        return AUTH_LOGIN_RECOVERY_MESSAGE;
    }

    const candidates = normalizedMessage
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);

    for (const candidate of candidates) {
        const safeMessage = AUTH_LOGIN_SAFE_ERROR_MESSAGES.get(candidate.toLowerCase());
        if (safeMessage) {
            return safeMessage;
        }
    }

    return AUTH_LOGIN_RECOVERY_MESSAGE;
}

const createAuthSignupValidationError = (code) => {
    const message = AUTH_SIGNUP_ERROR_MESSAGES[code] || AUTH_SIGNUP_ERROR_MESSAGES.invalidPayload;
    return new AuthSignupValidationError(code, message);
};

export function normalizeAuthRole(role) {
    if (typeof role !== 'string') {
        return null;
    }

    const normalizedRole = role.trim().toUpperCase();
    return AUTH_ALLOWED_ROLES.has(normalizedRole) ? normalizedRole : null;
}

// Keep the signed auth identity as the canonical source after refresh.
const buildCanonicalAuthUserSnapshot = (userData, tokenPayload = {}) => {
    const canonicalSnapshot = buildStoredAuthUserSnapshot(userData, tokenPayload.role);
    if (!canonicalSnapshot) {
        return null;
    }

    const tokenUserId =
        typeof tokenPayload.userId === 'string' && tokenPayload.userId.trim() !== ''
            ? tokenPayload.userId.trim()
            : null;

    if (tokenUserId) {
        canonicalSnapshot.id = tokenUserId;
    }

    if (typeof tokenPayload.email === 'string' && tokenPayload.email.trim() !== '') {
        canonicalSnapshot.email = tokenPayload.email.trim().toLowerCase();
    }

    if (Object.prototype.hasOwnProperty.call(tokenPayload, 'role')) {
        const tokenRole = normalizeAuthRole(tokenPayload.role);
        if (!tokenRole) {
            return null;
        }
        canonicalSnapshot.role = tokenRole;
    }

    if (typeof tokenPayload.subscriptionPlan === 'string' && tokenPayload.subscriptionPlan.trim() !== '') {
        canonicalSnapshot.subscriptionPlan = tokenPayload.subscriptionPlan.trim();
    }

    return canonicalSnapshot;
};

const buildStoredAuthUserSnapshot = (userData, fallbackRole = null) => {
    const basicUserInfo = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
    };

    const normalizedRole = normalizeAuthRole(userData.role) || normalizeAuthRole(fallbackRole);
    if (!normalizedRole) {
        return null;
    }

    basicUserInfo.role = normalizedRole;
    basicUserInfo.subscriptionPlan = userData.subscriptionPlan || 'FREE';
    basicUserInfo.subscriptionStatus = userData.subscriptionStatus || 'inactive';

    const dailyCalories = userData.dailyCalories;

    return {
        ...basicUserInfo,
        ...(dailyCalories === undefined ? {} : { dailyCalories }),
    };
};

export function parseStoredAuthUserSnapshot(storedUser, fallbackRole = null) {
    if (typeof storedUser !== 'string' || storedUser.trim() === '') {
        return null;
    }

    try {
        const parsedUser = JSON.parse(storedUser);

        if (!parsedUser || typeof parsedUser !== 'object' || Array.isArray(parsedUser)) {
            return null;
        }

        if (
            typeof parsedUser.id !== 'string' ||
            typeof parsedUser.name !== 'string' ||
            typeof parsedUser.email !== 'string'
        ) {
            return null;
        }

        return buildStoredAuthUserSnapshot(parsedUser, fallbackRole);
    } catch (error) {
        return null;
    }
}

export function resolveStoredAuthSession(storedToken, storedUser, nowSeconds = Math.floor(Date.now() / 1000)) {
    const tokenValidation = validateStoredAuthToken(storedToken, nowSeconds);

    if (!storedToken) {
        return {
            status: 'missing-token',
            token: null,
            user: null,
            sessionNotice: storedUser ? AUTH_STORED_SESSION_ERROR_MESSAGE : '',
            shouldClearStorage: true,
            tokenValidation,
        };
    }

    if (!tokenValidation.valid) {
        return {
            status: 'invalid-token',
            token: null,
            user: null,
            sessionNotice: tokenValidation.error.message,
            shouldClearStorage: true,
            tokenValidation,
        };
    }

    const storedUserSnapshot = parseStoredAuthUserSnapshot(storedUser, tokenValidation.payload.role);

    if (!storedUserSnapshot) {
        return {
            status: 'invalid-user',
            token: null,
            user: null,
            sessionNotice: AUTH_STORED_SESSION_ERROR_MESSAGE,
            shouldClearStorage: true,
            tokenValidation,
        };
    }

    const canonicalUserSnapshot = buildCanonicalAuthUserSnapshot(storedUserSnapshot, tokenValidation.payload);
    if (!canonicalUserSnapshot) {
        return {
            status: 'invalid-user',
            token: null,
            user: null,
            sessionNotice: AUTH_STORED_SESSION_ERROR_MESSAGE,
            shouldClearStorage: true,
            tokenValidation,
        };
    }

    return {
        status: 'hydrated',
        token: storedToken,
        user: canonicalUserSnapshot,
        sessionNotice: '',
        shouldClearStorage: false,
        tokenValidation,
    };
}

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

const validateSignupPassword = (password) => {
    if (typeof password !== 'string' || password.trim() === '') {
        return createAuthSignupValidationError('missingPassword');
    }

    if (password.length < 8) {
        return createAuthSignupValidationError('weakPasswordLength');
    }

    if (!/[A-Z]/.test(password)) {
        return createAuthSignupValidationError('weakPasswordUppercase');
    }

    if (!/[a-z]/.test(password)) {
        return createAuthSignupValidationError('weakPasswordLowercase');
    }

    if (!/[0-9]/.test(password)) {
        return createAuthSignupValidationError('weakPasswordNumber');
    }

    if (!/[^A-Za-z0-9]/.test(password)) {
        return createAuthSignupValidationError('weakPasswordSymbol');
    }

    return null;
};

const normalizeSignupStringArray = (values) =>
    values.map((value) => (typeof value === 'string' ? value.trim() : value)).filter((value) => value !== '');

const hasOwnSignupField = (input, key) => Object.prototype.hasOwnProperty.call(input, key);

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

        if (Object.prototype.hasOwnProperty.call(payload, 'role') && !normalizeAuthRole(payload.role)) {
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

export function persistLoginInfo(token, userData, storageAdapter = storage, nowSeconds = Math.floor(Date.now() / 1000)) {
    const tokenValidation = validateStoredAuthToken(token, nowSeconds);

    if (!tokenValidation.valid) {
        storageAdapter.removeItem('authToken');
        storageAdapter.removeItem('userInfo');
        return {
            ok: false,
            user: null,
            error: tokenValidation.error,
        };
    }

    const canonicalUserInfo = buildCanonicalAuthUserSnapshot(userData, tokenValidation.payload);
    if (!canonicalUserInfo) {
        storageAdapter.removeItem('authToken');
        storageAdapter.removeItem('userInfo');
        return {
            ok: false,
            user: null,
            error: createAuthTokenValidationError('invalidPayload'),
        };
    }
    const tokenStored = storageAdapter.setItem('authToken', token);
    const userStored = storageAdapter.setItem('userInfo', JSON.stringify(canonicalUserInfo));

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
        user: canonicalUserInfo,
        error: null,
    };
}

export function saveLoginInfo(token, userData, nowSeconds = Math.floor(Date.now() / 1000)) {
    const result = persistLoginInfo(token, userData, storage, nowSeconds);
    return result.ok ? result.user : null;
}

export function completeSignupSession(sessionResult, { onSuccess, onError } = {}) {
    if (!sessionResult?.ok) {
        const message = sessionResult?.error?.message || AUTH_SESSION_ERROR_MESSAGES.storageUnavailable;
        if (typeof onError === 'function') {
            onError(message);
        }
        return false;
    }

    if (typeof onSuccess === 'function') {
        onSuccess();
    }

    return true;
}

export function validateLoginInput(input) {
    if (!input || typeof input !== 'object' || Array.isArray(input)) {
        return { valid: false, error: createAuthLoginValidationError('invalidPayload') };
    }

    const normalizedEmail = typeof input.email === 'string' ? input.email.trim().toLowerCase() : '';
    if (!normalizedEmail) {
        return { valid: false, error: createAuthLoginValidationError('missingEmail') };
    }

    if (!SIGNUP_EMAIL_REGEX.test(normalizedEmail)) {
        return { valid: false, error: createAuthLoginValidationError('invalidEmail') };
    }

    if (typeof input.password !== 'string' || input.password.trim() === '') {
        return { valid: false, error: createAuthLoginValidationError('missingPassword') };
    }

    return {
        valid: true,
        input: {
            email: normalizedEmail,
            password: input.password,
        },
    };
}

export function validateSignupInput(input) {
    if (!input || typeof input !== 'object' || Array.isArray(input)) {
        return { valid: false, error: createAuthSignupValidationError('invalidPayload') };
    }

    const normalizedName = typeof input.name === 'string' ? input.name.trim() : '';
    if (!normalizedName) {
        return { valid: false, error: createAuthSignupValidationError('missingName') };
    }

    const normalizedEmail = typeof input.email === 'string' ? input.email.trim().toLowerCase() : '';
    if (!normalizedEmail) {
        return { valid: false, error: createAuthSignupValidationError('missingEmail') };
    }

    if (!SIGNUP_EMAIL_REGEX.test(normalizedEmail)) {
        return { valid: false, error: createAuthSignupValidationError('invalidEmail') };
    }

    const passwordError = validateSignupPassword(input.password);
    if (passwordError) {
        return { valid: false, error: passwordError };
    }

    const normalizedGender = typeof input.gender === 'string' ? input.gender.trim().toUpperCase() : '';
    if (!normalizedGender) {
        return { valid: false, error: createAuthSignupValidationError('missingGender') };
    }

    if (!SIGNUP_ALLOWED_GENDERS.has(normalizedGender)) {
        return { valid: false, error: createAuthSignupValidationError('invalidGender') };
    }

    const normalizedMeasurementSystem = typeof input.measurementSystem === 'string' ? input.measurementSystem.trim().toUpperCase() : '';
    if (!normalizedMeasurementSystem) {
        return { valid: false, error: createAuthSignupValidationError('missingMeasurementSystem') };
    }

    if (!SIGNUP_ALLOWED_MEASUREMENT_SYSTEMS.has(normalizedMeasurementSystem)) {
        return { valid: false, error: createAuthSignupValidationError('invalidMeasurementSystem') };
    }

    const normalizedInput = {
        name: normalizedName,
        email: normalizedEmail,
        gender: normalizedGender,
        measurementSystem: normalizedMeasurementSystem,
        password: input.password,
    };

    if (hasOwnSignupField(input, 'role')) {
        normalizedInput.role = input.role;
    }

    if (hasOwnSignupField(input, 'weight')) {
        normalizedInput.weight = input.weight;
    }

    if (hasOwnSignupField(input, 'height')) {
        normalizedInput.height = input.height;
    }

    if (hasOwnSignupField(input, 'weightGoal')) {
        normalizedInput.weightGoal = input.weightGoal;
    }

    if (hasOwnSignupField(input, 'foodGoals')) {
        normalizedInput.foodGoals = input.foodGoals;
    }

    if (hasOwnSignupField(input, 'allergies')) {
        normalizedInput.allergies = input.allergies;
    }

    if (hasOwnSignupField(input, 'dailyCalories')) {
        normalizedInput.dailyCalories = input.dailyCalories;
    }

    if (normalizedInput.weightGoal === undefined || normalizedInput.weightGoal === null) {
        delete normalizedInput.weightGoal;
    } else if (typeof normalizedInput.weightGoal === 'string') {
        const normalizedWeightGoal = normalizedInput.weightGoal.trim().toUpperCase();

        if (!normalizedWeightGoal) {
            delete normalizedInput.weightGoal;
        } else if (!SIGNUP_ALLOWED_WEIGHT_GOALS.has(normalizedWeightGoal)) {
            return { valid: false, error: createAuthSignupValidationError('invalidWeightGoal') };
        } else {
            normalizedInput.weightGoal = normalizedWeightGoal;
        }
    } else {
        return { valid: false, error: createAuthSignupValidationError('invalidWeightGoal') };
    }

    if (normalizedInput.dailyCalories !== undefined && normalizedInput.dailyCalories !== null && normalizedInput.dailyCalories !== '') {
        const normalizedDailyCalories = typeof normalizedInput.dailyCalories === 'number'
            ? normalizedInput.dailyCalories
            : Number(normalizedInput.dailyCalories);

        if (!Number.isInteger(normalizedDailyCalories) || normalizedDailyCalories <= 0) {
            return { valid: false, error: createAuthSignupValidationError('invalidDailyCalories') };
        }

        normalizedInput.dailyCalories = normalizedDailyCalories;
    }

    if (Array.isArray(normalizedInput.foodGoals)) {
        normalizedInput.foodGoals = normalizeSignupStringArray(normalizedInput.foodGoals);
    }

    if (Array.isArray(normalizedInput.allergies)) {
        normalizedInput.allergies = normalizeSignupStringArray(normalizedInput.allergies);
    }

    return { valid: true, input: normalizedInput };
}

export function buildAuthFeedbackState({
    isLoading = false,
    errorMessage = '',
    sessionNotice = '',
    successMessage = '',
    emptyMessage = 'Ready to sign in.',
    loadingMessage = 'Checking your session...',
} = {}) {
    if (isLoading) {
        return {
            state: 'loading',
            message: loadingMessage,
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

export function buildLoginFeedbackState({
    authLoading = false,
    mutationLoading = false,
    devLoading = false,
    errorMessage = '',
    sessionNotice = '',
    successMessage = '',
    emptyMessage = 'Ready to sign in.',
} = {}) {
    return buildAuthFeedbackState({
        isLoading: authLoading || mutationLoading || devLoading,
        loadingMessage: authLoading ? 'Checking your session...' : 'Signing you in...',
        errorMessage,
        sessionNotice,
        successMessage,
        emptyMessage,
    });
}

export function buildAuthFeedbackContainerStyles(state = 'empty') {
    if (state === 'error') {
        return AUTH_FEEDBACK_SURFACE_STYLES.error;
    }

    if (state === 'success') {
        return AUTH_FEEDBACK_SURFACE_STYLES.success;
    }

    return AUTH_FEEDBACK_SURFACE_STYLES.neutral;
}

export function buildProtectedRouteFeedbackState({
    state = 'loading',
    message = '',
    loadingMessage = 'Checking your session...',
    readyMessage = 'Ready to continue.',
    successMessage = 'Access granted.',
} = {}) {
    if (state === 'loading') {
        return buildAuthFeedbackState({
            isLoading: true,
            loadingMessage,
        });
    }

    if (state === 'error') {
        return buildAuthFeedbackState({
            errorMessage: message || AUTH_ROUTE_GUARD_ERROR_MESSAGES.unauthenticated,
        });
    }

    if (state === 'redirect') {
        return buildAuthFeedbackState({
            emptyMessage: message || readyMessage,
        });
    }

    return buildAuthFeedbackState({
        successMessage: message || successMessage,
    });
}

export function resolveProtectedRouteState({
    loading = false,
    isAuthenticated = false,
    userRole = null,
    allowedRoles = undefined,
    sessionNotice = '',
} = {}) {
    const hasArrayRoleRestriction = Array.isArray(allowedRoles) && allowedRoles.length > 0;
    const hasSetRoleRestriction = allowedRoles instanceof Set && allowedRoles.size > 0;
    const hasRoleRestriction = hasArrayRoleRestriction || hasSetRoleRestriction;

    if (loading) {
        return {
            state: 'loading',
            canRender: false,
            redirectTo: null,
            message: 'Checking your session...',
            error: null,
        };
    }

    if (!isAuthenticated) {
        if (sessionNotice) {
            return {
                state: 'error',
                canRender: false,
                redirectTo: '/login',
                message: sessionNotice,
                error: createAuthRouteGuardError('sessionUnavailable', sessionNotice),
            };
        }

        return {
            state: 'redirect',
            canRender: false,
            redirectTo: '/login',
            message: AUTH_ROUTE_GUARD_ERROR_MESSAGES.unauthenticated,
            error: createAuthRouteGuardError('unauthenticated'),
        };
    }

    const normalizedUserRole = normalizeAuthRole(userRole);

    if (!normalizedUserRole) {
        return {
            state: 'error',
            canRender: false,
            redirectTo: '/login',
            message: sessionNotice || AUTH_ROUTE_GUARD_ERROR_MESSAGES.sessionUnavailable,
            error: createAuthRouteGuardError('sessionUnavailable', sessionNotice || AUTH_ROUTE_GUARD_ERROR_MESSAGES.sessionUnavailable),
        };
    }

    const normalizedAllowedRoles = Array.isArray(allowedRoles)
        ? allowedRoles.map((role) => normalizeAuthRole(role)).filter(Boolean)
        : allowedRoles instanceof Set
            ? Array.from(allowedRoles, (role) => normalizeAuthRole(role)).filter(Boolean)
            : [];

    const isAllowedRole = normalizedAllowedRoles.includes(normalizedUserRole);

    if (hasRoleRestriction && !isAllowedRole) {
        return {
            state: 'redirect',
            canRender: false,
            redirectTo: normalizedUserRole === 'ADMIN' ? '/admin' : '/dashboard',
            message: normalizedUserRole === 'ADMIN'
                ? 'Redirecting to the admin dashboard...'
                : 'Redirecting to the dashboard...',
            error: createAuthRouteGuardError('unauthorizedRole'),
        };
    }

    return {
        state: 'allowed',
        canRender: true,
        redirectTo: null,
        message: '',
        error: null,
    };
}
