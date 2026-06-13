// @ts-nocheck
import crypto from 'crypto';
import { withErrorHandling } from './baseImports';
import Household from '@/models/Household/householdSchema';
import User from '@/models/User';
import { normalizeHouseholdInviteCode } from '../householdInvite';

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
    await household.save();

    await User.findByIdAndUpdate(userId, { activeHousehold: household._id });

    return household.populate('owner members.user');
});

export const updateHousehold = withErrorHandling(async (_, { id, input }, context) => {
    if (!context.user?.userId) throw new Error('Authentication required');
    const household = await Household.findById(id);
    if (!household || household.owner.toString() !== context.user.userId) {
        throw new Error('Household not found or unauthorized');
    }

    Object.assign(household, input);
    await household.save();
    return household.populate('owner members.user sharedCookbook');
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

    household.members.push({
        user: member.userId,
        role: member.role || 'MEMBER',
        servingMultiplier: member.servingMultiplier || 1,
        includeInPlanning: member.includeInPlanning !== false,
    });
    await household.save();

    await User.findByIdAndUpdate(member.userId, { activeHousehold: household._id });

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

    household.guests.push(guest);
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

    household.members.push({
        user: context.user.userId,
        role: 'MEMBER',
    });
    await household.save();

    await User.findByIdAndUpdate(context.user.userId, { activeHousehold: household._id });

    return household.populate('owner members.user sharedCookbook');
});
