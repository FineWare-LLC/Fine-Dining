import { withErrorHandling } from './baseQueries.js';
import User from '@/models/User/index.js';
import { paginateQuery } from '@/utils/pagination.js';

/**
 * Retrieves a single user by ID.
 *
 * @function getUser
 * @param {object} _parent
 * @param {object} args - Contains { id }
 * @param {object} context - GraphQL context.
 * @returns {Promise<User|null>} The user document or null.
 */
export const getUser = withErrorHandling(async (_parent, { id }, context) => {
  if (!context.user?.userId) {
    throw new Error('Authentication required');
  }
  if (context.user.userId !== id && context.user.role !== 'ADMIN') {
    throw new Error('Authorization required: You can only get your own profile or be an admin.');
  }
  return User.findById(id);
});

/**
 * Retrieves a paginated list of users.
 *
 * @function getUsers
 * @param {object} _parent
 * @param {object} args - Contains { page, limit }
 * @param {object} context - GraphQL context.
 * @returns {Promise<User[]>} An array of user documents.
 */
export const getUsers = withErrorHandling(async (_parent, { page, limit }, context) => {
  if (!context.user?.userId || context.user.role !== 'ADMIN') {
    throw new Error('Authorization required: Only admins can get all users.');
  }
  return paginateQuery(User, page, limit);
});

/**
 * Searches users by matching a keyword against name or email.
 *
 * @function searchUsers
 * @param {object} _parent
 * @param {object} args - Contains { keyword }
 * @param {object} context - GraphQL context.
 * @returns {Promise<User[]>} An array of user documents.
 */
export const searchUsers = withErrorHandling(async (_parent, { keyword }, context) => {
  if (!context.user?.userId || context.user.role !== 'ADMIN') {
    throw new Error('Authorization required: Only admins can search users.');
  }
  return User.find({
    $or: [
      { name: { $regex: keyword, $options: 'i' } },
      { email: { $regex: keyword, $options: 'i' } }
    ]
  });
});