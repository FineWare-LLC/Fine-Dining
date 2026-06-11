// @ts-check
import { test, expect } from '@playwright/experimental-ct-react';
import { MockedProvider } from '@apollo/client/testing';
import MealCatalog from '../../components/Dashboard/MealCatalog';

// Mock GraphQL queries and responses
const mockMeals = [
    {
        id: 'meal-1',
        mealName: 'Grilled Chicken Breast',
        price: 15.99,
        restaurant: {
            id: 'rest-1',
            restaurantName: 'Healthy Kitchen'
        },
        nutrition: {
            carbohydrates: 5,
            protein: 35,
            fat: 8,
            sodium: 420
        },
        allergens: ['none']
    },
    {
        id: 'meal-2',
        mealName: 'Quinoa Power Bowl',
        price: 12.50,
        restaurant: {
            id: 'rest-2',
            restaurantName: 'Green Eats'
        },
        nutrition: {
            carbohydrates: 45,
            protein: 15,
            fat: 12,
            sodium: 380
        },
        allergens: ['nuts']
    },
    {
        id: 'meal-3',
        mealName: 'Salmon Teriyaki',
        price: 18.75,
        restaurant: {
            id: 'rest-1',
            restaurantName: 'Healthy Kitchen'
        },
        nutrition: {
            carbohydrates: 8,
            protein: 32,
            fat: 15,
            sodium: 520
        },
        allergens: ['fish']
    },
    {
        id: 'meal-4',
        mealName: 'Vegetarian Pasta',
        price: 11.25,
        restaurant: {
            id: 'rest-3',
            restaurantName: 'Italian Corner'
        },
        nutrition: {
            carbohydrates: 55,
            protein: 12,
            fat: 8,
            sodium: 450
        },
        allergens: ['gluten', 'dairy']
    }
];

const mockRestaurants = [
    { id: 'rest-1', restaurantName: 'Healthy Kitchen' },
    { id: 'rest-2', restaurantName: 'Green Eats' },
    { id: 'rest-3', restaurantName: 'Italian Corner' }
];

// GraphQL mocks
const GET_ALL_MEALS_MOCK = {
    request: {
        query: expect.anything(),
        variables: { page: 1, limit: 20 }
    },
    result: {
        data: {
            getAllMeals: mockMeals
        }
    }
};

const GET_RESTAURANTS_MOCK = {
    request: {
        query: expect.anything(),
        variables: { page: 1, limit: 50 }
    },
    result: {
        data: {
            getRestaurants: mockRestaurants
        }
    }
};

