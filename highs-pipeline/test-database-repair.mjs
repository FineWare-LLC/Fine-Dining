/**
 * Database Self-Repair Testing Script
 * 
 * This script tests various scenarios to verify the database self-repair functionality:
 * - Connection failures and recovery
 * - Data corruption and repair
 * - Index issues and rebuilding
 * - Token cleanup functionality
 * - Data integrity verification
 */

import mongoose from 'mongoose';
import databaseRepair from './database-repair.mjs';
import dotenv from 'dotenv';

// Import models for testing
import User from '../frontend/src/models/User/index.js';
import { MealModel } from '../frontend/src/models/Meal/index.js';
import { MealPlanModel } from '../frontend/src/models/MealPlan/index.js';

dotenv.config();

class DatabaseRepairTester {
    constructor() {
        this.testResults = [];
        this.testUsers = [];
        this.testMeals = [];
        this.testMealPlans = [];
    }

    /**
     * Log test results
     */
    logTest(testName, passed, details = '') {
        const result = {
            testName,
            passed,
            details,
            timestamp: new Date().toISOString()
        };
        
        this.testResults.push(result);
        console.log(`[TEST] ${testName}: ${passed ? 'PASSED' : 'FAILED'} ${details}`);
    }

    /**
     * Setup test data
     */
    async setupTestData() {
        console.log('Setting up test data...');
        
        try {
            // Create test users
            const testUser1 = new User({
                name: 'Test User 1',
                email: 'test1@repair-test.com',
                password: 'testpassword123',
                role: 'USER',
                measurementSystem: 'METRIC',
                gender: 'MALE',
                weight: 70,
                height: 175
            });
            await testUser1.save();
            this.testUsers.push(testUser1);

            // Create test meals
            const testMeal1 = new MealModel({
                meal_name: 'Test Meal 1',
                chain: 'Test Chain',
                price: 10.99,
                calories: 500,
                protein: 25,
                carbohydrates: 50,
                fat: 15,
                sodium: 800
            });
            await testMeal1.save();
            this.testMeals.push(testMeal1);

            // Create test meal plan
            const testMealPlan1 = new MealPlanModel({
                userId: testUser1._id,
                name: 'Test Meal Plan 1',
                description: 'Test meal plan for repair testing'
            });
            await testMealPlan1.save();
            this.testMealPlans.push(testMealPlan1);

            console.log('Test data setup completed');
            return true;
        } catch (error) {
            console.error('Failed to setup test data:', error);
            return false;
        }
    }

    /**
     * Test connection health check
     */
    async testConnectionHealthCheck() {
        console.log('\n--- Testing Connection Health Check ---');
        
        try {
            const isHealthy = await databaseRepair.checkConnectionHealth();
            this.logTest('Connection Health Check', isHealthy, 'Basic connection health verification');
            return isHealthy;
        } catch (error) {
            this.logTest('Connection Health Check', false, `Error: ${error.message}`);
            return false;
        }
    }

    /**
     * Test index validation and repair
     */
    async testIndexValidationAndRepair() {
        console.log('\n--- Testing Index Validation and Repair ---');
        
        try {
            // This will validate existing indexes and ensure they're built
            await databaseRepair.validateAndRepairIndexes();
            this.logTest('Index Validation and Repair', true, 'Indexes validated and repaired');
            return true;
        } catch (error) {
            this.logTest('Index Validation and Repair', false, `Error: ${error.message}`);
            return false;
        }
    }

    /**
     * Test expired token cleanup
     */
    async testExpiredTokenCleanup() {
        console.log('\n--- Testing Expired Token Cleanup ---');
        
        try {
            // Create a user with expired tokens
            const userWithExpiredTokens = new User({
                name: 'Expired Token User',
                email: 'expired-tokens@repair-test.com',
                password: 'testpassword123',
                role: 'USER',
                measurementSystem: 'IMPERIAL',
                gender: 'FEMALE',
                weight: 130,
                height: 65,
                passwordResetToken: 'expired-reset-token',
                passwordResetTokenExpiry: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
                magicLinkToken: 'expired-magic-token',
                magicLinkExpiry: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
            });
            
            await userWithExpiredTokens.save();
            this.testUsers.push(userWithExpiredTokens);

            // Run token cleanup
            await databaseRepair.cleanupExpiredTokens();

            // Verify tokens were cleaned up
            const updatedUser = await User.findById(userWithExpiredTokens._id);
            const tokensCleared = !updatedUser.passwordResetToken && !updatedUser.magicLinkToken;
            
            this.logTest('Expired Token Cleanup', tokensCleared, 'Expired tokens were properly removed');
            return tokensCleared;
        } catch (error) {
            this.logTest('Expired Token Cleanup', false, `Error: ${error.message}`);
            return false;
        }
    }

    /**
     * Test data integrity verification
     */
    async testDataIntegrityVerification() {
        console.log('\n--- Testing Data Integrity Verification ---');
        
        try {
            // Create a meal with invalid data
            const invalidMeal = new MealModel({
                meal_name: 'Invalid Meal',
                chain: 'Test Chain',
                price: -5.00, // Invalid negative price
                calories: -100, // Invalid negative calories
                protein: 25,
                carbohydrates: 50,
                fat: 15,
                sodium: 800
            });
            
            // Save directly to bypass validation for testing
            await MealModel.collection.insertOne(invalidMeal.toObject());
            this.testMeals.push(invalidMeal);

            // Run data integrity verification (this should fix the negative values)
            await databaseRepair.verifyDataIntegrity();

            // Check if the invalid data was fixed
            const fixedMeal = await MealModel.findOne({ meal_name: 'Invalid Meal' });
            const dataFixed = fixedMeal && fixedMeal.price >= 0 && fixedMeal.calories >= 0;
            
            this.logTest('Data Integrity Verification', dataFixed, 'Invalid data was corrected');
            return dataFixed;
        } catch (error) {
            this.logTest('Data Integrity Verification', false, `Error: ${error.message}`);
            return false;
        }
    }

