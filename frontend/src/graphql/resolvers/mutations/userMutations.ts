// @ts-nocheck
import {withErrorHandling} from './baseImports';
import jwt from 'jsonwebtoken';
import { checkActionRateLimit } from '@/lib/rateLimit';
import { sanitizeString } from '@/lib/sanitize';
import { normalizeTier } from '@/lib/tiers';
import { buildUpdatedAuthUserSnapshot, createAuthProfileValidationError } from '@/context/authUtils';
import User from '@/models/User/index';

function validatePassword(password) {
    if (password.length < 8) throw new Error('Password must be at least 8 characters long.');
    if (!/[A-Z]/.test(password)) throw new Error('Password must contain at least one uppercase letter.');
    if (!/[a-z]/.test(password)) throw new Error('Password must contain at least one lowercase letter.');
    if (!/[0-9]/.test(password)) throw new Error('Password must contain at least one number.');
    if (!/[^A-Za-z0-9]/.test(password)) throw new Error('Password must contain at least one special character.');
}

function sanitizeUserInput(input) {
    const sanitizedInput = {};
    for (const [key, value] of Object.entries(input)) {
        if (key === 'password') {
            sanitizedInput[key] = value;
        } else if (typeof value === 'string') {
            sanitizedInput[key] = sanitizeString(value.trim());
        } else if (Array.isArray(value)) {
            sanitizedInput[key] = value.map(v => typeof v === 'string' ? sanitizeString(v) : v);
        } else {
            sanitizedInput[key] = value;
        }
    }
    return sanitizedInput;
}

function hasSensitiveNotesField(value) {
    return Boolean(
        value &&
        typeof value === 'object' &&
        !Array.isArray(value) &&
        Object.prototype.hasOwnProperty.call(value, 'adminNotes'),
    );
}

function rejectSensitiveProfileNotes(input) {
    if (
        hasSensitiveNotesField(input) ||
        hasSensitiveNotesField(input?.dietaryProfile) ||
        hasSensitiveNotesField(input?.questionnaire)
    ) {
        throw createAuthProfileValidationError('invalidPayload');
    }
}

function signAuthToken(user) {
    const secret = process.env.JWT_SECRET;
    const issuer = process.env.JWT_ISSUER;
    const audience = process.env.JWT_AUDIENCE;
    if (!secret) {
        throw new Error('Authentication configuration error.');
    }
    return jwt.sign(
        {
            userId: user._id.toString(),
            email: user.email,
            role: user.role,
            subscriptionPlan: normalizeTier(user.subscriptionPlan),
        },
        secret,
        {
            expiresIn: '1d',
            algorithm: 'HS256',
            ...(issuer && { issuer }),
            ...(audience && { audience }),
        },
    );
}

/**
 * Creates a new user with the provided input.
 *
 * @function createUser
 * @param {Object} _parent - Parent resolver result.
 * @param {Object} param0 - Object containing the user input.
 * @param {Object} param0.input - The user input data.
 * @param {string} param0.input.email - The user's email.
 * @param {string} param0.input.password - The user's password.
 * @param {Object} context - GraphQL context.
 * @returns {Promise<Object>} The created user.
 * @throws {Error} Throws an error if email is not provided.
 * @throws {Error} Throws an error if password is not provided or is less than 8 characters.
 * @throws {Error} Throws an error if the email is already in use.
 */
export const createUser = withErrorHandling(async (_parent, { input }, context) => {
    // Rate limit account creation by IP
    if (context.ip && !checkActionRateLimit(`create_account:ip:${context.ip}`, 5, 24 * 60 * 60 * 1000)) {
        throw new Error('Too many accounts created from this IP. Please try again tomorrow.');
    }

    // Validate required fields
    if (!input.email) {
        throw new Error('Email is required.');
    }
    
    // Password strength validation
    const password = input.password || '';
    validatePassword(password);
    rejectSensitiveProfileNotes(input);

    // Prevent user from setting sensitive fields on creation
    // Allow CREATOR and INFLUENCER roles for public registration
    if (input.role && ['ADMIN', 'SUPER_ADMIN'].includes(input.role)) {
        delete input.role;
    }
    if (input.accountStatus) delete input.accountStatus;

    const sanitizedInput = sanitizeUserInput(input);
    sanitizedInput.email = sanitizedInput.email.toLowerCase();
    sanitizedInput.subscriptionPlan = 'FREE';

    const existingUser = await User.findOne({ email: sanitizedInput.email });
    if (existingUser) {
        throw new Error('Email already in use');
    }

    // Create user; note that password hashing is expected to be done via middleware on the User model.
    return User.create(sanitizedInput);
});

export const registerUser = withErrorHandling(async (_parent, { input }, context) => {
    const user = await createUser(_parent, { input: { ...input, role: 'USER' } }, context);
    const token = signAuthToken(user);
    return { token, user };
});

/**
 * Updates an existing user by ID.
 *
 * @function updateUser
 * @param {Object} _parent - Parent resolver result.
 * @param {Object} param0 - Object containing user ID and update input.
 * @param {string} param0.id - The user's ID.
 * @param {Object} param0.input - The fields to update.
 * @param {Object} context - GraphQL context.
 * @returns {Promise<Object>} The updated user.
 * @throws {Error} Throws an error if the user is not authenticated.
 * @throws {Error} Throws an error if the user is not authorized to update the profile.
 * @throws {Error} Throws an error if the user is not found.
 */
