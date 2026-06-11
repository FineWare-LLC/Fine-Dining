// @ts-nocheck
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { withErrorHandling } from './baseImports';
import { checkActionRateLimit } from '@/lib/rateLimit';
import { sanitizeString } from '@/lib/sanitize';
import { normalizeTier } from '@/lib/tiers';
import User from '@/models/User/index';

/**
 * Logs in a user by verifying credentials.
 *
 * @function loginUser
 * @param {Object} _parent - Parent resolver result.
 * @param {Object} param0 - Object containing email and password.
 * @param {string} param0.email - The user's email.
 * @param {string} param0.password - The user's password.
 * @param {Object} context - GraphQL context.
 * @returns {Promise<Object>} An object with token and user info.
 * @throws {Error} Throws an error if email or password is not provided.
 * @throws {Error} Throws an error if the credentials are invalid.
 * @throws {Error} Throws an error if the JWT_SECRET is not defined.
 */
export const loginUser = withErrorHandling(async (_parent, { email, password }, context) => {
    // Validate and sanitize inputs
    if (!email || !password) {
        throw new Error('Email and password are required.');
    }
    email = sanitizeString(email.trim().toLowerCase());
    
    // Rate limit login attempts by IP
    if (context.ip && !checkActionRateLimit(`login:ip:${context.ip}`, 5, 15 * 60 * 1000)) {
        throw new Error('Too many login attempts from this IP. Please try again in 15 minutes.');
    }
    // Rate limit login attempts by Email (to prevent targeted brute force)
    if (!checkActionRateLimit(`login:email:${email}`, 5, 15 * 60 * 1000)) {
        throw new Error('Too many login attempts for this account. Please try again in 15 minutes.');
    }

    // Find the user by email (include password for comparison)
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
        // Return a generic error message to avoid revealing if the user exists.
        throw new Error('Invalid credentials');
    }

    // Compare the provided password with the stored hashed password.
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
        await new Promise(resolve => setTimeout(resolve, 500)); // Consistent 500ms delay
        throw new Error('Invalid credentials');
    }


    // Update last login time (could also log the IP address here)
    user.lastLogin = new Date();
    await user.save();

    // Retrieve the secret key and options from environment variables.
    const secret = process.env.JWT_SECRET;
    const issuer = process.env.JWT_ISSUER;
    const audience = process.env.JWT_AUDIENCE;

    if (!secret) {
        console.error('FATAL ERROR: JWT_SECRET is not defined in environment variables.');
        throw new Error('Authentication configuration error.');
    }

    // Create a JWT token with a 1-day expiration using HS256.
    const token = jwt.sign(
        { userId: user._id.toString(), email: user.email, role: user.role, subscriptionPlan: normalizeTier(user.subscriptionPlan) },
        secret,
        { 
            expiresIn: '1d', 
            algorithm: 'HS256',
            ...(issuer && { issuer }),
            ...(audience && { audience }),
        },
    );

    return {
        token,
        user: {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            accountStatus: user.accountStatus,
            subscriptionPlan: normalizeTier(user.subscriptionPlan),
            subscriptionStatus: user.subscriptionStatus,
            subscriptionCurrentPeriodEnd: user.subscriptionCurrentPeriodEnd,
        },
    };
});

/**
 * Initiates a password reset by generating a reset token.
 *
 * @function requestPasswordReset
 * @param {Object} _parent - Parent resolver result.
 * @param {Object} param0 - Object containing email.
 * @param {string} param0.email - The user's email.
 * @param {Object} context - GraphQL context.
 * @returns {Promise<Boolean>} True if successful.
 * @throws {Error} Throws an error if email is not provided.
 */
