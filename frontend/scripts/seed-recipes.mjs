import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { dbConnect } from '../src/lib/dbConnect.ts';
import { RecipeModel } from '../src/models/Recipe/index.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const defaultSeedPath = path.join(__dirname, '..', 'data', 'recipe_seed', 'full_meal_recipes_100.json');
const seedPath = process.argv.find((arg) => arg.endsWith('.json'))
    ? path.resolve(process.argv.find((arg) => arg.endsWith('.json')))
    : defaultSeedPath;
const dryRun = process.argv.includes('--dry-run');

dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config({ path: path.join(__dirname, '..', '.env.local'), override: true });

if (!process.env.MONGODB_URI) {
    process.env.MONGODB_URI = 'mongodb://localhost:27017/fineDiningApp';
}

const affiliateTemplates = {
    Instacart: process.env.INSTACART_AFFILIATE_URL_TEMPLATE || '',
    Walmart: process.env.WALMART_AFFILIATE_URL_TEMPLATE || '',
};

const affiliateDisclosure = process.env.FINE_DINING_AFFILIATE_DISCLOSURE
    || 'Fine Dining may earn a commission from qualifying grocery purchases.';

const REQUIRED_SOURCE_DETAILS_FIELDS = [
    'siteName',
    'extractionMethod',
    'copyrightReviewStatus',
    'transformationNotes',
    'nutritionSource',
    'pricingSource',
];

function applyTemplate(template, ingredient, option) {
    const encodedQuery = encodeURIComponent(ingredient.affiliateSearchTerm || ingredient.canonicalName || ingredient.name);
    return template
        .replaceAll('{{query}}', ingredient.affiliateSearchTerm || ingredient.canonicalName || ingredient.name)
        .replaceAll('{{encodedQuery}}', encodedQuery)
        .replaceAll('{{url}}', encodeURIComponent(option.url));
}

function getRecipeName(recipe) {
    return typeof recipe?.recipeName === 'string' && recipe.recipeName.trim()
        ? recipe.recipeName.trim()
        : 'Recipe';
}

function normalizeSeedText(value) {
    return typeof value === 'string' ? value.trim() : '';
}

export function validateRecipeSourceProvenance(recipe) {
    const recipeName = getRecipeName(recipe);
    const source = normalizeSeedText(recipe?.source);
    if (!source) {
        throw new Error(`${recipeName}: missing source`);
    }

    const sourceDetails = recipe?.sourceDetails;
    if (!sourceDetails || typeof sourceDetails !== 'object') {
        throw new Error(`${recipeName}: missing sourceDetails`);
    }

    const missingFields = REQUIRED_SOURCE_DETAILS_FIELDS.filter((field) => {
        const value = sourceDetails[field];
        return typeof value !== 'string' || !value.trim();
    });

    if (missingFields.length > 0) {
        throw new Error(`${recipeName}: missing sourceDetails ${missingFields.join(', ')}`);
    }
}

function withAffiliateLinks(recipe) {
    return {
        ...recipe,
        ingredients: recipe.ingredients.map((ingredient) => ({
            ...ingredient,
            purchaseOptions: ingredient.purchaseOptions.map((option) => {
                const template = affiliateTemplates[option.retailer];
                if (!template) {
                    return option;
                }
                return {
                    ...option,
                    affiliateUrl: applyTemplate(template, ingredient, option),
                    monetizationStatus: 'READY',
                    disclosure: affiliateDisclosure,
                };
            }),
        })),
    };
}

function buildRecipeUpsertOperations(recipes) {
    return recipes.map((recipe) => ({
        updateOne: {
            filter: { source: recipe.source },
            update: { $set: recipe },
            upsert: true,
            runValidators: true,
            setDefaultsOnInsert: true,
        },
    }));
}

function countLinkedPurchaseOptions(recipes) {
    return recipes.reduce((sum, recipe) => sum + recipe.ingredients
        .flatMap((ingredient) => ingredient.purchaseOptions)
        .filter((option) => option.affiliateUrl).length, 0);
}

export async function seedRecipes(seedFile = seedPath, options = {}) {
    const {
        dbConnectImpl = dbConnect,
        recipeModel = RecipeModel,
        mongooseClient = mongoose,
        readFile = fs.readFile,
        dryRun: shouldDryRun = false,
    } = options;

    const payload = JSON.parse(await readFile(seedFile, 'utf8'));

    if (!Array.isArray(payload.recipes) || payload.recipes.length === 0) {
        throw new Error(`No recipes found in ${seedFile}`);
    }

    payload.recipes.forEach(validateRecipeSourceProvenance);

    const recipes = payload.recipes.map(withAffiliateLinks);
    const linkedPurchaseOptions = countLinkedPurchaseOptions(recipes);

    if (shouldDryRun) {
        return {
            recipeCount: recipes.length,
            linkedPurchaseOptions,
            upserted: 0,
            modified: 0,
            dryRun: true,
        };
    }

    await dbConnectImpl();

    let session;

    try {
        session = await mongooseClient.startSession();
        await session.startTransaction();

        const result = await recipeModel.bulkWrite(
            buildRecipeUpsertOperations(recipes),
            { session, ordered: true },
        );

        await session.commitTransaction();
        return {
            recipeCount: recipes.length,
            linkedPurchaseOptions,
            upserted: result.upsertedCount || 0,
            modified: result.modifiedCount || 0,
            dryRun: false,
        };
    } catch (error) {
        if (session) {
            try {
                await session.abortTransaction();
            } catch {
                // Keep the original seed failure as the primary error.
            }
        }
        throw error;
    } finally {
        if (session) {
            await session.endSession();
        }
        await mongooseClient.disconnect();
    }
}

async function main() {
    const result = await seedRecipes(seedPath, { dryRun });

    if (result.dryRun) {
        console.log(`Dry run: ${result.recipeCount} recipes ready. ${result.linkedPurchaseOptions} purchase options have affiliateUrl values.`);
        return;
    }

    console.log(`Seeded ${result.recipeCount} recipes from ${path.relative(process.cwd(), seedPath)}. Upserted: ${result.upserted}. Modified: ${result.modified}.`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
    await main().catch((error) => {
        console.error(`Recipe seed failed: ${error.message}`);
        process.exit(1);
    });
}
