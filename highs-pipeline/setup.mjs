#!/usr/bin/env node
// setup.mjs
// Run this script from the HiGHS directory to ensure the project structure exists.
// Example: node setup.mjs

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// --- Configuration ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename); // Should be the HiGHS directory

const directories = [
    'data/raw',
    'data/processed',
    'src/fetcher',
    'src/normalizer',
    'src/enricher',
    'src/sampler',
    'src/writer',
    'src/logger',
    'src/solver',
    'tools' // Ensure tools directory exists if build-meal-csv.mjs wasn't already in it
];

const filesToCreate = {
    // Basic package.json
    'package.json': JSON.stringify({
        name: "highs-meal-pipeline",
        version: "1.0.0",
        description: "Data pipeline for processing and optimizing meal plans using HiGHS.",
        type: "module", // Use ES modules
        main: "src/main_pipeline.mjs",
        scripts: {
            "start": "node src/main_pipeline.mjs",
            "setup": "node setup_pipeline.mjs",
            "build-csv": "node tools/build-meal-csv.mjs",
            "solve": "node src/solver/index.mjs"
        },
        author: "",
        license: "ISC",
        dependencies: {
            // Add initial dependencies - highs-addon might need manual setup
            // "highs-addon": "latest", // Add if you install it via npm
            "csv-parse": "^5.5.6", // From build-meal-csv.mjs
            "csv-stringify": "^6.5.0", // From build-meal-csv.mjs
            "node-fetch": "^3.3.2" // From build-meal-csv.mjs
        }
    }, null, 2) // Pretty print JSON
};

const filesToMove = [
    {
        source: 'restaurant_meals_8000_full.csv',
        destination: 'data/raw/restaurant_meals_8000_full.csv'
    },
    {
        source: 'index.js', // Original solver script
        destination: 'src/solver/index.mjs' // Rename to .mjs for consistency
    }
    // Keep tools/build-meal-csv.mjs where it is, just ensure tools dir exists
];

// --- Helper Functions ---
async function ensureDir(dirPath) {
    try {
        await fs.mkdir(path.join(__dirname, dirPath), { recursive: true });
        console.log(`✅ Directory created or already exists: ${dirPath}`);
    } catch (err) {
        console.error(`❌ Error creating directory ${dirPath}:`, err);
        throw err; // Stop script if directory creation fails critically
    }
}

async function createFile(filePath, content) {
    const fullPath = path.join(__dirname, filePath);
    try {
        // Check if file exists before writing
        await fs.access(fullPath);
        console.log(`🟡 File already exists, skipping: ${filePath}`);
    } catch (err) {
        // File does not exist, create it
        if (err.code === 'ENOENT') {
            try {
                await fs.writeFile(fullPath, content, 'utf8');
                console.log(`✅ File created: ${filePath}`);
            } catch (writeErr) {
                console.error(`❌ Error writing file ${filePath}:`, writeErr);
            }
        } else {
            // Other access error
            console.error(`❌ Error accessing file ${filePath}:`, err);
        }
    }
}

async function moveFile(sourcePath, destPath) {
    const fullSourcePath = path.join(__dirname, sourcePath);
    const fullDestPath = path.join(__dirname, destPath);
    try {
        await fs.access(fullSourcePath); // Check if source exists
        try {
            await fs.access(fullDestPath); // Check if destination exists
            console.log(`🟡 Destination file already exists, skipping move: ${destPath}`);
        } catch (destErr) {
            if (destErr.code === 'ENOENT') {
                // Destination doesn't exist, proceed with move
                await fs.rename(fullSourcePath, fullDestPath);
                console.log(`✅ File moved: ${sourcePath} -> ${destPath}`);
            } else {
                console.error(`❌ Error checking destination file ${destPath}:`, destErr);
            }
        }
    } catch (sourceErr) {
        if (sourceErr.code === 'ENOENT') {
            console.log(`🟡 Source file not found, skipping move: ${sourcePath}`);
        } else {
            console.error(`❌ Error accessing source file ${sourcePath}:`, sourceErr);
        }
    }
}

// --- Main Execution ---
async function setup() {
    console.log("🚀 Starting project setup...");

    // 1. Create Directories
    console.log("\n--- Creating Directories ---");
    for (const dir of directories) {
        await ensureDir(dir);
    }

    // 2. Create Placeholder Files
    console.log("\n--- Creating Placeholder Files ---");
    for (const [filePath, content] of Object.entries(filesToCreate)) {
        await createFile(filePath, content);
    }

    // 3. Move Existing Files
    console.log("\n--- Moving Existing Files ---");
    for (const { source, destination } of filesToMove) {
        await moveFile(source, destination);
    }

    console.log("\n🎉 Project setup complete!");
    console.log("Next steps:");
    console.log("1. Run 'npm install' or 'yarn install' to install dependencies.");
    console.log("2. Run the main pipeline using 'npm start' or 'node src/main_pipeline.mjs'.");
    console.log("3. Run the solver using 'npm run solve' or 'node src/solver/index.mjs'.");
}

setup().catch(err => {
    console.error("\n❌ Setup failed:", err);
    process.exit(1);
});
