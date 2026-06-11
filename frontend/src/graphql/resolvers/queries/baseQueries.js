/**
 * Hardened error handling wrapper for queries.
 * Additional security measures (input sanitization, error masking, logging, etc.) can be added here.
 *
 * @param {Function} resolver - The resolver function to wrap.
 * @returns {Function} The hardened resolver function.
 */
export const withErrorHandling = (resolver) => async (parent, args, context, info) => {
    try {
        // Hardened: Place additional input validation or security checks here if needed.
        return await resolver(parent, args, context, info);
    } catch (error) {
        console.error('Query Resolver Error (Hardened):', error);
        throw new Error('Internal server error.');
    }
};