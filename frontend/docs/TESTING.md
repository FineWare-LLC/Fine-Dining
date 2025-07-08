# Node.js Testing Guide for Fine Dining Application

This document provides a comprehensive guide to the Node.js testing infrastructure set up for the Fine Dining application.

## Overview

The Fine Dining application uses a multi-layered testing approach with the following testing frameworks and tools:

- **Node.js Built-in Test Runner**: For unit tests, integration tests, and performance tests
- **Playwright**: For end-to-end (E2E) testing and component testing
- **Custom Test Utilities**: Helper functions for common testing patterns

## Test Structure

```
src/tests/
├── components/          # Playwright component tests
├── e2e/                # Playwright end-to-end tests
├── gpu/                # GPU performance tests
├── solver/             # Solver-specific tests
├── unit/               # Unit tests
└── utils/              # Test utilities and helpers
```

## Available Test Scripts

### Core Test Commands

```bash
# Run all unit, solver, and GPU tests
npm test

# Run only unit tests
npm run test:unit

# Run only solver tests
npm run test:solver

# Run only GPU tests
npm run test:gpu

# Run tests in watch mode (auto-rerun on file changes)
npm run test:watch

# Run tests with coverage reporting
npm run test:coverage
```

### Playwright Test Commands

```bash
# Run Playwright end-to-end tests
npm run test:e2e

# Run Playwright component tests
npm run test:components

# Run Playwright tests via custom script
npm run test:playwright

# Run all tests (unit + playwright)
npm run test:all
```

## Test Utilities

The application includes a comprehensive set of test utilities located in `src/tests/utils/testHelpers.js`:

### Mock Data Creation

```javascript
import { createMockUser, createMockMeal, createMockMeals } from '../utils/testHelpers.js';

// Create a mock user with default values
const user = createMockUser();

// Create a mock user with custom properties
const customUser = createMockUser({
  name: 'John Doe',
  allergies: ['peanuts', 'shellfish']
});

// Create a single mock meal
const meal = createMockMeal();

// Create multiple mock meals
const meals = createMockMeals(5, { restaurant: 'Test Restaurant' });
```

### Performance Testing

```javascript
import { measureExecutionTime, withTimeout } from '../utils/testHelpers.js';

// Measure function execution time
const { result, duration } = await measureExecutionTime(myAsyncFunction, arg1, arg2);

// Run function with timeout
const result = await withTimeout(slowFunction, 5000); // 5 second timeout
```

### Safe Mocking

```javascript
import { safeMock } from '../utils/testHelpers.js';

test('my test', async (t) => {
  // Safely mock a method, handling redefinition errors gracefully
  const mockSuccess = safeMock(t, MyModule, 'methodName', () => 'mocked result');
  
  if (!mockSuccess) {
    t.skip('Skipping due to mock conflict');
    return;
  }
  
  // Continue with test...
});
```

### Object Structure Validation

```javascript
import { validateObjectStructure } from '../utils/testHelpers.js';

// Validate that an object has the expected structure
validateObjectStructure(myObject, {
  id: 'string',
  name: 'string',
  count: 'number',
  active: 'boolean'
});
```

## Writing Tests

### Unit Test Example

```javascript
import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import { createMockUser, safeMock } from '../utils/testHelpers.js';

describe('UserService', () => {
  test('getUserById returns user data', async (t) => {
    const mockUser = createMockUser({ name: 'Test User' });
    
    // Mock the repository
    safeMock(t, UserRepository, 'findById', async () => mockUser);
    
    const result = await UserService.getUserById('test-id');
    
    assert.equal(result.name, 'Test User');
    assert.ok(result._id);
  });
});
```

### Performance Test Example

```javascript
import test from 'node:test';
import assert from 'node:assert/strict';
import { measureExecutionTime } from '../utils/testHelpers.js';

test('optimization completes within time limit', async () => {
  const { result, duration } = await measureExecutionTime(
    optimizationService.generateMealPlan,
    'user-id'
  );
  
  assert.ok(result.meals.length > 0);
  assert.ok(duration < 1000, `Execution took ${duration}ms, should be under 1000ms`);
});
```

