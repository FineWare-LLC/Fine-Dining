export type RecipeSwiperCard = {
    id?: string;
    [key: string]: unknown;
};

export type ResolveRecipeSwiperWindowArgs = {
    recipes?: RecipeSwiperCard[];
    currentIndex?: number;
    swipedRecipeIds?: {
        has: (recipeId: string) => boolean;
    };
    windowSize?: number;
};

export function resolveRecipeSwiperWindow({
    recipes = [],
    currentIndex = 0,
    swipedRecipeIds = new Set<string>(),
    windowSize = 3,
}: ResolveRecipeSwiperWindowArgs = {}) {
    const recipeList = Array.isArray(recipes) ? recipes : [];
    const startIndex = Number.isFinite(currentIndex) && currentIndex > 0 ? Math.floor(currentIndex) : 0;
    const visibleWindowSize = Number.isFinite(windowSize) && windowSize > 0 ? Math.floor(windowSize) : 3;
    const hasSwipedRecipe = swipedRecipeIds != null && typeof swipedRecipeIds.has === 'function'
        ? (recipeId: string) => swipedRecipeIds.has(recipeId)
        : () => false;

    const visibleRecipes: RecipeSwiperCard[] = [];

    for (let index = startIndex; index < recipeList.length && visibleRecipes.length < visibleWindowSize; index += 1) {
        const recipe = recipeList[index];

        if (!recipe || typeof recipe !== 'object') {
            continue;
        }

        if (typeof recipe.id === 'string' && hasSwipedRecipe(recipe.id)) {
            continue;
        }

        visibleRecipes.push(recipe);
    }

    return visibleRecipes;
}
