import mongoose from 'mongoose';
import { withErrorHandling } from './baseImports.js';
import { sanitizeString } from '@/lib/sanitize.js';
import { NotificationModel } from '@/models/Notification/index.js';
import User from '@/models/User/index.js';

/**
 * Creates a new notification.
 *
 * @function createNotification
 * @param {Object} _parent - Parent resolver result.
 * @param {Object} param0 - Object containing notification input.
 * @param {Object} param0.input - The notification input data.
 * @param {Object} context - GraphQL context.
 * @returns {Promise<Object>} The created notification.
 */
export const createNotification = withErrorHandling(async (_parent, { input }, context) => {
    // Authentication check
    if (!context.user?.userId) {
        throw new Error('Authentication required');
    }

    const {
        title,
        body,
        category,
        type = 'INFO',
        priority = 'MEDIUM',
        recipientId,
        senderId,
        images = [],
        metadata,
        actionUrl,
        actionText,
        expiresAt,
        scheduledFor,
        tags = []
    } = input;

    // Validate required fields
    if (!title || !body || !category || !recipientId) {
        throw new Error('Title, body, category, and recipientId are required');
    }

    // Validate recipientId
    if (!mongoose.Types.ObjectId.isValid(recipientId)) {
        throw new Error('Invalid recipientId');
    }

    // Validate senderId if provided
    if (senderId && !mongoose.Types.ObjectId.isValid(senderId)) {
        throw new Error('Invalid senderId');
    }

    // Verify recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
        throw new Error('Recipient not found');
    }

    // Verify sender exists if provided
    if (senderId) {
        const sender = await User.findById(senderId);
        if (!sender) {
            throw new Error('Sender not found');
        }
    }

    // Sanitize string inputs
    const sanitizedTitle = sanitizeString(title.trim());
    const sanitizedBody = sanitizeString(body.trim());
    const sanitizedCategory = sanitizeString(category.trim());

    // Create notification
    const newNotification = await NotificationModel.create({
        title: sanitizedTitle,
        body: sanitizedBody,
        category: sanitizedCategory,
        type: type.toLowerCase(),
        priority: priority.toLowerCase(),
        recipientId,
        senderId: senderId || context.user.userId,
        images,
        metadata,
        actionUrl,
        actionText,
        expiresAt,
        scheduledFor,
        tags
    });

    return await NotificationModel.findById(newNotification._id)
        .populate('recipientId', 'name email')
        .populate('senderId', 'name email');
});

/**
 * Updates an existing notification.
 *
 * @function updateNotification
 * @param {Object} _parent - Parent resolver result.
 * @param {Object} param0 - Object containing notification id and input.
 * @param {string} param0.id - The ID of the notification to update.
 * @param {Object} param0.input - The notification update data.
 * @param {Object} context - GraphQL context.
 * @returns {Promise<Object>} The updated notification.
 */
export const updateNotification = withErrorHandling(async (_parent, { id, input }, context) => {
    // Authentication check
    if (!context.user?.userId) {
        throw new Error('Authentication required');
    }

    // Validate notification id
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('Invalid notification id');
    }

    const notification = await NotificationModel.findById(id);
    if (!notification) {
        throw new Error('Notification not found');
    }

    // Authorization: only sender or admin can update
    if (notification.senderId?.toString() !== context.user.userId && context.user.role !== 'ADMIN') {
        throw new Error('Authorization required: You can only update your own notifications or be an admin.');
    }

    // Prepare update data
    const updateData = {};
    
    if (input.title) updateData.title = sanitizeString(input.title.trim());
    if (input.body) updateData.body = sanitizeString(input.body.trim());
    if (input.category) updateData.category = sanitizeString(input.category.trim());
    if (input.type) updateData.type = input.type.toLowerCase();
    if (input.priority) updateData.priority = input.priority.toLowerCase();
    if (input.images !== undefined) updateData.images = input.images;
    if (input.metadata !== undefined) updateData.metadata = input.metadata;
    if (input.actionUrl !== undefined) updateData.actionUrl = input.actionUrl;
    if (input.actionText !== undefined) updateData.actionText = input.actionText;
    if (input.expiresAt !== undefined) updateData.expiresAt = input.expiresAt;
    if (input.scheduledFor !== undefined) updateData.scheduledFor = input.scheduledFor;
    if (input.tags !== undefined) updateData.tags = input.tags;
    
    if (input.isRead !== undefined) {
        updateData.isRead = input.isRead;
        if (input.isRead) {
            updateData.readAt = new Date();
        } else {
            updateData.readAt = null;
        }
    }
    
    if (input.isArchived !== undefined) {
        updateData.isArchived = input.isArchived;
        if (input.isArchived) {
            updateData.archivedAt = new Date();
        } else {
            updateData.archivedAt = null;
        }
    }

    const updatedNotification = await NotificationModel.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
    ).populate('recipientId', 'name email').populate('senderId', 'name email');

    return updatedNotification;
});

