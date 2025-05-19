/**
 * @file AnalyticsService.js
 * @description Provides helper functions to log analytics events either to
 * AWS CloudWatch (via the winston logger) or directly into MongoDB.
 */

import logger from '../lib/logger.js';
import { AnalyticsEventModel } from '../models/AnalyticsEvent/index.js';

const useCloudWatch =
  process.env.AWS_REGION &&
  process.env.CLOUDWATCH_LOG_GROUP &&
  process.env.CLOUDWATCH_LOG_STREAM;

/**
 * Log an analytics event.
 *
 * @param {string} event - Name of the event to record.
 * @param {Object} [payload={}] - Additional metadata for the event.
 * @returns {Promise<void>} Resolves when the event has been logged.
 */
export async function logEvent(event, payload = {}) {
  if (useCloudWatch) {
    logger.info('analytics event', { event, ...payload });
    return;
  }
  await AnalyticsEventModel.create({ event, data: payload });
}

export default { logEvent };
