/**
 * @file securityQuestionSchema.js
 * @description Sub-schema for storing user security questions (question + hashed answer).
 */

import mongoose from 'mongoose';

const securityQuestionSchema = new mongoose.Schema(
    {
        question: { type: String, required: true },
        answerHash: { type: String, required: true }, // hashed answer for security
    },
    { _id: false }
);

export default securityQuestionSchema;
