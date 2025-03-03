/*************************************************************
 * FILE: /src/models/StatsModel.js
 * Minimal Mongoose model for Stats in Fine Dining
 *************************************************************/

import mongoose from 'mongoose';

/**
 * @constant statsSchema
 * Defines fields for the Stats collection.
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
        macros: String,
        micros: String,
    },
    { timestamps: true }
);

/**
 * @constant StatsModel
 * Creates a Mongoose model named "Stats" if not already existing.
 */
export default mongoose.models.Stats || mongoose.model('Stats', statsSchema);
