import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { parse } from 'csv-parse/sync';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import models
import { MealModel } from '../../models/Meal/index.js';
import { MealPlanModel } from '../../models/MealPlan/index.js';
import User from '../../models/User/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Delete all existing meals and meal plans
 */
async function clearDatabase() {
  console.log("Clearing existing database data...");

  try {
    // Delete all meals
    const deletedMeals = await MealModel.deleteMany({});
    console.log(`Deleted ${deletedMeals.deletedCount} meals from database`);

    // Delete all meal plans
    const deletedMealPlans = await MealPlanModel.deleteMany({});
    console.log(`Deleted ${deletedMealPlans.deletedCount} meal plans from database`);

    console.log("Database cleared successfully!");
  } catch (error) {
    console.error("Error clearing database:", error);
    throw error;
  }
}

/**
 * Seed the database with processed meal data
 */
async function seedDatabase() {
  console.log("Starting database seeding...");

  try {
    // Connect to MongoDB
    await connectToDatabase();

    // Clear existing database data
    await clearDatabase();

    // Read the processed CSV file
    // Find the most recent processed meals file
    const processedDir = path.join(__dirname, 'data/processed');
    const files = await fs.readdir(processedDir);
    const processedFiles = files.filter(file => file.startsWith('processed_meals_') && file.endsWith('.csv'));

    if (processedFiles.length === 0) {
      throw new Error('No processed meal files found');
    }

    // Sort files by date (newest first)
    processedFiles.sort().reverse();
    const latestFile = processedFiles[0];

    console.log(`Using latest processed meals file: ${latestFile}`);

    const processedFilePath = path.join(processedDir, latestFile);
    const fileContent = await fs.readFile(processedFilePath, 'utf8');
    const processedMeals = parse(fileContent, { columns: true, skip_empty_lines: true });

    console.log(`Read ${processedMeals.length} meals from processed CSV file`);

    // Find or create a test user
    const testUser = await findOrCreateTestUser();

    // Create a meal plan for the test user
    const mealPlan = await createMealPlan(testUser);

    // Create meals in the meal plan
    await createMeals(mealPlan, processedMeals);

    console.log("Database seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

/**
 * Connect to MongoDB
 */
async function connectToDatabase() {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fine-dining';

  console.log(`Connecting to MongoDB at ${mongoURI}...`);

  try {
    await mongoose.connect(mongoURI);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    throw error;
  }
}

/**
 * Find or create a test user
 * @returns {Promise<Object>} The test user
 */
async function findOrCreateTestUser() {
  const testEmail = 'test@example.com';

  console.log(`Finding or creating test user with email ${testEmail}...`);

  let testUser = await User.findOne({ email: testEmail });

  if (!testUser) {
    console.log("Test user not found, creating new user...");

    testUser = await User.create({
      name: 'Test User',
      email: testEmail,
      password: 'password123', // This would be hashed in a real application
      role: 'USER',
      allergies: ['Peanuts', 'Shellfish'], // Example allergies
      nutritionTargets: {
        calories: 2000,
        protein: 100,
        carbohydrates: 250,
        fat: 70,
        sodium: 2300
      },
      measurementSystem: 'IMPERIAL', // Required field
      gender: 'OTHER' // Required field
    });

    console.log(`Created test user with ID ${testUser._id}`);
  } else {
    console.log(`Found existing test user with ID ${testUser._id}`);
  }

  return testUser;
}

/**
 * Create a meal plan for a user
 * @param {Object} user - The user to create a meal plan for
 * @returns {Promise<Object>} The created meal plan
 */
async function createMealPlan(user) {
  console.log(`Creating meal plan for user ${user._id}...`);

  const today = new Date();
  const oneWeekLater = new Date(today);
  oneWeekLater.setDate(today.getDate() + 7);

  const mealPlan = await MealPlanModel.create({
    user: user._id,
    startDate: today,
    endDate: oneWeekLater,
    title: 'Test Meal Plan',
    status: 'ACTIVE',
    totalCalories: 0 // Will be updated as meals are added
  });

  console.log(`Created meal plan with ID ${mealPlan._id}`);

  return mealPlan;
}

/**
 * Create meals in a meal plan
 * @param {Object} mealPlan - The meal plan to create meals in
 * @param {Array} processedMeals - The processed meals to create
 * @returns {Promise<void>}
 */
async function createMeals(mealPlan, processedMeals) {
  console.log(`Creating ${processedMeals.length} meals in meal plan ${mealPlan._id}...`);

  const mealTypes = ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'];
  const today = new Date();

  let totalCalories = 0;

  for (let i = 0; i < processedMeals.length; i++) {
    const processedMeal = processedMeals[i];

    // Calculate meal date (distribute meals over the week)
    const mealDate = new Date(today);
    mealDate.setDate(today.getDate() + Math.floor(i / 4)); // 4 meals per day

    // Determine meal type
    const mealType = mealTypes[i % 4];

    // Convert allergens from string to array if needed
    let allergens = processedMeal.allergens || [];
    if (typeof allergens === 'string') {
      allergens = allergens.split(',').map(a => a.trim()).filter(a => a);
    }

    // Create the meal
    const meal = await MealModel.create({
      mealPlan: mealPlan._id,
      date: mealDate,
      mealType,
      mealName: processedMeal.meal_name || `${processedMeal.chain} Meal ${i + 1}`,
      price: parseFloat(processedMeal.price) || 0,
      ingredients: [], // We don't have ingredients in the scraped data
      nutrition: {
        carbohydrates: parseFloat(processedMeal.carbohydrates) || 0,
        protein: parseFloat(processedMeal.protein) || 0,
        fat: parseFloat(processedMeal.fat) || 0,
        sodium: parseFloat(processedMeal.sodium) || 0
      },
      allergens,
      nutritionFacts: `Calories: ${processedMeal.calories || 0}, Protein: ${processedMeal.protein || 0}g, Carbs: ${processedMeal.carbohydrates || 0}g, Fat: ${processedMeal.fat || 0}g, Sodium: ${processedMeal.sodium || 0}mg`
    });

    // Add the meal to the meal plan
    mealPlan.meals.push(meal._id);

    // Update total calories
    totalCalories += parseFloat(processedMeal.calories || 0);

    console.log(`Created meal ${i + 1}/${processedMeals.length}: ${meal.mealName}`);
  }

  // Update the meal plan with the total calories
  mealPlan.totalCalories = totalCalories;
  await mealPlan.save();

  console.log(`Updated meal plan with ${mealPlan.meals.length} meals and ${totalCalories} total calories`);
}

// Run the seeding script
seedDatabase().catch(error => {
  console.error("Uncaught error:", error);
  process.exit(1);
});
