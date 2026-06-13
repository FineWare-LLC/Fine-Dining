// @ts-nocheck
import crypto from 'crypto';
import { withErrorHandling } from './baseImports';
import Household from '@/models/Household/householdSchema';
import User from '@/models/User';
import { validateHouseholdPlanningPreferences } from '@/utils/householdPlanningPreferences';
import { normalizeHouseholdServingMultiplier } from '@/utils/householdMemberServings';
import {
    HouseholdInvitePersistenceError,
    normalizeHouseholdInviteCode,
} from '../householdInvite';

const deleteCreatedHousehold = async (householdId) => {
    if (!householdId) {
        return;
    }

    await Household.findByIdAndDelete(householdId).catch((rollbackError) => {
        console.error('Household invite rollback failed:', rollbackError);
    });
};

const restoreHouseholdMembers = (household, originalMembers) => {
    if (!household || !Array.isArray(originalMembers)) {
        return;
    }

    household.members = originalMembers;
};

const snapshotPlanningDefaults = (planningDefaults) => {
    if (!planningDefaults) {
        return planningDefaults;
    }

    const snapshot = {
        ...planningDefaults,
    };

    if (Array.isArray(planningDefaults.mealSlots)) {
        snapshot.mealSlots = [...planningDefaults.mealSlots];
    } else if (planningDefaults.mealSlots !== undefined) {
        snapshot.mealSlots = planningDefaults.mealSlots;
    } else {
        delete snapshot.mealSlots;
    }

    return snapshot;
};

const snapshotHouseholdState = (household) => ({
    name: household?.name,
    type: household?.type,
    owner: household?.owner,
    members: Array.isArray(household?.members)
        ? [...household.members]
        : household?.members,
    guests: Array.isArray(household?.guests)
        ? [...household.guests]
        : household?.guests,
    sharedCookbook: household?.sharedCookbook,
    planningDefaults: snapshotPlanningDefaults(household?.planningDefaults),
    headcount: household?.headcount,
    inviteCode: household?.inviteCode,
    updatedAt: household?.updatedAt,
});

const restoreHouseholdState = (household, originalState) => {
    if (!household || !originalState) {
        return;
    }

    if (typeof household.set === 'function') {
        household.set(originalState);
        return;
    }

    Object.assign(household, originalState);
};

const normalizePlanningDefaultsInput = (planningDefaults) => {
    if (planningDefaults === undefined) {
        return undefined;
    }

    const validation = validateHouseholdPlanningPreferences(planningDefaults);
    if (!validation.valid) {
        throw validation.error;
    }

    return validation.planningDefaults;
};

const HOUSEHOLD_REVISION_ERROR_MESSAGES = {
    invalidPayload: 'We could not read the latest household plan. Please refresh and try again.',
    staleHouseholdRevision: 'This household was updated by someone else. Please refresh and try again.',
};

const HOUSEHOLD_PLAN_PERSISTENCE_ERROR_MESSAGE =
    'We could not save your household plan. Please try again.';

export class HouseholdRevisionValidationError extends Error {
    constructor(code, message = HOUSEHOLD_REVISION_ERROR_MESSAGES.invalidPayload) {
        super(message);
        this.name = 'HouseholdRevisionValidationError';
        this.code = code;
        this.isUserSafe = true;
    }

    toJSON() {
        return {
            name: this.name,
            code: this.code,
            message: this.message,
            isUserSafe: this.isUserSafe,
        };
    }
}

export class HouseholdPlanPersistenceError extends Error {
    constructor(reason, cause = null) {
        super(HOUSEHOLD_PLAN_PERSISTENCE_ERROR_MESSAGE);
        this.name = 'HouseholdPlanPersistenceError';
        this.code = 'householdPlanPersistenceFailed';
        this.reason = reason;
        this.isUserSafe = true;
        if (cause) {
            this.cause = cause;
        }
    }

    toJSON() {
        const serialized = {
            name: this.name,
            code: this.code,
            message: this.message,
            reason: this.reason,
            isUserSafe: this.isUserSafe,
        };

        if (Object.prototype.hasOwnProperty.call(this, 'cause')) {
            serialized.cause = this.cause;
        }

        return serialized;
    }
}

