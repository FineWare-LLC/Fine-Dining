import test from 'node:test';
import assert from 'node:assert/strict';
import bcrypt from 'bcrypt';
import {
  generatePasswordResetToken,
  comparePassword,
  enableTwoFactor,
  disableTwoFactor,
} from '../../models/User/user.methods.js';

// Helper to create a minimal user object
function createUser() {
  return {
    password: 'hashed',
    passwordResetToken: null,
    passwordResetTokenExpiry: null,
    twoFactorEnabled: false,
    twoFactorMethod: 'NONE',
    twoFactorSecret: null,
  };
}

test('generatePasswordResetToken sets fields and returns a token', () => {
  const user = createUser();
  const token = generatePasswordResetToken.call(user);

  assert.equal(user.passwordResetToken, token);
  assert.ok(user.passwordResetTokenExpiry instanceof Date);
  assert.ok(typeof token === 'string' && token.length > 0);
});

test('comparePassword delegates to bcrypt', async t => {
  const user = createUser();
  const mock = t.mock.method(bcrypt, 'compare', async (candidate, hash) => {
    assert.equal(candidate, 'secret');
    assert.equal(hash, 'hashed');
    return true;
  });

  const result = await comparePassword.call(user, 'secret');
  assert.strictEqual(result, true);
  assert.strictEqual(mock.mock.callCount(), 1);
  mock.mock.restore();
});

test('enableTwoFactor and disableTwoFactor update flags correctly', () => {
  const user = createUser();

  enableTwoFactor.call(user, 'TOTP', 'abc123');
  assert.equal(user.twoFactorEnabled, true);
  assert.equal(user.twoFactorMethod, 'TOTP');
  assert.equal(user.twoFactorSecret, 'abc123');

  disableTwoFactor.call(user);
  assert.equal(user.twoFactorEnabled, false);
  assert.equal(user.twoFactorMethod, 'NONE');
  assert.equal(user.twoFactorSecret, null);
});
