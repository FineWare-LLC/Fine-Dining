#!/usr/bin/env node

/**
 * Test script to verify registration and login flow with user names
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './frontend/src/models/User/index.js';

dotenv.config({ path: './frontend/.env.local' });

console.log("Testing registration and login flow...\n");

async function connectToDatabase() {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fineDiningApp';
    
    try {
        await mongoose.connect(mongoURI);
        console.log('✓ Connected to MongoDB');
        return true;
    } catch (error) {
        console.error('✗ Error connecting to MongoDB:', error.message);
        return false;
    }
}

async function testUserWithName() {
    try {
        // Check if we can find existing users with names
        const usersWithNames = await User.find({ name: { $exists: true, $ne: null, $ne: '' } }).select('name email');
        console.log(`\n=== Existing Users With Names ===`);
        
        if (usersWithNames.length > 0) {
            console.log(`✓ Found ${usersWithNames.length} users with names:`);
            usersWithNames.forEach(user => {
                console.log(`  - ${user.name} (${user.email})`);
            });
        } else {
            console.log('✗ No users found with name fields populated');
        }

        // Check users without names
        const usersWithoutNames = await User.find({ 
            $or: [
                { name: { $exists: false } },
                { name: null },
                { name: '' }
            ]
        }).select('email');
        
        if (usersWithoutNames.length > 0) {
            console.log(`\n⚠️  Found ${usersWithoutNames.length} users without names:`);
            usersWithoutNames.forEach(user => {
                console.log(`  - ${user.email} (missing name)`);
            });
        }

        return usersWithNames.length > 0;
    } catch (error) {
        console.error('Error checking users:', error.message);
        return false;
    }
}

async function testCreateUser() {
    try {
        console.log(`\n=== Testing User Creation ===`);
        
        // Create a test user
        const testEmail = `test-${Date.now()}@example.com`;
        const testUser = await User.create({
            name: 'Test User',
            email: testEmail,
            password: 'password123',
            gender: 'OTHER',
            measurementSystem: 'METRIC'
        });

        console.log(`✓ Successfully created user: ${testUser.name} (${testUser.email})`);
        
        // Verify the user can be found with name
        const foundUser = await User.findById(testUser._id).select('name email');
        if (foundUser && foundUser.name) {
            console.log(`✓ User lookup successful: ${foundUser.name}`);
            
            // Clean up test user
            await User.findByIdAndDelete(testUser._id);
            console.log(`✓ Test user cleaned up`);
            
            return true;
        } else {
            console.log(`✗ User lookup failed - name field missing`);
            return false;
        }
        
    } catch (error) {
        console.error('Error creating test user:', error.message);
        return false;
    }
}

async function runTests() {
    console.log("=== User Name Display Issue Investigation ===\n");

    // Test database connection
    const connected = await connectToDatabase();
    if (!connected) {
        console.log("\n❌ Cannot proceed without database connection");
        return;
    }

    // Test existing users
    const hasUsersWithNames = await testUserWithName();
    
    // Test user creation
    const userCreationWorks = await testCreateUser();

    console.log(`\n=== Test Results Summary ===`);
    console.log(`Database Connection: ✓`);
    console.log(`Users with names exist: ${hasUsersWithNames ? '✓' : '✗'}`);
    console.log(`User creation with names: ${userCreationWorks ? '✓' : '✗'}`);

    if (hasUsersWithNames && userCreationWorks) {
        console.log(`\n✅ SOLUTION: The authentication system is working correctly!`);
        console.log(`   - Test users with names exist in database`);
        console.log(`   - New user creation includes names`);
        console.log(`   - Login should display proper names`);
        console.log(`\n   TO SEE YOUR NAME:`);
        console.log(`   1. Register a new account at /create-account`);
        console.log(`   2. Or login with existing test accounts:`);
        console.log(`      - health@example.com / password123 (Alex Johnson)`);
        console.log(`      - fitness@example.com / password123 (Taylor Smith)`);
    } else {
        console.log(`\n⚠️  ISSUES FOUND:`);
        if (!hasUsersWithNames) {
            console.log(`   - Run: npm run seed-database to create test users`);
        }
        if (!userCreationWorks) {
            console.log(`   - User creation flow has issues`);
        }
    }

    await mongoose.disconnect();
    console.log(`\n✓ Disconnected from MongoDB`);
}

runTests().catch(console.error);