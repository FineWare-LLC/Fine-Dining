import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { parse } from 'csv-parse/sync';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { exec } from 'child_process';
import { promisify } from 'util';

// Import web scraper
import { scrapeAllChains } from './src/fetcher/scraper.mjs';

// Load environment variables
dotenv.config();

// Import models
import { MealModel } from '../../models/Meal/index.js';
import { MealPlanModel } from '../../models/MealPlan/index.js';
import User from '../../models/User/index.js';

const execPromise = promisify(exec);
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
 * Run the web scraper to get fresh meal data
 * @returns {Promise<Array>} Array of processed meal data
 */
async function runWebScraper() {
  console.log("Running web scraper to get fresh meal data...");

  try {
    // Run the web scraper
    console.log("Scraping meal data from food chains...");
    const scrapedItems = await scrapeAllChains();
    console.log(`Scraped ${scrapedItems.length} items from all chains`);

    // Process the scraped items
    const processedMeals = scrapedItems.map(item => {
      // Calculate additional metrics
      const proteinDensity = item.calories > 0 ? (item.protein / item.calories * 100).toFixed(2) : '';
      const carbProteinRatio = item.protein > 0 ? (item.carbohydrates / item.protein).toFixed(2) : '';
      const sodiumPerCalorie = item.calories > 0 ? (item.sodium / item.calories).toFixed(2) : '';
      const pricePerProtein = item.protein > 0 ? (item.price / item.protein).toFixed(2) : '';

      // Calculate health score (simple example)
      const healthScore = item.protein > 0 ? 
        ((item.protein / item.calories * 10) - (item.sodium / item.calories / 100)).toFixed(2) : '0';

      // Determine protein category
      let proteinCategory = 'low';
      if (item.protein >= 25) {
        proteinCategory = 'high';
      } else if (item.protein >= 15) {
        proteinCategory = 'medium';
      }

      // Return processed meal object
      return {
        chain: item.chain,
        meal_name: item.meal_name,
        price: item.price,
        calories: item.calories,
        protein: item.protein,
        carbohydrates: item.carbohydrates,
        fat: item.fat,
        sodium: item.sodium,
        allergens: item.allergens || [],
        protein_density: proteinDensity,
        carb_protein_ratio: carbProteinRatio,
        sodium_per_calorie: sodiumPerCalorie,
        price_per_protein: pricePerProtein,
        health_score: healthScore,
        protein_category: proteinCategory
      };
    });

    // Create a timestamp for the output file (for reference)
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const outputDir = path.join(__dirname, 'data/processed');
    const outputFile = path.join(outputDir, `processed_meals_${timestamp}.json`);

    // Ensure the output directory exists
    await fs.mkdir(outputDir, { recursive: true });

    // Write the JSON file for reference
    await fs.writeFile(outputFile, JSON.stringify(processedMeals, null, 2));
    console.log(`Wrote ${processedMeals.length} items to ${outputFile}`);

    return processedMeals;
  } catch (error) {
    console.error("Error running web scraper:", error);

    // If scraping fails, find the most recent processed file
    console.log("Falling back to most recent processed file...");
    const processedDir = path.join(__dirname, 'data/processed');

    // Try to find a JSON file first
    const files = await fs.readdir(processedDir);
    const jsonFiles = files.filter(file => file.startsWith('processed_meals_') && file.endsWith('.json'));

    if (jsonFiles.length > 0) {
      // Sort files by date (newest first)
      jsonFiles.sort().reverse();
      const latestFile = jsonFiles[0];
      console.log(`Using latest processed meals JSON file: ${latestFile}`);

      const filePath = path.join(processedDir, latestFile);
      const fileContent = await fs.readFile(filePath, 'utf8');
      return JSON.parse(fileContent);
    }

    // Fall back to CSV if no JSON files are found
    const csvFiles = files.filter(file => file.startsWith('processed_meals_') && file.endsWith('.csv'));

    if (csvFiles.length === 0) {
      throw new Error('No processed meal files found');
    }

    // Sort files by date (newest first)
    csvFiles.sort().reverse();
    const latestFile = csvFiles[0];
    console.log(`Using latest processed meals CSV file: ${latestFile}`);

    const filePath = path.join(processedDir, latestFile);
    const fileContent = await fs.readFile(filePath, 'utf8');

    // Parse CSV manually to avoid issues with the csv-parse library
    const lines = fileContent.split('\n');
    const headers = lines[0].split(',');

    const processedMeals = [];

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;

      const values = lines[i].split(',');
      const meal = {};

      for (let j = 0; j < headers.length; j++) {
        let value = values[j];

        // Try to parse numeric values
        if (!isNaN(value) && value.trim() !== '') {
          value = parseFloat(value);
        }

        // Handle allergens specially
        if (headers[j] === 'allergens') {
          try {
            // Try to parse as JSON
            value = JSON.parse(value);
            // If it's a string, try to parse it again
            if (typeof value === 'string') {
              value = JSON.parse(value);
            }
          } catch (e) {
            // If parsing fails, use an empty array
            value = [];
          }
        }

        meal[headers[j]] = value;
      }

      processedMeals.push(meal);
    }

    return processedMeals;
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

    // Run the web scraper to get fresh meal data
    const processedMeals = await runWebScraper();

    console.log(`Got ${processedMeals.length} processed meals from web scraper`);

    // Create users
    const users = await createUsers();

    // Create meal plans and meals for each user
    for (const user of users) {
      console.log(`Creating meal plan for user ${user.name}...`);

      // Create a meal plan for the user
      const mealPlan = await createMealPlan(user);

      // Filter meals based on user preferences
      let filteredMeals = processedMeals;

      // Filter out meals with allergens the user is allergic to
      if (user.allergies && user.allergies.length > 0) {
        filteredMeals = filteredMeals.filter(meal => {
          try {
            const allergens = JSON.parse(meal.allergens);
            return !user.allergies.some(allergy => 
              allergens.some(a => a.toLowerCase().includes(allergy.toLowerCase()))
            );
          } catch (e) {
            // If parsing fails, keep the meal
            return true;
          }
        });
      }

      // For the health-conscious user, prioritize meals with better health scores
      if (user.email === 'health@example.com') {
        filteredMeals.sort((a, b) => parseFloat(b.health_score) - parseFloat(a.health_score));
      }

      // For the fitness enthusiast, prioritize meals with higher protein
      if (user.email === 'fitness@example.com') {
        filteredMeals.sort((a, b) => parseFloat(b.protein) - parseFloat(a.protein));
      }

      // Take the top 20 meals for each user
      const userMeals = filteredMeals.slice(0, 20);

      // Create meals in the meal plan
      await createMeals(mealPlan, userMeals);
    }

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
  const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fineDiningApp';

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
 * Find or create users
 * @returns {Promise<Array<Object>>} The users
 */
async function createUsers() {
  console.log("Creating users...");

  const users = [];

  // User 1 - Health-conscious user
  const user1Email = 'health@example.com';
  let user1 = await User.findOne({ email: user1Email });

  if (!user1) {
    console.log(`Creating health-conscious user with email ${user1Email}...`);

    user1 = await User.create({
      name: 'Alex Johnson',
      email: user1Email,
      password: 'password123', // This would be hashed in a real application
      role: 'USER',
      allergies: ['Peanuts', 'Shellfish'],
      nutritionTargets: {
        calories: 2000,
        protein: 120,
        carbohydrates: 200,
        fat: 65,
        sodium: 2000,
        proteinMin: 100,
        proteinMax: 150,
        carbohydratesMin: 150,
        carbohydratesMax: 250,
        fatMin: 50,
        fatMax: 80,
        sodiumMin: 1500,
        sodiumMax: 2300
      },
      measurementSystem: 'METRIC',
      gender: 'MALE',
      weight: 75, // kg
      height: 180, // cm
      weightGoal: 'MAINTAIN',
      foodGoals: ['High Protein', 'Low Carb', 'Balanced Diet'],
      preferredCuisines: ['Mediterranean', 'Asian', 'Mexican'],
      dietaryRestrictions: ['Low Sodium', 'Gluten-Free'],
      dislikedIngredients: ['Cilantro', 'Blue Cheese']
    });

    console.log(`Created health-conscious user with ID ${user1._id}`);
  } else {
    console.log(`Found existing health-conscious user with ID ${user1._id}`);
  }

  users.push(user1);

  // User 2 - Fitness enthusiast
  const user2Email = 'fitness@example.com';
  let user2 = await User.findOne({ email: user2Email });

  if (!user2) {
    console.log(`Creating fitness enthusiast user with email ${user2Email}...`);

    user2 = await User.create({
      name: 'Taylor Smith',
      email: user2Email,
      password: 'password123', // This would be hashed in a real application
      role: 'USER',
      allergies: ['Milk', 'Soy'],
      nutritionTargets: {
        calories: 2500,
        protein: 180,
        carbohydrates: 300,
        fat: 70,
        sodium: 2200,
        proteinMin: 150,
        proteinMax: 200,
        carbohydratesMin: 250,
        carbohydratesMax: 350,
        fatMin: 60,
        fatMax: 90,
        sodiumMin: 1800,
        sodiumMax: 2500
      },
      measurementSystem: 'IMPERIAL',
      gender: 'FEMALE',
      weight: 145, // lbs
      height: 67, // inches
      weightGoal: 'GAIN',
      foodGoals: ['High Protein', 'Muscle Building', 'Performance'],
      preferredCuisines: ['Italian', 'Greek', 'American'],
      dietaryRestrictions: ['Dairy-Free'],
      dislikedIngredients: ['Mushrooms', 'Olives']
    });

    console.log(`Created fitness enthusiast user with ID ${user2._id}`);
  } else {
    console.log(`Found existing fitness enthusiast user with ID ${user2._id}`);
  }

  users.push(user2);

  return users;
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

    // Parse allergens from JSON string if needed
    let allergens = [];
    try {
      if (processedMeal.allergens) {
        if (typeof processedMeal.allergens === 'string') {
          // Handle double-stringified JSON
          const parsed = JSON.parse(processedMeal.allergens);
          if (typeof parsed === 'string') {
            // This is a double-stringified array
            allergens = JSON.parse(parsed);
          } else if (Array.isArray(parsed)) {
            // This is a single-stringified array
            allergens = parsed;
          }
        } else if (Array.isArray(processedMeal.allergens)) {
          allergens = processedMeal.allergens;
        }
      }
    } catch (e) {
      console.warn(`Error parsing allergens for meal ${processedMeal.meal_name}: ${e.message}`);
      // If parsing fails, try to split by comma
      if (typeof processedMeal.allergens === 'string') {
        allergens = processedMeal.allergens.split(',').map(a => a.trim()).filter(a => a);
      }
    }

    // Create a more descriptive meal name
    const mealName = processedMeal.meal_name 
      ? `${processedMeal.chain} - ${processedMeal.meal_name}`
      : `${processedMeal.chain} Meal ${i + 1}`;

    // Create the meal
    const meal = await MealModel.create({
      mealPlan: mealPlan._id,
      date: mealDate,
      mealType,
      mealName: mealName,
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
