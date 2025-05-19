import * as userMutations from './userMutations.js';
import * as authMutations from './authMutations.js';
import * as recipeMutations from './recipeMutations.js';
import * as restaurantMutations from './restaurantMutations.js';
import * as mealPlanMutations from './mealPlanMutations.js';
import * as mealMutations from './mealMutations.js';
import * as statsMutations from './statsMutations.js';
import * as reviewMutations from './reviewMutations.js';
import * as optimizationMutations from './optimizationMutations.js';
import * as menuItemMutations from './menuItemMutations.js';

export const Mutation = {
  ...userMutations,
  ...authMutations,
  ...recipeMutations,
  ...restaurantMutations,
  ...mealPlanMutations,
  ...mealMutations,
  ...statsMutations,
  ...reviewMutations,
  ...optimizationMutations,
  ...menuItemMutations,
};
