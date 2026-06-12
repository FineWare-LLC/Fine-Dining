import { readFile } from 'fs/promises';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { AsvabQuestionModel } from '../src/models/AsvabQuestion/index.js';

dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local' });

const DEFAULT_QUESTIONS_FILE = new URL('../data/asvabQuestions.json', import.meta.url);

const ASVAB_QUESTION_SEED_ERROR_MESSAGES = {
    invalidFile: 'ASVAB question seed file could not be read. Please check the file path and try again.',
    invalidJson: 'ASVAB question seed file must contain valid JSON.',
    invalidPayload: 'ASVAB question seed file is malformed. Check the question records and try again.',
};

export class AsvabQuestionSeedValidationError extends Error {
    constructor(code, message) {
        super(message);
        this.name = 'AsvabQuestionSeedValidationError';
        this.code = code;
        this.isUserSafe = true;
    }

    toJSON() {
        return {
            name: this.name,
            code: this.code,
            message: this.message,
            isUserSafe: this.isUserSafe,
        };
    }
}

function createAsvabQuestionSeedValidationError(code) {
    return new AsvabQuestionSeedValidationError(code, ASVAB_QUESTION_SEED_ERROR_MESSAGES[code]);
}

function normalizeRequiredQuestionString(value) {
    if (typeof value !== 'string') {
        throw createAsvabQuestionSeedValidationError('invalidPayload');
    }

    const normalized = value.trim();
    if (!normalized) {
        throw createAsvabQuestionSeedValidationError('invalidPayload');
    }

    return normalized;
}

function normalizeOptionalQuestionString(value) {
    if (value === undefined) {
        return '';
    }

    if (typeof value !== 'string') {
        throw createAsvabQuestionSeedValidationError('invalidPayload');
    }

    return value.trim();
}

function normalizeQuestionOptions(value) {
    if (value === undefined) {
        return [];
    }

    if (!Array.isArray(value)) {
        throw createAsvabQuestionSeedValidationError('invalidPayload');
    }

    return value.map((option) => {
        if (typeof option !== 'string') {
            throw createAsvabQuestionSeedValidationError('invalidPayload');
        }

        const normalized = option.trim();
        if (!normalized) {
            throw createAsvabQuestionSeedValidationError('invalidPayload');
        }

        return normalized;
    });
}

function normalizeAsvabQuestionRecord(question) {
    if (!question || typeof question !== 'object' || Array.isArray(question)) {
        throw createAsvabQuestionSeedValidationError('invalidPayload');
    }

    return {
        questionText: normalizeRequiredQuestionString(question.questionText),
        options: normalizeQuestionOptions(question.options),
        correctAnswer: normalizeRequiredQuestionString(question.correctAnswer),
        explanation: normalizeOptionalQuestionString(question.explanation),
        category: normalizeOptionalQuestionString(question.category),
    };
}

export function normalizeAsvabQuestionSeedPayload(payload) {
    if (!Array.isArray(payload)) {
        throw createAsvabQuestionSeedValidationError('invalidPayload');
    }

    return payload.map(normalizeAsvabQuestionRecord);
}

function parseAsvabQuestionSeedPayload(data) {
    let payload;
    try {
        payload = JSON.parse(data);
    } catch {
        throw createAsvabQuestionSeedValidationError('invalidJson');
    }

    return normalizeAsvabQuestionSeedPayload(payload);
}

export async function seedAsvabQuestions(
    mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/fineDiningApp',
    questionsFile = DEFAULT_QUESTIONS_FILE,
) {
    let questions;

    try {
        const data = await readFile(questionsFile, 'utf8');
        questions = parseAsvabQuestionSeedPayload(data);
    } catch (error) {
        if (error instanceof AsvabQuestionSeedValidationError) {
            throw error;
        }

        throw createAsvabQuestionSeedValidationError('invalidFile');
    }

    await mongoose.connect(mongoUri);

    try {
        await AsvabQuestionModel.deleteMany({});
        await AsvabQuestionModel.insertMany(questions);
        return await AsvabQuestionModel.countDocuments();
    } finally {
        await mongoose.disconnect();
    }
}

if (import.meta.url === `file://${process.argv[1]}`) {
    seedAsvabQuestions()
        .then((count) => {
            console.log(`Seeded ${count} ASVAB questions`);
            process.exit(0);
        })
        .catch((err) => {
            if (err instanceof AsvabQuestionSeedValidationError) {
                console.error(err.message);
            } else {
                console.error('Error seeding ASVAB questions', err);
            }
            process.exit(1);
        });
}