test.describe('MealCatalog Selection Functionality', () => {
    test.describe('Individual Meal Selection', () => {
        test('should allow selecting each meal individually', async ({ mount }) => {
            console.log('[DEBUG_LOG] Testing individual meal selection');
            
            let selectedMeals = [];
            const handleSelectMeal = (mealId) => {
                console.log(`[DEBUG_LOG] Selection callback triggered for meal: ${mealId}`);
                if (selectedMeals.includes(mealId)) {
                    selectedMeals = selectedMeals.filter(id => id !== mealId);
                    console.log(`[DEBUG_LOG] Meal ${mealId} deselected`);
                } else {
                    selectedMeals.push(mealId);
                    console.log(`[DEBUG_LOG] Meal ${mealId} selected`);
                }
            };

            const component = await mount(
                <MockedProvider mocks={[GET_ALL_MEALS_MOCK, GET_RESTAURANTS_MOCK]} addTypename={false}>
                    <MealCatalog
                        selectedMeals={selectedMeals}
                        onSelectMeal={handleSelectMeal}
                    />
                </MockedProvider>
            );

            // Wait for data to load
            await expect(component.getByText('Meal Catalog')).toBeVisible();
            
            // Test selecting each meal individually
            for (const meal of mockMeals) {
                console.log(`[DEBUG_LOG] Testing selection of: ${meal.mealName}`);
                
                // Find the meal row
                const mealRow = component.getByText(meal.mealName).locator('..').locator('..');
                await expect(mealRow).toBeVisible();
                
                // Find and click the checkbox for this meal
                const checkbox = mealRow.locator('input[type="checkbox"]');
                await expect(checkbox).toBeVisible();
                await expect(checkbox).not.toBeDisabled();
                
                // Click the checkbox to select the meal
                await checkbox.click();
                console.log(`[DEBUG_LOG] Clicked checkbox for ${meal.mealName}`);
                
                // Verify the checkbox is now checked
                await expect(checkbox).toBeChecked();
                console.log(`[DEBUG_LOG] ✅ ${meal.mealName} is properly selected`);
                
                // Verify the row appears selected (has selected styling)
                await expect(mealRow).toHaveClass(/selected/);
                console.log(`[DEBUG_LOG] ✅ ${meal.mealName} row shows selected styling`);
            }
        });

        test('should allow deselecting individual meals', async ({ mount }) => {
            console.log('[DEBUG_LOG] Testing individual meal deselection');
            
            // Start with all meals selected
            let selectedMeals = mockMeals.map(meal => meal.id);
            const handleSelectMeal = (mealId) => {
                console.log(`[DEBUG_LOG] Deselection callback triggered for meal: ${mealId}`);
                selectedMeals = selectedMeals.filter(id => id !== mealId);
                console.log(`[DEBUG_LOG] Meal ${mealId} deselected`);
            };

            const component = await mount(
                <MockedProvider mocks={[GET_ALL_MEALS_MOCK, GET_RESTAURANTS_MOCK]} addTypename={false}>
                    <MealCatalog
                        selectedMeals={selectedMeals}
                        onSelectMeal={handleSelectMeal}
                    />
                </MockedProvider>
            );

            // Wait for data to load
            await expect(component.getByText('Meal Catalog')).toBeVisible();
            
            // Test deselecting each meal individually
            for (const meal of mockMeals) {
                console.log(`[DEBUG_LOG] Testing deselection of: ${meal.mealName}`);
                
                // Find the meal row
                const mealRow = component.getByText(meal.mealName).locator('..').locator('..');
                await expect(mealRow).toBeVisible();
                
                // Find the checkbox for this meal
                const checkbox = mealRow.locator('input[type="checkbox"]');
                await expect(checkbox).toBeVisible();
                await expect(checkbox).toBeChecked(); // Should start checked
                
                // Click the checkbox to deselect the meal
                await checkbox.click();
                console.log(`[DEBUG_LOG] Clicked checkbox to deselect ${meal.mealName}`);
                
                // Verify the checkbox is now unchecked
                await expect(checkbox).not.toBeChecked();
                console.log(`[DEBUG_LOG] ✅ ${meal.mealName} is properly deselected`);
                
                // Verify the row no longer appears selected
                await expect(mealRow).not.toHaveClass(/selected/);
                console.log(`[DEBUG_LOG] ✅ ${meal.mealName} row no longer shows selected styling`);
            }
        });
    });

    test.describe('Row Click Selection', () => {
        test('should allow selecting meals by clicking table rows', async ({ mount }) => {
            console.log('[DEBUG_LOG] Testing row click selection');
            
            let selectedMeals = [];
            const handleSelectMeal = (mealId) => {
                console.log(`[DEBUG_LOG] Row click callback triggered for meal: ${mealId}`);
                if (selectedMeals.includes(mealId)) {
                    selectedMeals = selectedMeals.filter(id => id !== mealId);
                } else {
                    selectedMeals.push(mealId);
                }
            };

            const component = await mount(
                <MockedProvider mocks={[GET_ALL_MEALS_MOCK, GET_RESTAURANTS_MOCK]} addTypename={false}>
                    <MealCatalog
                        selectedMeals={selectedMeals}
                        onSelectMeal={handleSelectMeal}
                    />
                </MockedProvider>
            );

            // Wait for data to load
            await expect(component.getByText('Meal Catalog')).toBeVisible();
            
            // Test clicking each meal row
            for (const meal of mockMeals) {
                console.log(`[DEBUG_LOG] Testing row click for: ${meal.mealName}`);
                
                // Find and click the meal row
                const mealRow = component.getByText(meal.mealName).locator('..').locator('..');
                await expect(mealRow).toBeVisible();
                
                await mealRow.click();
                console.log(`[DEBUG_LOG] Clicked row for ${meal.mealName}`);
                
                // Verify the row appears selected after clicking
                await expect(mealRow).toHaveClass(/selected/);
                console.log(`[DEBUG_LOG] ✅ ${meal.mealName} row shows selected styling after row click`);
                
                // Verify the checkbox is checked
                const checkbox = mealRow.locator('input[type="checkbox"]');
                await expect(checkbox).toBeChecked();
                console.log(`[DEBUG_LOG] ✅ ${meal.mealName} checkbox is checked after row click`);
            }
        });
    });

    test.describe('Selection State Persistence', () => {
        test('should maintain selection state correctly', async ({ mount }) => {
            console.log('[DEBUG_LOG] Testing selection state persistence');
            
            let selectedMeals = ['meal-1', 'meal-3']; // Pre-select some meals
            const handleSelectMeal = (mealId) => {
                console.log(`[DEBUG_LOG] Selection state change for meal: ${mealId}`);
                if (selectedMeals.includes(mealId)) {
                    selectedMeals = selectedMeals.filter(id => id !== mealId);
                } else {
                    selectedMeals.push(mealId);
                }
            };

            const component = await mount(
                <MockedProvider mocks={[GET_ALL_MEALS_MOCK, GET_RESTAURANTS_MOCK]} addTypename={false}>
                    <MealCatalog
                        selectedMeals={selectedMeals}
                        onSelectMeal={handleSelectMeal}
                    />
                </MockedProvider>
            );

            // Wait for data to load
            await expect(component.getByText('Meal Catalog')).toBeVisible();
            
            // Verify pre-selected meals are shown as selected
            const preSelectedMeals = ['meal-1', 'meal-3'];
            for (const mealId of preSelectedMeals) {
                const meal = mockMeals.find(m => m.id === mealId);
                console.log(`[DEBUG_LOG] Verifying pre-selected meal: ${meal.mealName}`);
                
                const mealRow = component.getByText(meal.mealName).locator('..').locator('..');
                const checkbox = mealRow.locator('input[type="checkbox"]');
                
                await expect(checkbox).toBeChecked();
                await expect(mealRow).toHaveClass(/selected/);
                console.log(`[DEBUG_LOG] ✅ ${meal.mealName} correctly shows as pre-selected`);
            }
            
            // Verify non-selected meals are not shown as selected
            const nonSelectedMeals = ['meal-2', 'meal-4'];
            for (const mealId of nonSelectedMeals) {
                const meal = mockMeals.find(m => m.id === mealId);
                console.log(`[DEBUG_LOG] Verifying non-selected meal: ${meal.mealName}`);
                
                const mealRow = component.getByText(meal.mealName).locator('..').locator('..');
                const checkbox = mealRow.locator('input[type="checkbox"]');
                
                await expect(checkbox).not.toBeChecked();
                await expect(mealRow).not.toHaveClass(/selected/);
                console.log(`[DEBUG_LOG] ✅ ${meal.mealName} correctly shows as not selected`);
            }
        });
    });

    test.describe('No Fake Data Verification', () => {
        test('should only show real API data with no disabled items', async ({ mount }) => {
            console.log('[DEBUG_LOG] Verifying no fake/scraped data is present');
            
            const component = await mount(
                <MockedProvider mocks={[GET_ALL_MEALS_MOCK, GET_RESTAURANTS_MOCK]} addTypename={false}>
                    <MealCatalog
                        selectedMeals={[]}
                        onSelectMeal={() => {}}
                    />
                </MockedProvider>
            );

            // Wait for data to load
            await expect(component.getByText('Meal Catalog')).toBeVisible();
            
            // Verify all checkboxes are enabled (no disabled items from fake data)
            const checkboxes = component.locator('input[type="checkbox"]');
            const checkboxCount = await checkboxes.count();
            console.log(`[DEBUG_LOG] Found ${checkboxCount} checkboxes`);
            
            for (let i = 0; i < checkboxCount; i++) {
                const checkbox = checkboxes.nth(i);
                await expect(checkbox).not.toBeDisabled();
                console.log(`[DEBUG_LOG] ✅ Checkbox ${i + 1} is enabled`);
            }
            
            // Verify no scraped data indicators are present
            const scrapedIndicators = component.locator('text=/scraped|fake|test/i');
            await expect(scrapedIndicators).toHaveCount(0);
            console.log('[DEBUG_LOG] ✅ No scraped/fake data indicators found');
            
            // Verify all displayed meals are from our mock API data
            for (const meal of mockMeals) {
                await expect(component.getByText(meal.mealName)).toBeVisible();
                console.log(`[DEBUG_LOG] ✅ Real meal "${meal.mealName}" is displayed`);
            }
        });
    });

    test.describe('Selection Callback Verification', () => {
        test('should call selection callback with correct meal IDs', async ({ mount }) => {
            console.log('[DEBUG_LOG] Testing selection callback accuracy');
            
            const selectionLog = [];
            const handleSelectMeal = (mealId) => {
                selectionLog.push(mealId);
                console.log(`[DEBUG_LOG] Selection callback received: ${mealId}`);
            };

            const component = await mount(
                <MockedProvider mocks={[GET_ALL_MEALS_MOCK, GET_RESTAURANTS_MOCK]} addTypename={false}>
                    <MealCatalog
                        selectedMeals={[]}
                        onSelectMeal={handleSelectMeal}
                    />
                </MockedProvider>
            );

            // Wait for data to load
            await expect(component.getByText('Meal Catalog')).toBeVisible();
            
            // Select each meal and verify correct ID is passed to callback
            for (const meal of mockMeals) {
                console.log(`[DEBUG_LOG] Testing callback for meal: ${meal.mealName} (ID: ${meal.id})`);
                
                const mealRow = component.getByText(meal.mealName).locator('..').locator('..');
                const checkbox = mealRow.locator('input[type="checkbox"]');
                
                await checkbox.click();
                
                // Verify the correct meal ID was logged
                expect(selectionLog).toContain(meal.id);
                console.log(`[DEBUG_LOG] ✅ Callback correctly received meal ID: ${meal.id}`);
            }
            
            // Verify all expected meal IDs were captured
            expect(selectionLog).toHaveLength(mockMeals.length);
            for (const meal of mockMeals) {
                expect(selectionLog).toContain(meal.id);
            }
            console.log('[DEBUG_LOG] ✅ All meal selection callbacks were triggered correctly');
        });
    });
});