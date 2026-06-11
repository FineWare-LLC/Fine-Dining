/**
 * @file Notification/notification.schema.js
 * @description Defines the Mongoose schema for the Notification collection.
 */

import mongoose from 'mongoose';

/**
 * @constant {mongoose.Schema} notificationSchema
 * @description The Mongoose Schema for Notification documents.
 */
const notificationSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            description: 'Title of the notification',
        },
        body: {
            type: String,
            required: true,
            description: 'Main content/body of the notification',
        },
        category: {
            type: String,
            required: true,
            description: 'Category of the notification (unlimited categories supported)',
        },
        type: {
            type: String,
            enum: ['info', 'success', 'warning', 'error', 'system'],
            default: 'info',
            description: 'Type of notification for styling and priority',
        },
        priority: {
            type: String,
            enum: ['low', 'medium', 'high', 'urgent'],
            default: 'medium',
            description: 'Priority level of the notification',
        },
        recipientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            description: 'ID of the user who should receive this notification',
        },
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            description: 'ID of the user who sent this notification (optional for system notifications)',
        },
        images: [{
            url: {
                type: String,
                description: 'URL of the attached image',
            },
            alt: {
                type: String,
                description: 'Alt text for the image',
            },
            caption: {
                type: String,
                description: 'Optional caption for the image',
            }
        }],
        metadata: {
            type: mongoose.Schema.Types.Mixed,
            description: 'Additional metadata for the notification (flexible object)',
        },
        actionUrl: {
            type: String,
            description: 'URL to navigate to when notification is clicked',
        },
        actionText: {
            type: String,
            description: 'Text for the action button',
        },
        isRead: {
            type: Boolean,
            default: false,
            description: 'Whether the notification has been read',
        },
        readAt: {
            type: Date,
            description: 'Timestamp when the notification was read',
        },
        isArchived: {
            type: Boolean,
            default: false,
            description: 'Whether the notification has been archived',
        },
        archivedAt: {
            type: Date,
            description: 'Timestamp when the notification was archived',
        },
        expiresAt: {
            type: Date,
            description: 'Optional expiration date for the notification',
        },
        scheduledFor: {
            type: Date,
            description: 'Optional scheduled delivery time for the notification',
        },
        tags: [{
            type: String,
            description: 'Tags for categorizing and filtering notifications',
        }],
    },
    {
        timestamps: true,
        collection: 'notifications',
    },
);

// Indexes for better query performance
notificationSchema.index({ recipientId: 1, createdAt: -1 });
notificationSchema.index({ recipientId: 1, isRead: 1 });
notificationSchema.index({ recipientId: 1, category: 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default notificationSchema;