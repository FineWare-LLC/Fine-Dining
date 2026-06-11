/**
 * @file securityQuestionSchema.js
 * @description Hardened sub-schema for storing user security questions, including the question text and a hashed answer.
 */

import mongoose from 'mongoose';

const securityQuestionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: [true, 'Security question is required.'],
        trim: true,
        minlength: [10, 'Security question must be at least 10 characters long.'],
        maxlength: [256, 'Security question must not exceed 256 characters.'],
    }, answerHash: {
        type: String,
        required: [true, 'Answer hash is required.'],
        trim: true, // Depending on the hashing algorithm (e.g., bcrypt produces ~60 characters),
        // you might adjust the minlength. This is just an example.
        minlength: [50, 'Answer hash appears to be too short.'],
    },
}, {_id: false});

export default securityQuestionSchema;
