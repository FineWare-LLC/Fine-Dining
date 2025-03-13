/**
 * @file stats.schema.js
 * @description Defines the Mongoose schema for user stats.
 */

import mongoose from 'mongoose';

/**
 * @typedef {Object} StatsDocument
 * @property {mongoose.Schema.Types.ObjectId} user - Reference to the user who owns these stats.
 * @property {Date} dateLogged - Date when stats were logged.
 * @property {string} macros - Macro-nutrient details.
 * @property {string} micros - Micro-nutrient details.
 * @property {number} caloriesConsumed - Total calories consumed.
 * @property {number} waterIntake - Daily water intake measurement (e.g., ml/ounces).
 * @property {number} steps - Number of steps walked.
 */

/**
 * @description Schema for the Stats collection with timestamps.
 */
const statsSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        dateLogged: {
            type: Date,
            default: Date.now,
        },
        macros: {
            type: String,
            default: '',
        },
        micros: {
            type: String,
            default: '',
        },
        caloriesConsumed: {
            type: Number,
            default: 0,
        },
        waterIntake: {
            type: Number,
            default: 0,
        },
        steps: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

export default statsSchema;
