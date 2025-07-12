/**
 * highs-pipeline/index.js
 * ------------------------------------------------------------
 * Feasibility MIP: build a one-day meal plan that satisfies
 * calorie, protein, carbohydrate, and sodium ranges using HiGHS.
 *
 * Servings are truncated to whole or half servings.
 * ------------------------------------------------------------
 * Prerequisites:
 *   npm i highs-addon
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parse } from 'csv-parse';
import highsDefault from 'highs-addon';
import { interpretStatus } from '../../../../io/solverOutput.js';
import { autoTune, loadConfig } from '../tuner/index.mjs';

const { Solver, solverVersion } = highsDefault;
const STATUS_OPTIMAL = 7; // HiGHS status code for Optimal

// ─────────────────────────────────────────────────────────────
// 1. Sanity-check HiGHS load
// ─────────────────────────────────────────────────────────────
if (typeof Solver !== 'function') {
    console.error('❌ Could not locate Solver class in highs-addon.');
    process.exit(1);
}
console.log(`🔍 HiGHS version: ${solverVersion()}`);

// ─────────────────────────────────────────────────────────────
// 2. Read & parse the 8 000-meal CSV
// ─────────────────────────────────────────────────────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MEAL_FILE = path.join(__dirname, '../../data/processed/restaurant_meals_processed.csv');
const CONFIG_FILE = path.join(__dirname, '../tuner/config.json');
const ARGS = process.argv.slice(2);
const DO_TUNE = ARGS.includes('--tune');

async function readMeals() {
    return new Promise((resolve, reject) => {
        const mealNames = [];
        const cals = [];
        const prots = [];
        const carbs = [];
        const sods = [];

        const parser = parse({ columns: true, trim: true });

        parser.on('data', row => {
            mealNames.push(row.meal_name);
            cals.push (parseFloat(row.calories));
            prots.push (parseFloat(row.protein));
            carbs.push (parseFloat(row.carbohydrates));
            sods.push (parseFloat(row.sodium));
        });

        parser.on('error', err => reject(err));

        parser.on('end', () => {
            const n = mealNames.length;
            resolve({
                mealCount: n,
                mealNames,
                calories: Float32Array.from(cals),
                protein:  Float32Array.from(prots),
                carbs:    Float32Array.from(carbs),
                sodium:   Float32Array.from(sods),
            });
        });

        fs.createReadStream(MEAL_FILE)
            .on('error', err => reject(err))
            .pipe(parser);
    });
}

// ─────────────────────────────────────────────────────────────
// 3. Build the HiGHS Model with half-serving integer vars
// ─────────────────────────────────────────────────────────────
function buildMealPlanModel({ mealCount, calories, protein, carbs, sodium }) {
    // Variables x_i = number of HALF-servings of meal i
    const columnCount = mealCount;
    const columnLowerBounds = new Float32Array(mealCount).fill(0);
    const columnUpperBounds = new Float32Array(mealCount).fill(6); // max 3 servings = 6 half-servings
    const objectiveWeights = new Float32Array(mealCount).fill(0);
    const isMaximization = false; // minimize 0

    // Nutrient constraints (unchanged)
    const rowCount = 4;
    const rowLowerBounds = new Float32Array([2200, 100, 250, 1500]);
    const rowUpperBounds = new Float32Array([2600, 160, 350, 2300]);

    // Sparse matrix: for each half-serving variable we halve its nutrient
    const offsets = new Int32Array([0,
        mealCount,
        2*mealCount,
        3*mealCount,
        4*mealCount,
    ]);

    const indices = new Int32Array(4 * mealCount);
    for (let r = 0; r < 4; ++r) {
        for (let c = 0; c < mealCount; ++c) {
            indices[r * mealCount + c] = c;
        }
    }

    const values = new Float32Array(4 * mealCount);
    // Row 0: calories per HALF-serving = calories[i] * 0.5
    // Row 1: protein per HALF-serving = protein[i] * 0.5
    // etc.
    for (let i = 0; i < mealCount; ++i) {
        values[0 * mealCount + i] = calories[i] * 0.5;
        values[1 * mealCount + i] = protein[i] * 0.5;
        values[2 * mealCount + i] = carbs[i] * 0.5;
        values[3 * mealCount + i] = sodium[i] * 0.5;
    }

    return {
        columnCount,
        columnLowerBounds,
        columnUpperBounds,
        rowCount,
        rowLowerBounds,
        rowUpperBounds,
        weights: { offsets, indices, values },
        objectiveLinearWeights: objectiveWeights,
        isMaximization,
    };
}

// ─────────────────────────────────────────────────────────────
// 4. Solve & Display (truncate to .0 or .5 servings)
// ─────────────────────────────────────────────────────────────
async function main() {
    const data = await readMeals();
    console.log(`🥗 Loaded ${data.mealCount} meals from CSV.`);
    const model = buildMealPlanModel(data);

    let options = loadConfig(CONFIG_FILE);
    if (DO_TUNE) {
        console.log('🔧 Auto-tuning solver parameters...');
        options = await autoTune(data, buildMealPlanModel, CONFIG_FILE);
    }

    const solver = new Solver();
    Object.entries(options).forEach(([k, v]) => {
        try { solver.setOptionValue(k, v); } catch (_) {}
    });
    solver.passModel(model);
    console.log('✅ Model transferred to HiGHS – solving…');

    solver.run(err => {
        if (err) {
            console.error('❌ HiGHS error:', err);
            return;
        }

        const status = solver.getModelStatus();
        console.log(`📊 Solver status code: ${status}`);
        if (status !== STATUS_OPTIMAL) {
            const { message } = interpretStatus(status);
            console.warn(`⚠ ${message}`);
        }

        const info = solver.getInfo();
        const sol = solver.getSolution();

        console.log('\n───────── Meal Plan Solution ─────────');
        console.log(`Objective value: ${info.objective_function_value.toFixed(2)}\n`);

        const totals = { kcal:0, prot:0, carb:0, sod:0 };
        console.log('Selected Meals & Servings:');
        sol.columnValues.forEach((halfServings, i) => {
            if (halfServings > 0.5) {
                // round to nearest .5
                const servings = Math.round(halfServings) / 2;
                console.log(` • ${data.mealNames[i]}: ${servings.toFixed(1)} servings`);
                totals.kcal += servings * data.calories[i];
                totals.prot += servings * data.protein[i];
                totals.carb += servings * data.carbs[i];
                totals.sod += servings * data.sodium[i];
            }
        });

        console.log('\nDaily Nutrient Totals:');
        console.table({
            'Calories (kcal)': { Value: Math.round(totals.kcal), Target: `${model.rowLowerBounds[0]}–${model.rowUpperBounds[0]}` },
            'Protein (g)'    : { Value: totals.prot.toFixed(1), Target: `${model.rowLowerBounds[1]}–${model.rowUpperBounds[1]}` },
            'Carbs (g)'      : { Value: totals.carb.toFixed(1), Target: `${model.rowLowerBounds[2]}–${model.rowUpperBounds[2]}` },
            'Sodium (mg)'    : { Value: Math.round(totals.sod), Target: `${model.rowLowerBounds[3]}–${model.rowUpperBounds[3]}` },
        });
        console.log('─────────────────────────────────────────');
    });
}

export { readMeals, buildMealPlanModel, main };

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    main().catch(e => {
        console.error('❌ Unexpected failure:', e);
        process.exit(1);
    });
}
