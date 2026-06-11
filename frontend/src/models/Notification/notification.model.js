/**
 * @file Notification/notification.model.js
 * @description Creates or retrieves the Notification Mongoose model.
 */

import mongoose from 'mongoose';
import notificationSchema from './notification.schema.js';

/**
 * @constant NotificationModel
 * @description Mongoose model for the Notification collection. Uses 'notifications' collection name by default.
 * @type {mongoose.Model}
 */
const NotificationModel =
    mongoose.models.Notification || mongoose.model('Notification', notificationSchema);

export default NotificationModel;