/**
 * @file addressSchema.js
 * @description Hardened sub-schema for storing addresses (shipping, billing, etc.).
 */

import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema({
    label: {
        type: String, default: 'Home', trim: true,
    }, street: {
        type: String, default: '', trim: true,
    }, city: {
        type: String, default: '', trim: true,
    }, state: {
        type: String, default: '', trim: true,
    }, postalCode: {
        type: String, default: '', trim: true, validate: {
            validator: function (v) {
                // Allow empty postal codes or ones that contain alphanumeric characters,
                // spaces, or dashes.
                return v === '' || /^[a-zA-Z0-9\s\-]+$/.test(v);
            }, message: props => `${props.value} is not a valid postal code!`,
        },
    }, country: {
        type: String, default: '', trim: true, // Convert country code to uppercase
        set: (val) => (val ? val.trim().toUpperCase() : val), validate: {
            validator: function (v) {
                // Allow empty strings or a two-letter ISO country code
                return v === '' || /^[A-Z]{2}$/.test(v);
            }, message: props => `${props.value} is not a valid ISO country code!`,
        },
    }, isPrimary: {
        type: Boolean, default: false,
    },
}, {
    _id: false, // Timestamps can help track when an address was created or updated,
    // even though this is a sub-schema.
    timestamps: true,
});

export default addressSchema;
