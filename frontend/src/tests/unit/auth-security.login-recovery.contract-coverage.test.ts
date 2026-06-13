// @ts-nocheck
import assert from 'node:assert/strict';
import test from 'node:test';
import { AuthLoginValidationError, validateLoginInput } from '../../context/authUtils';

test('validateLoginInput accepts a valid login payload and normalizes the email address', () => {
    const result = validateLoginInput({
        email: '  Ada@Example.com ',
        password: 'S3cure!Pass',
    });

    assert.equal(result.valid, true);
    assert.deepEqual(result.input, {
        email: 'ada@example.com',
        password: 'S3cure!Pass',
    });
});

test('validateLoginInput rejects missing and malformed login payloads with typed, user-safe errors', () => {
    const missingFields = validateLoginInput({});

    assert.equal(missingFields.valid, false);
    assert.ok(missingFields.error instanceof AuthLoginValidationError);
    assert.equal(missingFields.error.code, 'missingEmail');
    assert.equal(missingFields.error.message, 'Please enter your email address.');

    const malformedEmail = validateLoginInput({
        email: 'not-an-email',
        password: 'S3cure!Pass',
    });

    assert.equal(malformedEmail.valid, false);
    assert.ok(malformedEmail.error instanceof AuthLoginValidationError);
    assert.equal(malformedEmail.error.code, 'invalidEmail');
    assert.equal(malformedEmail.error.message, 'Please enter a valid email address.');

    const missingPassword = validateLoginInput({
        email: 'user@example.com',
        password: '   ',
    });

    assert.equal(missingPassword.valid, false);
    assert.ok(missingPassword.error instanceof AuthLoginValidationError);
    assert.equal(missingPassword.error.code, 'missingPassword');
    assert.equal(missingPassword.error.message, 'Please enter your password.');
});
