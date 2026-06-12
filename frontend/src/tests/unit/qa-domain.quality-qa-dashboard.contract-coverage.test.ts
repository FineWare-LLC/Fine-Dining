// @ts-nocheck
import assert from 'node:assert/strict';
import test from 'node:test';
import {
    AsvabQuestionSeedValidationError,
    normalizeAsvabQuestionSeedPayload,
} from '../../../scripts/seed-asvab.mjs';

test('normalizeAsvabQuestionSeedPayload accepts valid ASVAB question records and strips unsupported metadata', () => {
    const payload = [
        {
            id: 1,
            questionText: '  What is the answer?  ',
            options: ['A', 'B', 'C', 'D'],
            correctAnswer: 'A',
            explanation: '  Because. ',
            category: '  General Knowledge  ',
            metrics: {
                difficulty: 'easy',
            },
        },
    ];

    assert.deepEqual(normalizeAsvabQuestionSeedPayload(payload), [
        {
            questionText: 'What is the answer?',
            options: ['A', 'B', 'C', 'D'],
            correctAnswer: 'A',
            explanation: 'Because.',
            category: 'General Knowledge',
        },
    ]);
});

test('normalizeAsvabQuestionSeedPayload rejects malformed ASVAB question records with a typed, user-safe error', () => {
    assert.throws(
        () => normalizeAsvabQuestionSeedPayload([
            {
                questionText: 'Missing the correct answer',
                options: ['A', 'B'],
            },
        ]),
        (error) => {
            assert.ok(error instanceof AsvabQuestionSeedValidationError);
            assert.equal(error.code, 'invalidPayload');
            assert.equal(error.isUserSafe, true);
            assert.match(
                error.message,
                /^ASVAB question seed file is malformed\./,
            );
            return true;
        },
    );
});
