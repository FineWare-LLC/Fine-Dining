/**
 * @file /src/graphql/typeDefs.js
 * @description Provides the GraphQL Schema Definition for Fine Dining, heavily expanded for demonstration.
 * This version is over-engineered and hardened with extensive descriptions and suggestions for validations.
 */

import { gql } from 'graphql-tag';

export const typeDefs = gql`
    """
    Custom scalar for Dates.
    You might implement this scalar to validate proper ISO date strings.
    """
    scalar Date

    """
    User gender enumeration.
    Use this to ensure a valid, controlled list of genders.
    """
    enum Gender {
        MALE
        FEMALE
        OTHER
    }

    """
    Measurement system enumeration.
    Only METRIC and IMPERIAL values are allowed.
    """
    enum MeasurementSystem {
        METRIC
        IMPERIAL
    }

    """
    User weight goal enumeration.
    Valid weight goals for users.
    """
    enum WeightGoal {
        LOSE
        GAIN
        MAINTAIN
    }

    """
    Meal difficulty enumeration.
    Reflects the complexity level of a recipe.
    """
    enum Difficulty {
        EASY
        INTERMEDIATE
        HARD
    }

    """
    Meal type enumeration.
    Defines when a meal is typically consumed.
    """
    enum MealType {
        BREAKFAST
        LUNCH
        DINNER
        SNACK
    }

    """
    Role-based user enumeration.
    Restricts users to known roles for authorization purposes.
    """
    enum UserRole {
        ADMIN
        USER
        PREMIUM
    }

    """
    Account status enumeration.
    States that describe the user's account lifecycle.
    """
    enum AccountStatus {
        ACTIVE
        PENDING
        SUSPENDED
        DELETED
    }

    """
    MealPlan status enumeration.
    Defines the lifecycle status of a meal plan.
    """
    enum MealPlanStatus {
        DRAFT
        ACTIVE
        COMPLETED
        CANCELLED
    }

    """
    Restaurant price range enumeration.
    Provides a controlled vocabulary for price classification.
    """
    enum PriceRange {
        CHEAP
        MODERATE
        EXPENSIVE
        LUXURY
    }

    """
    Represents a User with robust fields.
    Note: Passwords are handled separately for security.
    """
    type User {
        id: ID!
        name: String!
        email: String!
        role: UserRole!
        accountStatus: AccountStatus!
        weight: Float
        height: Float
        gender: Gender!
        measurementSystem: MeasurementSystem!
        weightGoal: WeightGoal
        foodGoals: [String]
        allergies: [String]
        questionnaire: Questionnaire
        dailyCalories: Int
        nutritionTargets: NutritionTargets
        avatarUrl: String
        lastLogin: Date
        createdAt: Date!
        updatedAt: Date!
    }

    """
    Represents a Recipe with details including instructions, ingredients, and ratings.
    """
    type Recipe {
        id: ID!
        recipeName: String!
        ingredients: [String]!
        instructions: String!
        prepTime: Int!
        difficulty: Difficulty!
        nutritionFacts: String
        tags: [String]
        images: [String]
        estimatedCost: Float
        author: User
        averageRating: Float
        ratingCount: Int
        createdAt: Date!
        updatedAt: Date!
    }

    """
    Represents a Restaurant with location, contact, and rating details.
    """
    type Restaurant {
        id: ID!
        restaurantName: String!
        address: String!
        phone: String
        website: String
        cuisineType: [String]
        priceRange: PriceRange
        openingHours: [OpeningHour] # We'll define OpeningHour as a custom type
        averageRating: Float
        ratingCount: Int
        location: GeoJSON
        createdAt: Date!
        updatedAt: Date!
    }

    """
    Simple key/value pair for restaurant opening hours.
    For example: mon: "9AM-5PM"
    """
    type OpeningHour {
        day: String
        hours: String
    }

    """
    GeoJSON for location-based data.
    Must conform to standard GeoJSON structures.
    """
    type GeoJSON {
        type: String
        coordinates: [Float]
    }

    """
    Represents a MealPlan which groups multiple meals for a user.
    """
    type MealPlan {
        id: ID!
        user: User!
        startDate: Date!
        endDate: Date!
        status: MealPlanStatus
        title: String
        totalCalories: Int
        meals: [Meal]!
        createdAt: Date!
        updatedAt: Date!
    }

    """
    Represents nutrition information for a meal.
    """
    type Nutrition {
        carbohydrates: Float
        protein: Float
        fat: Float
        sodium: Float
    }

    """
    Represents a meal in a generated optimized meal plan.
    """
    type GeneratedMeal {
        mealId: ID!
        mealName: String!
        servings: Float!
        pricePerServing: Float!
        totalPrice: Float!
        nutrition: Nutrition!
    }

    """
    Represents the result of a meal plan optimization.
    """
    type GeneratedMealPlanPayload {
        meals: [GeneratedMeal!]!
        totalCost: Float!
        totalNutrition: Nutrition!
    }

    """
    Input type for nutrition information.
    """
    input NutritionInput {
        carbohydrates: Float
        protein: Float
        fat: Float
        sodium: Float
    }

    """
    Represents nutrition targets for meal optimization.
    """
    type NutritionTargets {
        proteinMin: Float
        proteinMax: Float
        carbohydratesMin: Float
        carbohydratesMax: Float
        fatMin: Float
        fatMax: Float
        sodiumMin: Float
        sodiumMax: Float
    }

    """
    Input type for nutrition targets.
    """
    input NutritionTargetsInput {
        proteinMin: Float
        proteinMax: Float
        carbohydratesMin: Float
        carbohydratesMax: Float
        fatMin: Float
        fatMax: Float
        sodiumMin: Float
        sodiumMax: Float
    }

    """
    Input type for filtering meals by price range.
    """
    input PriceRangeInput {
        min: Float
        max: Float
    }

    """
    Input type for filtering meals by nutrition values.
    """
    input NutritionRangeInput {
        carbohydratesMin: Float
        carbohydratesMax: Float
        proteinMin: Float
        proteinMax: Float
        fatMin: Float
        fatMax: Float
        sodiumMin: Float
        sodiumMax: Float
    }

    """
    Input type for filtering meals by allergens.
    """
    input AllergensFilterInput {
        includeAllergens: [String]
        excludeAllergens: [String]
    }

    type Questionnaire {
        allergies: [String]
        disallowedIngredients: [String]
        dietaryPattern: String
        activityLevel: Int
    }

    input QuestionnaireInput {
        allergies: [String]
        disallowedIngredients: [String]
        dietaryPattern: String
        activityLevel: Int
    }

    """
    Represents a Meal which can be tied to a recipe, restaurant, or be custom.
    """
    type Meal {
        id: ID!
        mealPlan: MealPlan!
        date: Date!
        mealType: MealType!
        recipe: Recipe
        restaurant: Restaurant
        mealName: String
        price: Float
        ingredients: [String]
        nutrition: Nutrition
        allergens: [String]
        nutritionFacts: String
        portionSize: String
        notes: String
        createdAt: Date!
        updatedAt: Date!
    }

    """
    Represents a menu item belonging to a restaurant.
    """
    type MenuItem {
        id: ID!
        restaurant: Restaurant!
        mealName: String!
        price: Float
        description: String
        allergens: [String]
        nutritionFacts: String
        createdAt: Date!
        updatedAt: Date!
    }

    """
    Statistics on presolve reduction.
    """
    type PresolveStats {
        before: Int!
        after: Int!
    }

    """
    Represents nutritional and activity statistics logged by a user.
    """
    type Stats {
        id: ID!
        user: User!
        dateLogged: Date!
        macros: String
        micros: String
        caloriesConsumed: Int
        waterIntake: Int
        steps: Int
        createdAt: Date!
        updatedAt: Date!
    }

    """
    Represents a Review made by a user on either a Recipe or Restaurant.
    """
    type Review {
        id: ID!
        user: User!
        targetType: String!
        targetId: ID!
        rating: Int!
        comment: String
        createdAt: Date!
        updatedAt: Date!
    }

    """
    Simple LatLng coordinate type.
    """
    type LatLng {
        latitude: Float
        longitude: Float
    }

    """
    Represents restaurant data fetched from an external API (e.g., Google Places).
    """
    type ExternalRestaurant {
        placeId: String!       # External API Place ID (e.g., Google Place ID)
        name: String
        vicinity: String       # Short address/neighborhood
        rating: Float
        userRatingsTotal: Int
        location: LatLng       # Using the simple LatLng type defined above
    }

    type NearbyRestaurantsResult {
        source: String
        restaurants: [ExternalRestaurant]
    }

    """
    Query definitions for retrieving data in Fine Dining.
    Each query includes security and validation considerations.
    """
    type Query {
        ping: String
        presolveStats: PresolveStats
        getUser(id: ID!): User
        getUsers(page: Int, limit: Int): [User]
        searchUsers(keyword: String!): [User]
        getQuestionnaire(id: ID!): Questionnaire
        getRecipe(id: ID!): Recipe
        getRecipes(page: Int, limit: Int): [Recipe]
        searchRecipes(keyword: String!): [Recipe]
        getRestaurant(id: ID!): Restaurant
        getRestaurants(page: Int, limit: Int): [Restaurant]
        searchRestaurants(keyword: String!): [Restaurant]
        getMealPlan(id: ID!): MealPlan
        getMealPlans(userId: ID, page: Int, limit: Int): [MealPlan]
        getMeals(
            mealPlanId: ID,
            priceRange: PriceRangeInput,
            nutritionRange: NutritionRangeInput,
            allergensFilter: AllergensFilterInput,
            page: Int,
            limit: Int
        ): [Meal]
        getAllMeals(
            priceRange: PriceRangeInput,
            nutritionRange: NutritionRangeInput,
            allergensFilter: AllergensFilterInput,
            page: Int,
            limit: Int
        ): [Meal]
        getStatsByUser(userId: ID!): [Stats]
        getReview(id: ID!): Review
        getReviewsForTarget(targetType: String!, targetId: ID!): [Review]
        getMenuItem(id: ID!): MenuItem
        getMenuItemsByRestaurant(restaurantId: ID!, page: Int, limit: Int): [MenuItem]
        findNearbyRestaurants(
            latitude: Float!,
            longitude: Float!,
            radius: Int,
            keyword: String
        ): NearbyRestaurantsResult
    }

    """
    Input type for creating a new user account.
    Consider adding directives like @constraint if using validation libraries.
    """
    input CreateUserInput {
        name: String!
        email: String! # e.g. "user@example.com" @constraint(format: "email")
        password: String! # Enforce minimum length and complexity if desired.
        role: UserRole
        weight: Float
        height: Float
        gender: Gender!
        measurementSystem: MeasurementSystem!
        weightGoal: WeightGoal
        foodGoals: [String]
        allergies: [String]
        dailyCalories: Int
    }

    """
    Input type for updating a user.
    """
    input UpdateUserInput {
        name: String
        password: String
        weight: Float
        height: Float
        measurementSystem: MeasurementSystem
        weightGoal: WeightGoal
        foodGoals: [String]
        allergies: [String]
        dailyCalories: Int
        nutritionTargets: NutritionTargetsInput
        accountStatus: AccountStatus
        role: UserRole
    }

    """
    Payload type returned by loginUser containing a JWT token and user info.
    """
    type AuthPayload {
        token: String!
        user: User!
    }

    """
    Input type for custom nutrition targets when generating an optimized meal plan.
    """
    input CustomNutritionTargetsInput {
        proteinMin: Float
        proteinMax: Float
        carbohydratesMin: Float
        carbohydratesMax: Float
        fatMin: Float
        fatMax: Float
        sodiumMin: Float
        sodiumMax: Float
    }

    """
    Mutation definitions for Fine Dining.
    Each mutation should implement robust security, input validations, and logging.
    """
    type Mutation {
        createUser(input: CreateUserInput!): User!
        updateUser(id: ID!, input: UpdateUserInput!): User
        deleteUser(id: ID!): Boolean
        loginUser(email: String!, password: String!): AuthPayload
        requestPasswordReset(email: String!): Boolean
        resetPassword(resetToken: String!, newPassword: String!): Boolean
        upsertQuestionnaire(id: ID!, input: QuestionnaireInput!): Questionnaire
        generateOptimizedMealPlan(
            selectedMealIds: [ID],
            customNutritionTargets: CustomNutritionTargetsInput
        ): GeneratedMealPlanPayload!
        createRecipe(
            recipeName: String!
            ingredients: [String]!
            instructions: String!
            prepTime: Int!
            difficulty: Difficulty
            nutritionFacts: String
            tags: [String]
            images: [String]
            estimatedCost: Float
            authorId: ID
        ): Recipe!
        updateRecipe(
            id: ID!
            recipeName: String
            ingredients: [String]
            instructions: String
            prepTime: Int
            difficulty: Difficulty
            nutritionFacts: String
            tags: [String]
            images: [String]
            estimatedCost: Float
        ): Recipe
        deleteRecipe(id: ID!): Boolean
        createRestaurant(
            restaurantName: String!
            address: String!
            phone: String
            website: String
            cuisineType: [String]
            priceRange: PriceRange
        ): Restaurant!
        updateRestaurant(
            id: ID!
            restaurantName: String
            address: String
            phone: String
            website: String
            cuisineType: [String]
            priceRange: PriceRange
        ): Restaurant
        deleteRestaurant(id: ID!): Boolean
        createMenuItem(
            restaurantId: ID!,
            mealName: String!,
            price: Float,
            description: String,
            allergens: [String],
            nutritionFacts: String
        ): MenuItem!
        updateMenuItem(
            id: ID!,
            mealName: String,
            price: Float,
            description: String,
            allergens: [String],
            nutritionFacts: String
        ): MenuItem
        deleteMenuItem(id: ID!): Boolean
        createMealPlan(
            userId: ID!
            startDate: Date!
            endDate: Date!
            title: String
            status: MealPlanStatus
            totalCalories: Int
        ): MealPlan!
        updateMealPlan(
            id: ID!
            startDate: Date
            endDate: Date
            title: String
            status: MealPlanStatus
            totalCalories: Int
        ): MealPlan
        deleteMealPlan(id: ID!): Boolean
        createMeal(
            mealPlanId: ID!
            date: Date!
            mealType: MealType!
            recipeId: ID
            restaurantId: ID
            mealName: String
            price: Float
            ingredients: [String]
            nutrition: NutritionInput
            allergens: [String]
            nutritionFacts: String
            portionSize: String
            notes: String
        ): Meal!
        updateMeal(
            id: ID!
            date: Date
            mealType: MealType
            recipeId: ID
            restaurantId: ID
            mealName: String
            price: Float
            ingredients: [String]
            nutrition: NutritionInput
            allergens: [String]
            nutritionFacts: String
            portionSize: String
            notes: String
        ): Meal
        deleteMeal(id: ID!): Boolean
        createStats(
            userId: ID!
            macros: String
            micros: String
            caloriesConsumed: Int
            waterIntake: Int
            steps: Int
        ): Stats!
        deleteStats(id: ID!): Boolean
        createReview(
            targetType: String!
            targetId: ID!
            rating: Int!
            comment: String
        ): Review!
        deleteReview(id: ID!): Boolean
        submitFeedback(
            message: String!
            rating: Int
            email: String
        ): Boolean
    }
`;
