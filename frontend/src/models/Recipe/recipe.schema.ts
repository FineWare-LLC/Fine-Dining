// @ts-nocheck
/**
 * @file recipe.schema.js
 * @description Mongoose schema for the Recipe collection.
 *
 * Each recipe represents a complete meal/dish with:
 *   - Structured ingredients (name, quantity, unit, per-ingredient nutrition)
 *   - Comprehensive per-serving nutrition breakdown (macros + micros)
 *   - Serving metadata (yield, serving size)
 *   - Dietary tags, allergens, cuisine classification
 *   - Cost estimation and ratings
 */

import mongoose from 'mongoose';

const { Schema } = mongoose;

/**
 * Sub-schema: nutrition data that can appear on a recipe OR on an individual ingredient.
 * All values are per single serving (or per the ingredient's stated quantity).
 */
const nutritionSchema = new Schema(
    {
        calories:      { type: Number, default: 0, min: 0 },
        protein:       { type: Number, default: 0, min: 0 }, // grams
        carbohydrates: { type: Number, default: 0, min: 0 }, // grams
        fat:           { type: Number, default: 0, min: 0 }, // grams
        fiber:         { type: Number, default: 0, min: 0 }, // grams
        sugar:         { type: Number, default: 0, min: 0 }, // grams
        sodium:        { type: Number, default: 0, min: 0 }, // milligrams
        cholesterol:   { type: Number, default: 0, min: 0 }, // milligrams
        saturatedFat:  { type: Number, default: 0, min: 0 }, // grams
        transFat:      { type: Number, default: 0, min: 0 }, // grams
        // Micronutrients
        vitaminA:      { type: Number, default: 0, min: 0 }, // mcg RAE
        vitaminC:      { type: Number, default: 0, min: 0 }, // mg
        vitaminD:      { type: Number, default: 0, min: 0 }, // mcg
        vitaminE:      { type: Number, default: 0, min: 0 }, // mg
        vitaminK:      { type: Number, default: 0, min: 0 }, // mcg
        vitaminB6:     { type: Number, default: 0, min: 0 }, // mg
        vitaminB12:    { type: Number, default: 0, min: 0 }, // mcg
        thiamin:       { type: Number, default: 0, min: 0 }, // mg
        riboflavin:    { type: Number, default: 0, min: 0 }, // mg
        niacin:        { type: Number, default: 0, min: 0 }, // mg
        folate:        { type: Number, default: 0, min: 0 }, // mcg DFE
        calcium:       { type: Number, default: 0, min: 0 }, // mg
        iron:          { type: Number, default: 0, min: 0 }, // mg
        magnesium:     { type: Number, default: 0, min: 0 }, // mg
        phosphorus:    { type: Number, default: 0, min: 0 }, // mg
        potassium:     { type: Number, default: 0, min: 0 }, // mg
        zinc:          { type: Number, default: 0, min: 0 }, // mg
        selenium:      { type: Number, default: 0, min: 0 }, // mcg
        copper:        { type: Number, default: 0, min: 0 }, // mg
        manganese:     { type: Number, default: 0, min: 0 }, // mg
        omega3:        { type: Number, default: 0, min: 0 }, // grams
        omega6:        { type: Number, default: 0, min: 0 }, // grams
    },
    { _id: false },
);

/**
 * Sub-schema: a single ingredient line with optional per-ingredient nutrition.
 */
const purchaseOptionSchema = new Schema(
    {
        retailer: { type: String, required: true, trim: true },
        productName: { type: String, required: true, trim: true },
        url: { type: String, required: true, trim: true },
        affiliateUrl: { type: String, default: '', trim: true },
        affiliateProvider: { type: String, default: '', trim: true },
        linkType: {
            type: String,
            enum: ['SEARCH', 'PRODUCT', 'CART', 'LANDING'],
            default: 'SEARCH',
        },
        monetizationStatus: {
            type: String,
            enum: ['READY', 'PENDING_PARTNER', 'NOT_MONETIZED'],
            default: 'PENDING_PARTNER',
        },
        packageSize: { type: String, default: '', trim: true },
        estimatedPrice: { type: Number, default: 0, min: 0 },
        currency: { type: String, default: 'USD', trim: true },
        unitPrice: { type: Number, default: 0, min: 0 },
        lastCheckedAt: { type: Date, default: null },
        disclosure: { type: String, default: '', trim: true },
    },
    { _id: false },
);

const ingredientSchema = new Schema(
    {
        name:     { type: String, required: true, trim: true },
        quantity: { type: Number, required: true, min: 0 },
        unit:     { type: String, required: true, trim: true }, // e.g. "g", "oz", "cup", "tbsp"
        gramWeight: { type: Number, default: 0, min: 0 },
        canonicalName: { type: String, default: '', trim: true },
        affiliateSearchTerm: { type: String, default: '', trim: true },
        fdcId: { type: String, default: '', trim: true },
        category: { type: String, default: '', trim: true },    // e.g. "Protein", "Vegetable", "Spice"
        optional: { type: Boolean, default: false },
        nutrition: { type: nutritionSchema, default: () => ({}) },
        purchaseOptions: { type: [purchaseOptionSchema], default: [] },
    },
    { _id: false },
);

