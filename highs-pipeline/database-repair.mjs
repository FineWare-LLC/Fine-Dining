/**
 * Database Self-Repair Module
 * 
 * This module provides comprehensive database self-repair functionality including:
 * - Connection health checks and recovery
 * - Schema validation and repair
 * - Data integrity verification
 * - Index maintenance
 * - Orphaned record cleanup
 * - Automatic token cleanup and validation
 */

import mongoose from 'mongoose';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Import models
import User from '../frontend/src/models/User/index.js';
import { MealModel } from '../frontend/src/models/Meal/index.js';
import { MealPlanModel } from '../frontend/src/models/MealPlan/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class DatabaseRepair {
    constructor() {
        this.repairLog = [];
        this.healthCheckInterval = null;
        this.autoRepairEnabled = true;
    }

    /**
     * Log repair activities with timestamp
     */
    log(message, level = 'INFO') {
        const timestamp = new Date().toISOString();
        const logEntry = `[${timestamp}] [${level}] ${message}`;
        console.log(logEntry);
        this.repairLog.push({ timestamp, level, message });
    }

    /**
     * Check MongoDB connection health
     */
    async checkConnectionHealth() {
        try {
            // Check if mongoose is connected
            if (mongoose.connection.readyState !== 1) {
                this.log('MongoDB connection is not active', 'WARNING');
                return false;
            }

            // Perform a simple ping operation
            const admin = mongoose.connection.db.admin();
            await admin.ping();
            
            this.log('MongoDB connection health check passed', 'INFO');
            return true;
        } catch (error) {
            this.log(`MongoDB connection health check failed: ${error.message}`, 'ERROR');
            return false;
        }
    }

    /**
     * Attempt to reconnect to MongoDB with exponential backoff
     */
    async reconnectWithRetry(maxRetries = 5) {
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                this.log(`Attempting to reconnect to MongoDB (attempt ${attempt}/${maxRetries})`, 'INFO');
                
                const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fineDiningApp';
                
                // Close existing connection if any
                if (mongoose.connection.readyState !== 0) {
                    await mongoose.disconnect();
                }

                // Attempt reconnection with robust options
                await mongoose.connect(mongoURI, {
                    serverSelectionTimeoutMS: 5000,
                    socketTimeoutMS: 45000,
                    maxPoolSize: 10,
                    retryWrites: true,
                    w: 'majority'
                });

                this.log('Successfully reconnected to MongoDB', 'INFO');
                return true;
            } catch (error) {
                this.log(`Reconnection attempt ${attempt} failed: ${error.message}`, 'ERROR');
                
                if (attempt < maxRetries) {
                    const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
                    this.log(`Waiting ${delay}ms before next attempt`, 'INFO');
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        }
        
        this.log('All reconnection attempts failed', 'ERROR');
        return false;
    }

    /**
     * Validate and repair database indexes
     */
    async validateAndRepairIndexes() {
        const collections = [
            { name: 'users', model: User },
            { name: 'meals', model: MealModel },
            { name: 'mealplans', model: MealPlanModel }
        ];

        for (const { name, model } of collections) {
            try {
                this.log(`Checking indexes for ${name} collection`, 'INFO');
                
                // Get current indexes
                const currentIndexes = await model.collection.getIndexes();
                this.log(`Found ${Object.keys(currentIndexes).length} indexes in ${name}`, 'INFO');

                // Ensure indexes are built
                await model.ensureIndexes();
                this.log(`Ensured indexes for ${name} collection`, 'INFO');

            } catch (error) {
                this.log(`Index validation failed for ${name}: ${error.message}`, 'ERROR');
                
                if (this.autoRepairEnabled) {
                    try {
                        this.log(`Attempting to rebuild indexes for ${name}`, 'INFO');
                        await model.collection.dropIndexes();
                        await model.ensureIndexes();
                        this.log(`Successfully rebuilt indexes for ${name}`, 'INFO');
                    } catch (rebuildError) {
                        this.log(`Index rebuild failed for ${name}: ${rebuildError.message}`, 'ERROR');
                    }
                }
            }
        }
    }

    /**
     * Clean up expired tokens and invalid data
     */
    async cleanupExpiredTokens() {
        try {
            this.log('Starting expired token cleanup', 'INFO');
            
            const now = new Date();
            const result = await User.updateMany(
                {
                    $or: [
                        { passwordResetTokenExpiry: { $lt: now } },
                        { magicLinkExpiry: { $lt: now } },
                        { updateEmailExpiry: { $lt: now } },
                        { phoneVerificationExpiry: { $lt: now } }
                    ]
                },
                {
                    $unset: {
                        passwordResetToken: '',
                        passwordResetTokenExpiry: '',
                        magicLinkToken: '',
                        magicLinkExpiry: '',
                        updateEmailToken: '',
                        updateEmailExpiry: '',
                        newEmail: '',
                        phoneVerificationToken: '',
                        phoneVerificationExpiry: ''
                    }
                }
            );

            this.log(`Cleaned up expired tokens for ${result.modifiedCount} users`, 'INFO');
        } catch (error) {
            this.log(`Token cleanup failed: ${error.message}`, 'ERROR');
        }
    }

    /**
     * Verify data integrity across collections
     */
    async verifyDataIntegrity() {
        try {
            this.log('Starting data integrity verification', 'INFO');
            
            // Check for orphaned meal plans (meal plans without valid users)
            const orphanedMealPlans = await MealPlanModel.find({
                userId: { $exists: true }
            }).populate('userId');
            
            const orphanedPlans = orphanedMealPlans.filter(plan => !plan.userId);
            
            if (orphanedPlans.length > 0) {
                this.log(`Found ${orphanedPlans.length} orphaned meal plans`, 'WARNING');
                
                if (this.autoRepairEnabled) {
                    const deleteResult = await MealPlanModel.deleteMany({
                        _id: { $in: orphanedPlans.map(plan => plan._id) }
                    });
                    this.log(`Removed ${deleteResult.deletedCount} orphaned meal plans`, 'INFO');
                }
            }

            // Check for users with invalid email formats
            const usersWithInvalidEmails = await User.find({
                email: { $not: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ }
            });
            
            if (usersWithInvalidEmails.length > 0) {
                this.log(`Found ${usersWithInvalidEmails.length} users with invalid emails`, 'WARNING');
                // Log the issues but don't auto-fix emails as they need manual review
            }

            // Check for meals with missing required fields
            const mealsWithMissingData = await MealModel.find({
                $or: [
                    { meal_name: { $in: [null, ''] } },
                    { chain: { $in: [null, ''] } },
                    { calories: { $lt: 0 } },
                    { price: { $lt: 0 } }
                ]
            });

            if (mealsWithMissingData.length > 0) {
                this.log(`Found ${mealsWithMissingData.length} meals with invalid data`, 'WARNING');
                
                if (this.autoRepairEnabled) {
                    // Fix negative values
                    await MealModel.updateMany(
                        { calories: { $lt: 0 } },
                        { $set: { calories: 0 } }
                    );
                    await MealModel.updateMany(
                        { price: { $lt: 0 } },
                        { $set: { price: 0 } }
                    );
                    
                    this.log('Fixed negative calorie and price values', 'INFO');
                }
            }

            this.log('Data integrity verification completed', 'INFO');
        } catch (error) {
            this.log(`Data integrity verification failed: ${error.message}`, 'ERROR');
        }
    }

    /**
     * Validate schema compliance
     */
    async validateSchemaCompliance() {
        try {
            this.log('Starting schema compliance validation', 'INFO');
            
            // Test schema validation by attempting to validate a sample document
            const collections = [
                { name: 'users', model: User },
                { name: 'meals', model: MealModel },
                { name: 'mealplans', model: MealPlanModel }
            ];

            for (const { name, model } of collections) {
                try {
                    // Get a sample document to validate schema structure
                    const sampleDoc = await model.findOne().lean();
                    
                    if (sampleDoc) {
                        // Try to validate the document against the schema
                        const validationDoc = new model(sampleDoc);
                        await validationDoc.validate();
                        this.log(`Schema validation passed for ${name}`, 'INFO');
                    } else {
                        this.log(`No documents found in ${name} collection for schema validation`, 'WARNING');
                    }
                } catch (validationError) {
                    this.log(`Schema validation failed for ${name}: ${validationError.message}`, 'ERROR');
                }
            }
        } catch (error) {
            this.log(`Schema compliance validation failed: ${error.message}`, 'ERROR');
        }
    }

    /**
     * Perform comprehensive database health check and repair
     */
    async performHealthCheckAndRepair() {
        this.log('Starting comprehensive database health check and repair', 'INFO');
        
        try {
            // 1. Check connection health
            const isHealthy = await this.checkConnectionHealth();
            if (!isHealthy) {
                this.log('Connection unhealthy, attempting repair', 'WARNING');
                const reconnected = await this.reconnectWithRetry();
                if (!reconnected) {
                    this.log('Failed to repair database connection', 'ERROR');
                    return false;
                }
            }

            // 2. Validate and repair indexes
            await this.validateAndRepairIndexes();

            // 3. Clean up expired tokens
            await this.cleanupExpiredTokens();

            // 4. Verify data integrity
            await this.verifyDataIntegrity();

            // 5. Validate schema compliance
            await this.validateSchemaCompliance();

            this.log('Database health check and repair completed successfully', 'INFO');
            return true;
            
        } catch (error) {
            this.log(`Health check and repair failed: ${error.message}`, 'ERROR');
            return false;
        }
    }

    /**
     * Start automatic health monitoring
     */
    startAutoMonitoring(intervalMinutes = 30) {
        if (this.healthCheckInterval) {
            clearInterval(this.healthCheckInterval);
        }

        this.log(`Starting automatic health monitoring (every ${intervalMinutes} minutes)`, 'INFO');
        
        this.healthCheckInterval = setInterval(async () => {
            this.log('Running scheduled health check', 'INFO');
            await this.performHealthCheckAndRepair();
        }, intervalMinutes * 60 * 1000);
    }

    /**
     * Stop automatic health monitoring
     */
    stopAutoMonitoring() {
        if (this.healthCheckInterval) {
            clearInterval(this.healthCheckInterval);
            this.healthCheckInterval = null;
            this.log('Automatic health monitoring stopped', 'INFO');
        }
    }

    /**
     * Save repair log to file
     */
    async saveRepairLog() {
        try {
            const timestamp = new Date().toISOString().replace(/:/g, '-');
            const logFile = path.join(__dirname, 'logs', `database-repair-${timestamp}.log`);
            
            // Ensure logs directory exists
            await fs.mkdir(path.dirname(logFile), { recursive: true });
            
            const logContent = this.repairLog
                .map(entry => `[${entry.timestamp}] [${entry.level}] ${entry.message}`)
                .join('\n');
                
            await fs.writeFile(logFile, logContent);
            this.log(`Repair log saved to ${logFile}`, 'INFO');
        } catch (error) {
            this.log(`Failed to save repair log: ${error.message}`, 'ERROR');
        }
    }

    /**
     * Get repair statistics
     */
    getRepairStats() {
        const stats = {
            total: this.repairLog.length,
            info: this.repairLog.filter(entry => entry.level === 'INFO').length,
            warning: this.repairLog.filter(entry => entry.level === 'WARNING').length,
            error: this.repairLog.filter(entry => entry.level === 'ERROR').length
        };
        
        return stats;
    }
}

// Export singleton instance
export const databaseRepair = new DatabaseRepair();
export default databaseRepair;