// @ts-nocheck
import mongoose from 'mongoose';
const { Schema } = mongoose;

const ALLOWED_GROCER_PROVIDERS = ['WALMART', 'WHOLE_FOODS', 'LOCAL_MARKET', 'UBER_EATS', 'DOORDASH'];
const GROCER_PROVIDER_ERROR_MESSAGE = 'We could not read your store preference. Please choose a supported grocery provider.';

const normalizeGrocerProvider = (value) => (
    typeof value === 'string' ? value.trim().toUpperCase() : ''
);

export class GrocerIntegrationValidationError extends Error {
    constructor(reason, provider = '', message = GROCER_PROVIDER_ERROR_MESSAGE) {
        super(message);
        this.name = 'GrocerIntegrationValidationError';
        this.code = 'invalidGrocerProvider';
        this.reason = reason;
        this.provider = provider;
        this.isUserSafe = true;
    }

    toJSON() {
        return {
            name: this.name,
            code: this.code,
            message: this.message,
            reason: this.reason,
            provider: this.provider,
            isUserSafe: this.isUserSafe,
        };
    }
}

function validateGrocerProvider() {
    this.provider = normalizeGrocerProvider(this.provider);

    if (!ALLOWED_GROCER_PROVIDERS.includes(this.provider)) {
        return new GrocerIntegrationValidationError('provider', this.provider);
    }

    return null;
}

export const grocerIntegrationSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    provider: { type: String, enum: ['WALMART', 'WHOLE_FOODS', 'LOCAL_MARKET', 'UBER_EATS', 'DOORDASH'], required: true },
    accessToken: { type: String }, // Should be encrypted via Mongoose encrypt plugin in production
    refreshToken: { type: String },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

// Fail-shut mechanism: canonicalize the selected grocer and reject unsupported providers.
grocerIntegrationSchema.pre('validate', function (next) {
    const validationError = validateGrocerProvider.call(this);
    if (validationError) {
        return next(validationError);
    }

    return next();
});

grocerIntegrationSchema.pre('save', function (next) {
    const validationError = validateGrocerProvider.call(this);
    if (validationError) {
        return next(validationError);
    }

    return next();
});

export default mongoose.models.GrocerIntegration || mongoose.model('GrocerIntegration', grocerIntegrationSchema);
