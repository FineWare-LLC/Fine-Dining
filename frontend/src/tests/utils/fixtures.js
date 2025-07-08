/**
 * @fileoverview Test fixtures and data factories for consistent test data
 */

/**
 * Creates a mock user object with default values
 * @param {Object} overrides - Properties to override in the default user
 * @returns {Object} Mock user object
 */
export function createMockUser(overrides = {}) {
  return {
    id: 'user-123',
    name: 'Test User',
    email: 'test@example.com',
    role: 'user',
    avatarUrl: 'https://example.com/avatar.jpg',
    createdAt: new Date('2024-01-01'),
    preferences: {
      theme: 'light',
      notifications: true,
    },
    ...overrides,
  };
}

/**
 * Creates a mock admin user object
 * @param {Object} overrides - Properties to override in the default admin
 * @returns {Object} Mock admin user object
 */
export function createMockAdmin(overrides = {}) {
  return createMockUser({
    role: 'admin',
    name: 'Admin User',
    email: 'admin@example.com',
    ...overrides,
  });
}

/**
 * Creates mock meal plan data
 * @param {Object} overrides - Properties to override in the default meal plan
 * @returns {Object} Mock meal plan object
 */
export function createMockMealPlan(overrides = {}) {
  return {
    id: 'meal-plan-123',
    name: 'Test Meal Plan',
    description: 'A test meal plan for testing purposes',
    meals: [
      {
        id: 'meal-1',
        name: 'Breakfast',
        calories: 350,
        ingredients: ['eggs', 'toast', 'orange juice'],
      },
      {
        id: 'meal-2',
        name: 'Lunch',
        calories: 500,
        ingredients: ['chicken', 'rice', 'vegetables'],
      },
    ],
    totalCalories: 850,
    createdAt: new Date('2024-01-01'),
    ...overrides,
  };
}

/**
 * Creates mock GraphQL response data
 * @param {Object} data - The data to return in the GraphQL response
 * @param {Array} errors - Optional errors to include in the response
 * @returns {Object} Mock GraphQL response
 */
export function createMockGraphQLResponse(data, errors = null) {
  const response = { data };
  if (errors) {
    response.errors = errors;
  }
  return response;
}

/**
 * Creates mock authentication token
 * @param {Object} payload - JWT payload data
 * @returns {string} Mock JWT token
 */
export function createMockAuthToken(payload = {}) {
  const defaultPayload = {
    userId: 'user-123',
    email: 'test@example.com',
    role: 'user',
    exp: Math.floor(Date.now() / 1000) + (60 * 60), // 1 hour from now
    ...payload,
  };
  
  // This is a mock token for testing - not a real JWT
  return `mock.jwt.token.${btoa(JSON.stringify(defaultPayload))}`;
}

/**
 * Creates mock form data for testing forms
 * @param {Object} overrides - Properties to override in the default form data
 * @returns {Object} Mock form data
 */
export function createMockFormData(overrides = {}) {
  return {
    name: 'Test Name',
    email: 'test@example.com',
    password: 'TestPassword123!',
    confirmPassword: 'TestPassword123!',
    age: 25,
    height: 170,
    weight: 70,
    activityLevel: 'moderate',
    dietaryRestrictions: [],
    ...overrides,
  };
}

/**
 * Creates mock API error response
 * @param {string} message - Error message
 * @param {number} status - HTTP status code
 * @returns {Object} Mock error response
 */
export function createMockError(message = 'Test error', status = 400) {
  return {
    message,
    status,
    code: 'TEST_ERROR',
    timestamp: new Date().toISOString(),
  };
}

/**
 * Creates mock component props for testing
 * @param {Object} overrides - Properties to override in the default props
 * @returns {Object} Mock component props
 */
export function createMockProps(overrides = {}) {
  return {
    user: createMockUser(),
    onSubmit: () => {},
    onCancel: () => {},
    loading: false,
    error: null,
    ...overrides,
  };
}