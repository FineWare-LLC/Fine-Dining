// @ts-nocheck
import Household from '@/models/Household/householdSchema';
import { normalizeHouseholdPlanApproval } from '@/utils/householdPlanApproval';
import { normalizeHouseholdShoppingOwnership } from '@/utils/householdShoppingOwnership';
import { normalizeHouseholdInviteCode } from '../householdInvite';

const normalizeHouseholdPlanApprovalSnapshot = (household) => {
    if (household && typeof household === 'object' && household.planApproval !== undefined) {
        household.planApproval = normalizeHouseholdPlanApproval(household.planApproval);
    }

    return household;
};

const normalizeHouseholdShoppingOwnershipSnapshot = (household) => {
    if (household && typeof household === 'object' && household.shoppingOwnership !== undefined) {
        household.shoppingOwnership = normalizeHouseholdShoppingOwnership(household.shoppingOwnership);
    }

    return household;
};

export const getHousehold = async (_, { id }, context) => {
    if (!context.user?.userId) throw new Error('Authentication required');
    const household = await Household.findById(id)
        .populate('owner')
        .populate('members.user')
        .populate('sharedCookbook');
    if (!household) throw new Error('Household not found');
    return normalizeHouseholdShoppingOwnershipSnapshot(normalizeHouseholdPlanApprovalSnapshot(household));
};

export const getHouseholdsByUser = async (_, { userId }, context) => {
    if (!context.user?.userId) throw new Error('Authentication required');
    const households = await Household.find({
        $or: [
            { owner: userId },
            { 'members.user': userId },
        ],
    })
        .populate('owner')
        .populate('members.user')
        .populate('sharedCookbook');

    if (Array.isArray(households)) {
        return households.map((household) => (
            normalizeHouseholdShoppingOwnershipSnapshot(normalizeHouseholdPlanApprovalSnapshot(household))
        ));
    }

    return normalizeHouseholdShoppingOwnershipSnapshot(normalizeHouseholdPlanApprovalSnapshot(households));
};

export const getHouseholdByInviteCode = async (_, { inviteCode }) => {
    const normalizedInviteCode = normalizeHouseholdInviteCode(inviteCode);
    const household = await Household.findOne({ inviteCode: normalizedInviteCode })
        .populate('owner')
        .populate('members.user')
        .populate('sharedCookbook');
    if (!household) throw new Error('Invalid invite code');
    return normalizeHouseholdShoppingOwnershipSnapshot(normalizeHouseholdPlanApprovalSnapshot(household));
};
