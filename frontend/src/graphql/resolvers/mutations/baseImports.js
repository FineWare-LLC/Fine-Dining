
/**
 * Wraps a resolver to catch unexpected errors.
 *
 * @param {Function} resolver - The resolver function to wrap.
 * @returns {Function} The wrapped resolver.
 */
export const withErrorHandling = (resolver) => async (parent, args, context, info) => {
  try {
    return await resolver(parent, args, context, info);
  } catch (error) {
    console.error('Resolver Error:', error);
    throw new Error('Internal server error.');
  }
};