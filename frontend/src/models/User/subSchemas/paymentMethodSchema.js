/**
 * @file paymentMethodSchema.js
 * @description Sub-schema for storing user payment methods, e.g. Stripe or PayPal.
 */

import mongoose from 'mongoose';

const paymentMethodSchema = new mongoose.Schema(
    {
        provider: { type: String, required: true },         // e.g. "STRIPE", "PAYPAL"
        providerAccountId: { type: String, required: true },// e.g. Stripe's customer ID
        last4: { type: String, default: '' },               // Last 4 digits of card
        expirationDate: { type: String, default: '' },      // "MM/YY"
        isDefault: { type: Boolean, default: false },
    },
    { _id: false }
);

export default paymentMethodSchema;