/**
 * Deletes a notification.
 *
 * @function deleteNotification
 * @param {Object} _parent - Parent resolver result.
 * @param {Object} param0 - Object containing the notification id.
 * @param {string} param0.id - The ID of the notification to delete.
 * @param {Object} context - GraphQL context.
 * @returns {Promise<Boolean>} True if deletion was successful.
 */
export const deleteNotification = withErrorHandling(async (_parent, { id }, context) => {
    // Authentication check
    if (!context.user?.userId) {
        throw new Error('Authentication required');
    }

    // Validate notification id
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('Invalid notification id');
    }

    const notification = await NotificationModel.findById(id);
    if (!notification) {
        throw new Error('Notification not found');
    }

    // Authorization: only sender, recipient, or admin can delete
    const canDelete = notification.senderId?.toString() === context.user.userId ||
                     notification.recipientId.toString() === context.user.userId ||
                     context.user.role === 'ADMIN';

    if (!canDelete) {
        throw new Error('Authorization required: You can only delete your own notifications or be an admin.');
    }

    await NotificationModel.findByIdAndDelete(id);
    return true;
});

/**
 * Marks a notification as read.
 *
 * @function markNotificationAsRead
 * @param {Object} _parent - Parent resolver result.
 * @param {Object} param0 - Object containing the notification id.
 * @param {string} param0.id - The ID of the notification to mark as read.
 * @param {Object} context - GraphQL context.
 * @returns {Promise<Object>} The updated notification.
 */
export const markNotificationAsRead = withErrorHandling(async (_parent, { id }, context) => {
    // Authentication check
    if (!context.user?.userId) {
        throw new Error('Authentication required');
    }

    // Validate notification id
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('Invalid notification id');
    }

    const notification = await NotificationModel.findById(id);
    if (!notification) {
        throw new Error('Notification not found');
    }

    // Authorization: only recipient can mark as read
    if (notification.recipientId.toString() !== context.user.userId) {
        throw new Error('Authorization required: You can only mark your own notifications as read.');
    }

    const updatedNotification = await NotificationModel.findByIdAndUpdate(
        id,
        { isRead: true, readAt: new Date() },
        { new: true }
    ).populate('recipientId', 'name email').populate('senderId', 'name email');

    return updatedNotification;
});

/**
 * Marks a notification as unread.
 *
 * @function markNotificationAsUnread
 * @param {Object} _parent - Parent resolver result.
 * @param {Object} param0 - Object containing the notification id.
 * @param {string} param0.id - The ID of the notification to mark as unread.
 * @param {Object} context - GraphQL context.
 * @returns {Promise<Object>} The updated notification.
 */
export const markNotificationAsUnread = withErrorHandling(async (_parent, { id }, context) => {
    // Authentication check
    if (!context.user?.userId) {
        throw new Error('Authentication required');
    }

    // Validate notification id
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('Invalid notification id');
    }

    const notification = await NotificationModel.findById(id);
    if (!notification) {
        throw new Error('Notification not found');
    }

    // Authorization: only recipient can mark as unread
    if (notification.recipientId.toString() !== context.user.userId) {
        throw new Error('Authorization required: You can only mark your own notifications as unread.');
    }

    const updatedNotification = await NotificationModel.findByIdAndUpdate(
        id,
        { isRead: false, readAt: null },
        { new: true }
    ).populate('recipientId', 'name email').populate('senderId', 'name email');

    return updatedNotification;
});

