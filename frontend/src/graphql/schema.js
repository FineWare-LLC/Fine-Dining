/**********************************************************
 * FILE: typeDefs.js
 * Provides the GraphQL Schema Definition for Fine Dining
 **********************************************************/

import { gql } from 'apollo-server-micro';

/**
 * @constant typeDefs
 * Defines all types, queries, mutations for the Fine Dining app.
 */
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

    """User type for storing personal and dietary info."""
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

    """Input type for creating a new user."""
    input CreateUserInput {
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
    }

    """Input type for updating user info."""
    input UpdateUserInput {
        name: String
        weight: Float
        height: Float
        measurementSystem: MeasurementSystem
        weightGoal: WeightGoal
        foodGoals: [String]
        allergies: [String]
        dailyCalories: Int
    }

    """Mutations for creating, updating, deleting Fine Dining data."""
    type Mutation {
        # User
        createUser(input: CreateUserInput!): User!
        updateUser(id: ID!, input: UpdateUserInput!): User
        deleteUser(id: ID!): Boolean

        # Recipe
        createRecipe(
            recipeName: String!
            ingredients: [String]!
            instructions: String!
            prepTime: Int!
            difficulty: Difficulty
            nutritionFacts: String
        ): Recipe!

        """ Update an existing Recipe by ID """
        updateRecipe(
            id: ID!
            recipeName: String
            ingredients: [String]
            instructions: String
            prepTime: Int
            difficulty: Difficulty
            nutritionFacts: String
        ): Recipe

        """ Delete a recipe by ID, returns true if successful """
        deleteRecipe(id: ID!): Boolean

        # Restaurant
        createRestaurant(
            restaurantName: String!
            address: String!
            phone: String
            website: String
        ): Restaurant!

        """ Delete a restaurant by ID, returns true if successful """
        deleteRestaurant(id: ID!): Boolean

        # Meal Plan
        createMealPlan(userId: ID!, startDate: String!, endDate: String!): MealPlan!
        deleteMealPlan(id: ID!): Boolean

        # Stats
        createStats(userId: ID!, macros: String, micros: String): Stats!

        """ Delete a stats record by ID, returns true if successful """
        deleteStats(id: ID!): Boolean
    }
`;

/**********************************************************
 * EXPLANATION (LIKE I AM 10)
 * 1. "type Query" is where we read information.
 * 2. "type Mutation" is where we create or change data.
 * 3. "type User", "type Recipe", etc. are shapes of data.
 * 4. "enum" means a list of allowed words (like GENDER).
 **********************************************************/

/**********************************************************
 * EXPLANATION (LIKE I AM A PROFESSIONAL)
 * This schema defines the domain model for the Fine Dining
 * application, representing the primary entities: users,
 * recipes, restaurants, meal plans, individual meals,
 * and user-specific stats. The Query type offers read-only
 * operations, while the Mutation type now includes
 * updateRecipe, deleteRecipe, deleteRestaurant, and
 * deleteStats to support the end-to-end test coverage.
 **********************************************************/
