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
    invalidFoodGoals: 'Please choose valid diet goals.',
    invalidAllergies: 'Please choose valid allergies.',
    invalidWeightGoal: 'Please choose a valid weight goal.',
    invalidDailyCalories: 'Please enter a valid daily calorie target.',
};

const AUTH_SIGNUP_SAFE_ERROR_MESSAGES = new Map([
    ['email already in use', 'Email already in use'],
    ['email is required.', AUTH_SIGNUP_ERROR_MESSAGES.missingEmail],
    ['invalid email format.', AUTH_SIGNUP_ERROR_MESSAGES.invalidEmail],
    ['password must be at least 8 characters long.', AUTH_SIGNUP_ERROR_MESSAGES.weakPasswordLength],
    ['password must contain at least one uppercase letter.', AUTH_SIGNUP_ERROR_MESSAGES.weakPasswordUppercase],
    ['password must contain at least one lowercase letter.', AUTH_SIGNUP_ERROR_MESSAGES.weakPasswordLowercase],
    ['password must contain at least one number.', AUTH_SIGNUP_ERROR_MESSAGES.weakPasswordNumber],
    ['password must contain at least one special character.', AUTH_SIGNUP_ERROR_MESSAGES.weakPasswordSymbol],
    [
        'too many accounts created from this ip. please try again tomorrow.',
        'Too many accounts created from this IP. Please try again tomorrow.',
    ],
]);

const SIGNUP_EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SIGNUP_ALLOWED_GENDERS = new Set(['MALE', 'FEMALE', 'OTHER']);
const SIGNUP_ALLOWED_MEASUREMENT_SYSTEMS = new Set(['METRIC', 'IMPERIAL']);
const SIGNUP_ALLOWED_WEIGHT_GOALS = new Set(['LOSE', 'GAIN', 'MAINTAIN']);
const AUTH_ALLOWED_ROLES = new Set(['ADMIN', 'USER', 'PREMIUM', 'PRO', 'CREATOR', 'INFLUENCER']);
const NUTRITION_TARGET_FIELDS = [
    'caloriesMin',
    'caloriesMax',
    'proteinMin',
    'proteinMax',
    'carbohydratesMin',
    'carbohydratesMax',
    'fatMin',
    'fatMax',
    'fiberMin',
    'fiberMax',
    'sugarMax',
    'sodiumMin',
    'sodiumMax',
    'cholesterolMax',
    'saturatedFatMax',
    'ironMin',
    'calciumMin',
    'vitaminCMin',
    'vitaminDMin',
    'vitaminB12Min',
    'potassiumMin',
    'magnesiumMin',
    'zincMin',
    'folateMin',
    'omega3Min',
];
const NUTRITION_TARGET_RANGE_PAIRS = [
    ['caloriesMin', 'caloriesMax'],
    ['proteinMin', 'proteinMax'],
    ['carbohydratesMin', 'carbohydratesMax'],
    ['fatMin', 'fatMax'],
    ['fiberMin', 'fiberMax'],
    ['sodiumMin', 'sodiumMax'],
];

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

const clearAuthSessionStorage = (storageAdapter = storage) => {
    try {
        storageAdapter.removeItem('authToken');
    } catch (error) {
        // Fail shut if cleanup itself cannot remove the token snapshot.
    }

    try {
        storageAdapter.removeItem('userInfo');
    } catch (error) {
        // Fail shut if cleanup itself cannot remove the user snapshot.
    }
};

export async function performAuthLogout({
    storageAdapter = storage,
    client = null,
    router = null,
} = {}) {
    clearAuthSessionStorage(storageAdapter);

    try {
        if (client?.resetStore) {
            await client.resetStore();
        }
    } catch (error) {
        console.error('Error resetting Apollo cache on logout:', error);
    }

    try {
        await router?.push?.('/login');
    } catch (error) {
        // Redirect failures should not block logout cleanup.
    }
}

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

export function getSignupErrorMessage(message) {
    if (typeof message !== 'string') {
        return AUTH_SIGNUP_ERROR_MESSAGES.invalidPayload;
    }

    const normalizedMessage = message.replace(/^(GraphQL|Network) error:\s*/i, '').trim();

    if (!normalizedMessage) {
        return AUTH_SIGNUP_ERROR_MESSAGES.invalidPayload;
    }

    const candidates = normalizedMessage
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);

    for (const candidate of candidates) {
        const safeMessage = AUTH_SIGNUP_SAFE_ERROR_MESSAGES.get(candidate.toLowerCase());
        if (safeMessage) {
            return safeMessage;
        }
    }

    return AUTH_SIGNUP_ERROR_MESSAGES.invalidPayload;
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

const normalizeAuthMeasurementSystem = (measurementSystem) => {
    if (typeof measurementSystem !== 'string') {
        return null;
    }

    const normalizedMeasurementSystem = measurementSystem.trim().toUpperCase();
    return SIGNUP_ALLOWED_MEASUREMENT_SYSTEMS.has(normalizedMeasurementSystem)
        ? normalizedMeasurementSystem
        : null;
};

