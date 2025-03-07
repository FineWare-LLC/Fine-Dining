/*************************************************************
 * FILE: /src/models/UserModel.js
 * Absolutely Over-Engineered Mongoose User Model for Fine Dining
 *************************************************************/

import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs if needed

/**
 * Role-based Access Control.
 * Allows for role-specific logic (admin vs user vs premium, etc.)
 */
const rolesEnum = ['ADMIN', 'USER', 'PREMIUM', 'SUPER_ADMIN'];

/**
 * Account statuses can help handle user activation, banning, etc.
 */
const accountStatusEnum = ['ACTIVE', 'PENDING', 'SUSPENDED', 'DELETED', 'ARCHIVED'];

/**
 * 2FA methods (just an example).
 */
const twoFAMethodEnum = ['NONE', 'TOTP', 'SMS', 'EMAIL'];

/**
 * Subscription Plans
 */
const subscriptionPlanEnum = ['FREE', 'PREMIUM', 'ENTERPRISE'];

/**
 * Payment Methods (storing minimal data for demonstration).
 */
const paymentMethodSchema = new mongoose.Schema(
    {
        provider: { type: String, required: true }, // e.g. "STRIPE", "PAYPAL"
        providerAccountId: { type: String, required: true }, // e.g. Stripe's customer ID
        last4: { type: String, default: '' }, // Last 4 digits of card
        expirationDate: { type: String, default: '' }, // "MM/YY"
        isDefault: { type: Boolean, default: false },
    },
    { _id: false }
);

/**
 * Login history subdocument: records each time user logs in from an IP, device, etc.
 */
const loginHistorySchema = new mongoose.Schema(
    {
        ip: String,
        userAgent: String,
        timestamp: { type: Date, default: Date.now },
    },
    { _id: false }
);

/**
 * Address subdocument to store user addresses (shipping/billing).
 */
const addressSchema = new mongoose.Schema(
    {
        label: { type: String, default: 'Home' }, // e.g. Home, Work
        street: { type: String, default: '' },
        city: { type: String, default: '' },
        state: { type: String, default: '' },
        postalCode: { type: String, default: '' },
        country: { type: String, default: '' },
        isPrimary: { type: Boolean, default: false },
    },
    { _id: false }
);

/**
 * Preferences subdocument: user interface, notification, and other preferences.
 */
const preferencesSchema = new mongoose.Schema(
    {
        language: { type: String, default: 'en' },
        darkMode: { type: Boolean, default: false },
        emailNotifications: { type: Boolean, default: true },
        pushNotifications: { type: Boolean, default: false },
        smsNotifications: { type: Boolean, default: false },
        marketingOptIn: { type: Boolean, default: false },
    },
    { _id: false }
);

/**
 * Security Questions (if you want them).
 */
const securityQuestionSchema = new mongoose.Schema(
    {
        question: { type: String, required: true },
        answerHash: { type: String, required: true }, // hashed answer for security
    },
    { _id: false }
);

/**
 * Social account connections, e.g. Google, Facebook, etc.
 */
const socialAccountSchema = new mongoose.Schema(
    {
        provider: { type: String, required: true }, // 'google', 'facebook', etc.
        providerId: { type: String, required: true }, // user’s ID on that platform
        accessToken: { type: String },
        refreshToken: { type: String },
    },
    { _id: false }
);

/**
 * The MAIN User schema, with maximum over-engineering.
 */
