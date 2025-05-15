# Playwright Component Testing Guide

This guide provides instructions for setting up and running Playwright Component Tests in the Fine-Dining project.

## Table of Contents

- [Installation](#installation)
- [Running Tests](#running-tests)
- [Configuration](#configuration)
- [Common Pitfalls](#common-pitfalls)
- [Debugging](#debugging)

## Installation

To set up Playwright Component Testing, follow these steps:

1. Install dependencies:
   ```bash
   npm install
   ```

2. Install Playwright browsers (only needed once):
   ```bash
   npx playwright install chromium
   ```

## Running Tests

To run component tests:

```bash
npm run test:components
```

This will run all component tests in the `src/tests/components` directory.

To run a specific test file:

```bash
npx playwright test src/tests/components/yourTestFile.spec.js --config=playwright-ct.config.js
```

## Configuration

The component testing configuration is in `playwright-ct.config.js`. Key settings include:

- `testDir`: Location of component tests (`./src/tests/components`)
- `ctPort`: Port for the component testing server (3100)
- `ctViteConfig`: Vite configuration for component testing

The component test environment is set up in `playwright/index.js`, which includes:
- Global CSS imports
- Context providers
- Before/after mount hooks

## Common Pitfalls

### Version Skew

Ensure all Playwright packages are on the same version:
- `@playwright/test`
- `@playwright/experimental-ct-react`

Version mismatches can cause internal API breakages.

### Missing Root Element

The component testing HTML template (`playwright/index.html`) must contain:
```html
<div id="root"></div>
```

Without this element, components cannot be mounted.

### Environment Variables

Component tests require `NODE_ENV=test-ct`. This is set automatically in:
- The `test:components` script in `package.json`
- The `playwright-ct.config.js` file

### Port Conflicts

If port 3100 is already in use, tests will fail. You can change the port in:
- `playwright-ct.config.js` (`ctPort` and `ctViteConfig.server.port`)

## Debugging

For detailed logs, run:

```bash
DEBUG=pw:ct* npm run test:components
```

If you encounter URL-related errors, use the `mountWithGuard` utility:

```javascript
import { mountWithGuard } from '../utils/mountWithGuard';

test('Component test', async ({ mount, page }) => {
  const component = await mountWithGuard(page, mount, <YourComponent />);
  // Test assertions...
});
```

This utility provides better error messages when the component testing server fails to start.