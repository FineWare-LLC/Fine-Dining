import * as generalQueries from './generalQueries.js';
import * as mealPlanQueries from './mealPlanQueries.js';
import * as mealQueries from './mealQueries.js';
import * as menuItemQueries from './menuItemQueries.js';
import * as notificationQueries from './notificationQueries.js';
import * as recipeQueries from './recipeQueries.js';
import * as restaurantQueries from './restaurantQueries.js';
import * as reviewQueries from './reviewQueries.js';
import * as statsQueries from './statsQueries.js';
import * as userQueries from './userQueries.js';

export const Query = {
    ...generalQueries,
    ...userQueries,
    ...recipeQueries,
    ...restaurantQueries,
    ...mealPlanQueries,
    ...mealQueries,
    ...statsQueries,
    ...reviewQueries,
    ...notificationQueries,
    ...menuItemQueries,
};