export function resolveAuthDestination(role) {
    const normalizedRole = normalizeAuthRole(role);
    if (normalizedRole === 'ADMIN') {
        return {
            path: '/admin',
            label: 'admin',
        };
    }

    return {
        path: '/dashboard',
        label: 'dashboard',
    };
}

export function buildSignedInRedirectMessage(role) {
    const destination = resolveAuthDestination(role);
    return `Signed in. Redirecting to your ${destination.label}...`;
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

    if (typeof tokenPayload.subscriptionStatus === 'string' && tokenPayload.subscriptionStatus.trim() !== '') {
        canonicalSnapshot.subscriptionStatus = tokenPayload.subscriptionStatus.trim();
    }

    return canonicalSnapshot;
};

const normalizeAuthLoginHistoryEntry = (entry) => {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
        return null;
    }

    if (Object.prototype.hasOwnProperty.call(entry, 'ip') && typeof entry.ip !== 'string') {
        return null;
    }

    if (Object.prototype.hasOwnProperty.call(entry, 'userAgent') && typeof entry.userAgent !== 'string') {
        return null;
    }

    const timestamp = entry.timestamp instanceof Date ? entry.timestamp : new Date(entry.timestamp);

    if (!Number.isFinite(timestamp.getTime())) {
        return null;
    }

    return {
        ip: typeof entry.ip === 'string' ? entry.ip.trim() : '',
        userAgent: typeof entry.userAgent === 'string' ? entry.userAgent.trim() : '',
        timestamp: timestamp.toISOString(),
    };
};

const buildStoredAuthLoginHistorySnapshot = (loginHistory) => {
    if (loginHistory === undefined) {
        return undefined;
    }

    if (loginHistory === null || !Array.isArray(loginHistory)) {
        return null;
    }

    const normalizedLoginHistory = [];

    for (const entry of loginHistory) {
        const normalizedEntry = normalizeAuthLoginHistoryEntry(entry);
        if (!normalizedEntry) {
            return null;
        }
        normalizedLoginHistory.push(normalizedEntry);
    }

    return normalizedLoginHistory;
};

const buildStoredAuthUserSnapshot = (userData, fallbackRole = null) => {
    if (!userData || typeof userData !== 'object' || Array.isArray(userData)) {
        return null;
    }

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

    const hasQuestionnaire = Object.prototype.hasOwnProperty.call(userData, 'questionnaire');
    const hasDietaryProfile = Object.prototype.hasOwnProperty.call(userData, 'dietaryProfile');
    const hasNutritionTargets = Object.prototype.hasOwnProperty.call(userData, 'nutritionTargets');
    const questionnaire = hasQuestionnaire ? normalizeOptionalQuestionnaire(userData.questionnaire) : undefined;
    const dietaryProfile = hasDietaryProfile ? userData.dietaryProfile : null;
    const nutritionTargets = hasNutritionTargets ? userData.nutritionTargets : null;
    const allergySources = [
        Object.prototype.hasOwnProperty.call(userData, 'allergies') ? userData.allergies : undefined,
        questionnaire && Object.prototype.hasOwnProperty.call(questionnaire, 'allergies') ? questionnaire.allergies : undefined,
        dietaryProfile && Object.prototype.hasOwnProperty.call(dietaryProfile, 'allergens') ? dietaryProfile.allergens : undefined,
    ];

    if (questionnaire === null) {
        return null;
    }

    if (questionnaire !== undefined) {
        basicUserInfo.questionnaire = questionnaire;
    }

    for (const allergyValues of allergySources) {
        const normalizedAllergies = normalizeOptionalAllergyArray(allergyValues);

        if (normalizedAllergies === undefined) {
            continue;
        }

        if (normalizedAllergies === null) {
            return null;
        }

        basicUserInfo.allergies = normalizedAllergies;
        break;
    }

    const dislikedIngredientSources = [
        Object.prototype.hasOwnProperty.call(userData, 'dislikedIngredients') ? userData.dislikedIngredients : undefined,
        dietaryProfile && Object.prototype.hasOwnProperty.call(dietaryProfile, 'excludedIngredients') ? dietaryProfile.excludedIngredients : undefined,
        questionnaire && Object.prototype.hasOwnProperty.call(questionnaire, 'disallowedIngredients') ? questionnaire.disallowedIngredients : undefined,
    ];

    for (const value of dislikedIngredientSources) {
        const normalizedDislikedIngredients = normalizeOptionalIngredientArray(value);

        if (normalizedDislikedIngredients === undefined) {
            continue;
        }

        if (normalizedDislikedIngredients === null) {
            return null;
        }

        basicUserInfo.dislikedIngredients = normalizedDislikedIngredients;
        break;
    }

    const normalizedFoodGoals = normalizeOptionalFoodGoalArray(
        Object.prototype.hasOwnProperty.call(userData, 'foodGoals') ? userData.foodGoals : undefined,
    );
    if (normalizedFoodGoals === null) {
        return null;
    }
    if (normalizedFoodGoals !== undefined) {
        basicUserInfo.foodGoals = normalizedFoodGoals;
    }

    if (hasDietaryProfile && dietaryProfile !== undefined) {
        const normalizedDietaryProfile = normalizeOptionalDietaryProfile(dietaryProfile);
        if (normalizedDietaryProfile === null) {
            return null;
        }
        basicUserInfo.dietaryProfile = normalizedDietaryProfile;
    }

    if (hasNutritionTargets && nutritionTargets !== undefined) {
        const normalizedNutritionTargets = normalizeOptionalNutritionTargets(nutritionTargets);
        if (normalizedNutritionTargets === null) {
            return null;
        }
        basicUserInfo.nutritionTargets = normalizedNutritionTargets;
    }

    if (Object.prototype.hasOwnProperty.call(userData, 'measurementSystem')) {
        const normalizedMeasurementSystem = normalizeAuthMeasurementSystem(userData.measurementSystem);
        if (!normalizedMeasurementSystem) {
            return null;
        }
        basicUserInfo.measurementSystem = normalizedMeasurementSystem;
    }

    const dailyCalories = userData.dailyCalories;
    const hasLoginHistory = Object.prototype.hasOwnProperty.call(userData, 'loginHistory');
    const loginHistory = hasLoginHistory ? buildStoredAuthLoginHistorySnapshot(userData.loginHistory) : undefined;
    if (loginHistory === null) {
        return null;
    }

    return {
        ...basicUserInfo,
        ...(dailyCalories === undefined ? {} : { dailyCalories }),
        ...(loginHistory === undefined ? {} : { loginHistory }),
    };
};