export const updateUser = withErrorHandling(async (_parent, { id, input }, context) => {
    // Authentication check
    if (!context.user?.userId) {
        throw new Error('Authentication required');
    }
    // Prevent non-admins from modifying sensitive fields
    if (context.user.role !== 'ADMIN') {
        delete input.role;
        delete input.accountStatus;
    }
    // Authorization: Only allow self-update or admin privilege
    if (context.user.userId !== id && context.user.role !== 'ADMIN') {
        throw new Error('Authorization required: You can only update your own profile.');
    }
    rejectSensitiveProfileNotes(input);
    const user = await User.findById(id);
    if (!user) {
        throw new Error(`User with ID ${id} not found`);
    }
    const sanitizedInput = {};
    for (const [key, value] of Object.entries(input)) {
        if (typeof value === 'string') {
            sanitizedInput[key] = sanitizeString(value.trim());
        } else if (Array.isArray(value)) {
            sanitizedInput[key] = value.map(v => typeof v === 'string' ? sanitizeString(v) : v);
        } else {
            sanitizedInput[key] = value;
        }
    }

    const currentUserSnapshot = typeof user.toObject === 'function' ? user.toObject() : user;
    const canonicalProfile = buildUpdatedAuthUserSnapshot(currentUserSnapshot, sanitizedInput);
    if (!canonicalProfile) {
        throw new Error('Please review the profile details and try again.');
    }

    const updateFields = { ...canonicalProfile };
    delete updateFields.id;

    return User.findByIdAndUpdate(id, updateFields, { new: true, runValidators: true });
});

/**
 * Deletes a user by ID.
 *
 * @function deleteUser
 * @param {Object} _parent - Parent resolver result.
 * @param {Object} param0 - Object containing the user ID.
 * @param {string} param0.id - The user's ID.
 * @param {Object} context - GraphQL context.
 * @returns {Promise<Boolean>} True if deletion was successful.
 * @throws {Error} Throws an error if the user is not authenticated.
 * @throws {Error} Throws an error if the user is not authorized to delete the profile.
 */
export const deleteUser = withErrorHandling(async (_parent, { id }, context) => {
    // Ensure the user is authenticated
    if (!context.user?.userId) {
        throw new Error('Authentication required');
    }
    // Only allow self-deletion or admin privilege
    if (context.user.userId !== id && context.user.role !== 'ADMIN') {
        throw new Error('Authorization required: You can only delete your own profile or be an admin.');
    }
    const result = await User.findByIdAndDelete(id);
    return Boolean(result);
});

export const upsertQuestionnaire = withErrorHandling(async (_parent, { id, input }, context) => {
    if (!context.user?.userId) {
        throw new Error('Authentication required');
    }
    if (context.user.userId !== id && context.user.role !== 'ADMIN') {
        throw new Error('Authorization required: You can only update your own questionnaire or be an admin.');
    }
    const user = await User.findById(id);
    if (!user) {
        throw new Error(`User with ID ${id} not found`);
    }
    const sanitizedInput = {};
    for (const [key, value] of Object.entries(input)) {
        if (typeof value === 'string') {
            sanitizedInput[key] = sanitizeString(value.trim());
        } else if (Array.isArray(value)) {
            sanitizedInput[key] = value.map(v => typeof v === 'string' ? sanitizeString(v) : v);
        } else {
            sanitizedInput[key] = value;
        }
    }
    user.questionnaire = { ...(user.questionnaire || {}), ...sanitizedInput };
    await user.save();
    return user.questionnaire;
});

/**
 * Upgrades a user's role/tier.
 * In a real-world scenario, this would be triggered after a successful payment.
 *
 * @function upgradeUserRole
 * @param {Object} _parent - Parent resolver result.
 * @param {Object} param0 - Object containing user ID and new role.
 * @param {string} param0.id - The user's ID.
 * @param {string} param0.role - The new role.
 * @param {Object} context - GraphQL context.
 * @returns {Promise<Object>} The updated user.
 */
export const upgradeUserRole = withErrorHandling(async (_parent, { id, role }, context) => {
    // Authentication check
    if (!context.user?.userId) {
        throw new Error('Authentication required');
    }
    // Authorization: Only allow self-upgrade or admin privilege
    if (context.user.userId !== id && context.user.role !== 'ADMIN') {
        throw new Error('Authorization required: You can only upgrade your own profile.');
    }

    const user = await User.findById(id);
    if (!user) {
        throw new Error(`User with ID ${id} not found`);
    }

    user.role = role;
    await user.save();
    return user;
});

export const updateSubscriptionPlan = withErrorHandling(async (_parent, { id, plan }, context) => {
    if (!context.user?.userId) {
        throw new Error('Authentication required');
    }
    if (context.user.userId !== id && context.user.role !== 'ADMIN') {
        throw new Error('Authorization required: Only admins can directly change subscription plans.');
    }
    const normalizedPlan = normalizeTier(plan);
    const user = await User.findById(id);
    if (!user) {
        throw new Error(`User with ID ${id} not found`);
    }
    user.subscriptionPlan = normalizedPlan;
    user.subscriptionStatus = normalizedPlan === 'FREE' ? 'inactive' : 'active';
    await user.save();
    return user;
});
