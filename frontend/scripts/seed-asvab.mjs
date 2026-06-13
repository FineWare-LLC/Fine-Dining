import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { readFile } from 'fs/promises';
import { AsvabQuestionModel } from '../src/models/AsvabQuestion/index.js';

dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local' });

const DEFAULT_QUESTIONS_FILE = new URL('../data/asvabQuestions.json', import.meta.url);
const ASVAB_SEED_VALIDATION_ERROR_MESSAGE =
    'We could not read the ASVAB question seed file. Please refresh the dataset.';

export class AsvabQuestionSeedValidationError extends Error {
    constructor(code, message = ASVAB_SEED_VALIDATION_ERROR_MESSAGE, details = null, cause = null) {
        super(message);
        this.name = 'AsvabQuestionSeedValidationError';
        this.code = code;
        this.details = details;
        this.isUserSafe = true;

        if (cause) {
            this.cause = cause;
        }
    }
}

const createAsvabQuestionSeedValidationError = (code, details = null, cause = null) => (
    new AsvabQuestionSeedValidationError(code, ASVAB_SEED_VALIDATION_ERROR_MESSAGE, details, cause)
);

const parseQuestions = async (questionsFile) => {
    const data = await readFile(questionsFile, 'utf8');

    try {
        return JSON.parse(data);
    } catch (cause) {
        throw createAsvabQuestionSeedValidationError('invalidQuestionPayload', null, cause);
    }
};

const validateQuestionPayload = (questions) => {
    if (!Array.isArray(questions)) {
        throw createAsvabQuestionSeedValidationError('invalidQuestionPayload');
    }

    questions.forEach((question, index) => {
        const validationError = new AsvabQuestionModel(question).validateSync();

        if (validationError) {
            throw createAsvabQuestionSeedValidationError(
                'invalidQuestionPayload',
                { index },
                validationError,
            );
        }
    });

    return questions;
};

export async function seedAsvabQuestions(
    mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/fineDiningApp',
    questionsFile = DEFAULT_QUESTIONS_FILE,
) {
    const questions = validateQuestionPayload(await parseQuestions(questionsFile));
    let session;

    try {
        await mongoose.connect(mongoUri);
        session = await mongoose.startSession();
        await session.startTransaction();

        await AsvabQuestionModel.deleteMany({}, { session });
        await AsvabQuestionModel.insertMany(questions, { session });

        const count = await AsvabQuestionModel.countDocuments({}, { session });
        await session.commitTransaction();
        return count;
    } catch (error) {
        if (session) {
            try {
                await session.abortTransaction();
            } catch {
                // Keep the original seed failure as the primary error.
            }
        }
        throw error;
    } finally {
        if (session) {
            await session.endSession();
        }
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
            console.error('Error seeding ASVAB questions', err);
            process.exit(1);
        });
}
