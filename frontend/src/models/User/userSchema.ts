// @ts-nocheck
/**
 * @file userSchema.js
 * @description Composes all sub-schemas, enumerations, methods, and pre-hooks to build the ultimate User schema.
 */

import mongoose from 'mongoose';

// Enums
import encrypt from 'mongoose-encryption';
import accountStatusEnum from './enums/accountStatusEnum';
import rolesEnum from './enums/rolesEnum';
import subscriptionPlanEnum from './enums/subscriptionPlanEnum';
import twoFAMethodEnum from './enums/twoFAMethodEnum';

// Sub-schemas
import addressSchema from './subSchemas/addressSchema';
import loginHistorySchema from './subSchemas/loginHistorySchema';
import paymentMethodSchema from './subSchemas/paymentMethodSchema';
import preferencesSchema from './subSchemas/preferencesSchema';
import questionnaireSchema from './subSchemas/questionnaireSchema';
import securityQuestionSchema from './subSchemas/securityQuestionSchema';
import socialAccountSchema from './subSchemas/socialAccountSchema';
import { stripPublicProfileRedactedFields } from './publicProfileFields';

// Methods
import {
    generatePasswordResetToken,
    validatePasswordResetToken,
    generateMagicLinkToken,
    enableTwoFactor,
    disableTwoFactor,
    comparePassword,
} from './user.methods';

// (Optional) Statics
import { userPreSave } from './user.preHooks';
import { findByEmailCaseInsensitive, searchUsers, softDeleteUser } from './user.statics';

