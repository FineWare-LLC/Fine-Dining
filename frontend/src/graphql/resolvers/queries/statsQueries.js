import { withErrorHandling } from './baseQueries.js';
import {StatsModel} from '@/models/Stats/index.js';

/**
 * Retrieves statistics for a given user.
 *
 * @function getStatsByUser
 * @param {object} _parent
 * @param {object} args - Contains { userId }
 * @param {object} context - GraphQL context.
 * @returns {Promise<Object[]>} An array of stats documents.
 */
export const getStatsByUser = withErrorHandling(async (_parent, { userId }, context) => {
    if (!context.user?.userId) {
        throw new Error('Authentication required');
    }
    if (context.user.userId !== userId && context.user.role !== 'ADMIN') {
        throw new Error('Authorization required: You can only get your own stats or be an admin.');
    }
    return StatsModel.find({ user: userId });
});