/*************************************************************
 * FILE: /src/models/UserModel.js
 * Enhanced Mongoose model for User in Fine Dining
 * Includes password and hashing logic for authentication.
 *************************************************************/

/**
 * @fileoverview Mongoose User model with a pre-save hook
 * for password hashing via bcrypt. This ensures the password
 * remains encrypted, making it more secure and less ephemeral(***)
 * (***meaning short-lived and hidden***) to would-be attackers.
 */

import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

/**
 * @constant userSchema
 * Defines fields for the User collection, including authentication
 * and personal stats. The password field is 'select: false' by default.
 */
const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, unique: true, required: true },
        password: {
            type: String,
            required: true,
            select: false, // Excluded from queries unless explicitly requested
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
 * ensuring secure storage. This is invoked when the password
 * field changes, using a bcrypt salt to add complexity.
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
 * Creates a Mongoose model named "User" if it doesn't exist,
 * otherwise reuses the existing model. This pattern prevents
 * recompiling models during development.
 */
const UserModel = mongoose.models.User || mongoose.model('User', userSchema);
export default UserModel;

/***************************************************************
 * EXPLANATION (LIKE I AM 10)
 * - The "password" is turned into a secret code (hashed)
 *   before saving, so nobody can read it easily.
 ***************************************************************/

/***************************************************************
 * EXPLANATION (LIKE I AM A PROFESSIONAL)
 * We have introduced a pre-save hook that ensures passwords
 * are hashed using bcrypt before persisting to MongoDB. This
 * approach prevents storing plaintext credentials. The field
 * is declared `select: false` by default, so queries must
 * explicitly request it if needed.
 ***************************************************************/