const createHouseholdRevisionValidationError = (code) => (
    new HouseholdRevisionValidationError(
        code,
        HOUSEHOLD_REVISION_ERROR_MESSAGES[code]
            || HOUSEHOLD_REVISION_ERROR_MESSAGES.invalidPayload,
    )
);

const normalizeHouseholdRevisionTimestamp = (value) => {
    if (value instanceof Date) {
        const timestamp = value.getTime();
        return Number.isNaN(timestamp) ? null : new Date(timestamp);
    }

    if (typeof value === 'string' || typeof value === 'number') {
        const parsed = new Date(value);
        return Number.isNaN(parsed.getTime()) ? null : parsed;
    }

    return null;
};

const assertMatchingHouseholdRevision = (expectedUpdatedAt, currentUpdatedAt) => {
    const normalizedExpectedUpdatedAt = normalizeHouseholdRevisionTimestamp(expectedUpdatedAt);
    const normalizedCurrentUpdatedAt = normalizeHouseholdRevisionTimestamp(currentUpdatedAt);

    if (!normalizedExpectedUpdatedAt || !normalizedCurrentUpdatedAt) {
        throw createHouseholdRevisionValidationError('invalidPayload');
    }

    if (normalizedExpectedUpdatedAt.getTime() !== normalizedCurrentUpdatedAt.getTime()) {
        throw createHouseholdRevisionValidationError('staleHouseholdRevision');
    }
};

export const createHousehold = withErrorHandling(async (_, { input }, context) => {
    if (!context.user?.userId) throw new Error('Authentication required');
    const {userId} = context.user;

    const inviteCode = crypto.randomBytes(6).toString('hex');

    const household = new Household({
        ...input,
        owner: userId,
        members: [{ user: userId, role: 'OWNER' }],
        inviteCode,
    });
    try {
        await household.save();
    } catch (error) {
        if (error?.isUserSafe) {
            throw error;
        }

        throw new HouseholdInvitePersistenceError('save', error);
    }

    try {
        await User.findByIdAndUpdate(userId, { activeHousehold: household._id });
    } catch (error) {
        await deleteCreatedHousehold(household._id);

        if (error?.isUserSafe) {
            throw error;
        }

        throw new HouseholdInvitePersistenceError('linkUser', error);
    }

    return household.populate('owner members.user');
});

export const updateHousehold = withErrorHandling(async (_, { id, input }, context) => {
    if (!context.user?.userId) throw new Error('Authentication required');
    const household = await Household.findById(id);
    if (!household || household.owner.toString() !== context.user.userId) {
        throw new Error('Household not found or unauthorized');
    }

    const { planningDefaults, expectedUpdatedAt, ...updateFields } = input;
    assertMatchingHouseholdRevision(expectedUpdatedAt, household.updatedAt);
    const originalHouseholdState = snapshotHouseholdState(household);
    const normalizedPlanningDefaults = normalizePlanningDefaultsInput(planningDefaults);

    Object.assign(household, updateFields);
    if (normalizedPlanningDefaults !== undefined) {
        household.planningDefaults = normalizedPlanningDefaults;
    }

    try {
        await household.save();
    } catch (error) {
        restoreHouseholdState(household, originalHouseholdState);

        if (error?.isUserSafe) {
            throw error;
        }

        throw new HouseholdPlanPersistenceError('save', error);
    }

    try {
        await household.populate('owner');
        await household.populate('members.user');
        return await household.populate('sharedCookbook');
    } catch (error) {
        restoreHouseholdState(household, originalHouseholdState);

        try {
            await household.save();
        } catch (rollbackError) {
            console.error('Household plan rollback failed:', rollbackError);
        }

        if (error?.isUserSafe) {
            throw error;
        }

        throw new HouseholdPlanPersistenceError('populate', error);
    }
});

export const deleteHousehold = withErrorHandling(async (_, { id }, context) => {
    if (!context.user?.userId) throw new Error('Authentication required');
    const household = await Household.findById(id);
    if (!household || household.owner.toString() !== context.user.userId) {
        throw new Error('Household not found or unauthorized');
    }
    await Household.findByIdAndDelete(id);
    return true;
});

