/**
 * @file user.methods.js
 * @description Instance methods attached to user documents for password reset, 2FA, etc.
 */

import crypto from 'crypto';
import bcrypt from 'bcrypt';

/**
 * Generate a password reset token & expiry (forgot password).
 * @returns {string} The generated reset token (to be emailed or otherwise delivered).
 */
export function generatePasswordResetToken() {
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiry = Date.now() + 3600000; // 1 hour from now

    this.passwordResetToken = resetToken;
    this.passwordResetTokenExpiry = new Date(expiry);

    return resetToken;
}

/**
 * Validate if the provided token is still valid.
 * @param {string} token - The token to compare.
 * @returns {boolean} True if valid, false otherwise.
 */
export function validatePasswordResetToken(token) {
    if (!this.passwordResetToken || !this.passwordResetTokenExpiry) return false;
    if (this.passwordResetTokenExpiry < Date.now()) return false;
    return this.passwordResetToken === token;
}

/**
 * Generate a magic link token (similar to a reset token).
 * @returns {string} The generated magic link token.
 */
export function generateMagicLinkToken() {
    const token = crypto.randomBytes(20).toString('hex');
    this.magicLinkToken = token;
    this.magicLinkExpiry = new Date(Date.now() + 3600000); // 1 hour
    return token;
}

/**
 * Enable 2FA for the user.
 * @param {string} [method='TOTP'] - The 2FA method (TOTP, SMS, EMAIL, etc.)
 * @param {string} [secret=''] - The secret key if using TOTP-based 2FA.
 */
export function enableTwoFactor(method = 'TOTP', secret = '') {
    this.twoFactorEnabled = true;
    this.twoFactorMethod = method;
    this.twoFactorSecret = secret;
}

/**
 * Disable 2FA for the user.
 */
export function disableTwoFactor() {
    this.twoFactorEnabled = false;
    this.twoFactorMethod = 'NONE';
    this.twoFactorSecret = null;
}

/**
 * Compare the candidate password with the stored password hash.
 * @param {string} candidatePassword - Password to compare against stored hash.
 * @returns {Promise<boolean>} Resolves true if password matches, false otherwise.
 */
export async function comparePassword(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
}
