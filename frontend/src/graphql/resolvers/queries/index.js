import * as generalQueries from './generalQueries.js';
import * as userQueries from './userQueries.js';
import * as recipeQueries from './recipeQueries.js';
import * as restaurantQueries from './restaurantQueries.js';
import * as mealPlanQueries from './mealPlanQueries.js';
import * as mealQueries from './mealQueries.js';
import * as statsQueries from './statsQueries.js';
import * as reviewQueries from './reviewQueries.js';
import * as menuItemQueries from './menuItemQueries.js';

export const Query = {
  ...generalQueries,
  ...userQueries,
  ...recipeQueries,
  ...restaurantQueries,
  ...mealPlanQueries,
  ...mealQueries,
  ...statsQueries,
  ...reviewQueries,
  ...menuItemQueries,
};
