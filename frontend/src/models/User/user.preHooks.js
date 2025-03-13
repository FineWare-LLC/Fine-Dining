/**
 * @file user.preHooks.js
 * @description Mongoose pre-save hooks for hashing password, anonymizing deleted users, etc.
 */

import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

/**
 * Pre-save hook to handle password hashing, password history,
 * and special status changes like DELETED or ARCHIVED.
 *
 * @param {Function} next - Mongoose next() function
 */
export async function userPreSave(next) {
    // 1) Hash password if new or modified
    if (this.isModified('password')) {
        try {
            const saltRounds = 10;
            const newHash = await bcrypt.hash(this.password, saltRounds);

            // Optionally store old password in passwordHistory
            if (!this.isNew) {
                if (this.passwordHistory.length >= 5) {
                    // Keep last 5 password hashes (example policy)
                    this.passwordHistory.shift();
                }
                // If the old password was available, we could push it here
            }

            this.password = newHash;
            this.lastPasswordChange = new Date();
        } catch (error) {
            return next(error);
        }
    }

    // 2) If account status is DELETED, anonymize user data
    if (this.isModified('accountStatus') && this.accountStatus === 'DELETED') {
        this.email = `${uuidv4()}@deleted.user`;
        this.name = 'Deleted User';
        this.phoneNumber = '';
        this.deletedAt = new Date();
    }

    // 3) If account status is ARCHIVED, set archivedAt
    if (this.isModified('accountStatus') && this.accountStatus === 'ARCHIVED') {
        this.archivedAt = new Date();
    }

    return next();
}
