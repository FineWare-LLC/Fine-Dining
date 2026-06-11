/**
 * @file user.methods.js
 * @description Instance methods attached to user documents for password reset, magic link generation, 2FA management, and password comparison.
 */

import crypto from 'crypto';
import bcrypt from 'bcrypt';

/**
 * Generate a secure password reset token and set its expiry.
 * This token is meant to be sent to the user (e.g. via email) to allow a password reset.
 *
 * @returns {string} The generated reset token.
 */
export function generatePasswordResetToken() {
    // Generate a cryptographically secure token (32 bytes in hexadecimal)
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Set token expiry to 1 hour from now.
    const expiryTime = Date.now() + 3600000; // 3600000ms = 1 hour

    // Assign the token and its expiry to the user document.
    this.passwordResetToken = resetToken;
    this.passwordResetTokenExpiry = new Date(expiryTime);

    return resetToken;
}

/**
 * Validate the provided password reset token.
 * Checks whether the token matches the stored token and if it has not expired.
 *
 * @param {string} token - The token to validate.
 * @returns {boolean} True if the token is valid; otherwise, false.
 */
export function validatePasswordResetToken(token) {
    // Ensure a token and expiry exist on the document.
    if (!this.passwordResetToken || !this.passwordResetTokenExpiry) return false;

    // Check if the token has expired.
    if (this.passwordResetTokenExpiry < Date.now()) return false;

    // Compare the provided token with the stored token.
    return this.passwordResetToken === token;
}

/**
 * Generate a magic link token for passwordless login.
 * This token is similar to a reset token and is valid for 1 hour.
 *
 * @returns {string} The generated magic link token.
 */
export function generateMagicLinkToken() {
    // Generate a token (20 bytes in hexadecimal is sufficient for a magic link)
    const token = crypto.randomBytes(20).toString('hex');

    // Set the magic link token and expiry on the document.
    this.magicLinkToken = token;
    this.magicLinkExpiry = new Date(Date.now() + 3600000); // 1 hour

    return token;
}

/**
 * Enable Two-Factor Authentication (2FA) for the user.
 * Allows specifying a method and secret (for TOTP).
 *
 * @param {string} [method='TOTP'] - The 2FA method (e.g., 'TOTP', 'SMS', 'EMAIL').
 * @param {string} [secret=''] - The secret key for TOTP-based 2FA.
 */
export function enableTwoFactor(method = 'TOTP', secret = '') {
    // Validate the method input if needed (e.g., check against allowed methods)
    if (typeof method !== 'string' || method.trim() === '') {
        throw new Error('Invalid 2FA method specified.');
    }

    // For TOTP, ensure a secret is provided.
    if (method === 'TOTP' && (!secret || typeof secret !== 'string' || secret.trim() === '')) {
        throw new Error('A secret key is required for TOTP-based 2FA.');
    }

    this.twoFactorEnabled = true;
    this.twoFactorMethod = method;
    this.twoFactorSecret = secret.trim() || null;
}

/**
 * Disable Two-Factor Authentication (2FA) for the user.
 */
export function disableTwoFactor() {
    this.twoFactorEnabled = false;
    this.twoFactorMethod = 'NONE';
    this.twoFactorSecret = null;
}

/**
 * Compare a candidate password with the stored hashed password.
 *
 * @param {string} candidatePassword - The password to compare.
 * @returns {Promise<boolean>} Resolves to true if the password matches; otherwise, false.
 */
export async function comparePassword(candidatePassword) {
    // Validate input: ensure candidatePassword is a non-empty string.
    if (typeof candidatePassword !== 'string' || candidatePassword.trim() === '') {
        throw new Error('A valid password must be provided for comparison.');
    }

    // Compare the candidate password with the stored hash using bcrypt.
    return bcrypt.compare(candidatePassword, this.password);
}
