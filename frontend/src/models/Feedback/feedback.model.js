/**
 * @file feedback.model.js
 * @description Mongoose model for storing user feedback.
 */

import mongoose from 'mongoose';
import feedbackSchema from './feedback.schema.js';

const FeedbackModel =
  mongoose.models.Feedback || mongoose.model('Feedback', feedbackSchema);

export default FeedbackModel;