const sourceDetailsSchema = new Schema(
    {
        originalUrl: { type: String, default: '', trim: true },
        canonicalUrl: { type: String, default: '', trim: true },
        siteName: { type: String, default: '', trim: true },
        authorName: { type: String, default: '', trim: true },
        capturedAt: { type: Date, default: null },
        extractionMethod: { type: String, default: '', trim: true },
        copyrightReviewStatus: {
            type: String,
            enum: ['ORIGINAL', 'FACTS_ONLY_PARAPHRASE', 'PERMISSIONED', 'PUBLIC_DOMAIN', 'REJECTED', 'UNKNOWN'],
            default: 'UNKNOWN',
        },
        transformationNotes: { type: String, default: '', trim: true },
        nutritionSource: { type: String, default: '', trim: true },
        pricingSource: { type: String, default: '', trim: true },
    },
    { _id: false },
);

const recipeSchema = new Schema(
    {
        recipeName: {
            type: String,
            required: true,
            trim: true,
            maxlength: [200, 'Recipe name cannot exceed 200 characters'],
        },

        /** Structured ingredients list */
        ingredients: {
            type: [ingredientSchema],
            required: true,
            validate: {
                validator: (v) => Array.isArray(v) && v.length > 0,
                message: 'A recipe must have at least one ingredient.',
            },
        },

        instructions: {
            type: String,
            required: true,
        },

        /** Serving metadata */
        servings: {
            type: Number,
            required: true,
            default: 1,
            min: [1, 'Must yield at least 1 serving'],
        },
        servingSize: {
            type: String,
            default: '',
            trim: true, // e.g. "1 bowl (350g)"
        },

        /** Aggregate nutrition PER SERVING — should equal sum(ingredient nutrition) / servings */
        nutritionPerServing: {
            type: nutritionSchema,
            default: () => ({}),
        },

        /** Prep / cook times */
        prepTime:   { type: Number, required: true, min: 0 }, // minutes
        cookTime:   { type: Number, default: 0, min: 0 },     // minutes
        totalTime:  { type: Number, default: 0, min: 0 },     // auto-set via pre-save

        difficulty: {
            type: String,
            enum: ['EASY', 'INTERMEDIATE', 'HARD'],
            default: 'EASY',
        },

        /** Classification */
        mealTypes: [{
            type: String,
            enum: ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK', 'DESSERT', 'SIDE'],
        }],
        cuisine: {
            type: String,
            default: '',
            trim: true,
        },
        dietaryTags: [{
            type: String,
            trim: true,
            // e.g. "VEGAN", "VEGETARIAN", "KETO", "PALEO", "GLUTEN_FREE", "DAIRY_FREE"
        }],
        allergens: [{
            type: String,
            trim: true,
            // e.g. "GLUTEN", "DAIRY", "NUTS", "EGGS", "SOY", "SHELLFISH", "FISH", "SESAME"
        }],
        tags: [{ type: String, trim: true }],

        /** Media */
        images:   [{ type: String }],
        videoUrl: { type: String, default: '' },

        /** Cost */
        estimatedCost: { type: Number, default: 0, min: 0 }, // total cost for all servings
        costPerServing: { type: Number, default: 0, min: 0 }, // auto-set via pre-save

        /** Authorship & ratings */
        author: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
        source: { type: String, default: '', trim: true }, // external source URL or name
        sourceDetails: { type: sourceDetailsSchema, default: () => ({}) },
        verified: { type: Boolean, default: false },
        averageRating: { type: Number, default: 0, min: 0, max: 5 },
        ratingCount:   { type: Number, default: 0, min: 0 },
    },
    { timestamps: true },
);

/** Auto-compute totalTime and costPerServing before saving */
recipeSchema.pre('save', function (next) {
    this.totalTime = (this.prepTime || 0) + (this.cookTime || 0);
    const servings = Number(this.servings) || 0;
    const estimatedCost = Number(this.estimatedCost) || 0;

    this.costPerServing = servings > 0 && estimatedCost > 0
        ? +(estimatedCost / servings).toFixed(2)
        : 0;
    next();
});

/** Text index for full-text search across name, tags, cuisine */
recipeSchema.index({ recipeName: 'text', cuisine: 'text', tags: 'text' });
recipeSchema.index({ 'allergens': 1 });
recipeSchema.index({ 'dietaryTags': 1 });
recipeSchema.index({ 'mealTypes': 1 });
recipeSchema.index({ 'ingredients.canonicalName': 1 });
recipeSchema.index({ 'ingredients.purchaseOptions.retailer': 1 });

export default recipeSchema;