export const buildUpdatedAuthUserSnapshot = (currentUser, updatedUser = {}) => {
    if (!currentUser || typeof currentUser !== 'object' || Array.isArray(currentUser)) {
        return null;
    }

    if (!updatedUser || typeof updatedUser !== 'object' || Array.isArray(updatedUser)) {
        return null;
    }

    const pickCanonicalField = (field) =>
        Object.prototype.hasOwnProperty.call(updatedUser, field) ? updatedUser[field] : currentUser[field];

    const currentQuestionnaireValue = currentUser.questionnaire;
    const updatedQuestionnaireValue = updatedUser.questionnaire;
    const hasCurrentQuestionnaire = Object.prototype.hasOwnProperty.call(currentUser, 'questionnaire');
    const hasUpdatedQuestionnaire = Object.prototype.hasOwnProperty.call(updatedUser, 'questionnaire');
    const currentQuestionnaire =
        hasCurrentQuestionnaire && currentQuestionnaireValue !== null
            ? normalizeOptionalQuestionnaire(currentQuestionnaireValue)
            : undefined;
    if (currentQuestionnaire === null) {
        return null;
    }

    const updatedQuestionnaire = hasUpdatedQuestionnaire ? normalizeOptionalQuestionnaire(updatedQuestionnaireValue) : undefined;
    if (updatedQuestionnaire === null) {
        return null;
    }

    const mergedQuestionnaire =
        currentQuestionnaire !== undefined || updatedQuestionnaire !== undefined
            ? {
                  ...(currentQuestionnaire || {}),
                  ...(updatedQuestionnaire || {}),
              }
            : undefined;

    const dislikedIngredients = resolveCanonicalDislikedIngredients({
        currentUser,
        updatedUser,
        currentQuestionnaire,
        updatedQuestionnaire,
    });
    if (dislikedIngredients === null) {
        return null;
    }

    const currentNutritionTargetsValue = currentUser.nutritionTargets;
    const updatedNutritionTargetsValue = updatedUser.nutritionTargets;
    const hasCurrentNutritionTargets = Object.prototype.hasOwnProperty.call(currentUser, 'nutritionTargets');
    const hasUpdatedNutritionTargets = Object.prototype.hasOwnProperty.call(updatedUser, 'nutritionTargets');
    const currentNutritionTargets =
        hasCurrentNutritionTargets && currentNutritionTargetsValue !== null
            ? normalizeOptionalNutritionTargets(currentNutritionTargetsValue)
            : undefined;
    if (currentNutritionTargets === null) {
        return null;
    }

    const updatedNutritionTargets = hasUpdatedNutritionTargets
        ? normalizeOptionalNutritionTargets(updatedNutritionTargetsValue)
        : undefined;
    if (updatedNutritionTargets === null) {
        return null;
    }

    const mergedNutritionTargets =
        currentNutritionTargets !== undefined || updatedNutritionTargets !== undefined
            ? {
                  ...(currentNutritionTargets || {}),
                  ...(updatedNutritionTargets || {}),
              }
            : undefined;

    const allergies = Object.prototype.hasOwnProperty.call(updatedUser, 'allergies')
        ? updatedUser.allergies
        : mergedQuestionnaire && Object.prototype.hasOwnProperty.call(mergedQuestionnaire, 'allergies')
            ? mergedQuestionnaire.allergies
            : currentUser.allergies;

    const mergedUser = {
        id: pickCanonicalField('id'),
        name: pickCanonicalField('name'),
        email: pickCanonicalField('email'),
        role: pickCanonicalField('role'),
        subscriptionPlan: pickCanonicalField('subscriptionPlan'),
        subscriptionStatus: pickCanonicalField('subscriptionStatus'),
        measurementSystem: pickCanonicalField('measurementSystem'),
        allergies,
        ...(dislikedIngredients === undefined ? {} : { dislikedIngredients }),
        foodGoals: pickCanonicalField('foodGoals'),
        questionnaire: mergedQuestionnaire,
        dietaryProfile: pickCanonicalField('dietaryProfile'),
        nutritionTargets: mergedNutritionTargets,
        dailyCalories: pickCanonicalField('dailyCalories'),
        loginHistory: pickCanonicalField('loginHistory'),
    };

    return buildStoredAuthUserSnapshot(mergedUser, mergedUser.role || currentUser.role);
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

const hasNonWhitespaceCharacters = (value) => typeof value === 'string' && /\S/.test(value);

const validateSignupPassword = (password) => {
    if (!hasNonWhitespaceCharacters(password)) {
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

const normalizeOptionalFoodGoalArray = (values) => {
    if (values === undefined || values === null) {
        return undefined;
    }

    if (!Array.isArray(values)) {
        return null;
    }

    const normalizedFoodGoals = [];

    for (const value of values) {
        if (typeof value !== 'string') {
            return null;
        }

        const trimmedValue = value.trim();
        if (trimmedValue !== '') {
            normalizedFoodGoals.push(trimmedValue);
        }
    }

    return normalizedFoodGoals;
};

const normalizeOptionalIngredientArray = (values) => normalizeOptionalFoodGoalArray(values);

const resolveCanonicalDislikedIngredients = ({
    currentUser,
    updatedUser,
    currentQuestionnaire,
    updatedQuestionnaire,
} = {}) => {
    const candidateSources = [
        updatedUser && Object.prototype.hasOwnProperty.call(updatedUser, 'dislikedIngredients')
            ? updatedUser.dislikedIngredients
            : undefined,
        updatedUser?.dietaryProfile && Object.prototype.hasOwnProperty.call(updatedUser.dietaryProfile, 'excludedIngredients')
            ? updatedUser.dietaryProfile.excludedIngredients
            : undefined,
        updatedQuestionnaire && Object.prototype.hasOwnProperty.call(updatedQuestionnaire, 'disallowedIngredients')
            ? updatedQuestionnaire.disallowedIngredients
            : undefined,
        currentUser && Object.prototype.hasOwnProperty.call(currentUser, 'dislikedIngredients')
            ? currentUser.dislikedIngredients
            : undefined,
        currentUser?.dietaryProfile && Object.prototype.hasOwnProperty.call(currentUser.dietaryProfile, 'excludedIngredients')
            ? currentUser.dietaryProfile.excludedIngredients
            : undefined,
        currentQuestionnaire && Object.prototype.hasOwnProperty.call(currentQuestionnaire, 'disallowedIngredients')
            ? currentQuestionnaire.disallowedIngredients
            : undefined,
    ];

    let sawInvalidSource = false;

    for (const value of candidateSources) {
        const normalizedValues = normalizeOptionalIngredientArray(value);

        if (normalizedValues === undefined) {
            continue;
        }

        if (normalizedValues === null) {
            sawInvalidSource = true;
            continue;
        }

        return normalizedValues;
    }

    return sawInvalidSource ? null : undefined;
};

const normalizeOptionalNutritionTargets = (nutritionTargets) => {
    if (nutritionTargets === undefined) {
        return undefined;
    }

    if (nutritionTargets === null || typeof nutritionTargets !== 'object' || Array.isArray(nutritionTargets)) {
        return null;
    }

    const normalizedNutritionTargets = {};

    for (const field of NUTRITION_TARGET_FIELDS) {
        if (!Object.prototype.hasOwnProperty.call(nutritionTargets, field)) {
            continue;
        }

        const value = nutritionTargets[field];

        if (value === undefined || value === null) {
            normalizedNutritionTargets[field] = value ?? null;
            continue;
        }

        if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
            return null;
        }

        normalizedNutritionTargets[field] = value;
    }

    for (const [minField, maxField] of NUTRITION_TARGET_RANGE_PAIRS) {
        const minValue = normalizedNutritionTargets[minField];
        const maxValue = normalizedNutritionTargets[maxField];

        if (minValue === undefined || maxValue === undefined || minValue === null || maxValue === null) {
            continue;
        }

        if (minValue > maxValue) {
            return null;
        }
    }

    return normalizedNutritionTargets;
};

const normalizeOptionalDietaryProfile = (dietaryProfile) => {
    if (dietaryProfile === undefined) {
        return undefined;
    }

    if (dietaryProfile === null || typeof dietaryProfile !== 'object' || Array.isArray(dietaryProfile)) {
        return null;
    }

    const normalizedDietaryProfile = {};
    const dietaryProfileArrayFields = ['diets', 'allergens', 'excludedIngredients', 'preferredCuisines'];

    for (const field of dietaryProfileArrayFields) {
        if (!Object.prototype.hasOwnProperty.call(dietaryProfile, field)) {
            continue;
        }

        const normalizedValues = normalizeOptionalFoodGoalArray(dietaryProfile[field]);
        if (normalizedValues === null) {
            return null;
        }

        if (normalizedValues === undefined) {
            delete normalizedDietaryProfile[field];
            continue;
        }

        normalizedDietaryProfile[field] = normalizedValues;
    }

    if (Object.prototype.hasOwnProperty.call(dietaryProfile, 'mealsPerDay')) {
        const mealsPerDay = dietaryProfile.mealsPerDay;
        if (mealsPerDay === undefined || mealsPerDay === null) {
            delete normalizedDietaryProfile.mealsPerDay;
        } else if (!Number.isInteger(mealsPerDay) || mealsPerDay < 1 || mealsPerDay > 10) {
            return null;
        } else {
            normalizedDietaryProfile.mealsPerDay = mealsPerDay;
        }
    }

    if (Object.prototype.hasOwnProperty.call(dietaryProfile, 'snacksPerDay')) {
        const snacksPerDay = dietaryProfile.snacksPerDay;
        if (snacksPerDay === undefined || snacksPerDay === null) {
            delete normalizedDietaryProfile.snacksPerDay;
        } else if (!Number.isInteger(snacksPerDay) || snacksPerDay < 0 || snacksPerDay > 5) {
            return null;
        } else {
            normalizedDietaryProfile.snacksPerDay = snacksPerDay;
        }
    }

    if (Object.prototype.hasOwnProperty.call(dietaryProfile, 'dailyBudget')) {
        const dailyBudget = dietaryProfile.dailyBudget;
        if (dailyBudget === undefined || dailyBudget === null) {
            delete normalizedDietaryProfile.dailyBudget;
        } else if (!Number.isFinite(dailyBudget) || dailyBudget < 0) {
            return null;
        } else {
            normalizedDietaryProfile.dailyBudget = dailyBudget;
        }
    }

    if (Object.prototype.hasOwnProperty.call(dietaryProfile, 'maxPrepTimePerMeal')) {
        const maxPrepTimePerMeal = dietaryProfile.maxPrepTimePerMeal;
        if (maxPrepTimePerMeal === undefined || maxPrepTimePerMeal === null) {
            delete normalizedDietaryProfile.maxPrepTimePerMeal;
        } else if (!Number.isFinite(maxPrepTimePerMeal) || maxPrepTimePerMeal < 0) {
            return null;
        } else {
            normalizedDietaryProfile.maxPrepTimePerMeal = maxPrepTimePerMeal;
        }
    }

    if (Object.prototype.hasOwnProperty.call(dietaryProfile, 'maxDifficulty')) {
        const maxDifficulty = dietaryProfile.maxDifficulty;
        if (maxDifficulty === undefined || maxDifficulty === null) {
            delete normalizedDietaryProfile.maxDifficulty;
        } else if (typeof maxDifficulty !== 'string') {
            return null;
        } else {
            const normalizedDifficulty = maxDifficulty.trim().toUpperCase();
            if (!normalizedDifficulty) {
                delete normalizedDietaryProfile.maxDifficulty;
            } else if (!['EASY', 'INTERMEDIATE', 'HARD'].includes(normalizedDifficulty)) {
                return null;
            } else {
                normalizedDietaryProfile.maxDifficulty = normalizedDifficulty;
            }
        }
    }

    return normalizedDietaryProfile;
};

const normalizeOptionalAllergyArray = (values) => {
    if (values === undefined || values === null) {
        return undefined;
    }

    if (!Array.isArray(values)) {
        return null;
    }

    const normalizedAllergies = [];

    for (const value of values) {
        if (typeof value !== 'string') {
            return null;
        }

        const trimmedValue = value.trim();
        if (trimmedValue !== '') {
            normalizedAllergies.push(trimmedValue);
        }
    }

    return normalizedAllergies;
};

const normalizeOptionalQuestionnaire = (questionnaire) => {
    if (questionnaire === undefined) {
        return undefined;
    }

    if (questionnaire === null || typeof questionnaire !== 'object' || Array.isArray(questionnaire)) {
        return null;
    }

    const normalizedQuestionnaire = {};
    const questionnaireArrayFields = ['allergies', 'disallowedIngredients'];

    for (const field of questionnaireArrayFields) {
        if (!Object.prototype.hasOwnProperty.call(questionnaire, field)) {
            continue;
        }

        const normalizedValues = normalizeOptionalAllergyArray(questionnaire[field]);
        if (normalizedValues === null) {
            return null;
        }

        if (normalizedValues === undefined) {
            delete normalizedQuestionnaire[field];
            continue;
        }

        normalizedQuestionnaire[field] = normalizedValues;
    }

    if (Object.prototype.hasOwnProperty.call(questionnaire, 'dietaryPattern')) {
        const dietaryPattern = questionnaire.dietaryPattern;

        if (dietaryPattern === undefined || dietaryPattern === null) {
            delete normalizedQuestionnaire.dietaryPattern;
        } else if (typeof dietaryPattern !== 'string') {
            return null;
        } else {
            const trimmedPattern = dietaryPattern.trim();
            if (trimmedPattern) {
                normalizedQuestionnaire.dietaryPattern = trimmedPattern;
            } else {
                delete normalizedQuestionnaire.dietaryPattern;
            }
        }
    }

    if (Object.prototype.hasOwnProperty.call(questionnaire, 'activityLevel')) {
        const activityLevel = questionnaire.activityLevel;

        if (activityLevel === undefined || activityLevel === null) {
            delete normalizedQuestionnaire.activityLevel;
        } else if (!Number.isFinite(activityLevel) || !Number.isInteger(activityLevel)) {
            return null;
        } else {
            normalizedQuestionnaire.activityLevel = activityLevel;
        }
    }

    return normalizedQuestionnaire;
};

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
        clearAuthSessionStorage(storageAdapter);
        return {
            ok: false,
            user: null,
            error: tokenValidation.error,
        };
    }

    const canonicalUserInfo = buildCanonicalAuthUserSnapshot(userData, tokenValidation.payload);
    if (!canonicalUserInfo) {
        clearAuthSessionStorage(storageAdapter);
        return {
            ok: false,
            user: null,
            error: createAuthTokenValidationError('invalidPayload'),
        };
    }

    try {
        const tokenStored = storageAdapter.setItem('authToken', token);
        const userStored = storageAdapter.setItem('userInfo', JSON.stringify(canonicalUserInfo));

        if (!tokenStored || !userStored) {
            clearAuthSessionStorage(storageAdapter);
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
    } catch (error) {
        clearAuthSessionStorage(storageAdapter);
        return {
            ok: false,
            user: null,
            error: createAuthSessionStorageError('storageUnavailable'),
        };
    }
}

export function saveLoginInfo(token, userData, nowSeconds = Math.floor(Date.now() / 1000)) {
    const result = persistLoginInfo(token, userData, storage, nowSeconds);
    return result.ok ? result.user : null;
}

export function completeSignupSession(sessionResult, { onSuccess, onError } = {}) {
    if (!sessionResult?.ok) {
        const rawMessage = typeof sessionResult?.error?.message === 'string' ? sessionResult.error.message.trim() : '';
        const message = rawMessage || AUTH_SESSION_ERROR_MESSAGES.storageUnavailable;
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

    if (!hasNonWhitespaceCharacters(input.password)) {
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

    const normalizedMeasurementSystem = normalizeAuthMeasurementSystem(input.measurementSystem);
    if (typeof input.measurementSystem !== 'string' || input.measurementSystem.trim() === '') {
        return { valid: false, error: createAuthSignupValidationError('missingMeasurementSystem') };
    }

    if (!normalizedMeasurementSystem) {
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
        const normalizedFoodGoals = normalizeOptionalFoodGoalArray(input.foodGoals);

        if (normalizedFoodGoals === null) {
            return { valid: false, error: createAuthSignupValidationError('invalidFoodGoals') };
        }

        if (normalizedFoodGoals !== undefined) {
            normalizedInput.foodGoals = normalizedFoodGoals;
        }
    }

    if (hasOwnSignupField(input, 'allergies')) {
        const normalizedAllergies = normalizeOptionalAllergyArray(input.allergies);

        if (normalizedAllergies === null) {
            return { valid: false, error: createAuthSignupValidationError('invalidAllergies') };
        }

        if (normalizedAllergies !== undefined) {
            normalizedInput.allergies = normalizedAllergies;
        }
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

const AUTH_MEASUREMENT_SETUP_EMPTY_MESSAGE = 'Complete your measurement setup to continue.';
const AUTH_MEASUREMENT_SETUP_LOADING_MESSAGE = 'Saving your measurement setup...';

export function buildMeasurementSetupFeedbackState({
    isLoading = false,
    errorMessage = '',
    sessionNotice = '',
    successMessage = '',
    emptyMessage = AUTH_MEASUREMENT_SETUP_EMPTY_MESSAGE,
    loadingMessage = AUTH_MEASUREMENT_SETUP_LOADING_MESSAGE,
} = {}) {
    return buildAuthFeedbackState({
        isLoading,
        errorMessage,
        sessionNotice,
        successMessage,
        emptyMessage,
        loadingMessage,
    });
}

const PROFILE_COMPLETENESS_TOTAL_STEPS = 5;
const PROFILE_COMPLETENESS_LOADING_MESSAGE = 'Checking your profile progress...';
const PROFILE_COMPLETENESS_READY_MESSAGE = 'Your profile is complete. Review or save changes to continue.';

const hasMeaningfulProfileArray = (values) =>
    Array.isArray(values) && values.some((value) => typeof value === 'string' ? value.trim() !== '' : value !== null && value !== undefined);

export const hasMeaningfulFoodDislikes = (values) => hasMeaningfulProfileArray(values);

const hasMeaningfulNutritionTargets = (nutritionTargets) =>
    nutritionTargets &&
    typeof nutritionTargets === 'object' &&
    !Array.isArray(nutritionTargets) &&
    NUTRITION_TARGET_FIELDS.some((field) => {
        if (!Object.prototype.hasOwnProperty.call(nutritionTargets, field)) {
            return false;
        }

        const value = nutritionTargets[field];
        return value !== null && value !== undefined && value !== '' && value !== 0;
    });

export function resolveProfileCompletenessStep({ dietaryProfile = {}, nutritionTargets = {} } = {}) {
    if (!dietaryProfile || typeof dietaryProfile !== 'object' || Array.isArray(dietaryProfile)) {
        return 0;
    }

    if (!hasMeaningfulProfileArray(dietaryProfile.diets)) {
        return 0;
    }

    if (
        !hasMeaningfulProfileArray(dietaryProfile.allergens) &&
        !hasMeaningfulProfileArray(dietaryProfile.excludedIngredients)
    ) {
        return 1;
    }

    if (!hasMeaningfulProfileArray(dietaryProfile.preferredCuisines)) {
        return 2;
    }

    if (!hasMeaningfulNutritionTargets(nutritionTargets)) {
        return 3;
    }

    return 4;
}

export function buildProfileCompletenessFeedbackState({
    isLoading = false,
    errorMessage = '',
    sessionNotice = '',
    successMessage = '',
    resumeStep = 0,
    totalSteps = PROFILE_COMPLETENESS_TOTAL_STEPS,
    emptyMessage = '',
    loadingMessage = PROFILE_COMPLETENESS_LOADING_MESSAGE,
    readyMessage = PROFILE_COMPLETENESS_READY_MESSAGE,
} = {}) {
    const isComplete = resumeStep >= totalSteps - 1;
    const resolvedEmptyMessage = emptyMessage || `Resume your profile setup at step ${Math.min(resumeStep, totalSteps - 1) + 1} of ${totalSteps}.`;

    return {
        ...buildAuthFeedbackState({
            isLoading,
            errorMessage,
            sessionNotice,
            successMessage: successMessage || (isComplete ? readyMessage : ''),
            emptyMessage: resolvedEmptyMessage,
            loadingMessage,
        }),
        resumeStep,
        totalSteps,
        isComplete,
    };
}

const HOUSEHOLD_SETUP_TOTAL_STEPS = PROFILE_COMPLETENESS_TOTAL_STEPS;
const HOUSEHOLD_SETUP_LOADING_MESSAGE = 'Checking your household setup...';
const HOUSEHOLD_SETUP_READY_MESSAGE = 'Your household setup is complete. Review or save changes to continue.';

export function buildHouseholdSetupFeedbackState({
    isLoading = false,
    errorMessage = '',
    sessionNotice = '',
    successMessage = '',
    resumeStep = 0,
    totalSteps = HOUSEHOLD_SETUP_TOTAL_STEPS,
    emptyMessage = '',
    loadingMessage = HOUSEHOLD_SETUP_LOADING_MESSAGE,
    readyMessage = HOUSEHOLD_SETUP_READY_MESSAGE,
} = {}) {
    const isComplete = resumeStep >= totalSteps - 1;
    const resolvedEmptyMessage = emptyMessage || `Resume your household setup at step ${Math.min(resumeStep, totalSteps - 1) + 1} of ${totalSteps}.`;

    return {
        ...buildAuthFeedbackState({
            isLoading,
            errorMessage,
            sessionNotice,
            successMessage: successMessage || (isComplete ? readyMessage : ''),
            emptyMessage: resolvedEmptyMessage,
            loadingMessage,
        }),
        resumeStep,
        totalSteps,
        isComplete,
    };
}

const NUTRITION_TARGET_EDITING_EMPTY_MESSAGE = 'Choose calorie and macro targets to keep your optimizer aligned.';
const NUTRITION_TARGET_EDITING_LOADING_MESSAGE = 'Saving your nutrition targets...';
const NUTRITION_TARGET_EDITING_READY_MESSAGE = 'Nutrition targets are ready to save.';

export function buildNutritionTargetEditingFeedbackState({
    isLoading = false,
    errorMessage = '',
    sessionNotice = '',
    successMessage = '',
    hasNutritionTargets = false,
    emptyMessage = NUTRITION_TARGET_EDITING_EMPTY_MESSAGE,
    loadingMessage = NUTRITION_TARGET_EDITING_LOADING_MESSAGE,
    readyMessage = NUTRITION_TARGET_EDITING_READY_MESSAGE,
} = {}) {
    return buildAuthFeedbackState({
        isLoading,
        errorMessage,
        sessionNotice,
        successMessage: successMessage || (hasNutritionTargets ? readyMessage : ''),
        emptyMessage,
        loadingMessage,
    });
}

const AUTH_ALLERGEN_CAPTURE_EMPTY_MESSAGE = 'Choose allergies to keep unsafe meals filtered out.';
const AUTH_ALLERGEN_CAPTURE_LOADING_MESSAGE = 'Saving your allergy preferences...';
const AUTH_ALLERGEN_CAPTURE_READY_MESSAGE = 'Allergy preferences are ready to save.';

export function buildAllergenCaptureFeedbackState({
    isLoading = false,
    errorMessage = '',
    sessionNotice = '',
    successMessage = '',
    hasAllergies = false,
    emptyMessage = AUTH_ALLERGEN_CAPTURE_EMPTY_MESSAGE,
    loadingMessage = AUTH_ALLERGEN_CAPTURE_LOADING_MESSAGE,
    readyMessage = AUTH_ALLERGEN_CAPTURE_READY_MESSAGE,
} = {}) {
    return buildAuthFeedbackState({
        isLoading,
        errorMessage,
        sessionNotice,
        successMessage: successMessage || (hasAllergies ? readyMessage : ''),
        emptyMessage,
        loadingMessage,
    });
}

const FOOD_DISLIKE_CAPTURE_EMPTY_MESSAGE = 'Choose disliked ingredients to keep your recommendations aligned.';
const FOOD_DISLIKE_CAPTURE_LOADING_MESSAGE = 'Saving your food dislikes...';
const FOOD_DISLIKE_CAPTURE_READY_MESSAGE = 'Food dislikes are ready to save.';

export function buildFoodDislikeCaptureFeedbackState({
    isLoading = false,
    errorMessage = '',
    sessionNotice = '',
    successMessage = '',
    hasFoodDislikes = false,
    emptyMessage = FOOD_DISLIKE_CAPTURE_EMPTY_MESSAGE,
    loadingMessage = FOOD_DISLIKE_CAPTURE_LOADING_MESSAGE,
    readyMessage = FOOD_DISLIKE_CAPTURE_READY_MESSAGE,
} = {}) {
    return buildAuthFeedbackState({
        isLoading,
        errorMessage,
        sessionNotice,
        successMessage: successMessage || (hasFoodDislikes ? readyMessage : ''),
        emptyMessage,
        loadingMessage,
    });
}

const AUTH_DIET_PREFERENCE_RANKING_EMPTY_MESSAGE = 'Choose diet goals to shape recommendation order.';
const AUTH_DIET_PREFERENCE_RANKING_LOADING_MESSAGE = 'Saving your diet preferences...';
const AUTH_DIET_PREFERENCE_RANKING_READY_MESSAGE = 'Diet preferences are ready to save.';

export function buildDietPreferenceRankingFeedbackState({
    isLoading = false,
    errorMessage = '',
    sessionNotice = '',
    successMessage = '',
    hasDietGoals = false,
    emptyMessage = AUTH_DIET_PREFERENCE_RANKING_EMPTY_MESSAGE,
    loadingMessage = AUTH_DIET_PREFERENCE_RANKING_LOADING_MESSAGE,
    readyMessage = AUTH_DIET_PREFERENCE_RANKING_READY_MESSAGE,
} = {}) {
    return buildAuthFeedbackState({
        isLoading,
        errorMessage,
        sessionNotice,
        successMessage: successMessage || (hasDietGoals ? readyMessage : ''),
        emptyMessage,
        loadingMessage,
    });
}

export function buildSessionRefreshFeedbackState({
    isLoading = false,
    authLoading = false,
    mutationLoading = false,
    devLoading = false,
    errorMessage = '',
    sessionNotice = '',
    successMessage = '',
    emptyMessage = 'Ready to sign in.',
    loadingMessage = 'Refreshing your session...',
    pendingLoadingMessage = 'Signing you in...',
} = {}) {
    const resolvedIsLoading = isLoading || authLoading || mutationLoading || devLoading;
    const useSessionRefreshMessage = authLoading || (!mutationLoading && !devLoading && resolvedIsLoading);
    const prioritizedErrorMessage = sessionNotice || errorMessage;

    return buildAuthFeedbackState({
        isLoading: resolvedIsLoading,
        errorMessage: prioritizedErrorMessage,
        sessionNotice: '',
        successMessage,
        emptyMessage,
        loadingMessage: useSessionRefreshMessage ? loadingMessage : pendingLoadingMessage,
    });
}

export function buildDevLoginAvailabilityState({
    isDevelopment = false,
    isLoading = false,
    readyMessage = 'Dev quick login is ready.',
    loadingMessage = 'Signing you in...',
    blockedMessage = 'Dev quick login is disabled outside development.',
} = {}) {
    if (!isDevelopment) {
        return {
            state: 'blocked',
            message: blockedMessage,
            role: 'status',
            ariaLive: 'polite',
            minHeight: AUTH_FEEDBACK_MIN_HEIGHT,
            showSpinner: false,
        };
    }

    if (isLoading) {
        return buildAuthFeedbackState({
            isLoading: true,
            loadingMessage,
        });
    }

    return buildAuthFeedbackState({
        emptyMessage: readyMessage,
    });
}

export function buildAuthFeedbackContainerStyles(state = 'empty') {
    if (state === 'blocked') {
        return AUTH_FEEDBACK_SURFACE_STYLES.neutral;
    }

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
