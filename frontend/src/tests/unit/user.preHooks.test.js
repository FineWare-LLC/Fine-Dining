import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import bcrypt from 'bcrypt';
import { userPreSave } from '../../models/User/user.preHooks.js';

// Mock bcrypt
const originalHash = bcrypt.hash;

describe('user.preHooks', () => {
    let mockUser;
    let nextSpy;
    let hashedPassword = 'hashedPassword123';

    beforeEach(() => {
        // Mock bcrypt.hash
        bcrypt.hash = async (password, saltRounds) => {
            return hashedPassword;
        };

        // Create a mock user context
        mockUser = {
            password: 'newPassword123',
            passwordHistory: [],
            accountStatus: 'ACTIVE',
            isNew: false,
            isModified: (field) => mockUser.modifiedFields?.includes(field) || false,
            modifiedFields: []
        };

        // Mock next function
        nextSpy = {
            called: false,
            calledWith: null,
            call: function(error) {
                this.called = true;
                this.calledWith = error;
                return error;
            }
        };
    });

    afterEach(() => {
        bcrypt.hash = originalHash;
    });

    it('should hash password when password is modified', async () => {
        mockUser.modifiedFields = ['password'];
        mockUser.password = 'newPlainPassword';

        await userPreSave.call(mockUser, (error) => nextSpy.call(error));

        assert.strictEqual(mockUser.password, hashedPassword);
        assert.ok(mockUser.lastPasswordChange instanceof Date);
        assert.strictEqual(nextSpy.called, true);
        assert.strictEqual(nextSpy.calledWith, undefined);
    });

    it('should not hash password when password is not modified', async () => {
        mockUser.modifiedFields = ['email'];
        const originalPassword = mockUser.password;

        await userPreSave.call(mockUser, (error) => nextSpy.call(error));

        assert.strictEqual(mockUser.password, originalPassword);
        assert.strictEqual(mockUser.lastPasswordChange, undefined);
        assert.strictEqual(nextSpy.called, true);
    });

    it('should throw error for empty password', async () => {
        mockUser.modifiedFields = ['password'];
        mockUser.password = '';

        await userPreSave.call(mockUser, (error) => nextSpy.call(error));

        assert.strictEqual(nextSpy.called, true);
        assert.ok(nextSpy.calledWith instanceof Error);
        assert.strictEqual(nextSpy.calledWith.message, 'Invalid password provided.');
    });

    it('should throw error for whitespace-only password', async () => {
        mockUser.modifiedFields = ['password'];
        mockUser.password = '   ';

        await userPreSave.call(mockUser, (error) => nextSpy.call(error));

        assert.strictEqual(nextSpy.called, true);
        assert.ok(nextSpy.calledWith instanceof Error);
        assert.strictEqual(nextSpy.calledWith.message, 'Invalid password provided.');
    });

    it('should throw error for non-string password', async () => {
        mockUser.modifiedFields = ['password'];
        mockUser.password = null;

        await userPreSave.call(mockUser, (error) => nextSpy.call(error));

        assert.strictEqual(nextSpy.called, true);
        assert.ok(nextSpy.calledWith instanceof Error);
        assert.strictEqual(nextSpy.calledWith.message, 'Invalid password provided.');
    });

    it('should hash password for existing users', async () => {
        mockUser.modifiedFields = ['password'];
        mockUser.password = 'newPassword';
        mockUser.isNew = false;

        await userPreSave.call(mockUser, (error) => nextSpy.call(error));

        assert.strictEqual(mockUser.password, hashedPassword);
        assert.ok(mockUser.lastPasswordChange instanceof Date);
    });

    it('should maintain password history for existing users', async () => {
        mockUser.modifiedFields = ['password'];
        mockUser.password = 'newPassword';
        mockUser.isNew = false;
        mockUser.passwordHistory = ['old1', 'old2', 'old3', 'old4'];

        await userPreSave.call(mockUser, (error) => nextSpy.call(error));

        assert.ok(mockUser.passwordHistory.length <= 5);
    });

    it('should limit password history to 5 entries', async () => {
        mockUser.modifiedFields = ['password'];
        mockUser.password = 'newPassword';
        mockUser.isNew = false;
        mockUser.passwordHistory = ['old1', 'old2', 'old3', 'old4', 'old5'];

        await userPreSave.call(mockUser, (error) => nextSpy.call(error));

        assert.strictEqual(mockUser.passwordHistory.length, 4); // One should be shifted out
        assert.strictEqual(mockUser.passwordHistory[0], 'old2'); // First item should be removed
    });

    it('should not modify password history for new users', async () => {
        mockUser.modifiedFields = ['password'];
        mockUser.password = 'newPassword';
        mockUser.isNew = true;
        mockUser.passwordHistory = [];

        await userPreSave.call(mockUser, (error) => nextSpy.call(error));

        assert.strictEqual(mockUser.password, hashedPassword);
        assert.strictEqual(mockUser.passwordHistory.length, 0);
    });

    it('should anonymize email when account status is DELETED', async () => {
        mockUser.modifiedFields = ['accountStatus'];
        mockUser.accountStatus = 'DELETED';
        mockUser.email = 'user@example.com';

        await userPreSave.call(mockUser, (error) => nextSpy.call(error));

        assert.ok(mockUser.email.includes('@deleted.user'));
        assert.ok(mockUser.email.length > '@deleted.user'.length); // Should have UUID prefix
    });

    it('should anonymize name when account status is DELETED', async () => {
        mockUser.modifiedFields = ['accountStatus'];
        mockUser.accountStatus = 'DELETED';
        mockUser.name = 'John Doe';

        await userPreSave.call(mockUser, (error) => nextSpy.call(error));

        assert.strictEqual(mockUser.name, 'Deleted User');
    });

    it('should clear phone number when account status is DELETED', async () => {
        mockUser.modifiedFields = ['accountStatus'];
        mockUser.accountStatus = 'DELETED';
        mockUser.phoneNumber = '555-1234';

        await userPreSave.call(mockUser, (error) => nextSpy.call(error));

        assert.strictEqual(mockUser.phoneNumber, '');
    });

    it('should set deletedAt timestamp when account status is DELETED', async () => {
        mockUser.modifiedFields = ['accountStatus'];
        mockUser.accountStatus = 'DELETED';

        await userPreSave.call(mockUser, (error) => nextSpy.call(error));

        assert.ok(mockUser.deletedAt instanceof Date);
    });

    it('should clear password when account status is DELETED', async () => {
        mockUser.modifiedFields = ['accountStatus'];
        mockUser.accountStatus = 'DELETED';
        mockUser.password = 'hashedPassword';

        await userPreSave.call(mockUser, (error) => nextSpy.call(error));

        assert.strictEqual(mockUser.password, undefined);
    });

    it('should clear password history when account status is DELETED', async () => {
        mockUser.modifiedFields = ['accountStatus'];
        mockUser.accountStatus = 'DELETED';
        mockUser.passwordHistory = ['old1', 'old2'];

        await userPreSave.call(mockUser, (error) => nextSpy.call(error));

        assert.deepStrictEqual(mockUser.passwordHistory, []);
    });

    it('should clear two factor secret when account status is DELETED', async () => {
        mockUser.modifiedFields = ['accountStatus'];
        mockUser.accountStatus = 'DELETED';
        mockUser.twoFactorSecret = 'secret';

        await userPreSave.call(mockUser, (error) => nextSpy.call(error));

        assert.strictEqual(mockUser.twoFactorSecret, undefined);
    });

    it('should clear emergency backup codes when account status is DELETED', async () => {
        mockUser.modifiedFields = ['accountStatus'];
        mockUser.accountStatus = 'DELETED';
        mockUser.emergencyBackupCodes = ['code1', 'code2'];

        await userPreSave.call(mockUser, (error) => nextSpy.call(error));

        assert.deepStrictEqual(mockUser.emergencyBackupCodes, []);
    });

    it('should set archivedAt when account status is ARCHIVED and not already set', async () => {
        mockUser.modifiedFields = ['accountStatus'];
        mockUser.accountStatus = 'ARCHIVED';
        mockUser.archivedAt = null;

        await userPreSave.call(mockUser, (error) => nextSpy.call(error));

        assert.ok(mockUser.archivedAt instanceof Date);
        assert.strictEqual(nextSpy.called, true);
        assert.strictEqual(nextSpy.calledWith, undefined);
    });

    it('should not update archivedAt when already set', async () => {
        const existingDate = new Date('2023-01-01');
        mockUser.modifiedFields = ['accountStatus'];
        mockUser.accountStatus = 'ARCHIVED';
        mockUser.archivedAt = existingDate;

        await userPreSave.call(mockUser, (error) => nextSpy.call(error));

        assert.strictEqual(mockUser.archivedAt, existingDate);
    });

    it('should not process account status changes when not modified', async () => {
        mockUser.modifiedFields = ['email'];
        mockUser.accountStatus = 'DELETED';
        mockUser.email = 'user@example.com';
        mockUser.name = 'John Doe';

        await userPreSave.call(mockUser, (error) => nextSpy.call(error));

        assert.strictEqual(mockUser.email, 'user@example.com');
        assert.strictEqual(mockUser.name, 'John Doe');
        assert.strictEqual(mockUser.deletedAt, undefined);
    });

    it('should hash password when both password and account status change', async () => {
        mockUser.modifiedFields = ['password', 'accountStatus'];
        mockUser.password = 'newPassword';
        mockUser.accountStatus = 'ACTIVE'; // Use ACTIVE to focus on password hashing

        await userPreSave.call(mockUser, (error) => nextSpy.call(error));

        assert.strictEqual(mockUser.password, hashedPassword);
        assert.ok(mockUser.lastPasswordChange instanceof Date);
    });

    it('should anonymize data when both password and DELETED status change', async () => {
        mockUser.modifiedFields = ['password', 'accountStatus'];
        mockUser.password = 'newPassword';
        mockUser.accountStatus = 'DELETED';
        mockUser.email = 'user@example.com';
        mockUser.name = 'John Doe';

        await userPreSave.call(mockUser, (error) => nextSpy.call(error));

        // Focus on the interaction: password should be cleared by deletion process
        assert.strictEqual(mockUser.password, undefined);
        assert.ok(mockUser.email.includes('@deleted.user'));
        assert.strictEqual(mockUser.name, 'Deleted User');
    });

    it('should handle bcrypt hashing errors', async () => {
        mockUser.modifiedFields = ['password'];
        mockUser.password = 'validPassword';

        // Mock bcrypt to throw an error
        bcrypt.hash = async () => {
            throw new Error('Bcrypt hashing failed');
        };

        await userPreSave.call(mockUser, (error) => nextSpy.call(error));

        assert.strictEqual(nextSpy.called, true);
        assert.ok(nextSpy.calledWith instanceof Error);
        assert.strictEqual(nextSpy.calledWith.message, 'Bcrypt hashing failed');
    });

    it('should proceed normally when no modifications detected', async () => {
        mockUser.modifiedFields = [];

        await userPreSave.call(mockUser, (error) => nextSpy.call(error));

        assert.strictEqual(nextSpy.called, true);
        assert.strictEqual(nextSpy.calledWith, undefined);
    });

    it('should handle missing passwordHistory gracefully', async () => {
        mockUser.modifiedFields = ['password'];
        mockUser.password = 'newPassword';
        mockUser.isNew = false;
        mockUser.passwordHistory = undefined;

        await userPreSave.call(mockUser, (error) => nextSpy.call(error));

        assert.strictEqual(mockUser.password, hashedPassword);
        assert.ok(mockUser.lastPasswordChange instanceof Date);
        assert.strictEqual(nextSpy.called, true);
        assert.strictEqual(nextSpy.calledWith, undefined);
    });

    it('should handle account status other than DELETED or ARCHIVED', async () => {
        mockUser.modifiedFields = ['accountStatus'];
        mockUser.accountStatus = 'SUSPENDED';
        mockUser.email = 'user@example.com';
        mockUser.name = 'John Doe';

        await userPreSave.call(mockUser, (error) => nextSpy.call(error));

        assert.strictEqual(mockUser.email, 'user@example.com');
        assert.strictEqual(mockUser.name, 'John Doe');
        assert.strictEqual(mockUser.deletedAt, undefined);
        assert.strictEqual(mockUser.archivedAt, undefined);
    });

    it('should use correct salt rounds for bcrypt', async () => {
        let capturedSaltRounds;
        bcrypt.hash = async (password, saltRounds) => {
            capturedSaltRounds = saltRounds;
            return 'hashedPassword';
        };

        mockUser.modifiedFields = ['password'];
        mockUser.password = 'testPassword';

        await userPreSave.call(mockUser, (error) => nextSpy.call(error));

        assert.strictEqual(capturedSaltRounds, 10);
    });

    it('should generate unique email for deleted users', async () => {
        mockUser.modifiedFields = ['accountStatus'];
        mockUser.accountStatus = 'DELETED';
        mockUser.email = 'user@example.com';

        await userPreSave.call(mockUser, (error) => nextSpy.call(error));

        const emailPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}@deleted\.user$/;
        assert.ok(emailPattern.test(mockUser.email));
    });
});