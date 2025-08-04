#!/usr/bin/env node

/**
 * Script to reproduce the meal catalog bug
 * 
 * This script demonstrates:
 * 1. How fake scraped data is mixed with real API data
 * 2. How selection fails for scraped items
 * 3. The inconsistent behavior that confuses users
 */

import fs from 'fs';
import path from 'path';

console.log('[DEBUG_LOG] === Meal Catalog Bug Reproduction ===\n');

// Simulate the problematic code from MealCatalog.js
console.log('[DEBUG_LOG] 1. Loading fake scraped data (the bug source)...');

try {
    // This simulates line 35 in MealCatalog.js: import menuItems from '@highs/data/raw/scraped_data_test.json';
    const scrapedDataPath = path.join(process.cwd(), 'highs-pipeline/data/raw/scraped_data_test.json');
    
    if (!fs.existsSync(scrapedDataPath)) {
        console.log('[DEBUG_LOG] ❌ scraped_data_test.json not found - this is actually good, it means the fake data source is missing');
        console.log('[DEBUG_LOG] File should be at:', scrapedDataPath);
    } else {
        const scrapedData = JSON.parse(fs.readFileSync(scrapedDataPath, 'utf8'));
        console.log('[DEBUG_LOG] ✅ Found scraped test data with', scrapedData.length, 'items');
        
        // Show first few items to demonstrate the fake data
        console.log('[DEBUG_LOG] Sample fake data items:');
        scrapedData.slice(0, 3).forEach((item, idx) => {
            console.log(`[DEBUG_LOG]   ${idx + 1}. ${item.meal_name} from ${item.chain} - $${item.price || 'N/A'}`);
        });
    }
} catch (error) {
    console.log('[DEBUG_LOG] ❌ Error loading scraped data:', error.message);
}

console.log('\n[DEBUG_LOG] 2. Simulating the data mixing bug...');

// Simulate real API data (this would come from GraphQL)
const mockApiMeals = [
    {
        id: 'real-1',
        mealName: 'Grilled Salmon',
        price: 18.99,
        restaurant: { restaurantName: 'Ocean Grill' },
        nutrition: { carbohydrates: 5, protein: 35, fat: 12, sodium: 450 },
        isScraped: false
    },
    {
        id: 'real-2', 
        mealName: 'Chicken Caesar Salad',
        price: 14.50,
        restaurant: { restaurantName: 'Garden Bistro' },
        nutrition: { carbohydrates: 8, protein: 28, fat: 15, sodium: 680 },
        isScraped: false
    }
];

// Simulate fake scraped data (this is the problematic part)
const mockScrapedMeals = [
    {
        id: 'scraped-0',
        mealName: 'Big Mac',
        price: 5.99,
        restaurant: { restaurantName: 'McDonalds' },
        nutrition: { carbohydrates: 45, protein: 25, fat: 33, sodium: 1010 },
        isScraped: true // This flag causes the selection bug!
    },
    {
        id: 'scraped-1',
        mealName: 'Whopper',
        price: 6.49,
        restaurant: { restaurantName: 'Burger King' },
        nutrition: { carbohydrates: 49, protein: 28, fat: 40, sodium: 980 },
        isScraped: true // This flag causes the selection bug!
    }
];

// This simulates lines 141 in MealCatalog.js: mealsToDisplay = [...apiMeals, ...scrapedMeals];
const mixedMeals = [...mockApiMeals, ...mockScrapedMeals];

console.log('[DEBUG_LOG] Combined meal data:');
mixedMeals.forEach((meal, idx) => {
    const selectable = meal.isScraped ? '❌ NOT SELECTABLE' : '✅ SELECTABLE';
    console.log(`[DEBUG_LOG]   ${idx + 1}. ${meal.mealName} - ${selectable} (isScraped: ${meal.isScraped})`);
});

console.log('\n[DEBUG_LOG] 3. Demonstrating the selection bug...');

// Simulate user trying to select meals
const selectedMeals = [];

function simulateSelection(mealId, mealName) {
    const meal = mixedMeals.find(m => m.id === mealId);
    
    if (!meal) {
        console.log(`[DEBUG_LOG] ❌ Meal ${mealId} not found`);
        return false;
    }
    
    // This simulates the problematic logic from lines 276-284 in MealCatalog.js
    if (meal.isScraped) {
        console.log(`[DEBUG_LOG] ❌ SELECTION FAILED: "${mealName}" is scraped data and cannot be selected`);
        console.log(`[DEBUG_LOG]    User sees the item but clicking does nothing - this is the bug!`);
        return false;
    } else {
        selectedMeals.push(mealId);
        console.log(`[DEBUG_LOG] ✅ SELECTION SUCCESS: "${mealName}" selected`);
        return true;
    }
}

// Try to select each meal
console.log('[DEBUG_LOG] Attempting to select each meal:');
simulateSelection('real-1', 'Grilled Salmon');
simulateSelection('real-2', 'Chicken Caesar Salad');
simulateSelection('scraped-0', 'Big Mac');  // This will fail!
simulateSelection('scraped-1', 'Whopper');  // This will fail!

console.log('\n[DEBUG_LOG] 4. Bug Summary:');
console.log('[DEBUG_LOG] ❌ Problem: Fake scraped data is mixed with real API data');
console.log('[DEBUG_LOG] ❌ Problem: Users see items they cannot select');
console.log('[DEBUG_LOG] ❌ Problem: No clear indication why some items are not selectable');
console.log('[DEBUG_LOG] ❌ Problem: Inconsistent user experience');

console.log('\n[DEBUG_LOG] 5. Expected behavior:');
console.log('[DEBUG_LOG] ✅ Only show real, selectable meals from the API');
console.log('[DEBUG_LOG] ✅ All visible items should be selectable');
console.log('[DEBUG_LOG] ✅ No mixing of test/fake data with production data');

console.log('\n[DEBUG_LOG] === Bug reproduction complete ===');