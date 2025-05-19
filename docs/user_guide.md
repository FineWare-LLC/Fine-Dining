# User Guide

This guide explains how to run optimization tasks and troubleshoot common issues.

## Command-line Usage

After installing dependencies (see [Getting Started](./getting_started.md)), you can run helper scripts from the `frontend` directory.

### Seed the database
```bash
npm run seed
```

### Run an optimization test
```bash
node scripts/test-optimization.mjs
```
This command connects to MongoDB and generates an optimized meal plan for a sample user.

### Overpass demo
Fetch nearby restaurants without using Google Places:
```bash
node scripts/overpass-demo.mjs <latitude> <longitude> [radius] [keyword]
```

## Example LP Problem
Below is a minimal linear program solved by the HiGHS addon:
```text
minimize: 3 x + 2 y
subject to:
 2 x +   y >= 5
   x + 3 y >= 5
 x >= 0
 y >= 0
```

## Example MIP Problem
```text
maximize: 4 x + 3 y
subject to:
 2 x + 2 y <= 7
 x >= 0, integer
 y >= 0, integer
```

Load either model through your own script and pass it to the solver. The `OptimizationService` exposes helper functions for building and solving these models.

For additional help see the [Troubleshooting](./troubleshooting.md) document.
