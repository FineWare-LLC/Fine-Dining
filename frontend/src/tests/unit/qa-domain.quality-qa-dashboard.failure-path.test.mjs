import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import mongoose from 'mongoose';
import { AsvabQuestionModel } from '../../models/AsvabQuestion/index.js';
import { seedAsvabQuestions } from '../../../scripts/seed-asvab.mjs';

test('seedAsvabQuestions rolls back a failed ASVAB batch import without committing partial data', async (t) => {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'fine-dining-asvab-seed-failure-'));
    const questionsPath = path.join(tempDir, 'questions.json');
    const sampleQuestions = [
        {
            questionText: 'What is the best way to season a cast iron pan?',
            options: ['Soap it well', 'Leave it wet', 'Bake a thin oil layer', 'Store it submerged'],
            correctAnswer: 'Bake a thin oil layer',
        },
    ];

    await fs.writeFile(questionsPath, JSON.stringify(sampleQuestions), 'utf8');

    const events = [];
    const session = {
        startTransaction: async () => {
            events.push('startTransaction');
        },
        commitTransaction: async () => {
            events.push('commitTransaction');
        },
        abortTransaction: async () => {
            events.push('abortTransaction');
        },
        endSession: async () => {
            events.push('endSession');
        },
    };

    const connectTracker = t.mock.method(mongoose, 'connect', async () => {
        events.push('connect');
    });
    const disconnectTracker = t.mock.method(mongoose, 'disconnect', async () => {
        events.push('disconnect');
    });
    const startSessionTracker = t.mock.method(mongoose, 'startSession', async () => {
        events.push('startSession');
        return session;
    });
    const deleteTracker = t.mock.method(AsvabQuestionModel, 'deleteMany', async (_filter, options) => {
        events.push('deleteMany');
        assert.deepEqual(options, { session });
    });
    const insertTracker = t.mock.method(AsvabQuestionModel, 'insertMany', async (docs, options) => {
        events.push('insertMany');
        assert.deepEqual(docs, sampleQuestions);
        assert.deepEqual(options, { session });
        throw new Error('Mongo unavailable');
    });
    const countTracker = t.mock.method(AsvabQuestionModel, 'countDocuments', async () => {
        events.push('countDocuments');
        return sampleQuestions.length;
    });

    try {
        await assert.rejects(
            () => seedAsvabQuestions('mongodb://localhost/test', questionsPath),
            /Mongo unavailable/,
        );

        assert.deepEqual(events, [
            'connect',
            'startSession',
            'startTransaction',
            'deleteMany',
            'insertMany',
            'abortTransaction',
            'endSession',
            'disconnect',
        ]);
        assert.equal(connectTracker.mock.callCount(), 1);
        assert.equal(disconnectTracker.mock.callCount(), 1);
        assert.equal(startSessionTracker.mock.callCount(), 1);
        assert.equal(deleteTracker.mock.callCount(), 1);
        assert.equal(insertTracker.mock.callCount(), 1);
        assert.equal(countTracker.mock.callCount(), 0);
    } finally {
        await fs.rm(tempDir, { recursive: true, force: true });
    }
});
