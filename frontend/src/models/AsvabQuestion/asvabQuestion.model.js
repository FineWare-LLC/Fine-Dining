import mongoose from 'mongoose';
import asvabQuestionSchema from './asvabQuestion.schema.js';

const AsvabQuestionModel =
    mongoose.models.AsvabQuestion || mongoose.model('AsvabQuestion', asvabQuestionSchema);

export default AsvabQuestionModel;
