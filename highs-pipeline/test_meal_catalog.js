// Script to test the meal catalog
// This script will check if the meal catalog is properly populated with data from the HiGHS data directory

import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Load environment variables
dotenv.config();

// Import models
import { MealModel } from '../../models/Meal/index.js';

async function testMealCatalog() {
    try {
    // Connect to MongoDB
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fineDiningApp';
        console.log(`Connecting to MongoDB at ${mongoURI}...`);
        await mongoose.connect(mongoURI);
        console.log('Connected to MongoDB');

        // Count the number of meals in the database
        const mealCount = await MealModel.countDocuments();
        console.log(`Found ${mealCount} meals in the database`);

        // Get a sample of meals
        const meals = await MealModel.find().limit(5);
        console.log('Sample meals:');
        meals.forEach((meal, index) => {
            console.log(`Meal ${index + 1}:`);
            console.log(`  Name: ${meal.mealName}`);
            console.log(`  Price: $${meal.price.toFixed(2)}`);
            console.log('  Nutrition:');
            console.log(`    Carbs: ${meal.nutrition.carbohydrates}g`);
            console.log(`    Protein: ${meal.nutrition.protein}g`);
            console.log(`    Fat: ${meal.nutrition.fat}g`);
            console.log(`    Sodium: ${meal.nutrition.sodium}mg`);
            console.log(`  Allergens: ${meal.allergens.join(', ')}`);
        });

        console.log('\nMeal catalog test completed successfully!');
    } catch (error) {
        console.error('Error testing meal catalog:', error);
    } finally {
    // Disconnect from MongoDB
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

// Run the test
testMealCatalog().catch(error => {
    console.error('Uncaught error:', error);
    process.exit(1);
});
