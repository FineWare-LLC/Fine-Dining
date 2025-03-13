/**
 * @file seed.mjs
 * @description Seeding script using ESM import syntax only.
 *              Run via: `node scripts/seed.mjs`
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import {faker} from '@faker-js/faker/locale/en';

/* Adjust if your dbConnect is in a different path or uses a different name. */
import {dbConnect} from '../dbConnect.js';

/* Mongoose Models */
import UserModel from "@/models/User";
import {RecipeModel} from "@/models/Recipe";
import {RestaurantModel} from "@/models/Restaurant";
import {MealPlanModel} from "@/models/MealPlan";
import {MealModel} from "@/models/Meal";
import {StatsModel} from "@/models/Stats";
import {Review as ReviewModel} from "@/models/Review";

dotenv.config({path: '.env'});

/* ------------------------------------------------------------------
   Adjustable Constants
   ------------------------------------------------------------------ */
const NUM_USERS = 100;
const NUM_RESTAURANTS = 200;
const NUM_RECIPES = 500;
const NUM_MEAL_PLANS = 500;
const MIN_MEALS_PER_PLAN = 10;
const MAX_MEALS_PER_PLAN = 25;
const REVIEWS_PER_RECIPE = 20;
const REVIEWS_PER_RESTAURANT = 50;
const BATCH_SIZE = 500;

/**
 * Return a random cost as a small integer.
 */
function generateCost() {
    return faker.number.int({min: 5, max: 100});
}

/**
 * Return a random difficulty matching your recipe schema’s enum.
 */
function generateDifficulty() {
    const difficulties = ['EASY', 'INTERMEDIATE', 'HARD'];
    return faker.helpers.arrayElement(difficulties);
}

/**
 * Return a random numeric portion size.
 */
function generatePortionSize() {
    return faker.number.int({min: 1, max: 6});
}

/**
 * Create an array of random ingredients.
 */
function generateIngredients() {
    const ingredientCount = faker.number.int({min: 3, max: 10});
    return Array.from({length: ingredientCount}, () => faker.commerce.product());
}

/**
 * Create an array of random instruction steps.
 */
function generateInstructions() {
    const stepsCount = faker.number.int({min: 2, max: 6});
    return Array.from({length: stepsCount}, () => faker.lorem.sentence());
}

/**
 * Bulk-seeds the database with realistic dummy data across multiple collections.
 */
