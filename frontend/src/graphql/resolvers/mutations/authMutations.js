import { withErrorHandling } from './baseImports.js';
import User from '@/models/User/index.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

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
 * @throws {Error} Throws an error if the user is not found.
 * @throws {Error} Throws an error if the credentials are invalid.
 * @throws {Error} Throws an error if the JWT_SECRET is not defined.
 */
export const loginUser = withErrorHandling(async (_parent, { email, password }, context) => {
  // Validate inputs
  if (!email || !password) {
    throw new Error('Email and password are required.');
  }

  // (Optional) Rate limiting could be applied here to throttle repeated attempts.

  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new Error('User not found');
  }

  // Use bcrypt to compare passwords securely (constant-time comparison)
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    throw new Error('Invalid credentials');
  }

  // Update last login time
  user.lastLogin = new Date();
  await user.save();

  // Ensure JWT_SECRET is defined
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error('FATAL ERROR: JWT_SECRET is not defined in environment variables.');
    throw new Error('Authentication configuration error.');
  }

  // Create JWT token with HS256 algorithm and a 1-day expiration
  const token = jwt.sign(
      { userId: user._id.toString(), email: user.email, role: user.role },
      secret,
      { expiresIn: '1d', algorithm: 'HS256' }
  );

  return {
    token,
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      accountStatus: user.accountStatus,
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
  if (!email) {
    throw new Error('Email is required.');
  }
  const user = await User.findOne({ email });
  // Return true regardless of user existence to prevent enumeration.
  if (!user) {
    return true;
  }
  // Generate a secure password reset token.
  const resetToken = user.generatePasswordResetToken();
  await user.save();

  // Integration with a secure email service would go here.

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
  // Optionally, enforce password complexity rules.
  if (newPassword.length < 8) {
    throw new Error('Password must be at least 8 characters long.');
  }
  const user = await User.findOne({ passwordResetToken: resetToken });
  if (!user) {
    throw new Error('Invalid or expired reset token.');
  }
  const isValid = user.validatePasswordResetToken(resetToken);
  if (!isValid) {
    throw new Error('Invalid or expired reset token.');
  }
  user.password = newPassword;
  user.passwordResetToken = null;
  user.passwordResetTokenExpiry = null;
  await user.save();
  return true;
});