    /**
     * Test schema compliance validation
     */
    async testSchemaComplianceValidation() {
        console.log('\n--- Testing Schema Compliance Validation ---');
        
        try {
            await databaseRepair.validateSchemaCompliance();
            this.logTest('Schema Compliance Validation', true, 'Schema validation completed');
            return true;
        } catch (error) {
            this.logTest('Schema Compliance Validation', false, `Error: ${error.message}`);
            return false;
        }
    }

    /**
     * Test comprehensive health check and repair
     */
    async testComprehensiveHealthCheckAndRepair() {
        console.log('\n--- Testing Comprehensive Health Check and Repair ---');
        
        try {
            const repairSuccess = await databaseRepair.performHealthCheckAndRepair();
            this.logTest('Comprehensive Health Check and Repair', repairSuccess, 'Full repair cycle completed');
            return repairSuccess;
        } catch (error) {
            this.logTest('Comprehensive Health Check and Repair', false, `Error: ${error.message}`);
            return false;
        }
    }

    /**
     * Test automatic monitoring functionality
     */
    async testAutoMonitoring() {
        console.log('\n--- Testing Auto Monitoring ---');
        
        try {
            // Start monitoring with a short interval for testing (1 minute)
            databaseRepair.startAutoMonitoring(0.1); // 0.1 minutes = 6 seconds
            
            // Wait for one monitoring cycle
            await new Promise(resolve => setTimeout(resolve, 8000));
            
            // Stop monitoring
            databaseRepair.stopAutoMonitoring();
            
            this.logTest('Auto Monitoring', true, 'Monitoring started and stopped successfully');
            return true;
        } catch (error) {
            this.logTest('Auto Monitoring', false, `Error: ${error.message}`);
            return false;
        }
    }

    /**
     * Test repair statistics functionality
     */
    testRepairStatistics() {
        console.log('\n--- Testing Repair Statistics ---');
        
        try {
            const stats = databaseRepair.getRepairStats();
            const hasStats = stats && typeof stats.total === 'number' && stats.total > 0;
            
            this.logTest('Repair Statistics', hasStats, `Stats: ${JSON.stringify(stats)}`);
            return hasStats;
        } catch (error) {
            this.logTest('Repair Statistics', false, `Error: ${error.message}`);
            return false;
        }
    }

    /**
     * Cleanup test data
     */
    async cleanupTestData() {
        console.log('\nCleaning up test data...');
        
        try {
            // Remove test users
            for (const user of this.testUsers) {
                await User.findByIdAndDelete(user._id);
            }

            // Remove test meals
            for (const meal of this.testMeals) {
                await MealModel.findByIdAndDelete(meal._id);
            }

            // Remove test meal plans
            for (const mealPlan of this.testMealPlans) {
                await MealPlanModel.findByIdAndDelete(mealPlan._id);
            }

            // Also clean up by email pattern to catch any missed test data
            await User.deleteMany({ email: { $regex: /repair-test\.com$/ } });
            await MealModel.deleteMany({ meal_name: { $regex: /^Test Meal|^Invalid Meal/ } });

            console.log('Test data cleanup completed');
        } catch (error) {
            console.error('Error during test data cleanup:', error);
        }
    }

    /**
     * Run all tests
     */
    async runAllTests() {
        console.log('=== DATABASE REPAIR FUNCTIONALITY TESTS ===\n');
        
        try {
            // Connect to database
            const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fineDiningApp';
            await mongoose.connect(mongoURI);
            console.log('Connected to MongoDB for testing');

            // Setup test data
            const setupSuccess = await this.setupTestData();
            if (!setupSuccess) {
                console.error('Failed to setup test data, aborting tests');
                return;
            }

            // Run all tests
            await this.testConnectionHealthCheck();
            await this.testIndexValidationAndRepair();
            await this.testExpiredTokenCleanup();
            await this.testDataIntegrityVerification();
            await this.testSchemaComplianceValidation();
            await this.testComprehensiveHealthCheckAndRepair();
            await this.testAutoMonitoring();
            this.testRepairStatistics();

            // Save repair logs
            await databaseRepair.saveRepairLog();

            console.log('\n=== TEST RESULTS SUMMARY ===');
            const passedTests = this.testResults.filter(test => test.passed).length;
            const totalTests = this.testResults.length;
            
            console.log(`Total Tests: ${totalTests}`);
            console.log(`Passed: ${passedTests}`);
            console.log(`Failed: ${totalTests - passedTests}`);
            console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(2)}%`);

            console.log('\n=== DETAILED RESULTS ===');
            this.testResults.forEach(test => {
                console.log(`${test.passed ? '✓' : '✗'} ${test.testName}: ${test.details}`);
            });

            // Show final repair statistics
            const finalStats = databaseRepair.getRepairStats();
            console.log('\n=== FINAL REPAIR STATISTICS ===');
            console.log(finalStats);

        } catch (error) {
            console.error('Test execution error:', error);
        } finally {
            // Cleanup
            await this.cleanupTestData();
            await mongoose.disconnect();
            console.log('\nDisconnected from MongoDB');
        }
    }
}

// Run tests if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const tester = new DatabaseRepairTester();
    await tester.runAllTests();
}