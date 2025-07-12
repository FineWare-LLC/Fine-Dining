/**
 * @file preferencesSchema.js
 * @description Sub-schema for storing user preferences (UI, notifications, marketing, etc.).
 */

import mongoose from 'mongoose';

const preferencesSchema = new mongoose.Schema(
    {
        language: { type: String, default: 'en' },
        darkMode: { type: Boolean, default: false },
        emailNotifications: { type: Boolean, default: true },
        pushNotifications: { type: Boolean, default: false },
        smsNotifications: { type: Boolean, default: false },
        marketingOptIn: { type: Boolean, default: false },
    },
    { _id: false },
);

export default preferencesSchema;
