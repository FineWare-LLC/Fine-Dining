/*************************************************************
 * FILE: /src/models/UserModel.js
 * Enhanced Mongoose model for User in Fine Dining
 * Includes password and hashing logic for authentication.
 *************************************************************/

import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

/**
 * @constant userSchema
 * Defines fields for the User collection, including authentication.
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
        password: {
            type: String,
            required: true,
            select: false,  // Exclude from regular queries by default
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
 * @function pre-save
 * Automatically hashes the password if it's new or modified,
 * ensuring secure storage.
 */
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    try {
        const saltRounds = 10;
        this.password = await bcrypt.hash(this.password, saltRounds);
        next();
    } catch (error) {
        next(error);
    }
});

/**
 * @constant UserModel
 * Creates a Mongoose model named "User" if not already existing.
 */
export default mongoose.models.User || mongoose.model('User', userSchema);

/***************************************************************
 * EXPLANATION (LIKE I AM 10)
 * - The "password" is changed into a secret code (hashed) before
 *   we save it, so nobody can read it easily.
 ***************************************************************/

/***************************************************************
 * EXPLANATION (LIKE I AM A PROFESSIONAL)
 * We have introduced a pre-save hook that ensures passwords
 * are hashed using bcrypt before persisting to MongoDB. This
 * approach prevents storing plaintext credentials. Note that
 * 'select: false' omits the password field by default, though
 * it can still be selected explicitly if needed.
 ***************************************************************/
