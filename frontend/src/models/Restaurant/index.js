/**
 * @file Restaurant/index.js
 * @description Aggregates and re-exports all Restaurant-related modules for simpler imports.
 */

import RestaurantModel from './restaurant.model.js';
import restaurantSchema from './restaurant.schema.js';

/**
 * @module Restaurant
 * @description A simple module that provides the Restaurant Mongoose model
 * and schema for your application. Import this folder's index in your services,
 * controllers, or GraphQL resolvers.
 */
export {
    /**
     * @description The Restaurant Mongoose model.
     */
    RestaurantModel,

    /**
     * @description The Mongoose schema for Restaurant, if needed for advanced customization.
     */
    restaurantSchema,
};
