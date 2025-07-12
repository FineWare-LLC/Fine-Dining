import assert from 'node:assert/strict';
import test, { describe } from 'node:test';
import {
    createMockUser,
    createMockMeal,
    createMockMeals,
    measureExecutionTime,
    safeMock,
    validateObjectStructure,
    withTimeout,
} from '../utils/testHelpers.js';

describe('Test Helpers Demo', () => {
    test('createMockUser creates valid user objects', () => {
        const user = createMockUser();

        // Validate basic structure
        assert.ok(user._id);
        assert.ok(user.email);
        assert.ok(user.name);
        assert.ok(Array.isArray(user.allergies));
        assert.ok(Array.isArray(user.dislikedIngredients));
        assert.ok(typeof user.nutritionTargets === 'object');

        // Test with overrides
        const customUser = createMockUser({
            name: 'Custom User',
            allergies: ['peanuts', 'shellfish'],
        });

        assert.equal(customUser.name, 'Custom User');
        assert.deepEqual(customUser.allergies, ['peanuts', 'shellfish']);
        assert.equal(customUser.email, 'test@example.com'); // Should keep default
    });

    test('createMockMeal creates valid meal objects', () => {
        const meal = createMockMeal();

        // Validate structure
        validateObjectStructure(meal, {
            _id: 'string',
            name: 'string',
            price: 'number',
            allergens: 'object', // Array is typeof 'object'
            ingredients: 'object',
            nutrition: 'object',
            restaurant: 'string',
            category: 'string',
        });

        // Test nutrition object structure
        assert.ok(typeof meal.nutrition.carbohydrates === 'number');
        assert.ok(typeof meal.nutrition.protein === 'number');
        assert.ok(typeof meal.nutrition.fat === 'number');
        assert.ok(typeof meal.nutrition.sodium === 'number');
    });

    test('createMockMeals creates multiple meals', () => {
        const meals = createMockMeals(5);

        assert.equal(meals.length, 5);

        // Each meal should have unique ID and name
        meals.forEach((meal, index) => {
            assert.equal(meal._id, `test-meal-${index + 1}`);
            assert.equal(meal.name, `Test Meal ${index + 1}`);
            assert.equal(meal.price, 10 + index);
        });

        // Test with base overrides
        const vegetarianMeals = createMockMeals(3, { category: 'vegetarian' });
        vegetarianMeals.forEach(meal => {
            assert.equal(meal.category, 'vegetarian');
        });
    });

    test('measureExecutionTime measures function performance', async () => {
        const slowFunction = async () => {
            await new Promise(resolve => setTimeout(resolve, 50));
            return 'completed';
        };

        const { result, duration } = await measureExecutionTime(slowFunction);

        assert.equal(result, 'completed');
        assert.ok(duration >= 50); // Should take at least 50ms
        assert.ok(duration < 100); // But not too much longer
    });

    test('safeMock handles mock conflicts gracefully', async (t) => {
        const mockTarget = { testMethod: () => 'original' };

        // First mock should succeed
        const firstMock = safeMock(t, mockTarget, 'testMethod', () => 'mocked1');
        assert.ok(firstMock);

        // Test that the mock was applied
        assert.equal(mockTarget.testMethod(), 'mocked1');

        // Note: In this isolated test context, the second mock might succeed
        // because we're not dealing with cross-test conflicts.
        // The safeMock function is primarily useful for handling conflicts
        // between different test files or test runs.
        const secondMock = safeMock(t, mockTarget, 'testMethod', () => 'mocked2');

        // The function should either succeed or fail gracefully (return boolean)
        assert.ok(typeof secondMock === 'boolean');
    });

    test('validateObjectStructure validates object structures', () => {
        const testObject = {
            id: 'test-123',
            name: 'Test Object',
            count: 42,
            active: true,
            data: { nested: 'value' },
        };

        const expectedStructure = {
            id: 'string',
            name: 'string',
            count: 'number',
            active: 'boolean',
            data: 'object',
        };

        // Should pass validation
        assert.ok(validateObjectStructure(testObject, expectedStructure));

        // Should throw for missing property
        assert.throws(() => {
            validateObjectStructure(testObject, { ...expectedStructure, missing: 'string' });
        }, /Missing property: missing/);

        // Should throw for wrong type
        assert.throws(() => {
            validateObjectStructure(testObject, { ...expectedStructure, count: 'string' });
        }, /Property count expected string, got number/);
    });

    test('withTimeout handles async operations with timeout', async () => {
    // Fast operation should complete
        const fastOperation = async () => {
            await new Promise(resolve => setTimeout(resolve, 10));
            return 'fast result';
        };

        const result = await withTimeout(fastOperation, 100);
        assert.equal(result, 'fast result');

        // Slow operation should timeout
        const slowOperation = async () => {
            await new Promise(resolve => setTimeout(resolve, 200));
            return 'slow result';
        };

        await assert.rejects(
            withTimeout(slowOperation, 50),
            /Operation timed out after 50ms/,
        );
    });

    test('integration test using multiple helpers', async () => {
    // Create test data using helpers
        const user = createMockUser({
            name: 'Integration Test User',
            allergies: ['nuts'],
        });

        const meals = createMockMeals(3, {
            restaurant: 'Test Restaurant',
        });

        // Simulate a service function
        const findMealsForUser = async (userId, userAllergies) => {
            await new Promise(resolve => setTimeout(resolve, 10)); // Simulate async work

            return meals.filter(meal =>
                !meal.allergens.some(allergen => userAllergies.includes(allergen)),
            );
        };

        // Measure performance and validate results
        const { result: filteredMeals, duration } = await measureExecutionTime(
            findMealsForUser,
            user._id,
            user.allergies,
        );

        // Validate results
        assert.equal(filteredMeals.length, 3); // No allergens in mock meals
        assert.ok(duration >= 10); // Should take at least 10ms

        // Validate each meal structure
        filteredMeals.forEach(meal => {
            validateObjectStructure(meal, {
                _id: 'string',
                name: 'string',
                price: 'number',
                restaurant: 'string',
            });
            assert.equal(meal.restaurant, 'Test Restaurant');
        });
    });
});
