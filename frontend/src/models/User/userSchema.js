/**
 * @file userSchema.js
 * @description Composes all sub-schemas, enumerations, methods, and pre-hooks to build the ultimate User schema.
 */

import mongoose from 'mongoose';

// Enums
import rolesEnum from './enums/rolesEnum.js';
import accountStatusEnum from './enums/accountStatusEnum.js';
import twoFAMethodEnum from './enums/twoFAMethodEnum.js';
import subscriptionPlanEnum from './enums/subscriptionPlanEnum.js';

// Sub-schemas
import paymentMethodSchema from './subSchemas/paymentMethodSchema.js';
import loginHistorySchema from './subSchemas/loginHistorySchema.js';
import addressSchema from './subSchemas/addressSchema.js';
import preferencesSchema from './subSchemas/preferencesSchema.js';
import securityQuestionSchema from './subSchemas/securityQuestionSchema.js';
import socialAccountSchema from './subSchemas/socialAccountSchema.js';

// Methods
import {
    generatePasswordResetToken,
    validatePasswordResetToken,
    generateMagicLinkToken,
    enableTwoFactor,
    disableTwoFactor,
    comparePassword,
} from './user.methods.js';

// (Optional) Statics
import { findByEmailCaseInsensitive, softDeleteUser } from './user.statics.js';

// Pre-hooks
import { userPreSave } from './user.preHooks.js';

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
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: true,
            select: false, // Must explicitly .select('+password') to retrieve
        },

        /**
         * For demonstration of "maximum over-engineering," let's store
         * tokens for password reset, phone/email verification, magic links, etc.
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
         * Soft delete approach
         */
        deletedAt: { type: Date, default: null },
        archivedAt: { type: Date, default: null },

        /**
         * Basic user metrics
         */
        weight: { type: Number, default: null },
        height: { type: Number, default: null },
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
        foodGoals: [{ type: String }],
        allergies: [{ type: String }],
        dailyCalories: { type: Number, default: 0 },

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
        lockUntil: { type: Date, default: null },
        tokenVersion: { type: Number, default: 0 },

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
         * Social connections
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
        defaultPaymentMethod: { type: String, default: null },
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
         * Follower/Following or blocked users
         */
        blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

        /**
         * Referral system
         */
        referralCode: { type: String, default: null },
        referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
        referredUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

        /**
         * Achievements or badges
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
        preferredCuisines: [{ type: String }],
        dietaryRestrictions: [{ type: String }],
        dislikedIngredients: [{ type: String }],

        /**
         * Favorites directly
         */
        favoriteRecipes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' }],
        favoriteRestaurants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant' }],

        /**
         * Because why not store a million booleans?
         */
        sendPulseEmailOnLogin: { type: Boolean, default: false },
        sendPulseEmailOnMealPlanCreation: { type: Boolean, default: false },

        /**
         * Ephemeral tokens or statuses
         */
        ephemeralKeys: [
            {
                keyName: { type: String, default: '' },
                keyValue: { type: String, default: '' },
                expiresAt: { type: Date, default: null },
            },
        ],
    },
    { timestamps: true }
);

/* -------------------------------
 * Attaching Pre-Hooks
 * ------------------------------- */
userSchema.pre('save', userPreSave);

/* -------------------------------
 * Attaching Instance Methods
 * ------------------------------- */
userSchema.methods.generatePasswordResetToken = generatePasswordResetToken;
userSchema.methods.validatePasswordResetToken = validatePasswordResetToken;
userSchema.methods.generateMagicLinkToken = generateMagicLinkToken;
userSchema.methods.enableTwoFactor = enableTwoFactor;
userSchema.methods.disableTwoFactor = disableTwoFactor;
userSchema.methods.comparePassword = comparePassword;

/* -------------------------------
 * Attaching Static Methods (Optional)
 * ------------------------------- */
userSchema.statics.findByEmailCaseInsensitive = findByEmailCaseInsensitive;
userSchema.statics.softDeleteUser = softDeleteUser;

export default userSchema;
