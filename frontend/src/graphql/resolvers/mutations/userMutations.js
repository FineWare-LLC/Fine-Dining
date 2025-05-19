import {withErrorHandling} from './baseImports.js';
import User from '@/models/User/index.js';
import { sanitizeString } from '@/lib/sanitize.js';

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
  // Validate required fields
  if (!input.email) {
    throw new Error('Email is required.');
  }
  if (!input.password || input.password.length < 8) {
    throw new Error('Password must be at least 8 characters long.');
  }

  // Optionally validate email format here using regex if needed
  // Example:
  // const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  // if (!emailRegex.test(input.email)) {
  //   throw new Error('Invalid email format.');
  // }

  // Prevent user from setting sensitive fields on creation
  if (input.role) delete input.role;
  if (input.accountStatus) delete input.accountStatus;

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

  const existingUser = await User.findOne({ email: sanitizedInput.email });
  if (existingUser) {
    throw new Error('Email already in use');
  }

  // Create user; note that password hashing is expected to be done via middleware on the User model.
  return User.create(sanitizedInput);
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
  return User.findByIdAndUpdate(id, { ...sanitizedInput }, { new: true });
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