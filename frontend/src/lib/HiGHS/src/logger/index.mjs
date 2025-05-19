// src/logger/index.mjs
/**
 * Stores statistics throughout the pipeline and provides summary
 */
const stats = {
    startTime: null,
    endTime: null,
    steps: {},
    errors: []
};

/**
 * Records the start of a pipeline step
 * @param {string} step Name of the step
 * @param {number} inputCount Number of items input to the step
 */
export function startStep(step, inputCount) {
    if (!stats.startTime) {
        stats.startTime = new Date();
    }

    stats.steps[step] = {
        startTime: new Date(),
        inputCount
    };

    console.log(`[LOGGER] Starting ${step} step with ${inputCount} items`);
}

/**
 * Records the end of a pipeline step
 * @param {string} step Name of the step
 * @param {number} outputCount Number of items output from the step
 */
export function endStep(step, outputCount) {
    if (!stats.steps[step]) {
        stats.steps[step] = {};
    }

    const stepStats = stats.steps[step];
    stepStats.endTime = new Date();
    stepStats.outputCount = outputCount;
    stepStats.duration = stepStats.endTime - (stepStats.startTime || 0);
    stepStats.changeRate = stepStats.inputCount ? (outputCount / stepStats.inputCount) : 1;

    console.log(`[LOGGER] Completed ${step} step with ${outputCount} items (${stepStats.duration}ms)`);
}

/**
 * Records an error that occurred during the pipeline
 * @param {string} step Name of the step where the error occurred
 * @param {Error} error The error object
 */
export function recordError(step, error) {
    stats.errors.push({
        step,
        time: new Date(),
        message: error.message,
        stack: error.stack
    });

    console.error(`[LOGGER] Error in ${step} step:`, error.message);
}

/**
 * Logs a summary of the pipeline run
 */
export function logSummary() {
    console.log("Running logger step...");

    stats.endTime = new Date();
    const totalDuration = stats.endTime - (stats.startTime || stats.endTime);

    console.log("\n=== PIPELINE SUMMARY ===");
    console.log(`Total duration: ${totalDuration}ms (${(totalDuration/1000).toFixed(2)}s)`);

    console.log("\nStep statistics:");
    Object.entries(stats.steps).forEach(([step, stepStats]) => {
        console.log(`- ${step}: ${stepStats.inputCount || 0} → ${stepStats.outputCount || 0} items (${stepStats.duration || 0}ms)`);
    });

    console.log(`\nErrors: ${stats.errors.length}`);
    if (stats.errors.length > 0) {
        console.log("First 5 errors:");
        stats.errors.slice(0, 5).forEach((error, i) => {
            console.log(`  ${i+1}. [${error.step}] ${error.message}`);
        });
    }

    console.log("=======================");

    return stats;
}

/**
 * Executes the logging step and returns collected statistics
 * @returns {Object} Pipeline statistics
 */
export function run() {
    logSummary();
    return stats;
}