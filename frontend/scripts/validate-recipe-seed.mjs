import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { RecipeModel } from '../src/models/Recipe/index.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const defaultSeedPath = path.join(__dirname, '..', 'data', 'recipe_seed', 'full_meal_recipes_100.json');
const seedPath = process.argv[2] ? path.resolve(process.argv[2]) : defaultSeedPath;

const NUTRIENT_KEYS = [
    'calories', 'protein', 'carbohydrates', 'fat', 'fiber', 'sugar',
    'sodium', 'cholesterol', 'saturatedFat', 'transFat', 'vitaminA',
    'vitaminC', 'vitaminD', 'vitaminE', 'vitaminK', 'vitaminB6',
    'vitaminB12', 'thiamin', 'riboflavin', 'niacin', 'folate',
    'calcium', 'iron', 'magnesium', 'phosphorus', 'potassium',
    'zinc', 'selenium', 'copper', 'manganese', 'omega3', 'omega6',
];

function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}

function sumIngredientNutrition(recipe, key) {
    return recipe.ingredients.reduce((sum, ingredient) => sum + Number(ingredient.nutrition?.[key] || 0), 0);
}

function validateNutritionTotals(recipe) {
    for (const key of NUTRIENT_KEYS) {
        const expected = Number(recipe.nutritionPerServing?.[key] || 0);
        const actual = sumIngredientNutrition(recipe, key) / recipe.servings;
        const tolerance = key === 'calories' || key === 'sodium' ? 2.5 : 0.15;
        const delta = Math.abs(expected - actual);
        assert(delta <= tolerance, `${recipe.recipeName}: ${key} mismatch. expected ${expected}, got ${actual.toFixed(2)}`);
    }
}

function normalizeInstructionStep(step) {
    return step
        .replace(/^\s*[\-\*•]\s*/, '')
        .replace(/^\s*(?:step\s+\d+\s*[\.\):\-]?|\d+[\.\):\-])\s*/i, '')
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase();
}

function validateInstructionParaphraseQuality(recipe) {
    assert(
        typeof recipe.instructions === 'string' && recipe.instructions.trim(),
        `${recipe.recipeName}: instructions are missing`,
    );

    const instructionSteps = recipe.instructions
        .split('\n')
        .map((step) => step.trim())
        .filter(Boolean);
    const normalizedSteps = instructionSteps.map((step) => normalizeInstructionStep(step));

    assert(
        instructionSteps.length >= 4 && instructionSteps.length <= 8,
        `${recipe.recipeName}: instructions must contain 4-8 original steps`,
    );
    assert(
        new Set(normalizedSteps).size === normalizedSteps.length,
        `${recipe.recipeName}: instructions contain duplicate steps`,
    );
}

