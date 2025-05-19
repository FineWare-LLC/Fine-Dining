/**
 * @file analyticsEvent.model.js
 * @description Mongoose model for analytics events.
 */

import mongoose from 'mongoose';
import analyticsEventSchema from './analyticsEvent.schema.js';

/**
 * @constant {mongoose.Model<AnalyticsEventDocument>} AnalyticsEventModel
 * Reuses the compiled model if it exists (for hot-reload friendliness).
 */
const AnalyticsEventModel =
  mongoose.models.AnalyticsEvent ||
  mongoose.model('AnalyticsEvent', analyticsEventSchema);

export default AnalyticsEventModel;
