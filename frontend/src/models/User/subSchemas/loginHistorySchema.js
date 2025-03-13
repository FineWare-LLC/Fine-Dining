/**
 * @file loginHistorySchema.js
 * @description Sub-schema for storing user login history (IP, userAgent, timestamp).
 */

import mongoose from 'mongoose';

const loginHistorySchema = new mongoose.Schema(
    {
        ip: { type: String, default: '' },
        userAgent: { type: String, default: '' },
        timestamp: { type: Date, default: Date.now },
    },
    { _id: false }
);

export default loginHistorySchema;
