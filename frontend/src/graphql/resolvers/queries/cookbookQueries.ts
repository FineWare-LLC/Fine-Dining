// @ts-nocheck
import Cookbook from '@/models/Cookbook/cookbookSchema';

export const getCookbooksByUser = async (_, { userId }) => {
    return await Cookbook.find({ user: userId }).populate('entries.recipe meals recipes restaurants');
};

export const getCookbook = async (_, { id }) => {
    return await Cookbook.findById(id).populate('entries.recipe meals recipes restaurants');
};
