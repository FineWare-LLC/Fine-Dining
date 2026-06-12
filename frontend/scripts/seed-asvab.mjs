import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { readFile } from 'fs/promises';
import { AsvabQuestionModel } from '../src/models/AsvabQuestion/index.js';

dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local' });

const DEFAULT_QUESTIONS_FILE = new URL('../data/asvabQuestions.json', import.meta.url);

export async function seedAsvabQuestions(
    mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/fineDiningApp',
    questionsFile = DEFAULT_QUESTIONS_FILE,
) {
    const data = await readFile(questionsFile, 'utf8');
    const questions = JSON.parse(data);
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
