/**
 * @file mealPlanGenerator.js
 * @description Service for generating personalized meal plans based on user dietary preferences
 */

import { gql } from '@apollo/client';

// GraphQL query to get user profile with dietary preferences
const GET_USER_PROFILE = gql`
    query GetUserProfile($id: ID!) {
        getUser(id: $id) {
            id
            name
            gender
            weightGoal
            dailyCalories
            nutritionTargets {
                proteinMin
                proteinMax
                carbohydratesMin
                carbohydratesMax
                fatMin
                fatMax
                sodiumMin
                sodiumMax
            }
            questionnaire {
                allergies
                disallowedIngredients
                dietaryPattern
                activityLevel
            }
            allergies
            foodGoals
        }
    }
`;

// GraphQL query to get available meals with filtering/search
const GET_FILTERED_MEALS = gql`
    query GetFilteredMeals($search: String, $limit: Int, $allergenExclusions: [String]) {
        getMealsWithFilters(search: $search, limit: $limit, allergenExclusions: $allergenExclusions, page: 1) {
            meals {
                id
                mealName
                mealType
                price
                nutrition {
                    calories
                    protein
                    carbohydrates
                    fat
                    sodium
                }
                allergens
                recipe {
                    tags
                    ingredients
                    difficulty
                }
                restaurant {
                    restaurantName
                }
            }
        }
    }
`;

// GraphQL mutation to create meal plan
const CREATE_MEAL_PLAN = gql`
    mutation CreateMealPlan(
        $startDate: Date!
        $endDate: Date!
        $title: String
        $totalCalories: Int
    ) {
        createMealPlan(
            startDate: $startDate
            endDate: $endDate
            title: $title
            totalCalories: $totalCalories
        ) {
            id
            title
            startDate
            endDate
            totalCalories
            status
        }
    }
`;

/**
 * Generate nutrition constraints based on user profile
 */
function generateNutritionConstraints(user) {
    const dailyCalories = user.dailyCalories || 2000;
    const activityLevel = user.questionnaire?.activityLevel || 3;
    const weightGoal = user.weightGoal || 'MAINTAIN';
    
    // Adjust calories based on weight goal
    let adjustedCalories = dailyCalories;
    switch (weightGoal) {
        case 'LOSE':
            adjustedCalories = dailyCalories * 0.85; // 15% deficit
            break;
        case 'GAIN':
            adjustedCalories = dailyCalories * 1.15; // 15% surplus
            break;
        default:
            adjustedCalories = dailyCalories;
    }
    
    // Activity level adjustments
    const activityMultiplier = {
        1: 0.9,  // Sedentary
        2: 0.95, // Lightly active
        3: 1.0,  // Moderately active
        4: 1.1,  // Very active
        5: 1.2   // Extremely active
    };
    
    adjustedCalories *= (activityMultiplier[activityLevel] || 1.0);
    
    // Use custom nutrition targets if available
    if (user.nutritionTargets) {
        return {
            calories: {
                min: Math.max(adjustedCalories * 0.9, 1200),
                max: adjustedCalories * 1.1
            },
            protein: {
                min: user.nutritionTargets.proteinMin || adjustedCalories * 0.15 / 4,
                max: user.nutritionTargets.proteinMax || adjustedCalories * 0.25 / 4
            },
            carbohydrates: {
                min: user.nutritionTargets.carbohydratesMin || adjustedCalories * 0.45 / 4,
                max: user.nutritionTargets.carbohydratesMax || adjustedCalories * 0.65 / 4
            },
            sodium: {
                min: user.nutritionTargets.sodiumMin || 1500,
                max: user.nutritionTargets.sodiumMax || 2300
            }
        };
    }
    
    // Default macro distribution
    return {
        calories: {
            min: Math.max(adjustedCalories * 0.9, 1200),
            max: adjustedCalories * 1.1
        },
        protein: {
            min: adjustedCalories * 0.15 / 4, // 15% of calories from protein
            max: adjustedCalories * 0.25 / 4  // 25% of calories from protein
        },
        carbohydrates: {
            min: adjustedCalories * 0.45 / 4, // 45% of calories from carbs
            max: adjustedCalories * 0.65 / 4  // 65% of calories from carbs
        },
        sodium: {
            min: 1500, // mg
            max: 2300  // mg
        }
    };
}

/**
 * Filter meals based on user dietary preferences
 */
