import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { promises as fs } from 'fs';
import { AsvabQuestionModel } from '../../models/AsvabQuestion/index.js';

export default test('seedAsvabQuestions reads questions from JSON file', async t => {
  Object.defineProperty(global, 'navigator', { writable: true, configurable: true, value: undefined });

  const connectTracker = t.mock.method(mongoose, 'connect', async () => {});
  const disconnectTracker = t.mock.method(mongoose, 'disconnect', async () => {});
  const deleteTracker = t.mock.method(AsvabQuestionModel, 'deleteMany', async () => {});
  const insertTracker = t.mock.method(AsvabQuestionModel, 'insertMany', async () => {});
  const countTracker = t.mock.method(AsvabQuestionModel, 'countDocuments', async () => 1);
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
  assert.equal(deleteTracker.mock.callCount(), 1);
  assert.equal(insertTracker.mock.callCount(), 1);
  assert.equal(countTracker.mock.callCount(), 1);
});
