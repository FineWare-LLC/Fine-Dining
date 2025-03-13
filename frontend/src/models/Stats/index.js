/**
 * @file index.js
 * @description Exports the Stats model and schema from a single entry point.
 */

import StatsModel from './stats.model.js';
import statsSchema from './stats.schema.js';

export {
    StatsModel,  // The Mongoose model
    statsSchema, // The raw schema (if needed directly)
};
