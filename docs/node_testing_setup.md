# Node.js Testing Setup

This project uses Node's built-in test runner for unit and solver tests located in the `frontend` directory. The tests live under `src/tests/` and cover utilities, solver logic, and GPU helpers.

## Running npm test

From the `frontend` directory run:

```bash
npm test
```

This invokes the script defined in `package.json` which executes:

```bash
node --test src/tests/unit/*test.js src/tests/solver/*test.js src/tests/gpu/*test.mjs
```

All test files matching these globs are executed with the Node.js test runner. You can run a single test by passing its path directly:

```bash
node --test src/tests/unit/sanitize.test.js
```

## Mocking Patterns

The codebase relies on lightweight manual stubs rather than a dedicated mocking library. Typical patterns include:

- Simple function stubs for store hooks or callbacks. Example from `NewHeader.spec.js`:

```javascript
// Mock for useDashStore - using a simple function instead of jest.fn()
const mockToggleDrawer = () => {};
```

- Passing plain objects that mimic real data. Solver tests build a `sampleData` object to drive the optimizer:

```javascript
let runOptimization;
try {
  ({ runOptimization } = await import('../../services/OptimizationService.js'));
} catch (err) {
  test('runOptimization can be executed concurrently', { skip: true }, () => {});
}
```

These stubs are created inline within each test file. When optional dependencies are missing the tests are skipped using the `{ skip: true }` option. Playwright component tests follow a similar approach, interacting with real components and manually providing any required props.
