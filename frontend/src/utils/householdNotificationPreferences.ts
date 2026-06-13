// @ts-nocheck

const HOUSEHOLD_NOTIFICATION_PREFERENCES_ERROR_MESSAGES = {
    invalidPayload: 'We could not read your household notification preferences. Please refresh the planner.',
};

const DEFAULT_HOUSEHOLD_NOTIFICATION_PREFERENCES = {
    language: 'en',
    darkMode: false,
    emailNotifications: true,
    pushNotifications: false,
    smsNotifications: false,
    marketingOptIn: false,
};

export class HouseholdNotificationPreferencesValidationError extends Error {
    constructor(code, message = HOUSEHOLD_NOTIFICATION_PREFERENCES_ERROR_MESSAGES.invalidPayload) {
        super(message);
        this.name = 'HouseholdNotificationPreferencesValidationError';
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

const createHouseholdNotificationPreferencesValidationError = (code) => (
    new HouseholdNotificationPreferencesValidationError(
        code,
        HOUSEHOLD_NOTIFICATION_PREFERENCES_ERROR_MESSAGES[code]
            || HOUSEHOLD_NOTIFICATION_PREFERENCES_ERROR_MESSAGES.invalidPayload,
    )
);

const isPlainObject = (value) => (
    value !== null
    && typeof value === 'object'
    && !Array.isArray(value)
);

const normalizeOptionalString = (value) => {
    if (value === undefined || value === null) {
        return undefined;
    }

    if (typeof value !== 'string') {
        return null;
    }

    const trimmedValue = value.trim();
    return trimmedValue === '' ? undefined : trimmedValue;
};

const normalizeOptionalBoolean = (value) => {
    if (value === undefined || value === null) {
        return undefined;
    }

    if (typeof value !== 'boolean') {
        return null;
    }

    return value;
};

const buildInvalidNotificationPreferencesResult = () => ({
    valid: false,
    preferences: null,
    error: createHouseholdNotificationPreferencesValidationError('invalidPayload'),
});

const buildValidNotificationPreferencesResult = (preferences) => ({
    valid: true,
    preferences,
    error: null,
});

export function validateHouseholdNotificationPreferences(preferences) {
    if (preferences === undefined || preferences === null) {
        return buildValidNotificationPreferencesResult({
            ...DEFAULT_HOUSEHOLD_NOTIFICATION_PREFERENCES,
        });
    }

    if (!isPlainObject(preferences)) {
        return buildInvalidNotificationPreferencesResult();
    }

    const normalizedPreferences = {
        ...DEFAULT_HOUSEHOLD_NOTIFICATION_PREFERENCES,
    };

    if (Object.prototype.hasOwnProperty.call(preferences, 'language')) {
        const normalizedLanguage = normalizeOptionalString(preferences.language);
        if (normalizedLanguage === null) {
            return buildInvalidNotificationPreferencesResult();
        }

        if (normalizedLanguage !== undefined) {
            normalizedPreferences.language = normalizedLanguage;
        }
    }

    for (const field of [
        'darkMode',
        'emailNotifications',
        'pushNotifications',
        'smsNotifications',
        'marketingOptIn',
    ]) {
        if (!Object.prototype.hasOwnProperty.call(preferences, field)) {
            continue;
        }

        const normalizedValue = normalizeOptionalBoolean(preferences[field]);
        if (normalizedValue === null) {
            return buildInvalidNotificationPreferencesResult();
        }

        if (normalizedValue !== undefined) {
            normalizedPreferences[field] = normalizedValue;
        }
    }

    return buildValidNotificationPreferencesResult(normalizedPreferences);
}

const normalizeHouseholdNotificationPreferencesUserSnapshot = (user) => {
    if (!user || typeof user !== 'object' || Array.isArray(user)) {
        return user;
    }

    const validation = validateHouseholdNotificationPreferences(user.preferences);
    if (!validation.valid) {
        throw validation.error;
    }

    user.preferences = validation.preferences;
    return user;
};

export function normalizeHouseholdNotificationPreferencesSnapshot(household) {
    if (!household || typeof household !== 'object' || Array.isArray(household)) {
        return household;
    }

    if (household.owner !== undefined) {
        household.owner = normalizeHouseholdNotificationPreferencesUserSnapshot(household.owner);
    }

    if (Array.isArray(household.members)) {
        household.members = household.members.map((member) => {
            if (!member || typeof member !== 'object' || Array.isArray(member)) {
                return member;
            }

            return {
                ...member,
                user: normalizeHouseholdNotificationPreferencesUserSnapshot(member.user),
            };
        });
    }

    return household;
}
