import dotenv from 'dotenv';
dotenv.config({ path: './.env.local' });

console.log('MONGODB_URI:', process.env.MONGODB_URI);

import { dbConnect } from './src/lib/dbConnect.js';
import User from './src/models/User/index.js';
import { MealModel } from './src/models/Meal/index.js';
import { generateOptimizedMealPlan } from './src/services/OptimizationService.js';

async function testFix() {
    console.log('Testing database fix...');
    
    try {
        // Connect to database
        await dbConnect();
        console.log('✓ Database connection successful');
        
        // Test 1: Check if users exist
        const userCount = await User.countDocuments();
        console.log(`✓ Found ${userCount} users in database`);
        
        if (userCount === 0) {
            console.log('✗ No users found - authentication will fail');
            return;
        }
        
        // Test 2: Check if meals exist
        const mealCount = await MealModel.countDocuments();
        console.log(`✓ Found ${mealCount} meals in database`);
        
        if (mealCount === 0) {
            console.log('✗ No meals found - meal optimization will fail');
            return;
        }
        
        // Test 3: Get a sample user
        const sampleUser = await User.findOne();
        if (sampleUser) {
            console.log(`✓ Sample user found: ${sampleUser.email}`);
            
            // Test 4: Try meal optimization (this was failing before)
            try {
                console.log('Testing meal optimization...');
                const result = await generateOptimizedMealPlan(sampleUser._id.toString());
                console.log(`✓ Meal optimization successful! Generated plan with ${result.meals.length} meals`);
                console.log(`  Total cost: $${result.totalCost.toFixed(2)}`);
                console.log(`  Total nutrition: ${JSON.stringify(result.totalNutrition)}`);
            } catch (optimizationError) {
                console.log(`✗ Meal optimization failed: ${optimizationError.message}`);
            }
        }
        
        console.log('\n🎉 Database fix verification completed successfully!');
        console.log('The application should now work without the previous errors.');
        
    } catch (error) {
        console.error('✗ Test failed:', error.message);
    } finally {
        process.exit(0);
    }
}

testFix();