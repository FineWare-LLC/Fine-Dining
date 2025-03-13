/**
 * @file stats.model.js
 * @description Mongoose model for Stats, based on stats.schema.js
 */

import mongoose from 'mongoose';
import statsSchema from './stats.schema.js';

/**
 * @constant {mongoose.Model<StatsDocument>}
 * @description Stats model, reusing the same model if already compiled (Next.js friendliness).
 */
const StatsModel = mongoose.models.Stats || mongoose.model('Stats', statsSchema);

export default StatsModel;
