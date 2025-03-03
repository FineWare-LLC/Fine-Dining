/*************************************************************
 * FILE: /src/models/RestaurantModel.js
 * Minimal Mongoose model for Restaurant in Fine Dining
 *************************************************************/

import mongoose from 'mongoose';

/**
 * @constant restaurantSchema
 * Defines fields for the Restaurant collection.
 */
const restaurantSchema = new mongoose.Schema(
    {
        restaurantName: {
            type: String,
            required: true,
        },
        address: {
            type: String,
            required: true,
        },
        phone: String,
        website: String,
    },
    { timestamps: true }
);

/**
 * @constant RestaurantModel
 * Creates a Mongoose model named "Restaurant" if not already existing.
 */
export default mongoose.models.Restaurant || mongoose.model('Restaurant', restaurantSchema);
