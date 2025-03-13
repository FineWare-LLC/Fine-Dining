/**
 * @file socialAccountSchema.js
 * @description Sub-schema for storing user social media connections (Google, Facebook, etc.).
 */

import mongoose from 'mongoose';

const socialAccountSchema = new mongoose.Schema(
    {
        provider: { type: String, required: true },    // 'google', 'facebook', etc.
        providerId: { type: String, required: true },  // user’s ID on that platform
        accessToken: { type: String, default: '' },
        refreshToken: { type: String, default: '' },
    },
    { _id: false }
);

export default socialAccountSchema;
