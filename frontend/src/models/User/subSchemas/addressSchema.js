/**
 * @file addressSchema.js
 * @description Sub-schema for storing addresses (shipping, billing, etc.).
 */

import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema(
    {
        label: { type: String, default: 'Home' }, // e.g. Home, Work, etc.
        street: { type: String, default: '' },
        city: { type: String, default: '' },
        state: { type: String, default: '' },
        postalCode: { type: String, default: '' },
        country: { type: String, default: '' },
        isPrimary: { type: Boolean, default: false },
    },
    { _id: false }
);

export default addressSchema;
