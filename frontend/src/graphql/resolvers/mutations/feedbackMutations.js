import { withErrorHandling } from './baseImports.js';
import { FeedbackModel } from '@/models/Feedback/index.js';
import { sanitizeString } from '@/lib/sanitize.js';
import { logEvent } from '@/services/AnalyticsService.js';

/**
 * Submit user feedback.
 *
 * @function submitFeedback
 * @param {Object} _parent - Unused parent resolver parameter.
 * @param {Object} args - Mutation arguments.
 * @param {string} args.message - Feedback message provided by the user.
 * @param {number} [args.rating] - Optional rating between 1 and 5.
 * @param {string} [args.email] - Optional email for follow-up.
 * @param {Object} context - GraphQL context containing the authenticated user.
 * @returns {Promise<Boolean>} True on success.
 */
export const submitFeedback = withErrorHandling(async (
  _parent,
  { message, rating, email },
  context
) => {
  if (!message || typeof message !== 'string') {
    throw new Error('Message is required');
  }
  const cleanMessage = sanitizeString(message.trim());

  let numericRating;
  if (rating !== undefined && rating !== null) {
    numericRating = Number(rating);
    if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }
  }

  const feedback = await FeedbackModel.create({
    user: context.user?.userId,
    email: email ? sanitizeString(email.trim()) : undefined,
    message: cleanMessage,
    rating: numericRating,
  });

  await logEvent('feedback_submitted', { feedbackId: feedback.id });
  return true;
});
