// @ts-nocheck
import mongoose from 'mongoose';
import { validateHouseholdPlanningPreferences } from '../../utils/householdPlanningPreferences';

const { Schema } = mongoose;

/**
 * Sub-schema: a member of a household / organization with their role
 * and optional dietary constraint overrides.
 */
const memberSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        role: {
            type: String,
            enum: ['OWNER', 'ADMIN', 'MEMBER', 'GUEST'],
            default: 'MEMBER',
        },
        /** Per-member serving multiplier (e.g. 0.5 for a child, 2.0 for athlete) */
        servingMultiplier: {
            type: Number,
            default: 1,
            min: [0.1, 'Minimum 0.1 multiplier'],
            max: [10, 'Maximum 10x multiplier'],
        },
        /** If true, this member's dietary constraints are included in plan generation */
        includeInPlanning: {
            type: Boolean,
            default: true,
        },
        joinedAt: {
            type: Date,
            default: Date.now,
        },
    },
    { _id: true },
);

/**
 * Sub-schema: a guest who hasn't signed up but whose constraints we track
 * for temporary meal planning (e.g. dinner party, visiting family).
 */
const guestSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            default: '',
            trim: true,
        },
        allergens: [{ type: String, trim: true }],
        dietaryTags: [{ type: String, trim: true }],
        servingMultiplier: {
            type: Number,
            default: 1,
            min: 0.1,
            max: 10,
        },
        /** Date range the guest is present */
        startDate: { type: Date, default: null },
        endDate:   { type: Date, default: null },
        notes: {
            type: String,
            default: '',
            maxlength: [300, 'Guest notes cannot exceed 300 characters'],
        },
    },
    { _id: true },
);

/**
 * @class Household
 * @classdesc Represents a household, family, or organization that shares meal planning.
 *            Scales from 1 person to millions (military, school districts, etc.).
 *
 * The LP solver aggregates all active members' and guests' constraints
 * (allergens, dietary restrictions, nutrition targets) and serving multipliers
 * to produce a unified meal plan that satisfies everyone.
 */
const householdSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: [150, 'Household name cannot exceed 150 characters'],
        },
        type: {
            type: String,
            enum: ['INDIVIDUAL', 'FAMILY', 'ORGANIZATION'],
            default: 'FAMILY',
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        members: [memberSchema],
        guests: [guestSchema],

        /** Shared cookbook used for plan generation — if null, uses owner's default */
        sharedCookbook: {
            type: Schema.Types.ObjectId,
            ref: 'Cookbook',
            default: null,
        },

        /** Default planning preferences for the whole household */
        planningDefaults: {
            mealsPerDay: { type: Number, default: 3, min: 1, max: 10 },
            planDurationDays: { type: Number, default: 7, min: 1, max: 90 },
            budgetPerDay: { type: Number, default: null, min: 0 },
            budgetPerWeek: { type: Number, default: null, min: 0 },
            mealSlots: [{
                type: String,
                enum: ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK', 'DESSERT', 'SIDE'],
            }],
        },

        /** Total headcount — auto-computed from members + guests for the LP solver */
        headcount: {
            type: Number,
            default: 1,
            min: 1,
        },

        inviteCode: {
            type: String,
            default: null,
            unique: true,
            sparse: true,
        },
    },
    { timestamps: true },
);

/** Auto-compute headcount before saving */
householdSchema.pre('save', function (next) {
    if (this.planningDefaults !== undefined) {
        const planningDefaultsValidation = validateHouseholdPlanningPreferences(this.planningDefaults);
        if (!planningDefaultsValidation.valid) {
            next(planningDefaultsValidation.error);
            return;
        }

        this.planningDefaults = planningDefaultsValidation.planningDefaults;
    }

    let activeMembers = 0;
    for (const member of this.members) {
        if (member.includeInPlanning) {
            activeMembers += 1;
        }
    }

    const activeGuests = this.guests.length;
    this.headcount = Math.max(1, activeMembers + activeGuests);
    next();
});

householdSchema.index({ 'members.user': 1 });

export const Household = mongoose.models.Household || mongoose.model('Household', householdSchema);
export default Household;
