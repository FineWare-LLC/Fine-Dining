import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import mongoose from 'mongoose';
import { AsvabQuestionModel } from '../../models/AsvabQuestion/index.js';
import { seedAsvabQuestions } from '../../../scripts/seed-asvab.mjs';

test('seedAsvabQuestions strips legacy ASVAB metadata before persistence', async (t) => {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'fine-dining-asvab-cleanup-'));
    const questionsPath = path.join(tempDir, 'questions.json');
    const sampleQuestions = [
        {
            id: 1024,
            questionText: 'What is the best way to season a cast iron pan?',
            options: ['Soap it well', 'Leave it wet', 'Bake a thin oil layer', 'Store it submerged'],
            correctAnswer: 'Bake a thin oil layer',
            metrics: {
                difficulty: 'medium',
                topic: 'cookware',
            },
            explanation: 'A thin oil layer protects the pan.',
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
        assert.deepEqual(options, { session });
        assert.deepEqual(docs, [
            {
                questionText: 'What is the best way to season a cast iron pan?',
                options: ['Soap it well', 'Leave it wet', 'Bake a thin oil layer', 'Store it submerged'],
                correctAnswer: 'Bake a thin oil layer',
                explanation: 'A thin oil layer protects the pan.',
            },
        ]);
        return docs;
    });
    const countTracker = t.mock.method(AsvabQuestionModel, 'countDocuments', async (_filter, options) => {
        events.push('countDocuments');
        assert.deepEqual(options, { session });
        return 1;
    });

    try {
        const count = await seedAsvabQuestions('mongodb://localhost/test', questionsPath);

        assert.equal(count, 1);
        assert.deepEqual(events, [
            'connect',
            'startSession',
            'startTransaction',
            'deleteMany',
            'insertMany',
            'countDocuments',
            'commitTransaction',
            'endSession',
            'disconnect',
        ]);
        assert.equal(connectTracker.mock.callCount(), 1);
        assert.equal(disconnectTracker.mock.callCount(), 1);
        assert.equal(startSessionTracker.mock.callCount(), 1);
        assert.equal(deleteTracker.mock.callCount(), 1);
        assert.equal(insertTracker.mock.callCount(), 1);
        assert.equal(countTracker.mock.callCount(), 1);
    } finally {
        await fs.rm(tempDir, { recursive: true, force: true });
    }
});

test('seedAsvabQuestions rejects malformed ASVAB payloads before touching the database', async (t) => {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'fine-dining-asvab-invalid-'));
    const questionsPath = path.join(tempDir, 'questions.json');
    const invalidQuestions = [
        {
            id: 2048,
            questionText: 'Which utensil belongs on the left?',
            options: 'fork',
            metrics: {
                difficulty: 'easy',
            },
        },
    ];

    await fs.writeFile(questionsPath, JSON.stringify(invalidQuestions), 'utf8');

    const connectTracker = t.mock.method(mongoose, 'connect', async () => {});
    const disconnectTracker = t.mock.method(mongoose, 'disconnect', async () => {});
    const startSessionTracker = t.mock.method(mongoose, 'startSession', async () => {
        throw new Error('startSession should not be called for invalid payloads');
    });
    const deleteTracker = t.mock.method(AsvabQuestionModel, 'deleteMany', async () => {
        throw new Error('deleteMany should not be called for invalid payloads');
    });
    const insertTracker = t.mock.method(AsvabQuestionModel, 'insertMany', async () => {
        throw new Error('insertMany should not be called for invalid payloads');
    });
    const countTracker = t.mock.method(AsvabQuestionModel, 'countDocuments', async () => {
        throw new Error('countDocuments should not be called for invalid payloads');
    });

    try {
        await assert.rejects(
            () => seedAsvabQuestions('mongodb://localhost/test', questionsPath),
            (error) => {
                assert.equal(error.name, 'AsvabQuestionSeedValidationError');
                assert.equal(error.code, 'invalidQuestionPayload');
                assert.equal(error.isUserSafe, true);
                assert.equal(
                    error.message,
                    'We could not read the ASVAB question seed file. Please refresh the dataset.',
                );
                return true;
            },
        );

        assert.equal(connectTracker.mock.callCount(), 0);
        assert.equal(disconnectTracker.mock.callCount(), 0);
        assert.equal(startSessionTracker.mock.callCount(), 0);
        assert.equal(deleteTracker.mock.callCount(), 0);
        assert.equal(insertTracker.mock.callCount(), 0);
        assert.equal(countTracker.mock.callCount(), 0);
    } finally {
        await fs.rm(tempDir, { recursive: true, force: true });
    }
});
