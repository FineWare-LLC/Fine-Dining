import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { promises as fs } from 'fs';
import { AsvabQuestionModel } from '../../models/AsvabQuestion/index.js';

export default test('seedAsvabQuestions reads questions from JSON file', async t => {
  Object.defineProperty(global, 'navigator', { writable: true, configurable: true, value: undefined });

  const sessionEvents = [];
  const session = {
    startTransaction: async () => {
      sessionEvents.push('startTransaction');
    },
    commitTransaction: async () => {
      sessionEvents.push('commitTransaction');
    },
    abortTransaction: async () => {
      sessionEvents.push('abortTransaction');
    },
    endSession: async () => {
      sessionEvents.push('endSession');
    },
  };

  const connectTracker = t.mock.method(mongoose, 'connect', async () => {});
  const disconnectTracker = t.mock.method(mongoose, 'disconnect', async () => {});
  const startSessionTracker = t.mock.method(mongoose, 'startSession', async () => session);
  const deleteTracker = t.mock.method(AsvabQuestionModel, 'deleteMany', async (_filter, options) => {
    assert.deepEqual(options, { session });
  });
  const insertTracker = t.mock.method(AsvabQuestionModel, 'insertMany', async (_docs, options) => {
    assert.deepEqual(options, { session });
  });
  const countTracker = t.mock.method(AsvabQuestionModel, 'countDocuments', async (_filter, options) => {
    assert.deepEqual(options, { session });
    return 1;
  });
  const sample = [{ questionText: 'Q1?', options: ['A','B','C','D'], correctAnswer: 'A' }];
  const tmp = await fs.mkdtemp('asvab-test-');
  const path = `${tmp}/sample.json`;
  await fs.writeFile(path, JSON.stringify(sample));

  const { seedAsvabQuestions } = await import('../../../scripts/seed-asvab.mjs');
  const count = await seedAsvabQuestions('mongodb://localhost/test', path);

  await fs.rm(tmp, { recursive: true, force: true });

  assert.equal(count, 1);
  assert.deepEqual(insertTracker.mock.calls[0].arguments[0], sample);
  assert.equal(connectTracker.mock.callCount(), 1);
  assert.equal(disconnectTracker.mock.callCount(), 1);
  assert.equal(startSessionTracker.mock.callCount(), 1);
  assert.equal(deleteTracker.mock.callCount(), 1);
  assert.equal(insertTracker.mock.callCount(), 1);
  assert.equal(countTracker.mock.callCount(), 1);
  assert.deepEqual(sessionEvents, ['startTransaction', 'commitTransaction', 'endSession']);
});
