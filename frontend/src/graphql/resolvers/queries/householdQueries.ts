// @ts-nocheck
import Household from '@/models/Household/householdSchema';
import { normalizeHouseholdInviteCode } from '../householdInvite';

export const getHousehold = async (_, { id }, context) => {
    if (!context.user?.userId) throw new Error('Authentication required');
    const household = await Household.findById(id)
        .populate('owner')
        .populate('members.user')
        .populate('sharedCookbook');
    if (!household) throw new Error('Household not found');
    return household;
};

export const getHouseholdsByUser = async (_, { userId }, context) => {
    if (!context.user?.userId) throw new Error('Authentication required');
    return Household.find({
        $or: [
            { owner: userId },
            { 'members.user': userId },
        ],
    })
        .populate('owner')
        .populate('members.user')
        .populate('sharedCookbook');
};

export const getHouseholdByInviteCode = async (_, { inviteCode }) => {
    const normalizedInviteCode = normalizeHouseholdInviteCode(inviteCode);
    const household = await Household.findOne({ inviteCode: normalizedInviteCode })
        .populate('owner');
    if (!household) throw new Error('Invalid invite code');
    return household;
};
