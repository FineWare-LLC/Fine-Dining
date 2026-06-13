// @ts-nocheck
import { withErrorHandling } from './baseQueries';
import { ACCOUNT_TIERS, getTierConfig } from '@/lib/tiers';
import User from '@/models/User/index';
import { getUsageSnapshot } from '@/services/usageLimits';
import { paginateQuery } from '@/utils/pagination';

export const currentUser = withErrorHandling(async (_parent, _args, context) => {
    if (!context.user?.userId) {
        return null;
    }
    return User.findById(context.user.userId);
});

export const subscriptionPlans = withErrorHandling(async () => Object.values(ACCOUNT_TIERS));

export const accountUsage = withErrorHandling(async (_parent, _args, context) => {
    if (!context.user?.userId) {
        throw new Error('Authentication required');
    }
    const user = await User.findById(context.user.userId);
    if (!user) {
        throw new Error('User not found');
    }
    const { usage } = await getUsageSnapshot(user, ['optimizerRunsPerDay']);
    const tier = getTierConfig(user.subscriptionPlan);
    return {
        tier,
        optimizerRunsToday: usage.optimizerRunsPerDay || 0,
        optimizerRunsLimit: tier.limits.optimizerRunsPerDay,
    };
});

/**
 * Retrieves a single user by ID.
 *
 * @function getUser
 * @param {object} _parent
 * @param {object} args - Contains { id }
 * @param {object} context - GraphQL context.
 * @returns {Promise<User|null>} The user document or null.
 */
export const getUser = withErrorHandling(async (_parent, { id }, context) => {
    if (!context.user?.userId) {
        throw new Error('Authentication required');
    }
    if (context.user.userId !== id && context.user.role !== 'ADMIN') {
        throw new Error('Authorization required: You can only get your own profile or be an admin.');
    }
    return User.findById(id);
});

/**
 * Retrieves a paginated list of users.
 *
 * @function getUsers
 * @param {object} _parent
 * @param {object} args - Contains { page, limit }
 * @param {object} context - GraphQL context.
 * @returns {Promise<User[]>} An array of user documents.
 */
export const getUsers = withErrorHandling(async (_parent, { page, limit }, context) => {
    if (!context.user?.userId || context.user.role !== 'ADMIN') {
        throw new Error('Authorization required: Only admins can get all users.');
    }
    return paginateQuery(User, page, limit);
});

/**
 * Searches users by matching a keyword against name or email.
 *
 * @function searchUsers
 * @param {object} _parent
 * @param {object} args - Contains { keyword }
 * @param {object} context - GraphQL context.
 * @returns {Promise<User[]>} An array of user documents.
 */
export const searchUsers = withErrorHandling(async (_parent, { keyword }, context) => {
    if (!context.user?.userId || context.user.role !== 'ADMIN') {
        throw new Error('Authorization required: Only admins can search users.');
    }
    return User.searchUsers(keyword);
});

export const getQuestionnaire = withErrorHandling(async (_parent, { id }, context) => {
    if (!context.user?.userId) {
        throw new Error('Authentication required');
    }
    if (context.user.userId !== id && context.user.role !== 'ADMIN') {
        throw new Error('Authorization required: You can only access your own questionnaire or be an admin.');
    }
    const user = await User.findById(id);
    if (!user) {
        throw new Error(`User with ID ${id} not found`);
    }
    return user.questionnaire || {};
});
