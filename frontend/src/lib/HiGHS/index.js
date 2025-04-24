// src/lib/HiGHS/index.js

// ─── Imports & Sanity Checks ─────────────────────────────────────────────────

import highsDefault from 'highs-addon';
const { Solver, solverVersion } = highsDefault;

if (typeof Solver !== 'function') {
    console.error('❌ Failed to load Solver class from highs-addon. Imported module was:', highsDefault);
    process.exit(1);
}

console.log(`🔍 HiGHS version: ${solverVersion()}`);


// ─── Problem Definition ──────────────────────────────────────────────────────

/**
 * Builds the small test LP:
 *
 *   minimize    x0 + x1
 *   subject to  x0 ≥ 2
 *               x1 ≥ 1
 *
 * Expected solution: x0 = 2, x1 = 1, objective = 3
 *
 * @returns {import('highs-addon').Model}
 */
function buildTestModel() {
    // Number of decision variables
    const columnCount = 2;

    // Bounds for x0 and x1: [lower, upper]
    const columnLowerBounds = new Float64Array([0.0, 0.0]);
    const columnUpperBounds = new Float64Array([Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY]);

    // Number of constraints
    const rowCount = 2;

    // Constraint bounds: x0 ≥ 2  and  x1 ≥ 1
    const rowLowerBounds = new Float64Array([2.0, 1.0]);
    const rowUpperBounds = new Float64Array([Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY]);

    // Row-oriented sparse matrix:
    //   Row 0: [1  0]
    //   Row 1: [0  1]
    //
    // offsets: cumulative count per row  →  [0, 1, 2]
    // indices: column indices of nonzeros →  [0, 1]
    // values:  the nonzero entries       →  [1, 1]
    const weights = {
        offsets: new Int32Array([0, 1, 2]),
        indices: new Int32Array([0, 1]),
        values:  new Float64Array([1.0, 1.0]),
    };

    // Objective = x0 + x1  →  weights [1, 1]
    // isMaximization = false → we want to minimize
    const objectiveLinearWeights = new Float64Array([1.0, 1.0]);
    const isMaximization = false;

    return {
        columnCount,
        columnLowerBounds,
        columnUpperBounds,
        rowCount,
        rowLowerBounds,
        rowUpperBounds,
        weights,
        objectiveLinearWeights,
        isMaximization,
    };
}


// ─── Solver Invocation ────────────────────────────────────────────────────────

async function runSimpleOptimization() {
    const solver = new Solver();
    console.log('✅ Created HiGHS Solver instance.');

    // Build and pass the model
    const model = buildTestModel();
    try {
        solver.passModel(model);
        console.log('✅ Model data passed to HiGHS.');
    } catch (err) {
        console.error('❌ Error in passModel():', err);
        return;
    }

    // Run the solver (uses callback style)
    solver.run((err) => {
        if (err) {
            console.error('❌ Solver run error:', err);
            return;
        }

        // Fetch status, info, and solution
        const status = solver.getModelStatus();
        const info   = solver.getInfo();
        const sol    = solver.getSolution();

        console.log('\n--- Results ---');
        console.log('Model Status Code:', status);
        console.log('Objective Value:', info.objective_function_value);
        console.log('Variable Values:', Array.from(sol.columnValues));

        // Validate expected result
        const [x0, x1] = sol.columnValues;
        if (
            Math.abs(x0 - 2.0) < 1e-6 &&
            Math.abs(x1 - 1.0) < 1e-6 &&
            Math.abs(info.objective_function_value - 3.0) < 1e-6
        ) {
            console.log('🎉 SUCCESS: Solution matches expected (x0=2, x1=1, obj=3).');
        } else {
            console.warn('⚠️ WARNING: Unexpected solution.');
        }
        console.log('----------------\n');
    });
}

runSimpleOptimization();
