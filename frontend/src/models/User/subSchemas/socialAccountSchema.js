/**
 * @file socialAccountSchema.js
 * @description Hardened sub-schema for storing user social media connections (e.g. Google, Facebook).
 * This version normalizes inputs and validates required fields to ensure data integrity.
 */

import mongoose from 'mongoose';

const socialAccountSchema = new mongoose.Schema(
    {
        provider: {
            type: String,
            required: [true, 'Social account provider is required.'],
            trim: true,
            lowercase: true, // Normalize to lowercase for consistency.
            // Optionally, restrict to known providers:
            // enum: ['google', 'facebook', 'twitter', 'linkedin', 'instagram', 'other'],
        },
        providerId: {
            type: String,
            required: [true, 'Provider ID is required.'],
            trim: true,
            minlength: [3, 'Provider ID must be at least 3 characters long.'],
        },
        accessToken: {
            type: String,
            default: '',
            trim: true,
            // Further validations can be added here if necessary.
        },
        refreshToken: {
            type: String,
            default: '',
            trim: true,
        },
    },
    { _id: false },
);

export default socialAccountSchema;
