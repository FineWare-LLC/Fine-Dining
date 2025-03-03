/**********************************************************
 * FILE: typeDefs.js
 * Provides the GraphQL Schema Definition for Fine Dining,
 * including user authentication via loginUser.
 **********************************************************/

import { gql } from 'apollo-server-micro';

export const typeDefs = gql`
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

    """User type for storing personal, dietary, and authentication info."""
    type User {
        id: ID!
        name: String!
        email: String!
        weight: Float
        height: Float
        gender: Gender!
        measurementSystem: MeasurementSystem!
        weightGoal: WeightGoal
        foodGoals: [String]
        allergies: [String]
        dailyCalories: Int
        # password is intentionally omitted from the public schema
    }

    """Recipe type storing cooking steps, ingredients, nutrition info."""
    type Recipe {
        id: ID!
        recipeName: String!
        ingredients: [String]!
        instructions: String!
        prepTime: Int!
        difficulty: Difficulty!
        nutritionFacts: String
    }

    """Restaurant type storing location and contact info."""
    type Restaurant {
        id: ID!
        restaurantName: String!
        address: String!
        phone: String
        website: String
    }

    """Meal Plan type storing a 7-day plan for a user."""
    type MealPlan {
        id: ID!
        user: User!
        startDate: String!
        endDate: String!
        created: String!
        meals: [Meal]!
    }

    """Meal type storing recipes, restaurants, or custom items."""
    type Meal {
        id: ID!
        mealPlan: MealPlan!
        date: String!
        mealType: MealType!
        recipe: Recipe
        restaurant: Restaurant
        mealName: String
        ingredients: [String]
        nutritionFacts: String
    }

    """Stats type storing logged nutritional data."""
    type Stats {
        id: ID!
        user: User!
        dateLogged: String!
        macros: String
        micros: String
    }

    """Queries for retrieving Fine Dining data."""
    type Query {
        # User
        getUser(id: ID!): User
        getUsers: [User]

        # Recipe
        getRecipe(id: ID!): Recipe
        getRecipes: [Recipe]

        # Restaurant
        getRestaurant(id: ID!): Restaurant
        getRestaurants: [Restaurant]

        # Meal Plan
        getMealPlan(id: ID!): MealPlan
        getMealPlans: [MealPlan]

        # Stats
        getStatsByUser(userId: ID!): [Stats]
    }

    """Input type for creating a new user (now includes password)."""
    input CreateUserInput {
        name: String!
        email: String!
        password: String!  # new required field
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
    }

    """AuthPayload for loginUser returning a token and user info."""
    type AuthPayload {
        token: String!
        user: User!
    }

    """Mutations for creating, updating, deleting Fine Dining data."""
    type Mutation {
        # User
        createUser(input: CreateUserInput!): User!
        updateUser(id: ID!, input: UpdateUserInput!): User
        deleteUser(id: ID!): Boolean

        """ Login mutation that returns a JWT token & the user """
        loginUser(email: String!, password: String!): AuthPayload

        # Recipe
        createRecipe(
            recipeName: String!
            ingredients: [String]!
            instructions: String!
            prepTime: Int!
            difficulty: Difficulty
            nutritionFacts: String
        ): Recipe!

        updateRecipe(
            id: ID!
            recipeName: String
            ingredients: [String]
            instructions: String
            prepTime: Int
            difficulty: Difficulty
            nutritionFacts: String
        ): Recipe

        deleteRecipe(id: ID!): Boolean

        # Restaurant
        createRestaurant(
            restaurantName: String!
            address: String!
            phone: String
            website: String
        ): Restaurant!

        deleteRestaurant(id: ID!): Boolean

        # Meal Plan
        createMealPlan(userId: ID!, startDate: String!, endDate: String!): MealPlan!
        deleteMealPlan(id: ID!): Boolean

        # Stats
        createStats(userId: ID!, macros: String, micros: String): Stats!
        deleteStats(id: ID!): Boolean
    }
`;

/**********************************************************
 * EXPLANATION (LIKE I AM 10)
 * 1. We added `password: String!` to CreateUserInput so
 *    you must give a password when you create a user.
 * 2. We added `loginUser(email, password)` which returns
 *    `AuthPayload` with `token` + user.
 **********************************************************/

/**********************************************************
 * EXPLANATION (LIKE I AM A PROFESSIONAL)
 * This updated schema includes a `password` field for user
 * creation, ensuring the Mongoose pre-save hook can hash it.
 * The `loginUser` mutation expects `email` and `password`,
 * returning an `AuthPayload` that includes a JWT and user data.
 **********************************************************/
