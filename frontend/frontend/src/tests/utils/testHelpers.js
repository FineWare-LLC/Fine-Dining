// Test Utilities and Helpers for Fine Dining Application
import { performance } from 'node:perf_hooks';

/**
 * Creates a mock user object with default values
 * @param {Object} overrides - Properties to override in the mock user
 * @returns {Object} Mock user object
 */
export function createMockUser(overrides = {}) {
  return {
    _id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User',
    allergies: [],
    dislikedIngredients: [],
    nutritionTargets: {
      carbohydratesMin: 20,
      carbohydratesMax: 100,
      proteinMin: 10,
      proteinMax: 40,
      fatMin: 5,
      fatMax: 20,
      sodiumMin: 100,
      sodiumMax: 500
    },
    ...overrides
  };
}

/**
 * Creates a mock meal object with default values
 * @param {Object} overrides - Properties to override in the mock meal
 * @returns {Object} Mock meal object
 */
export function createMockMeal(overrides = {}) {
  return {
    _id: 'test-meal-id',
    name: 'Test Meal',
    price: 10.99,
    allergens: [],
    ingredients: ['ingredient1', 'ingredient2'],
    nutrition: {
      carbohydrates: 45,
      protein: 25,
      fat: 15,
      sodium: 350,
      calories: 400
    },
    restaurant: 'Test Restaurant',
    category: 'main',
    ...overrides
  };
}

/**
 * Creates multiple mock meals for testing
 * @param {number} count - Number of meals to create
 * @param {Object} baseOverrides - Base properties to apply to all meals
 * @returns {Array} Array of mock meal objects
 */
export function createMockMeals(count = 3, baseOverrides = {}) {
  return Array.from({ length: count }, (_, index) => 
    createMockMeal({
      _id: `test-meal-${index + 1}`,
      name: `Test Meal ${index + 1}`,
      price: 10 + index,
      ...baseOverrides
    })
  );
}

/**
 * Measures the execution time of an async function
 * @param {Function} fn - Async function to measure
 * @param {...any} args - Arguments to pass to the function
 * @returns {Promise<{result: any, duration: number}>} Result and duration in milliseconds
 */
export async function measureExecutionTime(fn, ...args) {
  const start = performance.now();
  const result = await fn(...args);
  const duration = performance.now() - start;
  return { result, duration };
}

/**
 * Creates a mock repository with common CRUD operations
 * @param {Object} mockData - Data to return from repository methods
 * @returns {Object} Mock repository object
 */
export function createMockRepository(mockData = {}) {
  return {
    find: async () => mockData.find || [],
    findById: async (id) => mockData.findById || { _id: id },
    create: async (data) => ({ _id: 'new-id', ...data }),
    update: async (id, data) => ({ _id: id, ...data }),
    delete: async (id) => ({ _id: id, deleted: true }),
    count: async () => mockData.count || 0,
    ...mockData.customMethods
  };
}

/**
 * Safely mocks a method and handles redefinition errors
 * @param {Object} testContext - Node.js test context
 * @param {Object} target - Object to mock
 * @param {string} methodName - Method name to mock
 * @param {Function} implementation - Mock implementation
 * @returns {boolean} True if mock was successful, false if skipped due to conflict
 */
export function safeMock(testContext, target, methodName, implementation) {
  try {
    testContext.mock.method(target, methodName, implementation);
    return true;
  } catch (err) {
    if (err.message.includes('Cannot redefine property')) {
      console.warn(`Mock conflict detected for ${methodName}, skipping...`);
      return false;
    }
    throw err;
  }
}

/**
 * Creates a test suite with common setup and teardown
 * @param {string} suiteName - Name of the test suite
 * @param {Function} setupFn - Setup function to run before tests
 * @param {Function} teardownFn - Teardown function to run after tests
 * @returns {Object} Test suite utilities
 */
export function createTestSuite(suiteName, setupFn = () => {}, teardownFn = () => {}) {
  let suiteData = {};

  return {
    setup: async () => {
      console.log(`Setting up test suite: ${suiteName}`);
      suiteData = await setupFn();
      return suiteData;
    },
    teardown: async () => {
      console.log(`Tearing down test suite: ${suiteName}`);
      await teardownFn(suiteData);
      suiteData = {};
    },
    getData: () => suiteData
  };
}

/**
 * Validates that an object has the expected structure
 * @param {Object} obj - Object to validate
 * @param {Object} expectedStructure - Expected structure with types
 * @returns {boolean} True if structure matches
 */
export function validateObjectStructure(obj, expectedStructure) {
  for (const [key, expectedType] of Object.entries(expectedStructure)) {
    if (!(key in obj)) {
      throw new Error(`Missing property: ${key}`);
    }
    
    const actualType = typeof obj[key];
    if (actualType !== expectedType && expectedType !== 'any') {
      throw new Error(`Property ${key} expected ${expectedType}, got ${actualType}`);
    }
  }
  return true;
}

/**
 * Creates a timeout promise for testing async operations
 * @param {number} ms - Timeout in milliseconds
 * @returns {Promise} Promise that rejects after timeout
 */
export function createTimeout(ms) {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(`Operation timed out after ${ms}ms`)), ms);
  });
}

/**
 * Runs a function with a timeout
 * @param {Function} fn - Function to run
 * @param {number} timeoutMs - Timeout in milliseconds
 * @returns {Promise} Promise that resolves with function result or rejects on timeout
 */
export async function withTimeout(fn, timeoutMs = 5000) {
  return Promise.race([
    fn(),
    createTimeout(timeoutMs)
  ]);
}