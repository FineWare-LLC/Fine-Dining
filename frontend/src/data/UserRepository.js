import User from '../models/User/index.js';

/**
 * Find a user by id.
 * @param {string} id
 * @returns {Promise<Object|null>}
 */
export function findUserById(id) {
  return User.findById(id);
}

export default {
  findUserById,
};
