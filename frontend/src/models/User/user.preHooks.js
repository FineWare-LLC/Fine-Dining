/**
 * @file user.preHooks.js
 * @description Mongoose pre-save hooks for hashing passwords, maintaining password history,
 * anonymizing deleted users, and setting archive timestamps.
 */

import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

export async function userPreSave(next) {
    try {
        // 1) Hash password if it's new or modified.
        if (this.isModified('password')) {
            // Ensure the password is a non-empty string.
            if (typeof this.password !== 'string' || this.password.trim() === '') {
                throw new Error('Invalid password provided.');
            }

            const saltRounds = 10;
            const newHash = await bcrypt.hash(this.password, saltRounds);

            // Optionally maintain a history of previous passwords.
            if (!this.isNew) {
                // Keep a maximum of 5 old password hashes.
                if (this.passwordHistory && this.passwordHistory.length >= 5) {
                    this.passwordHistory.shift();
                }
                // Optionally, you can push the old password hash if it exists.
            }

            this.password = newHash;
            this.lastPasswordChange = new Date();
        }

        // 2) Check if account status is modified.
        if (this.isModified('accountStatus')) {
            // If the account is marked as DELETED, anonymize sensitive user data.
            if (this.accountStatus === 'DELETED') {
                this.email = `${uuidv4()}@deleted.user`;
                this.name = 'Deleted User';
                this.phoneNumber = '';
                this.deletedAt = new Date();

                // Optional: Clear out sensitive fields.
                this.password = undefined;
                this.passwordHistory = [];
                this.twoFactorSecret = undefined;
                this.emergencyBackupCodes = [];
            }

            // If the account is marked as ARCHIVED, set archivedAt (only if not already set).
            if (this.accountStatus === 'ARCHIVED' && !this.archivedAt) {
                this.archivedAt = new Date();
            }
        }

        // Proceed with saving the document.
        return next();
    } catch (error) {
        // Pass any errors to the next middleware.
        return next(error);
    }
}
