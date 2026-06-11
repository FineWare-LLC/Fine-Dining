// @ts-check
import { test, expect } from '@playwright/test';

test.describe('User Workflows Integration Tests', () => {
    test.describe('User Registration and Onboarding', () => {
        test('complete user registration flow', async ({ page }) => {
            // Start at home page
            await page.goto('/');

            // Navigate to registration
            const signUpButton = page.locator('a:has-text("Sign Up"), button:has-text("Sign Up"), a:has-text("Create Account")').first();
            await signUpButton.click();

            // Fill registration form
            await page.fill('input[name="name"], input[placeholder*="name"]', 'John Doe');
            await page.fill('input[name="email"], input[type="email"]', 'john.doe@example.com');
            await page.fill('input[name="password"], input[type="password"]', 'SecurePassword123!');

            // Submit registration
            const submitButton = page.locator('button[type="submit"], button:has-text("Create"), button:has-text("Register")').first();
            await submitButton.click();

            // Should redirect to profile setup or dashboard
            await expect(page).toHaveURL(/dashboard|profile|questionnaire/);

            // Verify user is logged in
            await expect(page.locator('text=/welcome|hello|john/i')).toBeVisible();
        });

        test('profile setup and questionnaire completion', async ({ page }) => {
            // Mock user authentication
            await page.goto('/questionnaire');
            await page.evaluate(() => {
                localStorage.setItem('userToken', 'mock-token');
                localStorage.setItem('userId', 'test-user-123');
            });

            // Fill questionnaire
            await page.selectOption('select[name*="activity"], select[name*="level"]', 'moderate');

            // Select dietary preferences
            await page.check('input[value="vegetarian"]');
            await page.check('input[value="gluten_free"]');

            // Select health goals
            await page.check('input[value="weight_loss"]');

            // Fill physical information
            await page.fill('input[name*="height"], input[placeholder*="height"]', '175');
            await page.fill('input[name*="weight"], input[placeholder*="weight"]', '70');
            await page.fill('input[name*="age"], input[placeholder*="age"]', '30');

            // Submit questionnaire
            const nextButton = page.locator('button:has-text("Next"), button:has-text("Continue"), button:has-text("Save")').first();
            await nextButton.click();

            // Should proceed to next step or dashboard
            await expect(page).toHaveURL(/dashboard|profile|complete/);
        });
    });

    test.describe('Meal Planning Workflow', () => {
        test.beforeEach(async ({ page }) => {
            // Setup authenticated user
            await page.goto('/dashboard');
            await page.evaluate(() => {
                localStorage.setItem('userToken', 'mock-token');
                localStorage.setItem('userId', 'test-user-123');
                localStorage.setItem('userProfile', JSON.stringify({
                    name: 'Test User',
                    preferences: { dietaryRestrictions: ['vegetarian'] },
                    goals: ['weight_loss'],
                }));
            });
        });

        test('browse and select meals for meal plan', async ({ page }) => {
            await page.goto('/dashboard');

            // Navigate to meal catalog
            const browseMealsButton = page.locator('button:has-text("Browse"), a:has-text("Meals"), button:has-text("Find Meals")').first();
            if (await browseMealsButton.isVisible()) {
                await browseMealsButton.click();
            }

            // Filter meals by dietary preferences
            const vegetarianFilter = page.locator('input[value="vegetarian"], button:has-text("Vegetarian")').first();
            if (await vegetarianFilter.isVisible()) {
                await vegetarianFilter.click();
            }

            // Select a meal
            const mealCard = page.locator('.meal-card, [data-testid*="meal"]').first();
            if (await mealCard.isVisible()) {
                await mealCard.click();

                // Add to meal plan
                const addButton = page.locator('button:has-text("Add"), button:has-text("Select")').first();
                if (await addButton.isVisible()) {
                    await addButton.click();
                }
            }

            // Verify meal was added
            await expect(page.locator('text=/added|selected|success/i')).toBeVisible();
        });

        test('create and customize weekly meal plan', async ({ page }) => {
            await page.goto('/meal-plans');

            // Create new meal plan
            const createPlanButton = page.locator('button:has-text("Create"), button:has-text("New Plan")').first();
            if (await createPlanButton.isVisible()) {
                await createPlanButton.click();
            }

            // Select plan duration
            const weeklyOption = page.locator('input[value="weekly"], button:has-text("Weekly")').first();
            if (await weeklyOption.isVisible()) {
                await weeklyOption.click();
            }

            // Add meals for each day
            const days = ['monday', 'tuesday', 'wednesday'];
            for (const day of days) {
                const daySection = page.locator(`[data-day="${day}"], .${day}, [data-testid*="${day}"]`).first();
                if (await daySection.isVisible()) {
                    const addMealButton = daySection.locator('button:has-text("Add"), button:has-text("+")').first();
                    if (await addMealButton.isVisible()) {
                        await addMealButton.click();

                        // Select a meal from the list
                        const mealOption = page.locator('.meal-option, [data-testid*="meal-option"]').first();
                        if (await mealOption.isVisible()) {
                            await mealOption.click();
                        }
                    }
                }
            }

            // Save meal plan
            const savePlanButton = page.locator('button:has-text("Save"), button:has-text("Create Plan")').first();
            if (await savePlanButton.isVisible()) {
                await savePlanButton.click();
            }

            // Verify plan was created
            await expect(page.locator('text=/plan created|success|saved/i')).toBeVisible();
        });

        test('view and modify existing meal plan', async ({ page }) => {
            await page.goto('/meal-plans');

            // Select existing meal plan
            const existingPlan = page.locator('.meal-plan-card, [data-testid*="meal-plan"]').first();
            if (await existingPlan.isVisible()) {
                await existingPlan.click();

                // Edit a meal in the plan
                const editButton = page.locator('button:has-text("Edit"), button:has-text("Change")').first();
                if (await editButton.isVisible()) {
                    await editButton.click();

                    // Select different meal
                    const newMeal = page.locator('.meal-option').nth(1);
                    if (await newMeal.isVisible()) {
                        await newMeal.click();
                    }

                    // Save changes
                    const saveButton = page.locator('button:has-text("Save"), button:has-text("Update")').first();
                    if (await saveButton.isVisible()) {
                        await saveButton.click();
                    }
                }
            }

            // Verify changes were saved
            await expect(page.locator('text=/updated|saved|success/i')).toBeVisible();
        });
    });

    test.describe('Restaurant Discovery and Ordering', () => {
        test.beforeEach(async ({ page }) => {
            await page.goto('/dashboard');
            await page.evaluate(() => {
                localStorage.setItem('userToken', 'mock-token');
                localStorage.setItem('userLocation', JSON.stringify({
                    lat: 40.7128,
                    lng: -74.0060,
                    address: 'New York, NY',
                }));
            });
        });

        test('discover restaurants based on location and preferences', async ({ page }) => {
            await page.goto('/dashboard');

            // Navigate to restaurant discovery
            const findRestaurantsButton = page.locator('button:has-text("Find"), a:has-text("Restaurants"), button:has-text("Discover")').first();
            if (await findRestaurantsButton.isVisible()) {
                await findRestaurantsButton.click();
            }

            // Apply filters
            const cuisineFilter = page.locator('select[name*="cuisine"], button:has-text("Italian")').first();
            if (await cuisineFilter.isVisible()) {
                if (await cuisineFilter.evaluate(el => el.tagName) === 'SELECT') {
                    await cuisineFilter.selectOption('italian');
                } else {
                    await cuisineFilter.click();
                }
            }

            // Set distance filter
            const distanceFilter = page.locator('input[name*="distance"], select[name*="distance"]').first();
            if (await distanceFilter.isVisible()) {
                await distanceFilter.fill('5');
            }

            // Apply filters
            const applyButton = page.locator('button:has-text("Apply"), button:has-text("Search")').first();
            if (await applyButton.isVisible()) {
                await applyButton.click();
            }

            // Verify restaurants are displayed
            await expect(page.locator('.restaurant-card, [data-testid*="restaurant"]')).toBeVisible();
        });

        test('view restaurant details and menu', async ({ page }) => {
            await page.goto('/restaurants');

            // Click on first restaurant
            const restaurantCard = page.locator('.restaurant-card, [data-testid*="restaurant"]').first();
            if (await restaurantCard.isVisible()) {
                await restaurantCard.click();

                // Verify restaurant details page
                await expect(page.locator('h1, h2')).toBeVisible();
                await expect(page.locator('text=/menu|dishes|food/i')).toBeVisible();

                // View menu items
                const menuItem = page.locator('.menu-item, [data-testid*="menu-item"]').first();
                if (await menuItem.isVisible()) {
                    await menuItem.click();

                    // Verify item details
                    await expect(page.locator('text=/price|calories|ingredients/i')).toBeVisible();
                }
            }
        });

        test('add items to cart and place order', async ({ page }) => {
            await page.goto('/restaurants');

            // Select restaurant and menu item
            const restaurantCard = page.locator('.restaurant-card').first();
            if (await restaurantCard.isVisible()) {
                await restaurantCard.click();

                // Add item to cart
                const addToCartButton = page.locator('button:has-text("Add to Cart"), button:has-text("Add")').first();
                if (await addToCartButton.isVisible()) {
                    await addToCartButton.click();
                }

                // Go to cart
                const cartButton = page.locator('button:has-text("Cart"), a:has-text("Cart"), [data-testid*="cart"]').first();
                if (await cartButton.isVisible()) {
                    await cartButton.click();
                }

                // Verify item in cart
                await expect(page.locator('.cart-item, [data-testid*="cart-item"]')).toBeVisible();

                // Proceed to checkout
                const checkoutButton = page.locator('button:has-text("Checkout"), button:has-text("Order")').first();
                if (await checkoutButton.isVisible()) {
                    await checkoutButton.click();

                    // Fill delivery information
                    await page.fill('input[name*="address"], textarea[name*="address"]', '123 Main St, New York, NY');
                    await page.fill('input[name*="phone"], input[type="tel"]', '555-123-4567');

                    // Select payment method
                    const paymentMethod = page.locator('input[value="credit_card"], button:has-text("Credit Card")').first();
                    if (await paymentMethod.isVisible()) {
                        await paymentMethod.click();
                    }

                    // Place order
                    const placeOrderButton = page.locator('button:has-text("Place Order"), button:has-text("Confirm")').first();
                    if (await placeOrderButton.isVisible()) {
                        await placeOrderButton.click();
                    }

                    // Verify order confirmation
                    await expect(page.locator('text=/order confirmed|thank you|order placed/i')).toBeVisible();
                }
            }
        });
    });

    test.describe('User Profile and Settings Management', () => {
        test.beforeEach(async ({ page }) => {
            await page.goto('/profile');
            await page.evaluate(() => {
                localStorage.setItem('userToken', 'mock-token');
                localStorage.setItem('userProfile', JSON.stringify({
                    name: 'Test User',
                    email: 'test@example.com',
                    preferences: { dietaryRestrictions: ['vegetarian'] },
                }));
            });
        });

        test('update profile information', async ({ page }) => {
            await page.goto('/profile');

            // Edit profile
            const editButton = page.locator('button:has-text("Edit"), button:has-text("Update")').first();
            if (await editButton.isVisible()) {
                await editButton.click();

                // Update information
                await page.fill('input[name="name"]', 'Updated Test User');
                await page.fill('input[name="phone"]', '555-987-6543');

                // Update dietary preferences
                await page.check('input[value="vegan"]');
                await page.uncheck('input[value="vegetarian"]');

                // Save changes
                const saveButton = page.locator('button:has-text("Save"), button[type="submit"]').first();
                if (await saveButton.isVisible()) {
                    await saveButton.click();
                }

                // Verify changes saved
                await expect(page.locator('text=/updated|saved|success/i')).toBeVisible();
                await expect(page.locator('text=Updated Test User')).toBeVisible();
            }
        });

        test('manage notification preferences', async ({ page }) => {
            await page.goto('/profile/settings');

            // Update notification settings
            const emailNotifications = page.locator('input[name*="email"], input[type="checkbox"]').first();
            if (await emailNotifications.isVisible()) {
                await emailNotifications.check();
            }

            const pushNotifications = page.locator('input[name*="push"], input[name*="mobile"]').first();
            if (await pushNotifications.isVisible()) {
                await pushNotifications.uncheck();
            }

            // Save settings
            const saveButton = page.locator('button:has-text("Save"), button:has-text("Update")').first();
            if (await saveButton.isVisible()) {
                await saveButton.click();
            }

            // Verify settings saved
            await expect(page.locator('text=/settings updated|preferences saved/i')).toBeVisible();
        });

        test('change password', async ({ page }) => {
            await page.goto('/profile/security');

            // Fill password change form
            await page.fill('input[name*="current"], input[placeholder*="current"]', 'currentPassword123');
            await page.fill('input[name*="new"], input[placeholder*="new"]', 'newPassword456!');
            await page.fill('input[name*="confirm"], input[placeholder*="confirm"]', 'newPassword456!');

            // Submit password change
            const changePasswordButton = page.locator('button:has-text("Change"), button:has-text("Update Password")').first();
            if (await changePasswordButton.isVisible()) {
                await changePasswordButton.click();
            }

            // Verify password changed
            await expect(page.locator('text=/password updated|password changed/i')).toBeVisible();
        });
    });

    test.describe('Search and Filter Functionality', () => {
        test('search for meals with filters', async ({ page }) => {
            await page.goto('/dashboard');

            // Use search functionality
            const searchInput = page.locator('input[type="search"], input[placeholder*="search"]').first();
            if (await searchInput.isVisible()) {
                await searchInput.fill('chicken salad');
                await page.keyboard.press('Enter');

                // Apply additional filters
                const calorieFilter = page.locator('input[name*="calories"], select[name*="calories"]').first();
                if (await calorieFilter.isVisible()) {
                    await calorieFilter.fill('500');
                }

                const proteinFilter = page.locator('input[name*="protein"]').first();
                if (await proteinFilter.isVisible()) {
                    await proteinFilter.fill('30');
                }

                // Apply filters
                const filterButton = page.locator('button:has-text("Filter"), button:has-text("Apply")').first();
                if (await filterButton.isVisible()) {
                    await filterButton.click();
                }

                // Verify filtered results
                await expect(page.locator('.meal-card, [data-testid*="meal"]')).toBeVisible();
                await expect(page.locator('text=/chicken|salad/i')).toBeVisible();
            }
        });

        test('sort and paginate results', async ({ page }) => {
            await page.goto('/restaurants');

            // Sort results
            const sortDropdown = page.locator('select[name*="sort"], button:has-text("Sort")').first();
            if (await sortDropdown.isVisible()) {
                if (await sortDropdown.evaluate(el => el.tagName) === 'SELECT') {
                    await sortDropdown.selectOption('rating');
                } else {
                    await sortDropdown.click();
                    await page.locator('button:has-text("Rating"), a:has-text("Rating")').first().click();
                }
            }

            // Navigate through pages
            const nextPageButton = page.locator('button:has-text("Next"), a:has-text("Next"), button[aria-label*="next"]').first();
            if (await nextPageButton.isVisible()) {
                await nextPageButton.click();

                // Verify page changed
                await expect(page.locator('text=/page 2|next page/i')).toBeVisible();
            }
        });
    });

    test.describe('Error Handling and Edge Cases', () => {
        test('handles network errors gracefully', async ({ page }) => {
            // Simulate network failure
            await page.route('**/api/**', route => route.abort());

            await page.goto('/dashboard');

            // Try to perform an action that requires network
            const refreshButton = page.locator('button:has-text("Refresh"), button:has-text("Reload")').first();
            if (await refreshButton.isVisible()) {
                await refreshButton.click();
            }

            // Should show error message
            await expect(page.locator('text=/error|failed|try again/i')).toBeVisible();

            // Should provide retry option
            await expect(page.locator('button:has-text("Retry"), button:has-text("Try Again")')).toBeVisible();
        });

        test('handles empty states appropriately', async ({ page }) => {
            await page.goto('/meal-plans');

            // Mock empty meal plans
            await page.evaluate(() => {
                localStorage.setItem('mealPlans', JSON.stringify([]));
            });

            await page.reload();

            // Should show empty state
            await expect(page.locator('text=/no meal plans|create your first|get started/i')).toBeVisible();

            // Should provide action to create first meal plan
            await expect(page.locator('button:has-text("Create"), button:has-text("Get Started")')).toBeVisible();
        });

        test('validates form inputs properly', async ({ page }) => {
            await page.goto('/create-account');

            // Submit form with invalid data
            await page.fill('input[type="email"]', 'invalid-email');
            await page.fill('input[type="password"]', '123'); // Too short

            const submitButton = page.locator('button[type="submit"]').first();
            await submitButton.click();

            // Should show validation errors
            await expect(page.locator('text=/invalid email|email format/i')).toBeVisible();
            await expect(page.locator('text=/password.*short|password.*characters/i')).toBeVisible();

            // Form should not submit
            await expect(page).toHaveURL(/create-account|register|signup/);
        });
    });
});