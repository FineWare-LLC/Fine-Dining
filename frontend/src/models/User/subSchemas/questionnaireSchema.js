import mongoose from 'mongoose';

const questionnaireSchema = new mongoose.Schema(
  {
    allergies: { type: [String], default: [] },
    disallowedIngredients: { type: [String], default: [] },
    dietaryPattern: { type: String, default: '' },
    activityLevel: { type: Number, default: 0 }
  },
  { _id: false }
);

export default questionnaireSchema;