function validatePurchaseOptions(recipe) {
    for (const ingredient of recipe.ingredients) {
        assert(ingredient.canonicalName, `${recipe.recipeName}: ${ingredient.name} missing canonicalName`);
        assert(ingredient.affiliateSearchTerm, `${recipe.recipeName}: ${ingredient.name} missing affiliateSearchTerm`);
        assert(Array.isArray(ingredient.purchaseOptions) && ingredient.purchaseOptions.length > 0, `${recipe.recipeName}: ${ingredient.name} has no purchase links`);

        for (const option of ingredient.purchaseOptions) {
            assert(option.retailer, `${recipe.recipeName}: ${ingredient.name} purchase option missing retailer`);
            assert(option.productName, `${recipe.recipeName}: ${ingredient.name} purchase option missing productName`);
            assert(/^https:\/\//.test(option.url), `${recipe.recipeName}: ${ingredient.name} purchase option has invalid url`);
            assert(['SEARCH', 'PRODUCT', 'CART', 'LANDING'].includes(option.linkType), `${recipe.recipeName}: ${ingredient.name} invalid linkType`);
            assert(['READY', 'PENDING_PARTNER', 'NOT_MONETIZED'].includes(option.monetizationStatus), `${recipe.recipeName}: ${ingredient.name} invalid monetizationStatus`);
            if (option.affiliateUrl) {
                assert(/^https:\/\//.test(option.affiliateUrl), `${recipe.recipeName}: ${ingredient.name} affiliateUrl must be https`);
            }
        }
    }
}

const REQUIRED_SOURCE_DETAILS_FIELDS = [
    'siteName',
    'extractionMethod',
    'copyrightReviewStatus',
    'transformationNotes',
    'nutritionSource',
    'pricingSource',
];

function validateRecipeSourceDetails(recipe, index) {
    const recipeLabel = `Recipe ${index + 1}`;
    const sourceDetails = recipe?.sourceDetails;

    assert(sourceDetails && typeof sourceDetails === 'object' && !Array.isArray(sourceDetails), `${recipeLabel}: missing sourceDetails.`);

    for (const field of REQUIRED_SOURCE_DETAILS_FIELDS) {
        const value = sourceDetails[field];
        assert(
            typeof value === 'string' && value.trim(),
            `${recipeLabel}: missing sourceDetails.${field}.`,
        );
    }
}

export function validateRecipeSources(recipes) {
    assert(Array.isArray(recipes), 'recipes must be an array');

    const sources = new Set();
    for (const recipe of recipes) {
        const recipeName = typeof recipe?.recipeName === 'string' && recipe.recipeName.trim()
            ? recipe.recipeName.trim()
            : 'Recipe';
        const source = typeof recipe?.source === 'string' ? recipe.source.trim() : '';

        assert(source, `${recipeName}: missing source`);
        assert(!sources.has(source), `Duplicate recipe source: ${source}`);
        sources.add(source);
    }
}

export async function validateRecipeSeedPayload(payload) {
    assert(payload.schemaVersion === 'fine-dining.recipe-seed.v1', 'Unexpected recipe seed schemaVersion');
    assert(payload.recipeCount === 100, `Expected recipeCount 100, found ${payload.recipeCount}`);
    assert(Array.isArray(payload.recipes), 'recipes must be an array');
    assert(payload.recipes.length === 100, `Expected 100 recipes, found ${payload.recipes.length}`);

    validateRecipeSources(payload.recipes);

    const names = new Set();
    let ingredientLines = 0;

    for (const [index, recipe] of payload.recipes.entries()) {
        assert(recipe.recipeName, 'Recipe missing recipeName');
        assert(!names.has(recipe.recipeName), `Duplicate recipeName: ${recipe.recipeName}`);
        names.add(recipe.recipeName);
        assert(Array.isArray(recipe.ingredients) && recipe.ingredients.length >= 6, `${recipe.recipeName}: expected at least 6 ingredients`);
        validateInstructionParaphraseQuality(recipe);
        assert(recipe.servings >= 1, `${recipe.recipeName}: invalid servings`);
        assert(recipe.estimatedCost > 0, `${recipe.recipeName}: missing estimatedCost`);
        assert(recipe.costPerServing > 0, `${recipe.recipeName}: missing costPerServing`);
        validateRecipeSourceDetails(recipe, index);

        validatePurchaseOptions(recipe);
        validateNutritionTotals(recipe);

        const model = new RecipeModel(recipe);
        await model.validate();
        ingredientLines += recipe.ingredients.length;
    }

    assert(payload.ingredientLineCount === ingredientLines, `ingredientLineCount mismatch. expected ${payload.ingredientLineCount}, got ${ingredientLines}`);

    return {
        recipeCount: payload.recipes.length,
        ingredientLines,
    };
}

export async function validateRecipeSeed(seedFile = seedPath) {
    const payload = JSON.parse(await fs.readFile(seedFile, 'utf8'));
    return validateRecipeSeedPayload(payload);
}

async function main() {
    try {
        const result = await validateRecipeSeed(seedPath);
        console.log(`Validated ${result.recipeCount} recipes and ${result.ingredientLines} ingredient purchase-link rows from ${path.relative(process.cwd(), seedPath)}`);
    } catch (error) {
        console.error(`Recipe seed validation failed: ${error.message}`);
        process.exit(1);
    }
}

if (import.meta.url === `file://${process.argv[1]}`) {
    await main();
}
