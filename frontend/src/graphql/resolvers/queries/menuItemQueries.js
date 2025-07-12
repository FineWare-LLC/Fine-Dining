import mongoose from 'mongoose';
import { withErrorHandling } from './baseQueries.js';
import { MenuItemModel } from '@/models/MenuItem/index.js';
import { paginateQuery } from '@/utils/pagination.js';

export const getMenuItem = withErrorHandling(async (_parent, { id }) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('Invalid menu item ID');
    }
    return MenuItemModel.findById(id).populate('restaurant');
});

export const getMenuItemsByRestaurant = withErrorHandling(async (
    _parent,
    { restaurantId, page, limit },
) => {
    if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
        throw new Error('Invalid restaurant ID');
    }
    return paginateQuery(
        MenuItemModel.find({ restaurant: restaurantId }).populate('restaurant'),
        page,
        limit,
    );
});
