import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  getAvailableRecipes,
  getRecipeProgress,
  getVisibleRecipeCards,
} from '../../components/RecipeSwiper/recipeSwiperState.js';

const createMeal = (id, recipeName) => ({
  id: `meal-${id}`,
  recipe: {
    id: `recipe-${id}`,
    recipeName,
  },
});

test('recipe swiper shows the next unswiped recipe after the current recipe is swiped', async () => {
  const meals = [
    createMeal('first', 'First Recipe'),
    createMeal('second', 'Second Recipe'),
  ];
  const swipedRecipeIds = new Set(['recipe-first']);

  const availableRecipes = getAvailableRecipes(meals, swipedRecipeIds);
  const visibleRecipes = getVisibleRecipeCards(availableRecipes);
  const progress = getRecipeProgress(
    swipedRecipeIds.size,
    swipedRecipeIds.size + availableRecipes.length,
  );

  assert.deepEqual(
    visibleRecipes.map((recipe) => recipe.id),
    ['recipe-second'],
  );
  assert.deepEqual(progress, { current: 2, total: 2 });
});
