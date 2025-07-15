import mongoose from 'mongoose';

const { Schema } = mongoose;

const asvabQuestionSchema = new Schema(
    {
        questionText: { type: String, required: true },
        options: { type: [String], default: [] },
        correctAnswer: { type: String, required: true },
        explanation: { type: String, default: '' },
        category: { type: String, default: '' },
    },
    { timestamps: true, collection: 'asvabQuestions' },
);

export default asvabQuestionSchema;
