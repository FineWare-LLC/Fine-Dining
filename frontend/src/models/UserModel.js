/*************************************************************
 * FILE: /src/models/UserModel.js
 * Minimal Mongoose model for User in Fine Dining
 *************************************************************/

import mongoose from 'mongoose';

/**
 * @constant userSchema
 * Defines fields for the User collection.
 */
const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            unique: true,
            required: true,
        },
        weight: Number,
        height: Number,
        gender: {
            type: String,
            enum: ['MALE', 'FEMALE', 'OTHER'],
            required: true,
        },
        measurementSystem: {
            type: String,
            enum: ['METRIC', 'IMPERIAL'],
            required: true,
        },
        weightGoal: {
            type: String,
            enum: ['LOSE', 'GAIN', 'MAINTAIN'],
        },
        foodGoals: [String],
        allergies: [String],
        dailyCalories: Number,
    },
    { timestamps: true }
);

/**
 * @constant UserModel
 * Creates a Mongoose model named "User" if not already existing.
 */
export default mongoose.models.User || mongoose.model('User', userSchema);
