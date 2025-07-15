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
    await mongoose.connect(mongoUri);
    await AsvabQuestionModel.deleteMany({});
    const data = await readFile(questionsFile, 'utf8');
    const questions = JSON.parse(data);
    await AsvabQuestionModel.insertMany(questions);
    const count = await AsvabQuestionModel.countDocuments();
    await mongoose.disconnect();
    return count;
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
