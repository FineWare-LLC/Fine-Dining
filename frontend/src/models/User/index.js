/**
 * @file index.js
 * @description Exports the over-engineered User Model.
 */

import mongoose from 'mongoose';
import userSchema from './userSchema.js';

/**
 * @typedef {import('mongoose').Model} UserModel
 * The final Mongoose Model for the `User` collection.
 *
 * @property {Function} findByEmailCaseInsensitive
 * @property {Function} softDeleteUser
 * @property {Function} ...
 */

const UserModel =
    mongoose.models.User || mongoose.model('User', userSchema);

export { UserModel };
export default UserModel;