const userSchema = new mongoose.Schema(
    {
        /******************************************************
         * Core Identity fields
         ******************************************************/
        name: { type: String, required: true },
        email: {
            type: String,
            unique: true,
            required: true,
            lowercase: true, // convert email to lowercase
            trim: true,
        },
        password: {
            type: String,
            required: true,
            select: false, // Must explicitly select this in queries
        },

        /**
         * For demonstration of "over-engineering," let's store
         * tokens for password reset, phone/email verification,
         * magic links, etc.
         */
        passwordResetToken: { type: String, default: null },
        passwordResetTokenExpiry: { type: Date, default: null },

        // Magic link login
        magicLinkToken: { type: String, default: null },
        magicLinkExpiry: { type: Date, default: null },

        // Email update
        updateEmailToken: { type: String, default: null },
        updateEmailExpiry: { type: Date, default: null },
        newEmail: { type: String, default: null },

        // Phone verification
        phoneNumber: { type: String, default: '' },
        phoneVerificationToken: { type: String, default: null },
        phoneVerificationExpiry: { type: Date, default: null },
        isPhoneVerified: { type: Boolean, default: false },

        /**
         * Role-based Access Control.
         * e.g. "ADMIN", "USER", "PREMIUM"
         */
        role: {
            type: String,
            enum: rolesEnum,
            default: 'USER',
        },

        /**
         * Account status: e.g. "ACTIVE", "SUSPENDED", etc.
         */
        accountStatus: {
            type: String,
            enum: accountStatusEnum,
            default: 'ACTIVE',
        },

        /**
         * If you want a "soft delete" approach.
         */
        deletedAt: { type: Date, default: null },
        archivedAt: { type: Date, default: null },

        /**
         * Basic user metrics
         */
        weight: Number,
        height: Number,
        gender: {
            type: String,
            enum: ['MALE', 'FEMALE', 'OTHER'],
            required: true,
        },
        measurementSystem: {
            type: String,
            enum: ['METRIC', 'IMPERIAL'],
            required: true,
        },
        weightGoal: {
            type: String,
            enum: ['LOSE', 'GAIN', 'MAINTAIN'],
        },
        foodGoals: [String],
        allergies: [String],
        dailyCalories: Number,

        /**
         * Additional personal details
         */
        birthDate: { type: Date, default: null },
        avatarUrl: { type: String, default: '' },
        phoneCountryCode: { type: String, default: '' }, // e.g. '+1'
        bio: { type: String, default: '' },

        /**
         * 2FA, Security, and login attempt counters
         */
        twoFactorEnabled: { type: Boolean, default: false },
        twoFactorMethod: {
            type: String,
            enum: twoFAMethodEnum,
            default: 'NONE',
        },
        twoFactorSecret: { type: String, default: null },
        emergencyBackupCodes: [{ type: String }],

        loginAttempts: { type: Number, default: 0 },
        lockUntil: { type: Date, default: null }, // after too many login attempts
        tokenVersion: { type: Number, default: 0 }, // increments to invalidate old tokens

        /**
         * Security Questions
         */
        securityQuestions: [securityQuestionSchema],

        /**
         * Timestamps: last login, last password change, password history, etc.
         */
        lastLogin: { type: Date, default: null },
        lastPasswordChange: { type: Date, default: null },
        passwordHistory: [
            {
                passwordHash: String,
                changedAt: { type: Date, default: Date.now },
            },
        ],

        /**
         * Social connections (Google, Facebook, etc.)
         */
        connectedSocialAccounts: [socialAccountSchema],

        /**
         * Subscription / Payment details
         */
        subscriptionPlan: {
            type: String,
            enum: subscriptionPlanEnum,
            default: 'FREE',
        },
        subscriptionRenewalDate: { type: Date, default: null },
        membershipExpiration: { type: Date, default: null },
        paymentMethods: [paymentMethodSchema],
        defaultPaymentMethod: { type: String, default: null }, // references providerAccountId
        lastPaymentDate: { type: Date, default: null },
        couponCodesUsed: [{ type: String }],

        /**
         * Addresses
         */
        addresses: [addressSchema],

        /**
         * Preferences
         */
        preferences: preferencesSchema,

        /**
         * Follower/Following or blocked users if you have social features
         */
        blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

        /**
         * If using a referral system
         */
        referralCode: { type: String, default: null },
        referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
        referredUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

        /**
         * For achievements or badges in your system
         */
        badges: [{ type: String }],

        /**
         * Loyalty/points-based system
         */
        loyaltyPoints: { type: Number, default: 0 },
        loyaltyTier: { type: String, default: 'BRONZE' },

        /**
         * Overkill usage stats
         */
        loginHistory: [loginHistorySchema],

        /**
         * Notes: admin or internal notes about user
         */
        adminNotes: { type: String, default: '' },

        /**
         * Additional fields for meal preferences
         */
        preferredCuisines: [String],
        dietaryRestrictions: [String],
        dislikedIngredients: [String],

        /**
         * If you want to store user’s shoppingList or favorites directly
         */
        favoriteRecipes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' }],
        favoriteRestaurants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant' }],

        /**
         * Because why not store a million booleans?
         */
        sendPulseEmailOnLogin: { type: Boolean, default: false },
        sendPulseEmailOnMealPlanCreation: { type: Boolean, default: false },

        /**
         * A place to store ephemeral tokens or statuses
         */
        ephemeralKeys: [
            {
                keyName: String,
                keyValue: String,
                expiresAt: Date,
            },
        ],
    },
    { timestamps: true }
);

