/**
 * @fileoverview Mongoose connection helper (Consolidated).
 * Location: /src/lib/dbConnect.js
 */
import mongoose from 'mongoose';

// Read from environment or use default
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fineDiningApp';

// Log the URI being used
console.log('Using MongoDB URI:', MONGODB_URI.replace(/mongodb:\/\/([^:]+):([^@]+)@/, 'mongodb://***:***@'));

// No need to throw an error as we now have a default

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

/**
 * @function dbConnect
 * Opens or returns a cached Mongoose connection.
 * @returns {Promise<mongoose.Connection>} The Mongoose connection instance
 */
export async function dbConnect() {
    if (cached.conn) {
        console.log('Using cached database connection');
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
            // Add other Mongoose 6+ options here if needed
            // useNewUrlParser and useUnifiedTopology are deprecated
        };

        console.log('Creating new database connection promise');
        cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
            console.log('Database connection established');
            return mongooseInstance.connection; // Use mongooseInstance.connection directly
        }).catch(error => {
            console.error('Database connection error:', error);
            cached.promise = null; // Reset promise on error
            throw error; // Re-throw error after logging
        });
    }

    try {
        console.log('Awaiting database connection promise');
        cached.conn = await cached.promise;
        return cached.conn;
    } catch (error) {
        // Ensure promise is nullified if await fails
        cached.promise = null;
        throw error;
    }
}
