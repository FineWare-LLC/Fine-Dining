// @ts-nocheck
import assert from 'node:assert/strict';
import test from 'node:test';
import { AuthSignupValidationError, validateSignupInput } from '../../context/authUtils';

const buildValidSignupInput = () => ({
    name: '  Ada Lovelace  ',
    email: ' Ada@Example.com ',
    password: 'Ab1!cdef',
    gender: 'other',
    measurementSystem: 'metric',
    weightGoal: 'maintain',
    dailyCalories: 2200,
});

test('validateSignupInput accepts a valid signup payload and normalizes safe fields', () => {
    const result = validateSignupInput(buildValidSignupInput());

    assert.equal(result.valid, true);
    assert.deepEqual(result.input, {
        name: 'Ada Lovelace',
        email: 'ada@example.com',
        password: 'Ab1!cdef',
        gender: 'OTHER',
        measurementSystem: 'METRIC',
        weightGoal: 'MAINTAIN',
        dailyCalories: 2200,
    });
});

test('validateSignupInput rejects empty required fields with a typed, user-safe error', () => {
    const result = validateSignupInput({});

    assert.equal(result.valid, false);
    assert.ok(result.error instanceof AuthSignupValidationError);
    assert.equal(result.error.code, 'missingName');
    assert.equal(result.error.message, 'Please enter your name.');
});

test('validateSignupInput rejects weak passwords and invalid calorie values with typed errors', () => {
    const weakPassword = validateSignupInput({
        ...buildValidSignupInput(),
        password: 'short',
    });

    assert.equal(weakPassword.valid, false);
    assert.ok(weakPassword.error instanceof AuthSignupValidationError);
    assert.equal(weakPassword.error.code, 'weakPasswordLength');
    assert.equal(weakPassword.error.message, 'Password must be at least 8 characters long.');

    const invalidCalories = validateSignupInput({
        ...buildValidSignupInput(),
        dailyCalories: Number.NaN,
    });

    assert.equal(invalidCalories.valid, false);
    assert.ok(invalidCalories.error instanceof AuthSignupValidationError);
    assert.equal(invalidCalories.error.code, 'invalidDailyCalories');
    assert.equal(invalidCalories.error.message, 'Please enter a valid daily calorie target.');
});
