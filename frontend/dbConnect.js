/**
 * @file dbConnect.js
 * @description Establishes and caches a Mongoose connection to MongoDB.
 *
 * This ensures that subsequent calls to dbConnect reuse the existing
 * database connection within the Next.js serverless environment.
 */

import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/myLocalDB';

/**
 * A global variable to hold the cached database connection and promise.
 *
 * @type {{
 *   conn: mongoose.Connection | null,
 *   promise: Promise<mongoose.Connection> | null
 * }}
 */
let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

/**
 * @function dbConnect
 * @async
 * @description Asynchronous function that checks for an existing connection
 *              or creates a new one if needed, then returns the active
 *              Mongoose connection object.
 *
 * @throws Will throw an error if the connection to MongoDB fails.
 * @returns {Promise<mongoose.Connection>} - The active Mongoose Connection instance.
 */
export async function dbConnect() {
    // If connection is already established, return it
    if (cached.conn) {
        return cached.conn;
    }

    // If no promise yet, initiate a new one
    if (!cached.promise) {
        // Create a new Mongoose connection promise
        cached.promise = mongoose
            .connect(MONGODB_URI, {
                // For example, recommended options:
                useNewUrlParser: true,
                useUnifiedTopology: true,
            })
            .then((mongooseConnection) => mongooseConnection.connection);
    }

    // Await the promise and cache the connection
    cached.conn = await cached.promise;
    return cached.conn;
}
