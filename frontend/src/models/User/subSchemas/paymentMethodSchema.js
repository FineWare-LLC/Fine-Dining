/**
 * @file paymentMethodSchema.js
 * @description Hardened sub-schema for storing user payment methods (e.g. Stripe, PayPal) with robust validations.
 */

import mongoose from 'mongoose';

const paymentMethodSchema = new mongoose.Schema({
    provider: {
        type: String,
        required: [true, 'Payment provider is required.'],
        trim: true,
        uppercase: true, // Optionally, enforce allowed values:
        // enum: ['STRIPE', 'PAYPAL', 'SQUARE', 'OTHER'],
    }, providerAccountId: {
        type: String, required: [true, 'Provider account ID is required.'], trim: true,
    }, last4: {
        type: String, default: '', trim: true, validate: {
            validator: function (v) {
                // Allow empty string or exactly 4 digits.
                return v === '' || /^\d{4}$/.test(v);
            }, message: props => `${props.value} is not valid. It must be exactly 4 digits or empty.`,
        },
    }, expirationDate: {
        type: String, default: '', trim: true, validate: {
            validator: function (v) {
                // Allow empty string or match format MM/YY where MM is 01-12.
                return v === '' || /^(0[1-9]|1[0-2])\/\d{2}$/.test(v);
            }, message: props => `${props.value} is not a valid expiration date. Expected format is MM/YY.`,
        },
    }, isDefault: {
        type: Boolean, default: false,
    },
}, {_id: false});

export default paymentMethodSchema;