## Best Practices

### 1. Use Test Utilities

Always use the provided test utilities for creating mock data and handling common testing patterns:

```javascript
// ✅ Good - Use test utilities
const user = createMockUser({ allergies: ['nuts'] });

// ❌ Avoid - Manual mock creation
const user = {
  _id: 'test-id',
  name: 'Test',
  // ... lots of boilerplate
};
```

### 2. Handle Mock Conflicts

Use `safeMock` to handle mock redefinition errors gracefully:

```javascript
// ✅ Good - Handle mock conflicts
const mockSuccess = safeMock(t, Module, 'method', mockImpl);
if (!mockSuccess) {
  t.skip('Mock conflict detected');
  return;
}

// ❌ Avoid - Direct mocking without conflict handling
t.mock.method(Module, 'method', mockImpl); // May fail with redefinition error
```

### 3. Validate Object Structures

Use `validateObjectStructure` to ensure objects have the expected shape:

```javascript
// ✅ Good - Validate structure
validateObjectStructure(result, {
  id: 'string',
  meals: 'object',
  totalCost: 'number'
});

// ❌ Avoid - Manual property checking
assert.ok(typeof result.id === 'string');
assert.ok(Array.isArray(result.meals));
// ... repetitive checks
```

### 4. Test Performance

Use performance testing utilities for critical operations:

```javascript
// ✅ Good - Measure performance
const { result, duration } = await measureExecutionTime(criticalFunction);
assert.ok(duration < PERFORMANCE_THRESHOLD);

// ✅ Good - Use timeouts for async operations
const result = await withTimeout(asyncOperation, 5000);
```

### 5. Organize Tests Logically

Group related tests using `describe` blocks:

```javascript
describe('MealService', () => {
  describe('findMeals', () => {
    test('returns meals for valid criteria', () => { /* ... */ });
    test('handles empty results', () => { /* ... */ });
    test('filters by allergies', () => { /* ... */ });
  });
  
  describe('createMeal', () => {
    test('creates meal with valid data', () => { /* ... */ });
    test('validates required fields', () => { /* ... */ });
  });
});
```

## Test Coverage

To run tests with coverage reporting:

```bash
npm run test:coverage
```

This will show:
- Line coverage
- Function coverage
- Branch coverage
- Statement coverage

## Continuous Integration

The testing setup is designed to work well in CI environments:

- Tests run quickly and reliably
- Mock conflicts are handled gracefully
- Missing dependencies are skipped appropriately
- Performance tests have reasonable thresholds

## Troubleshooting

### Common Issues

1. **Mock Redefinition Errors**
   - Use `safeMock` utility
   - Check if tests are running in the correct order
   - Consider isolating tests that have mock conflicts

2. **Timeout Issues**
   - Use `withTimeout` for async operations
   - Increase timeout values for slow operations
   - Check for infinite loops or hanging promises

3. **Performance Test Failures**
   - Adjust performance thresholds based on environment
   - Use `measureExecutionTime` to get accurate measurements
   - Consider system load when running performance tests

4. **Missing Dependencies**
   - Tests will skip gracefully when dependencies are missing
   - Check console output for skip reasons
   - Install missing dependencies if needed

### Debug Mode

To run tests with additional debugging information:

```bash
# Run with Node.js debugging
node --inspect --test src/tests/unit/*test.js

# Run with verbose output
npm test -- --verbose
```

## Examples

See `src/tests/unit/testHelpers.demo.test.js` for comprehensive examples of using all test utilities and patterns.

## Contributing

When adding new tests:

1. Use the established patterns and utilities
2. Add appropriate error handling
3. Include performance tests for critical paths
4. Document any new testing utilities
5. Ensure tests are deterministic and reliable

For questions or issues with the testing setup, refer to the existing test files for examples or consult the team.