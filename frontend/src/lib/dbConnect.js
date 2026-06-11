/**
 * @fileoverview Mongoose connection helper (JavaScript version).
 */
import mongoose from 'mongoose';

// Read from environment
const {MONGODB_URI} = process.env;

// Throw if there's no URI
if (!MONGODB_URI) {
    throw new Error('Please define MONGODB_URI in your .env.local file');
}

/**
 * We create a global cached object to store the connection
 * so we don’t reopen a new DB connection on every request in dev.
 */
let cached = global.mongoose;
if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

/**
 * @function dbConnect
 * Opens or returns a single Mongoose connection.
 * @returns {Promise<mongoose.Connection>} The existing/new Mongoose connection
 */
export async function dbConnect() {
    // If already connected, return the existing connection
    if (cached.conn) {
        return cached.conn;
    }

    // If no promise yet, create a new one
    if (!cached.promise) {
        cached.promise = mongoose.connect(MONGODB_URI).then((mongooseInstance) => {
            return mongooseInstance.connection;
        });
    }

    // Await the promise and cache the connection
    cached.conn = await cached.promise;
    return cached.conn;
}
