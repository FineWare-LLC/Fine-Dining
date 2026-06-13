// @ts-nocheck
import assert from 'node:assert/strict';
import test from 'node:test';
import { AuthSignupValidationError, validateSignupInput } from '../../context/authUtils';

const buildBaseSignupInput = () => ({
    name: '  Ada Lovelace  ',
    email: ' Ada@Example.com ',
    password: 'Ab1!cdef',
    gender: 'other',
    measurementSystem: 'metric',
    foodGoals: ['  Keep energy steady  ', ''],
    allergies: ['  dairy  ', '  '],
    dailyCalories: 2200,
});

test('validateSignupInput omits blank optional weightGoal values so the persisted payload stays canonical', () => {
    const result = validateSignupInput({
        ...buildBaseSignupInput(),
        weightGoal: '',
    });

    assert.equal(result.valid, true);
    assert.deepEqual(result.input, {
        name: 'Ada Lovelace',
        email: 'ada@example.com',
        password: 'Ab1!cdef',
        gender: 'OTHER',
        measurementSystem: 'METRIC',
        foodGoals: ['Keep energy steady'],
        allergies: ['dairy'],
        dailyCalories: 2200,
    });
    assert.equal(Object.prototype.hasOwnProperty.call(result.input, 'weightGoal'), false);
});

test('validateSignupInput rejects unsupported weight goals with a typed user-safe error', () => {
    const result = validateSignupInput({
        ...buildBaseSignupInput(),
        weightGoal: 'build muscle',
    });

    assert.equal(result.valid, false);
    assert.ok(result.error instanceof AuthSignupValidationError);
    assert.equal(result.error.code, 'invalidWeightGoal');
    assert.equal(result.error.message, 'Please choose a valid weight goal.');
});
