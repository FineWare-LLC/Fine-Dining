import { gql } from '@apollo/client';

// Mutation for saving/liking a recipe
export const SAVE_RECIPE_MUTATION = gql`
    mutation SaveRecipe($recipeId: ID!) {
        saveRecipe(recipeId: $recipeId) {
            id
            recipeName
            images
            difficulty
            prepTime
            averageRating
            ratingCount
        }
    }
`;

// Mutation for rejecting/dismissing a recipe
export const REJECT_RECIPE_MUTATION = gql`
    mutation RejectRecipe($recipeId: ID!) {
        rejectRecipe(recipeId: $recipeId)
    }
`;

// Mutation for removing a saved recipe
export const UNSAVE_RECIPE_MUTATION = gql`
    mutation UnsaveRecipe($recipeId: ID!) {
        unsaveRecipe(recipeId: $recipeId) {
            success
            message
        }
    }
`;

// Mutation for updating user dietary preferences
export const UPDATE_DIETARY_PREFERENCES_MUTATION = gql`
    mutation UpdateDietaryPreferences($preferences: DietaryPreferencesInput!) {
        updateDietaryPreferences(preferences: $preferences) {
            id
            dietaryPattern
            allergyList
            disallowedIngredients
            nutritionGoals {
                caloriesMin
                caloriesMax
                proteinMin
                proteinMax
                carbsMin
                carbsMax
                fatMin
                fatMax
            }
            preferences {
                cuisines
                maxPrepTime
                difficulty
            }
        }
    }
`;

// Mutation for rating a recipe after trying it
export const RATE_RECIPE_MUTATION = gql`
    mutation RateRecipe($recipeId: ID!, $rating: Int!, $comment: String) {
        rateRecipe(recipeId: $recipeId, rating: $rating, comment: $comment) {
            id
            rating
            comment
            recipe {
                id
                recipeName
                averageRating
                ratingCount
            }
            user {
                id
                username
            }
            createdAt
        }
    }
`;

// Mutation for adding a recipe to meal plan
export const ADD_RECIPE_TO_MEAL_PLAN_MUTATION = gql`
    mutation AddRecipeToMealPlan($recipeId: ID!, $mealPlanId: ID!, $mealType: MealType!, $date: Date!) {
        addRecipeToMealPlan(recipeId: $recipeId, mealPlanId: $mealPlanId, mealType: $mealType, date: $date) {
            id
            mealName
            mealType
            date
            recipe {
                id
                recipeName
                images
                prepTime
                difficulty
            }
            mealPlan {
                id
                title
            }
        }
    }
`;