export const addHouseholdMember = withErrorHandling(async (_, { householdId, member }, context) => {
    if (!context.user?.userId) throw new Error('Authentication required');
    const household = await Household.findById(householdId);
    if (!household) throw new Error('Household not found');

    const isOwnerOrAdmin = household.members.some(
        (m) => m.user.toString() === context.user.userId && ['OWNER', 'ADMIN'].includes(m.role),
    );
    if (!isOwnerOrAdmin) throw new Error('Only owners and admins can add members');

    const alreadyMember = household.members.some((m) => m.user.toString() === member.userId);
    if (alreadyMember) throw new Error('User is already a member');

    const originalHouseholdState = snapshotHouseholdState(household);

    household.members.push({
        user: member.userId,
        role: member.role || 'MEMBER',
        servingMultiplier: normalizeHouseholdServingMultiplier(member.servingMultiplier),
        includeInPlanning: member.includeInPlanning !== false,
    });

    try {
        await household.save();
    } catch (error) {
        restoreHouseholdState(household, originalHouseholdState);

        if (error?.isUserSafe) {
            throw error;
        }

        throw new HouseholdInvitePersistenceError('save', error);
    }

    try {
        await User.findByIdAndUpdate(member.userId, { activeHousehold: household._id });
    } catch (error) {
        restoreHouseholdState(household, originalHouseholdState);
        await household.save().catch((rollbackError) => {
            console.error('Household member rollback failed:', rollbackError);
        });

        if (error?.isUserSafe) {
            throw error;
        }

        throw new HouseholdInvitePersistenceError('linkUser', error);
    }

    return household.populate('owner members.user sharedCookbook');
});

export const removeHouseholdMember = withErrorHandling(async (_, { householdId, memberId }, context) => {
    if (!context.user?.userId) throw new Error('Authentication required');
    const household = await Household.findById(householdId);
    if (!household) throw new Error('Household not found');

    const isOwnerOrAdmin = household.members.some(
        (m) => m.user.toString() === context.user.userId && ['OWNER', 'ADMIN'].includes(m.role),
    );
    if (!isOwnerOrAdmin) throw new Error('Only owners and admins can remove members');

    household.members = household.members.filter((m) => m._id.toString() !== memberId);
    await household.save();
    return household.populate('owner members.user sharedCookbook');
});

export const addHouseholdGuest = withErrorHandling(async (_, { householdId, guest }, context) => {
    if (!context.user?.userId) throw new Error('Authentication required');
    const household = await Household.findById(householdId);
    if (!household) throw new Error('Household not found');

    const isMember = household.members.some((m) => m.user.toString() === context.user.userId);
    if (!isMember) throw new Error('Only household members can add guests');

    household.guests.push({
        ...guest,
        servingMultiplier: normalizeHouseholdServingMultiplier(guest.servingMultiplier),
    });
    await household.save();
    return household.populate('owner members.user sharedCookbook');
});

export const removeHouseholdGuest = withErrorHandling(async (_, { householdId, guestId }, context) => {
    if (!context.user?.userId) throw new Error('Authentication required');
    const household = await Household.findById(householdId);
    if (!household) throw new Error('Household not found');

    household.guests = household.guests.filter((g) => g._id.toString() !== guestId);
    await household.save();
    return household.populate('owner members.user sharedCookbook');
});

export const joinHouseholdByInvite = withErrorHandling(async (_, { inviteCode }, context) => {
    if (!context.user?.userId) throw new Error('Authentication required');
    const normalizedInviteCode = normalizeHouseholdInviteCode(inviteCode);
    const household = await Household.findOne({ inviteCode: normalizedInviteCode });
    if (!household) throw new Error('Invalid invite code');

    const alreadyMember = household.members.some((m) => m.user.toString() === context.user.userId);
    if (alreadyMember) throw new Error('Already a member of this household');

    const originalMembers = household.members.slice();
    household.members.push({
        user: context.user.userId,
        role: 'MEMBER',
    });
    try {
        await household.save();
    } catch (error) {
        restoreHouseholdMembers(household, originalMembers);

        if (error?.isUserSafe) {
            throw error;
        }

        throw new HouseholdInvitePersistenceError('save', error);
    }

    try {
        await User.findByIdAndUpdate(context.user.userId, { activeHousehold: household._id });
    } catch (error) {
        restoreHouseholdMembers(household, originalMembers);
        await household.save().catch((rollbackError) => {
            console.error('Household invite rollback failed:', rollbackError);
        });

        if (error?.isUserSafe) {
            throw error;
        }

        throw new HouseholdInvitePersistenceError('linkUser', error);
    }

    return household.populate('owner members.user sharedCookbook');
});
