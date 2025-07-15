import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { seedAsvabQuestions } from '../../../scripts/seed-asvab.mjs';
import { AsvabQuestionModel } from '../../models/AsvabQuestion/index.js';

test('seedAsvabQuestions inserts 10000 questions', async t => {
    // Ensure later tests can freely set global.navigator
    Object.defineProperty(global, 'navigator', { writable: true, configurable: true, value: undefined });

    const connectTracker = t.mock.method(mongoose, 'connect', async () => {});
    const disconnectTracker = t.mock.method(mongoose, 'disconnect', async () => {});
    const deleteTracker = t.mock.method(AsvabQuestionModel, 'deleteMany', async () => {});
    const insertTracker = t.mock.method(AsvabQuestionModel, 'insertMany', async () => {});
    const countTracker = t.mock.method(AsvabQuestionModel, 'countDocuments', async () => 10000);

    const count = await seedAsvabQuestions('mongodb://localhost/test');

    assert.equal(count, 10000);
    assert.equal(connectTracker.mock.callCount(), 1);
    assert.equal(disconnectTracker.mock.callCount(), 1);
    assert.equal(deleteTracker.mock.callCount(), 1);
    assert.equal(insertTracker.mock.callCount(), 1);
    assert.equal(countTracker.mock.callCount(), 1);
});