async function seedDatabase() {
    console.log('Connecting to database...');
    await dbConnect();
    console.log('Connected! Clearing existing data...');

    // Clear existing collections to avoid duplicates
    await Promise.all([UserModel.deleteMany({}), RecipeModel.deleteMany({}), RestaurantModel.deleteMany({}), MealPlanModel.deleteMany({}), MealModel.deleteMany({}), StatsModel.deleteMany({}), ReviewModel.deleteMany({}),]);
    console.log('Databases cleared. Generating data...');

    /* ---------------------------------------------
       1) Create Users
    --------------------------------------------- */
    console.log(`Generating ${NUM_USERS} users...`);
    let userDocs = [];
    for (let i = 0; i < NUM_USERS; i++) {
        userDocs.push({
            name: faker.person.fullName(),
            email: faker.internet.email(),
            password: faker.internet.password(),
            role: faker.helpers.arrayElement(['USER', 'ADMIN']),
            accountStatus: faker.helpers.arrayElement(['ACTIVE', 'SUSPENDED']),
            lastLogin: faker.date.recent(),
            measurementSystem: faker.helpers.arrayElement(['METRIC', 'IMPERIAL']),
            gender: faker.helpers.arrayElement(['MALE', 'FEMALE', 'OTHER']),
        });

        if (userDocs.length >= BATCH_SIZE || i === NUM_USERS - 1) {
            await UserModel.insertMany(userDocs);
            userDocs = [];
        }
    }
    console.log('Users created!');

    /* ---------------------------------------------
       2) Create Restaurants
    --------------------------------------------- */
    console.log(`Generating ${NUM_RESTAURANTS} restaurants...`);
    let restaurantDocs = [];
    for (let i = 0; i < NUM_RESTAURANTS; i++) {
        restaurantDocs.push({
            restaurantName: faker.company.name() + ' ' + faker.company.buzzNoun(),
            address: faker.location.streetAddress(),
            phone: faker.phone.number(),
            website: faker.internet.url(),
            cuisineType: faker.helpers.arrayElement(['Italian', 'Chinese', 'Mexican', 'American', 'French',]),
            priceRange: faker.helpers.arrayElement(['$', '$$', '$$$']),
            averageRating: 0,
            ratingCount: 0,
        });

        if (restaurantDocs.length >= BATCH_SIZE || i === NUM_RESTAURANTS - 1) {
            await RestaurantModel.insertMany(restaurantDocs);
            restaurantDocs = [];
        }
    }
    console.log('Restaurants created!');

    /* ---------------------------------------------
       3) Create Recipes
    --------------------------------------------- */
    console.log(`Generating ${NUM_RECIPES} recipes...`);
    const allUsers = await UserModel.find({}, {_id: 1});
    const userIds = allUsers.map((u) => u._id.toString());

    let recipeDocs = [];
    for (let i = 0; i < NUM_RECIPES; i++) {
        const randomUserId = faker.helpers.arrayElement(userIds);
        const steps = generateInstructions();
        const nutritionObj = {
            calories: faker.number.int({min: 100, max: 1000}),
            fat: faker.number.int({min: 0, max: 50}),
            protein: faker.number.int({min: 0, max: 50}),
            carbs: faker.number.int({min: 0, max: 100}),
        };

        recipeDocs.push({
            recipeName: faker.lorem.words({min: 2, max: 4}),
            instructions: steps.join('\n'), // if your schema is a single string
            nutritionFacts: JSON.stringify(nutritionObj),
            ingredients: generateIngredients(),
            prepTime: faker.number.int({min: 5, max: 90}),
            difficulty: generateDifficulty(),
            tags: [faker.lorem.word(), faker.lorem.word()],
            images: [faker.image.urlLoremFlickr({category: 'food'})],
            estimatedCost: generateCost(),
            author: faker.datatype.boolean() ? new mongoose.Types.ObjectId(randomUserId) : null,
            averageRating: 0,
            ratingCount: 0,
        });

        if (recipeDocs.length >= BATCH_SIZE || i === NUM_RECIPES - 1) {
            await RecipeModel.insertMany(recipeDocs);
            recipeDocs = [];
        }
    }
    console.log('Recipes created!');

    /* ---------------------------------------------
       4) Create Meal Plans & Meals
    --------------------------------------------- */
    console.log(`Generating ${NUM_MEAL_PLANS} meal plans + random meals...`);
    let mealPlanDocs = [];
    for (let i = 0; i < NUM_MEAL_PLANS; i++) {
        const randomUserId = faker.helpers.arrayElement(userIds);

        mealPlanDocs.push({
            user: new mongoose.Types.ObjectId(randomUserId),
            startDate: faker.date.soon(),
            endDate: faker.date.future(),
            title: faker.lorem.words({min: 2, max: 5}),
            status: faker.helpers.arrayElement(['ACTIVE', 'COMPLETED', 'CANCELLED']),
            totalCalories: faker.number.int({min: 2000, max: 8000}),
            meals: [],
        });

        if (mealPlanDocs.length >= BATCH_SIZE || i === NUM_MEAL_PLANS - 1) {
            await MealPlanModel.insertMany(mealPlanDocs);
            mealPlanDocs = [];
        }
    }
    console.log('Meal Plans created!');

    // Fetch newly inserted MealPlans
    const allMealPlans = await MealPlanModel.find({}, {_id: 1});
    const mealPlanIds = allMealPlans.map((mp) => mp._id.toString());

    console.log('Generating Meals...');
    let mealDocs = [];
    for (const mealPlanId of mealPlanIds) {
        const mealCount = faker.number.int({
            min: MIN_MEALS_PER_PLAN, max: MAX_MEALS_PER_PLAN,
        });
        for (let i = 0; i < mealCount; i++) {
            mealDocs.push({
                mealPlan: new mongoose.Types.ObjectId(mealPlanId),
                date: faker.date.future(),
                mealType: faker.helpers.arrayElement(['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK']),
                recipe: null, // optional references
                restaurant: null,
                mealName: faker.lorem.words({min: 1, max: 3}),
                ingredients: [faker.commerce.product(), faker.commerce.product()],
                nutritionFacts: JSON.stringify({
                    calories: faker.number.int({min: 200, max: 1000}),
                    fat: faker.number.int({min: 0, max: 50}),
                    protein: faker.number.int({min: 0, max: 50}),
                    carbs: faker.number.int({min: 0, max: 100}),
                }),
                portionSize: generatePortionSize(),
                notes: faker.lorem.sentence(), // if you want to store notes
            });
        }
        // Insert in batches
        if (mealDocs.length >= BATCH_SIZE) {
            await MealModel.insertMany(mealDocs);
            mealDocs = [];
        }
    }
    // Insert any leftover meals
    if (mealDocs.length) {
        await MealModel.insertMany(mealDocs);
        mealDocs = [];
    }
    console.log('Meals created!');

    // Link Meals back to MealPlans
    console.log('Linking Meals back to MealPlans...');
    const mealCursor = MealModel.find({}, {_id: 1, mealPlan: 1}).cursor();
    while (true) {
        const batch = [];
        for (let i = 0; i < BATCH_SIZE; i++) {
            const doc = await mealCursor.next();
            if (!doc) break;
            batch.push(doc);
        }
        if (!batch.length) break;

        const bulkOps = batch.map((meal) => ({
            updateOne: {
                filter: {_id: meal.mealPlan}, update: {$push: {meals: meal._id}},
            },
        }));
        await MealPlanModel.bulkWrite(bulkOps);
    }
    console.log('Meals referenced in MealPlans.');

    /* ---------------------------------------------
       5) Create Stats
    --------------------------------------------- */
    console.log('Generating stats...');
    let statsDocs = [];
    for (const userId of userIds) {
        statsDocs.push({
            user: new mongoose.Types.ObjectId(userId),
            macros: JSON.stringify({
                protein: faker.number.int({min: 20, max: 200}),
                fat: faker.number.int({min: 10, max: 200}),
                carbs: faker.number.int({min: 50, max: 400}),
            }),
            micros: JSON.stringify({
                vitaminA: faker.number.int({min: 100, max: 500}), vitaminC: faker.number.int({min: 10, max: 200}),
            }),
            caloriesConsumed: faker.number.int({min: 1000, max: 5000}),
            waterIntake: faker.number.int({min: 1, max: 10}),
            steps: faker.number.int({min: 0, max: 20000}),
        });

        if (statsDocs.length >= BATCH_SIZE) {
            await StatsModel.insertMany(statsDocs);
            statsDocs = [];
        }
    }
    if (statsDocs.length) {
        await StatsModel.insertMany(statsDocs);
        statsDocs = [];
    }
    console.log('Stats created!');

    /* ---------------------------------------------
       6) Create Reviews
    --------------------------------------------- */
    console.log('Generating reviews...');

    const allRecipes = await RecipeModel.find({}, {_id: 1});
    const recipeIds = allRecipes.map((r) => r._id.toString());
    const allRestaurants = await RestaurantModel.find({}, {_id: 1});
    const restaurantIds = allRestaurants.map((r) => r._id.toString());

    let reviewDocs = [];

    async function flushReviews(force = false) {
        if (reviewDocs.length >= BATCH_SIZE || force) {
            await ReviewModel.insertMany(reviewDocs);
            reviewDocs = [];
        }
    }

    // Recipe reviews
    for (const rId of recipeIds) {
        for (let i = 0; i < REVIEWS_PER_RECIPE; i++) {
            reviewDocs.push({
                user: new mongoose.Types.ObjectId(faker.helpers.arrayElement(userIds)),
                targetType: 'RECIPE',
                targetId: new mongoose.Types.ObjectId(rId),
                rating: faker.number.int({min: 1, max: 5}),
                comment: faker.lorem.sentence(),
            });
        }
        await flushReviews();
    }
    await flushReviews(true);

    // Restaurant reviews
    for (const restId of restaurantIds) {
        for (let i = 0; i < REVIEWS_PER_RESTAURANT; i++) {
            reviewDocs.push({
                user: new mongoose.Types.ObjectId(faker.helpers.arrayElement(userIds)),
                targetType: 'RESTAURANT',
                targetId: new mongoose.Types.ObjectId(restId),
                rating: faker.number.int({min: 1, max: 5}),
                comment: faker.lorem.sentence(),
            });
        }
        await flushReviews();
    }
    await flushReviews(true);

    console.log('Reviews created!');

    // Recalculate average ratings
    console.log('Recalculating average ratings...');
    await recalcAverageRatings('RECIPE', RecipeModel);
    await recalcAverageRatings('RESTAURANT', RestaurantModel);

    console.log('Seeding completed successfully!');
}

