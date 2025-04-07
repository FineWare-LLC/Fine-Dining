import { withErrorHandling } from './baseQueries.js';

/**
 * Basic health check query.
 *
 * @function ping
 * @returns {string} "pong"
 */
export const ping = withErrorHandling(() => 'pong');