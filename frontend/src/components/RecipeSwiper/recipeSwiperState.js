const DEFAULT_VISIBLE_CARD_LIMIT = 3;

const hasRecipe = (meal) => Boolean(meal?.recipe?.id);

export const getAvailableRecipes = (meals = [], swipedRecipeIds = new Set()) => meals
  .filter(hasRecipe)
  .map((meal) => meal.recipe)
  .filter((recipe) => !swipedRecipeIds.has(recipe.id));

export const getVisibleRecipeCards = (
  availableRecipes = [],
  limit = DEFAULT_VISIBLE_CARD_LIMIT,
) => availableRecipes.slice(0, limit);

export const getRecipeProgress = (viewedCount, totalRecipes) => {
  if (totalRecipes <= 0) {
    return { current: 0, total: 0 };
  }

  return {
    current: Math.min(viewedCount + 1, totalRecipes),
    total: totalRecipes,
  };
};
