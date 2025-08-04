/**
 * @file Notification/index.js
 * @description Aggregates and re-exports all Notification-related modules for simpler imports.
 */

import NotificationModel from './notification.model.js';
import notificationSchema from './notification.schema.js';

/**
 * @module Notification
 * @description A simple module that provides the Notification Mongoose model
 * and schema for your application. Import this folder's index in your services,
 * controllers, or GraphQL resolvers.
 */
export {
    /**
     * @description The Notification Mongoose model.
     */
    NotificationModel,

    /**
     * @description The Mongoose schema for Notification, if needed for advanced customization.
     */
    notificationSchema,
};