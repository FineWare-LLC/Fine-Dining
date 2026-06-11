import { gql } from '@apollo/client';

// Query for getting meals with comprehensive filtering
export const GET_MEALS_WITH_FILTERS = gql`
    query GetMealsWithFilters(
        $page: Int!
        $limit: Int!
        $search: String
        $diets: [String]
        $caloriesMin: Int
        $caloriesMax: Int
        $proteinMin: Int
        $proteinMax: Int
        $prepTimeMax: Int
        $cuisines: [String]
        $allergenExclusions: [String]
    ) {
        getMealsWithFilters(
            page: $page
            limit: $limit
            search: $search
            diets: $diets
            caloriesMin: $caloriesMin
            caloriesMax: $caloriesMax
            proteinMin: $proteinMin
            proteinMax: $proteinMax
            prepTimeMax: $prepTimeMax
            cuisines: $cuisines
            allergenExclusions: $allergenExclusions
        ) {
            meals {
                id
                mealName
                mealType
                prepTime
                activeTime
                difficulty
                cuisine
                price
                rating
                nutrition {
                    calories
                    protein
                    carbohydrates
                    fat
                    sodium
                    fiber
                    sugar
                }
                recipe {
                    id
                    recipeName
                    ingredients
                    instructions
                    prepTime
                    difficulty
                    nutritionFacts
                    tags
                    images
                    estimatedCost
                    author {
                        id
                        username
                        firstName
                        lastName
                    }
                    averageRating
                    ratingCount
                    createdAt
                    updatedAt
                }
                allergens
                dietaryTags
                restaurant {
                    id
                    restaurantName
                }
                source
                verified
            }
            totalCount
            hasNextPage
        }
    }
`;

// Query for getting user's saved recipes
export const GET_SAVED_RECIPES = gql`
    query GetSavedRecipes($page: Int, $limit: Int) {
        getSavedRecipes(page: $page, limit: $limit) {
            recipes {
                id
                recipeName
                ingredients
                instructions
                prepTime
                difficulty
                nutritionFacts
                tags
                images
                estimatedCost
                author {
                    id
                    username
                    firstName
                    lastName
                }
                averageRating
                ratingCount
                createdAt
                updatedAt
                savedAt
            }
            totalCount
            hasNextPage
        }
    }
`;

// Query for getting user's recipe preferences/dietary requirements
export const GET_USER_DIETARY_PREFERENCES = gql`
    query GetUserDietaryPreferences {
        me {
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

// Query for search suggestions
export const GET_SEARCH_SUGGESTIONS = gql`
    query GetSearchSuggestions($query: String!) {
        getSearchSuggestions(query: $query) {
            meals
            ingredients
            cuisines
            tags
        }
    }
`;