function filterMealsByDiet(meals, user) {
    return meals.filter(meal => {
        // Check allergies
        const userAllergies = [
            ...(user.allergies || []),
            ...(user.questionnaire?.allergies || [])
        ];
        
        if (userAllergies.length > 0) {
            const mealAllergens = meal.allergens || [];
            if (userAllergies.some(allergy => 
                mealAllergens.some(allergen => 
                    allergen.toLowerCase().includes(allergy.toLowerCase())
                )
            )) {
                return false;
            }
        }
        
        // Check disallowed ingredients
        const disallowedIngredients = user.questionnaire?.disallowedIngredients || [];
        if (disallowedIngredients.length > 0 && meal.recipe?.ingredients) {
            const ingredientList = Array.isArray(meal.recipe.ingredients) 
                ? meal.recipe.ingredients.join(' ').toLowerCase()
                : (meal.recipe.ingredients || '').toLowerCase();
            
            if (disallowedIngredients.some(ingredient => 
                ingredientList.includes(ingredient.toLowerCase())
            )) {
                return false;
            }
        }
        
        // Check dietary pattern
        const dietaryPattern = user.questionnaire?.dietaryPattern;
        if (dietaryPattern && meal.recipe?.tags) {
            const tags = (meal.recipe.tags || []).map(tag => tag.toLowerCase());
            
            switch (dietaryPattern) {
                case 'VEGETARIAN':
                    return tags.includes('vegetarian') || !tags.some(tag => 
                        ['meat', 'chicken', 'beef', 'pork', 'fish', 'seafood'].includes(tag)
                    );
                case 'VEGAN':
                    return tags.includes('vegan') || (
                        tags.includes('vegetarian') && 
                        !tags.some(tag => ['dairy', 'cheese', 'milk', 'egg'].includes(tag))
                    );
                case 'KETO':
                    return tags.includes('keto') || tags.includes('low-carb');
                case 'PALEO':
                    return tags.includes('paleo');
                case 'MEDITERRANEAN':
                    return tags.includes('mediterranean');
                case 'LOW_CARB':
                    return tags.includes('low-carb') || tags.includes('keto');
                case 'LOW_FAT':
                    return tags.includes('low-fat');
                case 'DIABETES_FRIENDLY':
                    return tags.includes('diabetes-friendly') || tags.includes('low-sugar');
                case 'HEART_HEALTHY':
                    return tags.includes('heart-healthy') || tags.includes('low-sodium');
                default:
                    return true;
            }
        }
        
        return true;
    });
}

/**
 * Convert meal data to optimization format
 */
function convertMealsForOptimization(meals) {
    return meals.map(meal => ({
        meal_name: meal.mealName,
        calories: meal.nutrition?.calories || 0,
        protein: meal.nutrition?.protein || 0,
        carbohydrates: meal.nutrition?.carbohydrates || 0,
        sodium: meal.nutrition?.sodium || 0,
        price: meal.price || 0,
        originalMeal: meal // Keep reference to original meal object
    }));
}

/**
 * Generate personalized meal plan for user
 */