/**
 * PRE-SAVE MIDDLEWARE
 * 1) Hash password if new/modified.
 * 2) Possibly store password history.
 * 3) Handle special logic for "DELETED" or "ARCHIVED" statuses, etc.
 */
userSchema.pre('save', async function (next) {
    // 1) Hash password if new or modified
    if (this.isModified('password')) {
        try {
            const saltRounds = 10;
            const newHash = await bcrypt.hash(this.password, saltRounds);

            // Optionally push the old password hash to history if it exists
            if (this.isModified('password') && this.isNew === false) {
                if (this.passwordHistory.length >= 5) {
                    // Keep last 5 password hashes (example policy)
                    this.passwordHistory.shift();
                }
                // If the old password was selected, push it to history:
                // But you need the old hash first. Let's assume we don't
                // always have it in memory. If we do, we'd do something like:
                // const oldDoc = await this.constructor.findById(this._id).select('+password');
                // if (oldDoc?.password) {
                //   this.passwordHistory.push({ passwordHash: oldDoc.password });
                // }
            }

            this.password = newHash;
            this.lastPasswordChange = new Date();
        } catch (error) {
            return next(error);
        }
    }

    // 2) If account status is DELETED, you might anonymize user data
    if (this.isModified('accountStatus') && this.accountStatus === 'DELETED') {
        this.email = `${uuidv4()}@deleted.user`;
        this.name = 'Deleted User';
        this.phoneNumber = '';
        this.deletedAt = new Date();
    }

    // 3) If account status is ARCHIVED, set archivedAt
    if (this.isModified('accountStatus') && this.accountStatus === 'ARCHIVED') {
        this.archivedAt = new Date();
    }

    return next();
});

/**
 * PASSWORD RESET TOKEN METHODS
 */

/**
 * Generate a password reset token & expiry (forgot password).
 */
userSchema.methods.generatePasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiry = Date.now() + 3600000; // 1 hour from now

    this.passwordResetToken = resetToken;
    this.passwordResetTokenExpiry = new Date(expiry);

    return resetToken;
};

/**
 * Validate if the provided token is still valid.
 */
userSchema.methods.validatePasswordResetToken = function (token) {
    if (
        !this.passwordResetToken ||
        !this.passwordResetTokenExpiry ||
        this.passwordResetTokenExpiry < Date.now()
    ) {
        return false;
    }
    return this.passwordResetToken === token;
};

/**
 * MAGIC LINK or EMAIL UPDATE tokens, phone verification, etc. follow
 * the same pattern if you want.
 */
userSchema.methods.generateMagicLinkToken = function () {
    const token = crypto.randomBytes(20).toString('hex');
    this.magicLinkToken = token;
    this.magicLinkExpiry = new Date(Date.now() + 3600000);
    return token;
};

/**
 * 2FA HELPER METHODS
 * For TOTP-based 2FA, you’d integrate something like speakeasy.
 */
userSchema.methods.enableTwoFactor = function (method = 'TOTP', secret = '') {
    this.twoFactorEnabled = true;
    this.twoFactorMethod = method;
    this.twoFactorSecret = secret;
};

userSchema.methods.disableTwoFactor = function () {
    this.twoFactorEnabled = false;
    this.twoFactorMethod = 'NONE';
    this.twoFactorSecret = null;
};

/**
 * COMPARE PASSWORD HELPER (for login).
 * Because password is stored select: false, you must query with .select('+password')
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

const UserModel = mongoose.models.User || mongoose.model('User', userSchema);
export default UserModel;
