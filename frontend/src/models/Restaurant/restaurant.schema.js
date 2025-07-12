/**
 * @file Restaurant/restaurant.schema.js
 * @description Defines the Mongoose schema for the Restaurant collection.
 */

import mongoose from 'mongoose';

/**
 * @constant {mongoose.Schema} restaurantSchema
 * @description The Mongoose Schema for Restaurant documents.
 */
const restaurantSchema = new mongoose.Schema(
    {
        restaurantName: {
            type: String,
            required: true,
            description: 'Name of the restaurant',
        },
        address: {
            type: String,
            required: true,
            description: 'Physical address of the restaurant',
        },
        phone: {
            type: String,
            default: '',
            description: 'Contact phone number',
        },
        website: {
            type: String,
            default: '',
            description: 'Website URL of the restaurant',
        },
        cuisineType: {
            type: String,
            default: '',
            description: 'Cuisine type of the restaurant',
        },
        priceRange: {
            type: String,
            default: '$',
            description: 'Price range symbol (e.g., $, $$, $$$)',
        },
        averageRating: {
            type: Number,
            default: 0,
            description: 'Average star rating',
        },
        ratingCount: {
            type: Number,
            default: 0,
            description: 'Total number of ratings or reviews',
        },
    },
    {
        timestamps: true,
        collection: 'restaurants',
    },
);

export default restaurantSchema;