export async function generatePersonalizedMealPlan(apolloClient, userId, interestQuery = '', customNutritionTargets = null) {
    try {
        // 1. Get user profile with dietary preferences
        const { data: userData } = await apolloClient.query({
            query: GET_USER_PROFILE,
            variables: { id: userId }
        });
        
        if (!userData?.getUser) {
            throw new Error('User profile not found');
        }
        
        const user = userData.getUser;
        
        // 2. Get available meals (using search/filter if provided)
        const allergenExclusions = [
            ...(user.allergies || []),
            ...(user.questionnaire?.allergies || [])
        ];
        
        const { data: mealsData } = await apolloClient.query({
            query: GET_FILTERED_MEALS,
            variables: { 
                limit: 500, // Increased limit for better optimization pool
                allergenExclusions: allergenExclusions.length > 0 ? allergenExclusions : undefined,
                search: interestQuery || undefined
            }
        });
        
        const fetchedMeals = mealsData?.getMealsWithFilters?.meals || [];
        
        if (fetchedMeals.length === 0) {
            throw new Error('No meals match your criteria');
        }
        
        // 3. Filter meals based on dietary preferences (client-side double check)
        const filteredMeals = filterMealsByDiet(fetchedMeals, user);
        
        if (filteredMeals.length === 0) {
            throw new Error('No meals match your dietary preferences after filtering');
        }
        
        // 4. Generate nutrition constraints (use custom if provided)
        const constraints = customNutritionTargets 
            ? { ...customNutritionTargets } 
            : generateNutritionConstraints(user);
        
        // 5. Convert meals for optimization
        const optimizationMeals = convertMealsForOptimization(filteredMeals);
        
        // 6. Call optimization API
        const response = await fetch('/api/optimize-meals', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                meals: optimizationMeals,
                constraints
            })
        });
        
        if (!response.ok) {
            throw new Error('Meal optimization failed');
        }
        
        const optimizationResult = await response.json();
        
        if (optimizationResult.status !== 'optimal') {
            throw new Error(optimizationResult.message || 'No optimal meal plan found');
        }
        
        // 7. Enhance meal plan with original meal data
        const enhancedMealPlan = optimizationResult.mealPlan.map(optimizedMeal => {
            const originalMeal = optimizationMeals.find(m => 
                m.meal_name === optimizedMeal.mealName
            )?.originalMeal;
            
            return {
                ...optimizedMeal,
                meal: originalMeal,
                mealType: originalMeal?.mealType || 'LUNCH',
                price: originalMeal?.price || 0,
                recipe: originalMeal?.recipe,
                restaurant: originalMeal?.restaurant
            };
        });
        
        // 8. Create meal plan in database
        const startDate = new Date().toISOString().split('T')[0];
        const endDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        
        const { data: mealPlanData } = await apolloClient.mutate({
            mutation: CREATE_MEAL_PLAN,
            variables: {
                startDate,
                endDate,
                title: `Personalized Plan - ${new Date().toLocaleDateString()}`,
                totalCalories: Math.round(optimizationResult.totalNutrition.calories)
            }
        });
        
        return {
            mealPlan: enhancedMealPlan,
            totalNutrition: optimizationResult.totalNutrition,
            constraints,
            user: {
                name: user.name,
                dietaryPattern: user.questionnaire?.dietaryPattern,
                allergies: [...(user.allergies || []), ...(user.questionnaire?.allergies || [])]
            },
            planId: mealPlanData?.createMealPlan?.id,
            solverInfo: optimizationResult.solverInfo
        };
        
    } catch (error) {
        console.error('Error generating meal plan:', error);
        throw error;
    }
}

/**
 * Find nutritionally similar meals for swapping
 */
export async function findSimilarMeals(apolloClient, targetMeal, userId, maxResults = 5) {
    try {
        // Get user profile for dietary restrictions
        const { data: userData } = await apolloClient.query({
            query: GET_USER_PROFILE,
            variables: { id: userId }
        });
        
        const user = userData?.getUser;
        
        // Get available meals
        const { data: mealsData } = await apolloClient.query({
            query: GET_AVAILABLE_MEALS,
            variables: { limit: 200 }
        });
        
        if (!mealsData?.getAllMeals) {
            return [];
        }
        
        // Filter by dietary preferences
        const filteredMeals = user ? filterMealsByDiet(mealsData.getAllMeals, user) : mealsData.getAllMeals;
        
        // Calculate similarity scores based on nutrition
        const targetNutrition = targetMeal.nutrition || {};
        const similarMeals = filteredMeals
            .filter(meal => meal.id !== targetMeal.id) // Exclude the target meal itself
            .map(meal => {
                const mealNutrition = meal.nutrition || {};
                
                // Calculate nutritional distance
                const caloriesDiff = Math.abs((mealNutrition.calories || 0) - (targetNutrition.calories || 0));
                const proteinDiff = Math.abs((mealNutrition.protein || 0) - (targetNutrition.protein || 0));
                const carbsDiff = Math.abs((mealNutrition.carbohydrates || 0) - (targetNutrition.carbohydrates || 0));
                const fatDiff = Math.abs((mealNutrition.fat || 0) - (targetNutrition.fat || 0));
                
                // Weighted similarity score (lower is better)
                const similarityScore = (
                    caloriesDiff * 0.4 +
                    proteinDiff * 0.3 +
                    carbsDiff * 0.2 +
                    fatDiff * 0.1
                ) / Math.max(targetNutrition.calories || 1, 1); // Normalize by target calories
                
                return {
                    meal,
                    similarityScore
                };
            })
            .sort((a, b) => a.similarityScore - b.similarityScore) // Sort by similarity (ascending)
            .slice(0, maxResults)
            .map(item => item.meal);
        
        return similarMeals;
        
    } catch (error) {
        console.error('Error finding similar meals:', error);
        return [];
    }
}

export default {
    generatePersonalizedMealPlan,
    findSimilarMeals
};