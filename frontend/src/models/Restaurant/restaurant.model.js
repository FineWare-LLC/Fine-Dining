/**
 * @file Restaurant/restaurant.model.js
 * @description Creates or retrieves the Restaurant Mongoose model.
 */

import mongoose from 'mongoose';
import restaurantSchema from './restaurant.schema.js';

/**
 * @constant RestaurantModel
 * @description Mongoose model for the Restaurant collection. Uses 'restaurants' collection name by default (or overrides if specified in schema).
 * @type {mongoose.Model}
 */
const RestaurantModel =
    mongoose.models.Restaurant || mongoose.model('Restaurant', restaurantSchema);

export default RestaurantModel;
