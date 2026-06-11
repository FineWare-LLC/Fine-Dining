import { MealModel } from '@/models/Meal/index.js';
import { RecipeModel } from '@/models/Recipe/index.js';
import { MAX_RECIPES } from './constants.js';

function slugIngredient(name) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
}

function uniqueStrings(list = []) {
    return Array.from(new Set(list.map(v => v.toLowerCase().trim()).filter(Boolean)));
}

async function loadRecipesMap(ids) {
    if (!ids.length) return new Map();
    const recipes = await RecipeModel.find({ _id: { $in: ids } })
        .select(['recipeName', 'prepTime', 'tags', 'estimatedCost'])
        .lean();
    const map = new Map();
    for (const recipe of recipes) {
        map.set(String(recipe._id), recipe);
    }
    return map;
}

let dbConnectFn = null;

async function ensureDbConnection() {
    if (dbConnectFn) {
        return dbConnectFn();
    }
    const module = await import('@/lib/dbConnect.js');
    dbConnectFn = module.dbConnect;
    return dbConnectFn();
}

function fallbackCatalog(error, request) {
    const baseRecipes = [
        {
            id: 'fallback_oats',
            mealName: 'Fallback Oats',
            cuisine: ['mediterranean', 'breakfast'],
            mealType: 'BREAKFAST',
            macros: { kcal: 300, protein_g: 10, carb_g: 54, fat_g: 5, fiber_g: 5, sodium_mg: 150 },
            costUsd: 0.5,
            prepTimeMin: 10,
            allergens: [],
            ingredients: [{ ingredientId: 'oats', name: 'Oats', grams: null }],
            updatedAt: new Date().toISOString(),
        },
        {
            id: 'fallback_chicken',
            mealName: 'Fallback Chicken Rice',
            cuisine: ['mediterranean', 'dinner'],
            mealType: 'DINNER',
            macros: { kcal: 600, protein_g: 40, carb_g: 60, fat_g: 15, fiber_g: 3, sodium_mg: 450 },
            costUsd: 2.6,
            prepTimeMin: 25,
            allergens: [],
            ingredients: [{ ingredientId: 'chicken_breast', name: 'Chicken Breast', grams: null }],
            updatedAt: new Date().toISOString(),
        },
        {
            id: 'fallback_beans',
            mealName: 'Fallback Bean Chili',
            cuisine: ['mexican', 'dinner'],
            mealType: 'DINNER',
            macros: { kcal: 450, protein_g: 20, carb_g: 55, fat_g: 12, fiber_g: 10, sodium_mg: 380 },
            costUsd: 1.8,
            prepTimeMin: 35,
            allergens: [],
            ingredients: [{ ingredientId: 'black_beans', name: 'Black Beans', grams: null }],
            updatedAt: new Date().toISOString(),
        },
    ];

    const allergenSet = new Set(request.allergens);
    const bannedSet = new Set(request.bannedIngredients);
    const desiredCuisine = uniqueStrings(request.preferences?.cuisine || []);
    const filtered = baseRecipes.filter(recipe => {
        if (recipe.allergens.some(a => allergenSet.has(a))) return false;
        if (recipe.ingredients.some(ing => bannedSet.has(ing.ingredientId))) return false;
        if (desiredCuisine.length > 0 && !desiredCuisine.some(c => recipe.cuisine.includes(c))) return false;
        return true;
    });

    return {
        recipes: filtered,
        metadata: {
            totalMeals: baseRecipes.length,
            usableRecipes: filtered.length,
            excluded: { allergens: baseRecipes.length - filtered.length, banned: 0, cuisine: 0 },
            versionToken: `fallback-${error?.message || 'no-db'}`,
            fallback: true,
        },
    };
}

export async function fetchRecipeCatalog(request) {
    try {
        await ensureDbConnection();
    } catch (err) {
        console.warn('optimizer falling back to sample catalog', err.message);
        return fallbackCatalog(err, request);
    }

    const criteria = {};
    const meals = await MealModel.find(criteria)
        .limit(MAX_RECIPES)
        .select([
            'mealName',
            'price',
            'ingredients',
            'nutrition',
            'allergens',
            'mealType',
            'recipe',
            'updatedAt',
        ])
        .lean();

    const recipeIds = meals
        .map(meal => meal.recipe)
        .filter(Boolean)
        .map(id => String(id));
    const recipesMap = await loadRecipesMap(recipeIds);

    const allergenSet = new Set(request.allergens);
    const bannedSet = new Set(request.bannedIngredients);
    const desiredCuisine = uniqueStrings(request.preferences?.cuisine || []);
    const vegetarianOnly = Boolean(request.preferences?.vegetarian);

    const catalogRecipes = [];
    const excluded = { allergens: 0, banned: 0, cuisine: 0 };

    for (const meal of meals) {
        const mealAllergens = uniqueStrings(meal.allergens || []);
        if (mealAllergens.some(a => allergenSet.has(a))) {
            excluded.allergens += 1;
            continue;
        }

        const ingredientNames = uniqueStrings(meal.ingredients || []);
        if (ingredientNames.some(name => bannedSet.has(name))) {
            excluded.banned += 1;
            continue;
        }

        const recipeDoc = meal.recipe ? recipesMap.get(String(meal.recipe)) : null;
        const cuisineTags = uniqueStrings(recipeDoc?.tags || []);
        if (desiredCuisine.length > 0 && !desiredCuisine.some(tag => cuisineTags.includes(tag))) {
            excluded.cuisine += 1;
            continue;
        }

        if (vegetarianOnly) {
            const isVegetarian = cuisineTags.includes('vegetarian') || cuisineTags.includes('vegan');
            if (!isVegetarian) {
                excluded.cuisine += 1;
                continue;
            }
        }

        const protein = meal.nutrition?.protein ?? 0;
        const carbs = meal.nutrition?.carbohydrates ?? 0;
        const fat = meal.nutrition?.fat ?? 0;
        const fiber = meal.nutrition?.fiber ?? 0;
        const sodium = meal.nutrition?.sodium ?? 0;
        const kcal = meal.nutrition?.calories ?? 4 * (protein + carbs) + 9 * fat;

        const costUsd = meal.price ?? recipeDoc?.estimatedCost ?? 0;
        const prepTime = recipeDoc?.prepTime ?? request.timePerMeal ?? 30;

        const recipeId = String(meal._id);
        const ingredients = ingredientNames.map(name => ({
            ingredientId: slugIngredient(name),
            name,
            grams: null,
        }));

        catalogRecipes.push({
            id: recipeId,
            mealName: meal.mealName || recipeDoc?.recipeName || `Meal ${recipeId}`,
            cuisine: cuisineTags,
            mealType: meal.mealType || null,
            macros: {
                kcal,
                protein_g: protein,
                carb_g: carbs,
                fat_g: fat,
                fiber_g: fiber,
                sodium_mg: sodium,
            },
            costUsd,
            prepTimeMin: prepTime,
            allergens: mealAllergens,
            ingredients,
            source: meal,
            updatedAt: meal.updatedAt,
        });
    }

    const versionSeed = catalogRecipes
        .map(r => `${r.id}:${new Date(r.updatedAt || 0).getTime()}`)
        .sort()
        .join('|');

    return {
        recipes: catalogRecipes,
        metadata: {
            totalMeals: meals.length,
            usableRecipes: catalogRecipes.length,
            excluded,
            versionToken: versionSeed,
        },
    };
}