export const requestPasswordReset = withErrorHandling(async (_parent, { email }, context) => {
    // Check if an email was provided.
    if (!email) {
        throw new Error('Email is required.');
    }

    // Normalize email input.
    const normalizedEmail = sanitizeString(email.trim().toLowerCase());

    // Rate limit reset requests
    if (context.ip && !checkActionRateLimit(`reset_request:ip:${context.ip}`, 3, 60 * 60 * 1000)) {
        throw new Error('Too many password reset requests. Please try again in an hour.');
    }
    if (!checkActionRateLimit(`reset_request:email:${normalizedEmail}`, 3, 60 * 60 * 1000)) {
        // Return true to avoid enumeration even when rate limited by email
        return true;
    }

    // Validate the email format.
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
        throw new Error('Invalid email format.');
    }

    // OPTIONAL: Rate limiting logic could be added here to prevent abuse.
    // e.g., check how many password reset requests have been made from this IP or for this email.

    // Look up the user by the normalized email.
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
        // Log the attempt without revealing that the email doesn't exist.
        console.info(`Password reset requested for non-existing email: ${normalizedEmail}`);
        // Always return true to avoid revealing user existence.
        return true;
    }

    // Generate a secure password reset token using the user model's method.
    // This method should set a token and an expiry on the user.
    const resetToken = user.generatePasswordResetToken();

    // Save the token and its expiry in the user's record.
    await user.save();

    // OPTIONAL: Send the reset token to the user's email.
    try {
        // Assume sendResetEmail is a function that sends an email.
        await sendResetEmail(normalizedEmail, resetToken);
        console.info(`Password reset email sent to: ${normalizedEmail}`);
    } catch (emailError) {
        console.error(`Failed to send password reset email to ${normalizedEmail}:`, emailError);
        // You might choose to log the error and fail silently to avoid giving feedback to an attacker.
    }

    // Return true regardless, to prevent user enumeration.
    return true;
});

/**
 * Resets the user's password using a reset token.
 *
 * @function resetPassword
 * @param {Object} _parent - Parent resolver result.
 * @param {Object} param0 - Object containing resetToken and newPassword.
 * @param {string} param0.resetToken - The token received by the user.
 * @param {string} param0.newPassword - The user's new password.
 * @param {Object} context - GraphQL context.
 * @returns {Promise<Boolean>} True if successful.
 * @throws {Error} Throws an error if resetToken or newPassword is not provided.
 * @throws {Error} Throws an error if the password is less than 8 characters.
 * @throws {Error} Throws an error if the reset token is invalid or expired.
 */
export const resetPassword = withErrorHandling(async (_parent, { resetToken, newPassword }, context) => {
    if (!resetToken || !newPassword) {
        throw new Error('Reset token and new password are required.');
    }

    // Rate limit password reset attempts
    if (context.ip && !checkActionRateLimit(`reset_password:ip:${context.ip}`, 5, 1 * 60 * 60 * 1000)) {
        throw new Error('Too many password reset attempts. Please try again in an hour.');
    }

    // Password strength validation
    if (newPassword.length < 8) {
        throw new Error('Password must be at least 8 characters long.');
    }
    if (!/[A-Z]/.test(newPassword)) {
        throw new Error('Password must contain at least one uppercase letter.');
    }
    if (!/[a-z]/.test(newPassword)) {
        throw new Error('Password must contain at least one lowercase letter.');
    }
    if (!/[0-9]/.test(newPassword)) {
        throw new Error('Password must contain at least one number.');
    }
    if (!/[^A-Za-z0-9]/.test(newPassword)) {
        throw new Error('Password must contain at least one special character.');
    }

    // DO NOT sanitize passwords (HTML escaping can break them); preserve the exact secret string.
    const password = newPassword;

    const user = await User.findOne({ passwordResetToken: resetToken });
    if (!user) {
        throw new Error('Invalid or expired reset token.');
    }

    const isValid = user.validatePasswordResetToken(resetToken);
    if (!isValid) {
        throw new Error('Invalid or expired reset token.');
    }

    // Update the password and clear reset token data.
    const previousPassword = user.password;
    const previousResetToken = user.passwordResetToken;
    const previousResetTokenExpiry = user.passwordResetTokenExpiry;

    user.password = password;
    user.passwordResetToken = null;
    user.passwordResetTokenExpiry = null;

    try {
        await user.save();
        return true;
    } catch (error) {
        // Restore the document snapshot so a failed save does not leave a half-reset user in memory.
        user.password = previousPassword;
        user.passwordResetToken = previousResetToken;
        user.passwordResetTokenExpiry = previousResetTokenExpiry;
        throw error;
    }
});
