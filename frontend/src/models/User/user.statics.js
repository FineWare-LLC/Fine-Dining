/**
 * @file user.statics.js
 * @description Static methods for the User model. This file includes methods for
 * case-insensitive lookups, soft deletion, restoration, role-based queries,
 * updating user details, and managing login attempts. These utilities are designed
 * to be secure, over-engineered, and flexible for future enhancements.
 */

import mongoose from 'mongoose';

/**
 * Find a user by email in a case-insensitive manner.
 *
 * @param {string} email - The email to search for.
 * @returns {Promise<User|null>} A promise resolving to the user document or null if not found.
 * @throws {Error} Throws an error if the email is not provided or is invalid.
 */
export async function findByEmailCaseInsensitive(email) {
    if (typeof email !== 'string' || email.trim() === '') {
        throw new Error('A valid email must be provided.');
    }
    const normalizedEmail = email.trim().toLowerCase();
    return this.findOne({ email: normalizedEmail });
}

/**
 * Soft-delete a user by their ID by updating their account status to 'DELETED'.
 *
 * @param {string} userId - The user's ObjectId as a string.
 * @returns {Promise<User|null>} A promise resolving to the updated user document or null if not found.
 * @throws {Error} Throws an error if the userId is not provided or is invalid.
 */
export async function softDeleteUser(userId) {
    if (typeof userId !== 'string' || userId.trim() === '') {
        throw new Error('A valid user ID must be provided.');
    }
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error('Invalid user ID format.');
    }
    return this.findByIdAndUpdate(
        userId,
        { accountStatus: 'DELETED' },
        { new: true }
    );
}

/**
 * Restore a soft-deleted user by their ID, setting their account status to 'ACTIVE'
 * and clearing deletion-related fields.
 *
 * @param {string} userId - The user's ObjectId as a string.
 * @returns {Promise<User|null>} A promise resolving to the restored user document or null if not found.
 * @throws {Error} Throws an error if the userId is not provided or invalid.
 */
export async function restoreUser(userId) {
    if (typeof userId !== 'string' || userId.trim() === '') {
        throw new Error('A valid user ID must be provided.');
    }
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error('Invalid user ID format.');
    }
    return this.findByIdAndUpdate(
        userId,
        { accountStatus: 'ACTIVE', deletedAt: null },
        { new: true }
    );
}

/**
 * Update user details by their ID.
 *
 * @param {string} userId - The user's ObjectId as a string.
 * @param {Object} updates - An object containing the fields to update.
 * @returns {Promise<User|null>} A promise resolving to the updated user document or null if not found.
 * @throws {Error} Throws an error if the userId is invalid or if updates is not an object.
 */
export async function updateUserDetails(userId, updates) {
    if (typeof userId !== 'string' || userId.trim() === '') {
        throw new Error('A valid user ID must be provided.');
    }
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error('Invalid user ID format.');
    }
    if (typeof updates !== 'object' || updates === null) {
        throw new Error('Updates must be a valid object.');
    }
    // Prevent updates to sensitive fields directly.
    const forbiddenFields = ['password', 'role', 'accountStatus'];
    forbiddenFields.forEach(field => {
        if (updates.hasOwnProperty(field)) {
            delete updates[field];
        }
    });
    return this.findByIdAndUpdate(userId, updates, { new: true });
}

/**
 * Find all users with a specified role.
 *
 * @param {string} role - The role to filter by (e.g., 'USER', 'ADMIN').
 * @returns {Promise<User[]>} A promise resolving to an array of users with the given role.
 * @throws {Error} Throws an error if role is not provided.
 */
export async function findUsersByRole(role) {
    if (typeof role !== 'string' || role.trim() === '') {
        throw new Error('A valid role must be provided.');
    }
    return this.find({ role: role.trim().toUpperCase() });
}

/**
 * Count the number of active users.
 *
 * @returns {Promise<number>} A promise resolving to the count of users with accountStatus 'ACTIVE'.
 */
export async function countActiveUsers() {
    return this.countDocuments({ accountStatus: 'ACTIVE' });
}

/**
 * Increment the login attempts for a user by their ID.
 * Optionally, if a threshold is reached, set a lockUntil time.
 *
 * @param {string} userId - The user's ObjectId as a string.
 * @param {number} [threshold=5] - The number of allowed attempts before locking.
 * @param {number} [lockDuration=3600000] - Lock duration in milliseconds (default 1 hour).
 * @returns {Promise<User|null>} A promise resolving to the updated user document.
 * @throws {Error} Throws an error if userId is invalid.
 */
export async function incrementLoginAttempts(userId, threshold = 5, lockDuration = 3600000) {
    if (typeof userId !== 'string' || userId.trim() === '') {
        throw new Error('A valid user ID must be provided.');
    }
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error('Invalid user ID format.');
    }
    const user = await this.findById(userId);
    if (!user) {
        throw new Error('User not found.');
    }
    user.loginAttempts = (user.loginAttempts || 0) + 1;
    if (user.loginAttempts >= threshold) {
        user.lockUntil = new Date(Date.now() + lockDuration);
    }
    return user.save();
}

/**
 * Reset the login attempts and clear any lock on the user's account.
 *
 * @param {string} userId - The user's ObjectId as a string.
 * @returns {Promise<User|null>} A promise resolving to the updated user document.
 * @throws {Error} Throws an error if userId is invalid.
 */
export async function resetLoginAttempts(userId) {
    if (typeof userId !== 'string' || userId.trim() === '') {
        throw new Error('A valid user ID must be provided.');
    }
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error('Invalid user ID format.');
    }
    return this.findByIdAndUpdate(
        userId,
        { loginAttempts: 0, lockUntil: null },
        { new: true }
    );
}

/**
 * Search for users based on a text query that matches name or email.
 *
 * @param {string} query - The search query.
 * @returns {Promise<User[]>} A promise resolving to an array of matching users.
 * @throws {Error} Throws an error if the query is not provided or invalid.
 */
export async function searchUsers(query) {
    if (typeof query !== 'string' || query.trim() === '') {
        throw new Error('A valid search query must be provided.');
    }
    const regex = new RegExp(query.trim(), 'i');
    return this.find({
        $or: [
            { name: regex },
            { email: regex }
        ]
    });
}