/**
 * Recompute averageRating and ratingCount for either recipes or restaurants.
 * @param {'RECIPE'|'RESTAURANT'} targetType
 * @param {mongoose.Model} targetModel
 */
async function recalcAverageRatings(targetType, targetModel) {
    const cursor = targetModel.find({}, {_id: 1}).cursor();

    while (true) {
        const batch = [];
        for (let i = 0; i < BATCH_SIZE; i++) {
            const doc = await cursor.next();
            if (!doc) break;
            batch.push(doc._id);
        }
        if (!batch.length) break;

        const reviews = await ReviewModel.aggregate([{$match: {targetType, targetId: {$in: batch}}}, {
            $group: {
                _id: '$targetId', count: {$sum: 1}, avgRating: {$avg: '$rating'},
            },
        },]);

        const statsMap = {};
        for (const r of reviews) {
            statsMap[r._id.toString()] = {
                count: r.count, avgRating: r.avgRating,
            };
        }

        const bulkOps = batch.map((id) => {
            const stats = statsMap[id.toString()] || {count: 0, avgRating: 0};
            return {
                updateOne: {
                    filter: {_id: id}, update: {
                        $set: {
                            ratingCount: stats.count, averageRating: stats.avgRating,
                        },
                    },
                },
            };
        });
        await targetModel.bulkWrite(bulkOps);
    }
}

/** Main entry point */
(async function main() {
    try {
        await seedDatabase();
    } catch (error) {
        console.error('Seeding failed:', error);
    } finally {
        console.log('Disconnecting DB...');
        await mongoose.disconnect();
        console.log('Done.');
        process.exit(0);
    }
})();
