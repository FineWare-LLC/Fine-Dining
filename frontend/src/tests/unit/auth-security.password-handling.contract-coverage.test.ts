// @ts-nocheck
import assert from 'node:assert/strict';
import test, { mock } from 'node:test';
import { validateLoginInput } from '../../context/authUtils';
import { resetPassword } from '../../graphql/resolvers/mutations/authMutations';
import User from '../../models/User/index';

test('validateLoginInput preserves password characters while normalizing the email address', () => {
    const result = validateLoginInput({
        email: '  Ada@Example.com ',
        password: '  S3cure!Pass  ',
    });

    assert.equal(result.valid, true);
    assert.deepEqual(result.input, {
        email: 'ada@example.com',
        password: '  S3cure!Pass  ',
    });
});

test('resetPassword writes the exact new password string without trimming whitespace', async () => {
    const resetToken = 'reset-token-123';
    const newPassword = '  Ab1!cdef  ';
    const user = {
        password: 'old-hash',
        passwordResetToken: resetToken,
        passwordResetTokenExpiry: new Date(Date.now() + 60_000),
        validatePasswordResetToken: (token) => token === resetToken,
        save: async () => {
            user.saveCalls += 1;
            return user;
        },
        saveCalls: 0,
    };

    const findOneMock = mock.method(User, 'findOne', async (query) => {
        assert.deepEqual(query, { passwordResetToken: resetToken });
        return user;
    });

    const result = await resetPassword(null, { resetToken, newPassword }, {});

    assert.equal(result, true);
    assert.equal(user.password, newPassword);
    assert.equal(user.saveCalls, 1);
    assert.equal(findOneMock.mock.callCount(), 1);

    findOneMock.mock.restore();
});
