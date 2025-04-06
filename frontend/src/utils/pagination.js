/**
 * @file pagination.js
 * @description Utility function for paginating Mongoose queries.
 */

/**
 * @async
 * @function paginateQuery
 * @description Paginates a Mongoose query.
 * @param {mongoose.Query} query - The Mongoose query object.
 * @param {number} [page=1] - The desired page number (1-indexed).
 * @param {number} [limit=10] - The number of documents per page.
 * @returns {Promise<Array<mongoose.Document>>} - The documents for the requested page.
 */
export async function paginateQuery(query, page = 1, limit = 10) {
    const pageNum = Math.max(1, parseInt(page, 10)); // Ensure page is at least 1
    const limitNum = Math.max(1, parseInt(limit, 10)); // Ensure limit is at least 1
    const skip = (pageNum - 1) * limitNum;

    // Apply skip and limit to the query and execute it
    return query.skip(skip).limit(limitNum).exec();
}/**
 * @file pagination.js
 * @description Utility function for paginating Mongoose queries.
 */