/**
 * Utility functions for building database query filters
 * Consolidates duplicate filtering logic across the application
 */

/**
 * Builds nutrition range filters for MongoDB queries
 * @param {Object} nutritionRange - Object containing min/max values for nutrition fields
 * @param {Object} filter - Existing filter object to modify
 * @returns {Object} Modified filter object with nutrition range filters
 */
export const buildNutritionRangeFilter = (nutritionRange, filter = {}) => {
    if (!nutritionRange) return filter;

    const nutritionFields = ['carbohydrates', 'protein', 'fat', 'sodium'];
    
    nutritionFields.forEach(field => {
        const minKey = `${field}Min`;
        const maxKey = `${field}Max`;
        
        if (nutritionRange[minKey] !== undefined || nutritionRange[maxKey] !== undefined) {
            const fieldPath = `nutrition.${field}`;
            filter[fieldPath] = filter[fieldPath] || {};
            
            if (nutritionRange[minKey] !== undefined) {
                filter[fieldPath].$gte = nutritionRange[minKey];
            }
            if (nutritionRange[maxKey] !== undefined) {
                filter[fieldPath].$lte = nutritionRange[maxKey];
            }
        }
    });
    
    return filter;
};

/**
 * Builds price range filters for MongoDB queries
 * @param {Object} priceRange - Object containing min/max price values
 * @param {Object} filter - Existing filter object to modify
 * @returns {Object} Modified filter object with price range filters
 */
export const buildPriceRangeFilter = (priceRange, filter = {}) => {
    if (!priceRange) return filter;
    
    filter.price = {};
    if (priceRange.min !== undefined) {
        filter.price.$gte = priceRange.min;
    }
    if (priceRange.max !== undefined) {
        filter.price.$lte = priceRange.max;
    }
    
    return filter;
};

/**
 * Builds allergen filters for MongoDB queries
 * @param {Object} allergensFilter - Object containing include/exclude allergen arrays
 * @param {Object} filter - Existing filter object to modify
 * @returns {Object} Modified filter object with allergen filters
 */
export const buildAllergenFilter = (allergensFilter, filter = {}) => {
    if (!allergensFilter) return filter;
    
    if (allergensFilter.includeAllergens?.length > 0) {
        filter.allergens = { $in: allergensFilter.includeAllergens };
    }
    if (allergensFilter.excludeAllergens?.length > 0) {
        filter.allergens = filter.allergens || {};
        filter.allergens.$nin = allergensFilter.excludeAllergens;
    }
    
    return filter;
};

/**
 * Builds complete meal filter object using provided parameters
 * @param {Object} params - Filter parameters
 * @returns {Object} Complete filter object for MongoDB queries
 */
export const buildMealFilter = ({
    priceRange,
    nutritionRange,
    allergensFilter,
    search,
    diets,
    caloriesMin,
    caloriesMax,
    proteinMin,
    proteinMax,
    prepTimeMax,
    cuisines,
    allergenExclusions
}) => {
    let filter = {};

    // Apply basic filters
    filter = buildPriceRangeFilter(priceRange, filter);
    filter = buildNutritionRangeFilter(nutritionRange, filter);
    filter = buildAllergenFilter(allergensFilter, filter);

    // Text search
    if (search) {
        const searchRegex = new RegExp(search, 'i');
        filter.$or = [
            { mealName: searchRegex },
            { cuisine: searchRegex },
            { 'recipe.ingredients.name': searchRegex },
            { allergens: searchRegex },
        ];
    }

    // Dietary tags
    if (diets?.length > 0) {
        filter.dietaryTags = { $in: diets };
    }

    // Advanced nutrition filters
    if (caloriesMin !== undefined || caloriesMax !== undefined) {
        filter['nutrition.calories'] = {};
        if (caloriesMin !== undefined) filter['nutrition.calories'].$gte = caloriesMin;
        if (caloriesMax !== undefined) filter['nutrition.calories'].$lte = caloriesMax;
    }

    if (proteinMin !== undefined || proteinMax !== undefined) {
        filter['nutrition.protein'] = {};
        if (proteinMin !== undefined) filter['nutrition.protein'].$gte = proteinMin;
        if (proteinMax !== undefined) filter['nutrition.protein'].$lte = proteinMax;
    }

    // Prep time filter
    if (prepTimeMax !== undefined) {
        filter.$or = filter.$or ? [...filter.$or] : [];
        filter.$or.push(
            { prepTime: { $lte: prepTimeMax } },
            { activeTime: { $lte: prepTimeMax } }
        );
    }

    // Cuisine filter
    if (cuisines?.length > 0) {
        filter.cuisine = { $in: cuisines };
    }

    // Allergen exclusions
    if (allergenExclusions?.length > 0) {
        filter.allergens = { $nin: allergenExclusions };
    }

    return filter;
};