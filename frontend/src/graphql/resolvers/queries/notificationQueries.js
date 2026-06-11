import mongoose from 'mongoose';
import { withErrorHandling } from './baseQueries.js';
import { NotificationModel } from '@/models/Notification/index.js';

/**
 * Retrieves a single notification by ID.
 *
 * @function getNotification
 * @param {Object} _parent - Parent resolver result.
 * @param {Object} args - Contains { id }
 * @param {Object} context - GraphQL context.
 * @returns {Promise<Object|null>} The notification document or null.
 */
export const getNotification = withErrorHandling(async (_parent, { id }, context) => {
    // Authentication check
    if (!context.user?.userId) {
        throw new Error('Authentication required');
    }

    // Validate notification id
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('Invalid notification id');
    }

    const notification = await NotificationModel.findById(id)
        .populate('recipientId', 'name email')
        .populate('senderId', 'name email');

    if (!notification) {
        return null;
    }

    // Authorization: only recipient, sender, or admin can view
    const canView = notification.recipientId._id.toString() === context.user.userId ||
                   notification.senderId?._id.toString() === context.user.userId ||
                   context.user.role === 'ADMIN';

    if (!canView) {
        throw new Error('Authorization required: You can only view your own notifications.');
    }

    return notification;
});

/**
 * Retrieves notifications with optional filtering and pagination.
 *
 * @function getNotifications
 * @param {Object} _parent - Parent resolver result.
 * @param {Object} args - Contains filtering and pagination options
 * @param {Object} context - GraphQL context.
 * @returns {Promise<Object[]>} An array of notification documents.
 */
export const getNotifications = withErrorHandling(async (_parent, { 
    recipientId, 
    category, 
    isRead, 
    isArchived, 
    page = 1, 
    limit = 20 
}, context) => {
    // Authentication check
    if (!context.user?.userId) {
        throw new Error('Authentication required');
    }

    // Build query filter
    const filter = {};

    // If recipientId is provided, validate it and check authorization
    if (recipientId) {
        if (!mongoose.Types.ObjectId.isValid(recipientId)) {
            throw new Error('Invalid recipientId');
        }
        
        // Authorization: only the recipient or admin can view their notifications
        if (recipientId !== context.user.userId && context.user.role !== 'ADMIN') {
            throw new Error('Authorization required: You can only view your own notifications.');
        }
        
        filter.recipientId = recipientId;
    } else {
        // If no recipientId provided, default to current user's notifications
        filter.recipientId = context.user.userId;
    }

    // Add optional filters
    if (category) {
        filter.category = category;
    }
    
    if (typeof isRead === 'boolean') {
        filter.isRead = isRead;
    }
    
    if (typeof isArchived === 'boolean') {
        filter.isArchived = isArchived;
    }

    // Add filter for non-expired notifications
    filter.$or = [
        { expiresAt: { $exists: false } },
        { expiresAt: null },
        { expiresAt: { $gt: new Date() } }
    ];

    // Calculate pagination
    const skip = (page - 1) * limit;

    const notifications = await NotificationModel.find(filter)
        .populate('recipientId', 'name email')
        .populate('senderId', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    return notifications;
});

/**
 * Gets the count of unread notifications for a user.
 *
 * @function getUnreadNotificationCount
 * @param {Object} _parent - Parent resolver result.
 * @param {Object} args - Contains { recipientId }
 * @param {Object} context - GraphQL context.
 * @returns {Promise<Number>} The count of unread notifications.
 */
export const getUnreadNotificationCount = withErrorHandling(async (_parent, { recipientId }, context) => {
    // Authentication check
    if (!context.user?.userId) {
        throw new Error('Authentication required');
    }

    // Validate recipientId
    if (!mongoose.Types.ObjectId.isValid(recipientId)) {
        throw new Error('Invalid recipientId');
    }

    // Authorization: only the recipient or admin can view their notification count
    if (recipientId !== context.user.userId && context.user.role !== 'ADMIN') {
        throw new Error('Authorization required: You can only view your own notification count.');
    }

    const count = await NotificationModel.countDocuments({
        recipientId,
        isRead: false,
        isArchived: false,
        $or: [
            { expiresAt: { $exists: false } },
            { expiresAt: null },
            { expiresAt: { $gt: new Date() } }
        ]
    });

    return count;
});

/**
 * Retrieves notifications by category for a specific user.
 *
 * @function getNotificationsByCategory
 * @param {Object} _parent - Parent resolver result.
 * @param {Object} args - Contains { recipientId, category }
 * @param {Object} context - GraphQL context.
 * @returns {Promise<Object[]>} An array of notification documents.
 */
export const getNotificationsByCategory = withErrorHandling(async (_parent, { recipientId, category }, context) => {
    // Authentication check
    if (!context.user?.userId) {
        throw new Error('Authentication required');
    }

    // Validate recipientId
    if (!mongoose.Types.ObjectId.isValid(recipientId)) {
        throw new Error('Invalid recipientId');
    }

    // Authorization: only the recipient or admin can view their notifications
    if (recipientId !== context.user.userId && context.user.role !== 'ADMIN') {
        throw new Error('Authorization required: You can only view your own notifications.');
    }

    // Validate category
    if (!category || typeof category !== 'string') {
        throw new Error('Category is required and must be a string');
    }

    const notifications = await NotificationModel.find({
        recipientId,
        category,
        $or: [
            { expiresAt: { $exists: false } },
            { expiresAt: null },
            { expiresAt: { $gt: new Date() } }
        ]
    })
        .populate('recipientId', 'name email')
        .populate('senderId', 'name email')
        .sort({ createdAt: -1 });

    return notifications;
});