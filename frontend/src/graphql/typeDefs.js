/**********************************************************
 * FILE: /src/graphql/typeDefs.js
 * Provides the GraphQL Schema Definition for Fine Dining,
 * heavily expanded for demonstration.
 **********************************************************/
// Corrected import for the gql tag
import { gql } from 'graphql-tag'; // Changed from 'apollo-server-micro'

export const typeDefs = gql`
    """Custom scalar for Dates."""
    scalar Date

    """User gender enumeration."""
    enum Gender {
        MALE
        FEMALE
        OTHER
    }

    """Measurement system enumeration."""
    enum MeasurementSystem {
        METRIC
        IMPERIAL
    }

    """User weight goal enumeration."""
    enum WeightGoal {
        LOSE
        GAIN
        MAINTAIN
    }

    """Meal difficulty enumeration."""
    enum Difficulty {
        EASY
        INTERMEDIATE
        HARD
    }

    """Meal type enumeration."""
    enum MealType {
        BREAKFAST
        LUNCH
        DINNER
        SNACK
    }

    """Role-based user enumeration."""
    enum UserRole {
        ADMIN
        USER
        PREMIUM
    }

    """Account status enumeration."""
    enum AccountStatus {
        ACTIVE
        PENDING
        SUSPENDED
        DELETED
    }

    """MealPlan status enumeration."""
    enum MealPlanStatus {
        DRAFT
        ACTIVE
        COMPLETED
        CANCELLED
    }

    """Restaurant price range enumeration."""
    enum PriceRange {
        CHEAP
        MODERATE
        EXPENSIVE
        LUXURY
    }

    """User type with robust fields, including accountStatus and role."""
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
        dailyCalories: Int
        lastLogin: Date
        createdAt: Date!
        updatedAt: Date!
    }

    """Recipe type storing cooking steps, ingredients, advanced fields."""
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

    """Restaurant type storing location and contact info."""
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

    """Simple key/value for opening hours (mon: "9AM-5PM", etc.)."""
    type OpeningHour {
        day: String
        hours: String
    }

    """GeoJSON for location-based data."""
    type GeoJSON {
        type: String
        coordinates: [Float]
    }

    """Meal Plan type storing a set of meals for a user."""
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

    """Meal type storing recipes, restaurants, or custom items."""
    type Meal {
        id: ID!
        mealPlan: MealPlan!
        date: Date!
        mealType: MealType!
        recipe: Recipe
        restaurant: Restaurant
        mealName: String
        ingredients: [String]
        nutritionFacts: String
        portionSize: String
        notes: String
        createdAt: Date!
        updatedAt: Date!
    }

    """Stats type storing logged nutritional data."""
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

    """Review type for rating either a Recipe or Restaurant."""
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

    """Simple Lat/Lng coordinate type."""
    type LatLng {
        latitude: Float
        longitude: Float
    }

    """Represents restaurant data fetched from an external API like Google Places."""
    type ExternalRestaurant {
        placeId: String!       # External API Place ID (e.g., Google Place ID)
        name: String
        vicinity: String       # Short address/neighborhood
        rating: Float
        userRatingsTotal: Int
        location: LatLng       # Using the simple LatLng type defined above
    }

    """Queries for retrieving Fine Dining data."""
    type Query {
        ping: String
        getUser(id: ID!): User
        getUsers(page: Int, limit: Int): [User]
        searchUsers(keyword: String!): [User]
        getRecipe(id: ID!): Recipe
        getRecipes(page: Int, limit: Int): [Recipe]
        searchRecipes(keyword: String!): [Recipe]
        getRestaurant(id: ID!): Restaurant
        getRestaurants(page: Int, limit: Int): [Restaurant]
        searchRestaurants(keyword: String!): [Restaurant]
        getMealPlan(id: ID!): MealPlan
        getMealPlans(userId: ID, page: Int, limit: Int): [MealPlan]
        getStatsByUser(userId: ID!): [Stats]
        getReview(id: ID!): Review
        getReviewsForTarget(targetType: String!, targetId: ID!): [Review]
        findNearbyRestaurants(
            latitude: Float!,
            longitude: Float!,
            radius: Int,
            keyword: String
        ): [ExternalRestaurant]
    }

    """Input type for creating a new user (includes password)."""
    input CreateUserInput {
        name: String!
        email: String!
        password: String!
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

    """Input type for updating user info (password is optional)."""
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
        accountStatus: AccountStatus
        role: UserRole
    }

    """AuthPayload for loginUser returning a token and user info."""
    type AuthPayload {
        token: String!
        user: User!
    }

    """Mutations for creating, updating, deleting Fine Dining data."""
    type Mutation {
        createUser(input: CreateUserInput!): User!
        updateUser(id: ID!, input: UpdateUserInput!): User
        deleteUser(id: ID!): Boolean
        loginUser(email: String!, password: String!): AuthPayload
        requestPasswordReset(email: String!): Boolean
        resetPassword(resetToken: String!, newPassword: String!): Boolean
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
            ingredients: [String]
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
            ingredients: [String]
            nutritionFacts: String
            portionSize: String
            notes: String
        ): Meal
        deleteMeal(id: ID!): Boolean
        createStats(userId: ID!, macros: String, micros: String, caloriesConsumed: Int, waterIntake: Int, steps: Int): Stats!
        deleteStats(id: ID!): Boolean
        createReview(targetType: String!, targetId: ID!, rating: Int!, comment: String): Review!
        deleteReview(id: ID!): Boolean
    }
`;