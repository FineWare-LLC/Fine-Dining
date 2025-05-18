/**
 * @file test-optimization.mjs
 * @description Test script for the meal plan optimization feature.
 *              Run via: `node scripts/test-optimization.mjs`
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { dbConnect } from '../src/lib/dbConnect.js';
import User from "../src/models/User/index.js";
import { MealModel } from "../src/models/Meal/index.js";
import OptimizationService from "./OptimizationService.js";

// Try to load both .env and .env.local files
dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local' });

// Manually set MONGODB_URI if it's not loaded from .env files
if (!process.env.MONGODB_URI) {
    process.env.MONGODB_URI = 'mongodb://localhost:27017/fineDiningApp';
    console.log('MONGODB_URI not found in environment, using default:', process.env.MONGODB_URI);
}

/**
 * Test the meal plan optimization feature.
 */
async function testOptimization() {
  console.log('Connecting to database...');
  await dbConnect();
  console.log('Connected!');

  // Check if there are any meals in the database
  const mealCount = await MealModel.countDocuments();
  console.log(`Found ${mealCount} meals in the database.`);

  if (mealCount === 0) {
    console.log('No meals found in the database. Please run the seed script first.');
    return;
  }

  // Get a random user from the database
  const user = await User.findOne();
  if (!user) {
    console.log('No users found in the database. Please run the seed script first.');
    return;
  }

  console.log(`Testing optimization for user ${user._id}...`);

  try {
    // Generate an optimized meal plan
    const result = await OptimizationService.generateOptimizedMealPlan(user._id);
    console.log('Optimization successful!');
    console.log(`Generated meal plan with ${result.meals.length} meals.`);
    console.log(`Total cost: $${result.totalCost.toFixed(2)}`);
    console.log('Total nutrition:');
    console.log(`  Carbohydrates: ${result.totalNutrition.carbohydrates.toFixed(2)}g`);
    console.log(`  Protein: ${result.totalNutrition.protein.toFixed(2)}g`);
    console.log(`  Fat: ${result.totalNutrition.fat.toFixed(2)}g`);
    console.log(`  Sodium: ${result.totalNutrition.sodium.toFixed(2)}mg`);
  } catch (error) {
    console.error('Optimization failed:', error.message);
  }

  console.log('Disconnecting from database...');
  await mongoose.disconnect();
  console.log('Done.');
}

// Run the test
testOptimization().catch(error => {
  console.error('Test failed:', error);
  process.exit(1);
});
