// @ts-check
import { test, expect } from '@playwright/experimental-ct-react';
import DailySummary from '../../components/Dashboard/DailySummary';
import MealCatalog from '../../components/Dashboard/MealCatalog';
import WelcomeBanner from '../../components/Dashboard/WelcomeBanner';

// Mock data for testing
const mockUser = {
    name: 'Test User',
    email: 'test@example.com',
    preferences: {
        dietaryRestrictions: ['vegetarian'],
        allergies: ['nuts'],
    },
};

const mockMealData = [
    {
        id: 1,
        name: 'Grilled Chicken Salad',
        calories: 350,
        protein: 30,
        carbs: 15,
        fat: 20,
        restaurant: 'Healthy Eats',
        price: 12.99,
    },
    {
        id: 2,
        name: 'Quinoa Bowl',
        calories: 420,
        protein: 15,
        carbs: 65,
        fat: 12,
        restaurant: 'Green Kitchen',
        price: 14.50,
    },
];

const mockDailySummary = {
    totalCalories: 1850,
    targetCalories: 2000,
    protein: 120,
    carbs: 200,
    fat: 65,
    mealsPlanned: 3,
    waterIntake: 6,
};

test.describe('Dashboard Components', () => {
    test.describe('DailySummary Component', () => {
        test('renders daily summary with correct data', async ({ mount }) => {
            const component = await mount(
                <DailySummary
                    summary={mockDailySummary}
                    user={mockUser}
                />,
            );

            // Check if calorie information is displayed
            await expect(component.getByText('1850')).toBeVisible();
            await expect(component.getByText('2000')).toBeVisible();

            // Check if macronutrients are displayed
            await expect(component.getByText('120')).toBeVisible(); // protein
            await expect(component.getByText('200')).toBeVisible(); // carbs
            await expect(component.getByText('65')).toBeVisible(); // fat
        });

        test('shows progress indicators', async ({ mount }) => {
            const component = await mount(
                <DailySummary
                    summary={mockDailySummary}
                    user={mockUser}
                />,
            );

            // Check for progress bars or indicators
            const progressElements = component.locator('[role="progressbar"]');
            await expect(progressElements.first()).toBeVisible();
        });

        test('handles missing data gracefully', async ({ mount }) => {
            const component = await mount(
                <DailySummary
                    summary={{}}
                    user={mockUser}
                />,
            );

            // Component should render without errors even with empty data
            await expect(component).toBeVisible();
        });
    });

    test.describe('MealCatalog Component', () => {
        test('renders meal catalog with meal items', async ({ mount }) => {
            const component = await mount(
                <MealCatalog
                    meals={mockMealData}
                    onMealSelect={() => {}}
                />,
            );

            // Check if meal names are displayed
            await expect(component.getByText('Grilled Chicken Salad')).toBeVisible();
            await expect(component.getByText('Quinoa Bowl')).toBeVisible();

            // Check if restaurant names are displayed
            await expect(component.getByText('Healthy Eats')).toBeVisible();
            await expect(component.getByText('Green Kitchen')).toBeVisible();
        });

        test('displays meal nutritional information', async ({ mount }) => {
            const component = await mount(
                <MealCatalog
                    meals={mockMealData}
                    onMealSelect={() => {}}
                />,
            );

            // Check if calorie information is displayed
            await expect(component.getByText('350')).toBeVisible();
            await expect(component.getByText('420')).toBeVisible();

            // Check if prices are displayed
            await expect(component.getByText('$12.99')).toBeVisible();
            await expect(component.getByText('$14.50')).toBeVisible();
        });

        test('handles meal selection', async ({ mount }) => {
            const component = await mount(
                <MealCatalog
                    meals={mockMealData}
                    onMealSelect={() => {}}
                />,
            );

            // Find and click on a meal item
            const mealItem = component.getByText('Grilled Chicken Salad');
            await expect(mealItem).toBeVisible();
            await mealItem.click();
        });

        test('shows empty state when no meals available', async ({ mount }) => {
            const component = await mount(
                <MealCatalog
                    meals={[]}
                    onMealSelect={() => {}}
                />,
            );

            // Should show empty state message
            await expect(component.getByText(/no meals/i)).toBeVisible();
        });
    });

    test.describe('WelcomeBanner Component', () => {
        test('displays welcome message with user name', async ({ mount }) => {
            const component = await mount(
                <WelcomeBanner user={mockUser} />,
            );

            // Check if welcome message includes user name
            await expect(component.getByText(/welcome/i)).toBeVisible();
            await expect(component.getByText('Test User')).toBeVisible();
        });

        test('shows time-appropriate greeting', async ({ mount }) => {
            const component = await mount(
                <WelcomeBanner user={mockUser} />,
            );

            // Should show some form of greeting
            const greetingRegex = /(good morning|good afternoon|good evening|hello|welcome)/i;
            await expect(component.locator(`text=${greetingRegex}`)).toBeVisible();
        });

        test('renders without user data', async ({ mount }) => {
            const component = await mount(
                <WelcomeBanner />,
            );

            // Should render with default greeting
            await expect(component.getByText(/welcome/i)).toBeVisible();
        });
    });
});
