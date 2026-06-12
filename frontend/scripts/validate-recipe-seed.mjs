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

function isValidNutritionValue(value) {
    return typeof value === 'number' && Number.isFinite(value);
}

function validateNutritionProfile(nutrition, recipeLabel, fieldLabel) {
    assert(
        nutrition && typeof nutrition === 'object' && !Array.isArray(nutrition),
        `${recipeLabel}: missing ${fieldLabel}.`,
    );

    for (const key of NUTRIENT_KEYS) {
        assert(
            isValidNutritionValue(nutrition[key]),
            `${recipeLabel}: missing ${fieldLabel}.${key}.`,
        );
    }
}

function validateNutritionCompleteness(recipe) {
    validateNutritionProfile(recipe.nutritionPerServing, recipe.recipeName, 'nutritionPerServing');

    recipe.ingredients.forEach((ingredient, index) => {
        validateNutritionProfile(ingredient.nutrition, `${recipe.recipeName}: ingredients[${index}]`, 'nutrition');
    });
}

function validateIngredientNormalization(recipe) {
    recipe.ingredients.forEach((ingredient, index) => {
        const ingredientPath = `ingredients[${index}]`;

        assert(
            ingredient && typeof ingredient === 'object' && !Array.isArray(ingredient),
            `${recipe.recipeName}: missing ${ingredientPath}`,
        );
        assert(
            typeof ingredient.quantity === 'number' && Number.isFinite(ingredient.quantity) && ingredient.quantity >= 0,
            `${recipe.recipeName}: missing ${ingredientPath}.quantity`,
        );
        assert(
            typeof ingredient.unit === 'string' && ingredient.unit.trim(),
            `${recipe.recipeName}: missing ${ingredientPath}.unit`,
        );
        assert(
            typeof ingredient.gramWeight === 'number' && Number.isFinite(ingredient.gramWeight) && ingredient.gramWeight >= 0,
            `${recipe.recipeName}: missing ${ingredientPath}.gramWeight`,
        );
    });
}

function sumIngredientNutrition(recipe, key) {
    return recipe.ingredients.reduce((sum, ingredient) => sum + ingredient.nutrition[key], 0);
}

function validateNutritionTotals(recipe) {
    for (const key of NUTRIENT_KEYS) {
        const expected = recipe.nutritionPerServing[key];
        const actual = sumIngredientNutrition(recipe, key) / recipe.servings;
        const tolerance = key === 'calories' || key === 'sodium' ? 2.5 : 0.15;
        const delta = Math.abs(expected - actual);
        assert(delta <= tolerance, `${recipe.recipeName}: ${key} mismatch. expected ${expected}, got ${actual.toFixed(2)}`);
    }
}

function validateNutritionSnapshotConsistency(actualNutrition, expectedNutrition, recipeLabel, fieldLabel) {
    assert(
        actualNutrition && typeof actualNutrition === 'object' && !Array.isArray(actualNutrition),
        `${recipeLabel}: missing ${fieldLabel}.`,
    );

    for (const key of NUTRIENT_KEYS) {
        assert(
            actualNutrition[key] === expectedNutrition[key],
            `${recipeLabel}: ${fieldLabel}.${key} changed during model hydration`,
        );
    }
}

function validateIngredientSnapshotConsistency(actualIngredient, expectedIngredient, recipeLabel, fieldLabel) {
    assert(
        actualIngredient && typeof actualIngredient === 'object' && !Array.isArray(actualIngredient),
        `${recipeLabel}: missing ${fieldLabel}.`,
    );

    assert(
        actualIngredient.quantity === expectedIngredient.quantity,
        `${recipeLabel}: ${fieldLabel}.quantity changed during model hydration`,
    );
    assert(
        actualIngredient.unit === expectedIngredient.unit,
        `${recipeLabel}: ${fieldLabel}.unit changed during model hydration`,
    );
    assert(
        actualIngredient.gramWeight === expectedIngredient.gramWeight,
        `${recipeLabel}: ${fieldLabel}.gramWeight changed during model hydration`,
    );
}

export function validateRecipeIngredientPersistenceConsistency(recipe, model = new RecipeModel(recipe)) {
    const recipeLabel = recipe?.recipeName || 'Recipe';
    const hydratedRecipe = typeof model?.toObject === 'function'
        ? model.toObject({ depopulate: true, versionKey: false })
        : model;

    assert(
        Array.isArray(hydratedRecipe?.ingredients),
        `${recipeLabel}: missing ingredients after model hydration.`,
    );
    assert(
        hydratedRecipe.ingredients.length === recipe.ingredients.length,
        `${recipeLabel}: ingredient count changed during model hydration.`,
    );

    recipe.ingredients.forEach((ingredient, index) => {
        validateIngredientSnapshotConsistency(
            hydratedRecipe.ingredients[index],
            ingredient,
            recipeLabel,
            `ingredients[${index}]`,
        );
    });
}

export function validateRecipeNutritionPersistenceConsistency(recipe, model = new RecipeModel(recipe)) {
    const recipeLabel = recipe?.recipeName || 'Recipe';
    const hydratedRecipe = typeof model?.toObject === 'function'
        ? model.toObject({ depopulate: true, versionKey: false })
        : model;

    assert(
        Array.isArray(hydratedRecipe?.ingredients),
        `${recipeLabel}: missing ingredients after model hydration.`,
    );
    assert(
        hydratedRecipe.ingredients.length === recipe.ingredients.length,
        `${recipeLabel}: ingredient count changed during model hydration.`,
    );

    validateNutritionSnapshotConsistency(
        hydratedRecipe.nutritionPerServing,
        recipe.nutritionPerServing,
        recipeLabel,
        'nutritionPerServing',
    );

    recipe.ingredients.forEach((ingredient, index) => {
        validateNutritionSnapshotConsistency(
            hydratedRecipe.ingredients[index]?.nutrition,
            ingredient.nutrition,
            recipeLabel,
            `ingredients[${index}].nutrition`,
        );
    });
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

export async function validateRecipeSeedPayload(payload, options = {}) {
    assert(payload.schemaVersion === 'fine-dining.recipe-seed.v1', 'Unexpected recipe seed schemaVersion');
    assert(Array.isArray(payload.recipes), 'recipes must be an array');

    const expectedRecipeCount = options.expectedRecipeCount ?? payload.recipes.length;

    assert(
        payload.recipeCount === expectedRecipeCount,
        `Expected recipeCount ${expectedRecipeCount}, found ${payload.recipeCount}`,
    );
    assert(
        payload.recipes.length === expectedRecipeCount,
        `Expected ${expectedRecipeCount} recipes, found ${payload.recipes.length}`,
    );

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

        validateIngredientNormalization(recipe);
        validatePurchaseOptions(recipe);
        validateNutritionCompleteness(recipe);
        validateNutritionTotals(recipe);

        const model = new RecipeModel(recipe);
        await model.validate();
        validateRecipeIngredientPersistenceConsistency(recipe, model);
        validateRecipeNutritionPersistenceConsistency(recipe, model);
        ingredientLines += recipe.ingredients.length;
    }

    assert(payload.ingredientLineCount === ingredientLines, `ingredientLineCount mismatch. expected ${payload.ingredientLineCount}, got ${ingredientLines}`);

    return {
        recipeCount: payload.recipes.length,
        ingredientLines,
    };
}

export async function validateRecipeSeed(seedFile = seedPath, options = {}) {
    const payload = JSON.parse(await fs.readFile(seedFile, 'utf8'));
    return validateRecipeSeedPayload(payload, options);
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
