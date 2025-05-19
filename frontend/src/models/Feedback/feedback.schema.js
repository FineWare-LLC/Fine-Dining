/**
 * @file feedback.schema.js
 * @description Schema definition for user feedback.
 */

import mongoose from 'mongoose';

/**
 * @typedef {Object} FeedbackDocument
 * @property {mongoose.Schema.Types.ObjectId} [user] - Optional user reference.
 * @property {string} [email] - Contact email if provided.
 * @property {string} message - Feedback message content.
 * @property {number} [rating] - Optional rating between 1 and 5.
 */

const feedbackSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    email: { type: String, default: '' },
    message: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5 },
  },
  { timestamps: true }
);

export default feedbackSchema;