/**
 * Archives a notification.
 *
 * @function archiveNotification
 * @param {Object} _parent - Parent resolver result.
 * @param {Object} param0 - Object containing the notification id.
 * @param {string} param0.id - The ID of the notification to archive.
 * @param {Object} context - GraphQL context.
 * @returns {Promise<Object>} The updated notification.
 */
export const archiveNotification = withErrorHandling(async (_parent, { id }, context) => {
    // Authentication check
    if (!context.user?.userId) {
        throw new Error('Authentication required');
    }

    // Validate notification id
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('Invalid notification id');
    }

    const notification = await NotificationModel.findById(id);
    if (!notification) {
        throw new Error('Notification not found');
    }

    // Authorization: only recipient can archive
    if (notification.recipientId.toString() !== context.user.userId) {
        throw new Error('Authorization required: You can only archive your own notifications.');
    }

    const updatedNotification = await NotificationModel.findByIdAndUpdate(
        id,
        { isArchived: true, archivedAt: new Date() },
        { new: true }
    ).populate('recipientId', 'name email').populate('senderId', 'name email');

    return updatedNotification;
});

/**
 * Unarchives a notification.
 *
 * @function unarchiveNotification
 * @param {Object} _parent - Parent resolver result.
 * @param {Object} param0 - Object containing the notification id.
 * @param {string} param0.id - The ID of the notification to unarchive.
 * @param {Object} context - GraphQL context.
 * @returns {Promise<Object>} The updated notification.
 */
export const unarchiveNotification = withErrorHandling(async (_parent, { id }, context) => {
    // Authentication check
    if (!context.user?.userId) {
        throw new Error('Authentication required');
    }

    // Validate notification id
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('Invalid notification id');
    }

    const notification = await NotificationModel.findById(id);
    if (!notification) {
        throw new Error('Notification not found');
    }

    // Authorization: only recipient can unarchive
    if (notification.recipientId.toString() !== context.user.userId) {
        throw new Error('Authorization required: You can only unarchive your own notifications.');
    }

    const updatedNotification = await NotificationModel.findByIdAndUpdate(
        id,
        { isArchived: false, archivedAt: null },
        { new: true }
    ).populate('recipientId', 'name email').populate('senderId', 'name email');

    return updatedNotification;
});

/**
 * Marks all notifications as read for a user.
 *
 * @function markAllNotificationsAsRead
 * @param {Object} _parent - Parent resolver result.
 * @param {Object} param0 - Object containing the recipient id.
 * @param {string} param0.recipientId - The ID of the recipient.
 * @param {Object} context - GraphQL context.
 * @returns {Promise<Boolean>} True if operation was successful.
 */
export const markAllNotificationsAsRead = withErrorHandling(async (_parent, { recipientId }, context) => {
    // Authentication check
    if (!context.user?.userId) {
        throw new Error('Authentication required');
    }

    // Authorization: only the recipient or admin can mark all as read
    if (recipientId !== context.user.userId && context.user.role !== 'ADMIN') {
        throw new Error('Authorization required: You can only mark your own notifications as read.');
    }

    await NotificationModel.updateMany(
        { recipientId, isRead: false },
        { isRead: true, readAt: new Date() }
    );

    return true;
});

/**
 * Deletes all notifications for a user.
 *
 * @function deleteAllNotifications
 * @param {Object} _parent - Parent resolver result.
 * @param {Object} param0 - Object containing the recipient id.
 * @param {string} param0.recipientId - The ID of the recipient.
 * @param {Object} context - GraphQL context.
 * @returns {Promise<Boolean>} True if operation was successful.
 */
export const deleteAllNotifications = withErrorHandling(async (_parent, { recipientId }, context) => {
    // Authentication check
    if (!context.user?.userId) {
        throw new Error('Authentication required');
    }

    // Authorization: only the recipient or admin can delete all
    if (recipientId !== context.user.userId && context.user.role !== 'ADMIN') {
        throw new Error('Authorization required: You can only delete your own notifications.');
    }

    await NotificationModel.deleteMany({ recipientId });
    return true;
});