/**
 * @file user.statics.js
 * @description Static methods for the User model.
 */

/**
 * Find user by email in a case-insensitive manner.
 * @param {string} email
 * @returns {Promise<User| null>}
 */
export async function findByEmailCaseInsensitive(email) {
    return this.findOne({ email: email.toLowerCase() });
}

/**
 * Soft-delete a user by ID.
 * @param {string} userId - The user's ObjectId as a string.
 * @returns {Promise<User| null>} The updated user document, or null if not found.
 */
export async function softDeleteUser(userId) {
    return this.findByIdAndUpdate(
        userId,
        { accountStatus: 'DELETED' },
        { new: true }
    );
}
