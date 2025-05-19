/**
 * @file analyticsEvent.schema.js
 * @description Defines the schema for analytics events stored in MongoDB.
 */

import mongoose from 'mongoose';

/**
 * @typedef {Object} AnalyticsEventDocument
 * @property {string} event - Name of the analytics event.
 * @property {Object} data - Arbitrary metadata associated with the event.
 */

const analyticsEventSchema = new mongoose.Schema(
  {
    event: { type: String, required: true },
    data: { type: Object, default: {} },
  },
  { timestamps: true }
);

export default analyticsEventSchema;