// Pre-hooks

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
            // Ensure the email has a valid format using a regular expression.
            match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please fill a valid email address'],
        },
        password: {
            type: String,
            required: true,
            select: false, // Must explicitly .select('+password') to retrieve it
        },

        /**
         * Tokens for various authentication flows.
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
         * Account status (e.g. "ACTIVE", "SUSPENDED").
         */
        accountStatus: {
            type: String,
            enum: accountStatusEnum,
            default: 'ACTIVE',
        },

        /**
         * Soft delete and archive fields.
         */
        deletedAt: { type: Date, default: null },
        archivedAt: { type: Date, default: null },

        /**
         * Basic user metrics.
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
         * Nutrition targets for meal optimization (daily).
         * Each nutrient has min/max bounds that become LP constraints.
         */
        nutritionTargets: {
            // Macronutrients
            caloriesMin: { type: Number, default: 0, min: 0 },
            caloriesMax: { type: Number, default: null, min: 0 },
            proteinMin: { type: Number, default: 0, min: 0 },
            proteinMax: { type: Number, default: null, min: 0 },
            carbohydratesMin: { type: Number, default: 0, min: 0 },
            carbohydratesMax: { type: Number, default: null, min: 0 },
            fatMin: { type: Number, default: 0, min: 0 },
            fatMax: { type: Number, default: null, min: 0 },
            fiberMin: { type: Number, default: 0, min: 0 },
            fiberMax: { type: Number, default: null, min: 0 },
            sugarMax: { type: Number, default: null, min: 0 },
            sodiumMin: { type: Number, default: 0, min: 0 },
            sodiumMax: { type: Number, default: null, min: 0 },
            cholesterolMax: { type: Number, default: null, min: 0 },
            saturatedFatMax: { type: Number, default: null, min: 0 },
            // Micronutrients
            ironMin: { type: Number, default: null, min: 0 },
            calciumMin: { type: Number, default: null, min: 0 },
            vitaminCMin: { type: Number, default: null, min: 0 },
            vitaminDMin: { type: Number, default: null, min: 0 },
            vitaminB12Min: { type: Number, default: null, min: 0 },
            potassiumMin: { type: Number, default: null, min: 0 },
            magnesiumMin: { type: Number, default: null, min: 0 },
            zincMin: { type: Number, default: null, min: 0 },
            folateMin: { type: Number, default: null, min: 0 },
            omega3Min: { type: Number, default: null, min: 0 },
        },

        /**
         * Dietary profile for LP constraint generation.
         */
        dietaryProfile: {
            /** Named diets the user follows — each adds a set of LP constraints */
            diets: [{
                type: String,
                // e.g. "KETO", "PALEO", "VEGAN", "VEGETARIAN", "MEDITERRANEAN",
                //      "WHOLE30", "LOW_CARB", "HIGH_PROTEIN", "DASH", "GLUTEN_FREE"
            }],
            /** Specific allergens — recipes containing these are excluded */
            allergens: [{
                type: String,
                // e.g. "GLUTEN", "DAIRY", "NUTS", "TREE_NUTS", "PEANUTS",
                //      "EGGS", "SOY", "SHELLFISH", "FISH", "SESAME", "WHEAT"
            }],
            /** Ingredients the user refuses — hard LP exclusion */
            excludedIngredients: [{ type: String }],
            /** Preferred cuisines — LP objective bonus */
            preferredCuisines: [{ type: String }],
            /** Max meals per day */
            mealsPerDay: { type: Number, default: 3, min: 1, max: 10 },
            /** Max snacks per day */
            snacksPerDay: { type: Number, default: 1, min: 0, max: 5 },
            /** Budget constraint (daily, in user's currency) */
            dailyBudget: { type: Number, default: null, min: 0 },
            /** Max prep time per meal (minutes) */
            maxPrepTimePerMeal: { type: Number, default: null, min: 0 },
            /** Preferred difficulty */
            maxDifficulty: {
                type: String,
                enum: ['EASY', 'INTERMEDIATE', 'HARD', null],
                default: null,
            },
        },

        /**
         * Active household the user belongs to (if any).
         */
        activeHousehold: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Household',
            default: null,
        },

        /**
         * Additional personal details.
         */
        birthDate: { type: Date, default: null },
        avatarUrl: { type: String, default: '' },
        phoneCountryCode: { type: String, default: '' }, // e.g. '+1'
        bio: { type: String, default: '' },

        /**
         * 2FA, Security, and login attempt counters.
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
         * Security Questions.
         */
        securityQuestions: [securityQuestionSchema],

        /**
         * Timestamps and password change history.
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
         * Social connections.
         */
        connectedSocialAccounts: [socialAccountSchema],

        /**
         * Subscription / Payment details.
         */
        subscriptionPlan: {
            type: String,
            enum: subscriptionPlanEnum,
            default: 'FREE',
        },
        subscriptionStatus: {
            type: String,
            enum: ['inactive', 'active', 'trialing', 'past_due', 'canceled', 'unpaid', 'incomplete'],
            default: 'inactive',
        },
        stripeCustomerId: { type: String, default: null, index: true },
        stripeSubscriptionId: { type: String, default: null, index: true },
        stripePriceId: { type: String, default: null },
        subscriptionCurrentPeriodStart: { type: Date, default: null },
        subscriptionCurrentPeriodEnd: { type: Date, default: null },
        subscriptionRenewalDate: { type: Date, default: null },
        membershipExpiration: { type: Date, default: null },
        paymentMethods: [paymentMethodSchema],
        defaultPaymentMethod: { type: String, default: null },
        lastPaymentDate: { type: Date, default: null },
        couponCodesUsed: [{ type: String }],

        /**
         * Addresses.
         */
        addresses: [addressSchema],

        /**
         * Preferences.
         */
        preferences: preferencesSchema,

        /**
         * Last-completed questionnaire.
         */
        questionnaire: questionnaireSchema,

        /**
         * Follower/Following or blocked users.
         */
        blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

        /**
         * Referral system.
         */
        referralCode: { type: String, default: null },
        referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
        referredUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

        /**
         * Achievements or badges.
         */
        badges: [{ type: String }],

        /**
         * Loyalty/points-based system.
         */
        loyaltyPoints: { type: Number, default: 0 },
        loyaltyTier: { type: String, default: 'BRONZE' },

        /**
         * Overkill usage stats.
         */
        loginHistory: [loginHistorySchema],

        /**
         * Admin or internal notes.
         */
        adminNotes: { type: String, default: '' },

        /**
         * Meal preference fields.
         */
        preferredCuisines: [{ type: String }],
        dietaryRestrictions: [{ type: String }],
        dislikedIngredients: [{ type: String }],

        /**
         * Favorites.
         */
        favoriteRecipes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' }],
        rejectedRecipes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' }],
        favoriteRestaurants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant' }],

        /**
         * Personal Cookbooks (Saved/Curated Meals).
         */
        cookbooks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Cookbook' }],

        /**
         * Email notification preferences.
         */
        sendPulseEmailOnLogin: { type: Boolean, default: false },
        sendPulseEmailOnMealPlanCreation: { type: Boolean, default: false },

        /**
         * Ephemeral tokens or statuses.
         */
        ephemeralKeys: [
            {
                keyName: { type: String, default: '' },
                keyValue: { type: String, default: '' },
                expiresAt: { type: Date, default: null },
            },
        ],
    },
    {
        timestamps: true,
        // Configure toJSON to remove sensitive fields before outputting.
        toJSON: {
            transform (doc, ret) {
                // Preserve a stable public identifier while removing internal-only fields.
                if (ret && typeof ret === 'object' && !Array.isArray(ret)) {
                    if (typeof ret.id !== 'string' || ret.id.trim() === '') {
                        ret.id = ret._id ? ret._id.toString() : ret.id;
                    }
                }

                stripPublicProfileRedactedFields(ret);
                return ret;
            },
        },
    },
);

/* -------------------------------
 * Attaching Pre-Hooks
 * ------------------------------- */
// Run userPreSave before saving (e.g. to hash passwords, validate changes)
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
userSchema.statics.searchUsers = searchUsers;
userSchema.statics.softDeleteUser = softDeleteUser;

// Encrypt PII fields if encryption keys are provided
const encKey = process.env.MONGO_ENCRYPTION_KEY;
const sigKey = process.env.MONGO_ENCRYPTION_SIGNING_KEY;
if (encKey && sigKey) {
    // Convert hex keys to base64 format
    const hexToBase64 = (hexStr) => {
        return Buffer.from(hexStr, 'hex').toString('base64');
    };

    userSchema.plugin(encrypt, {
        encryptionKey: Buffer.from(hexToBase64(encKey), 'base64'),
        signingKey: Buffer.from(hexToBase64(sigKey), 'base64'),
        encryptedFields: ['phoneNumber', 'addresses'],
    });
} else {
    console.warn('Encryption keys missing; phone numbers and addresses will not be encrypted.');
}

export default userSchema;
