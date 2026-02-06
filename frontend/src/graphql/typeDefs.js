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
    Notification type enumeration.
    Defines the type of notification for styling and priority.
    """
    enum NotificationType {
        INFO
        SUCCESS
        WARNING
        ERROR
        SYSTEM
    }

    """
    Notification priority enumeration.
    Defines the priority level of notifications.
    """
    enum NotificationPriority {
        LOW
        MEDIUM
        HIGH
        URGENT
    }

    """
    Q&A question difficulty enumeration.
    Defines the difficulty level of nutrition questions.
    """
    enum QuestionDifficulty {
        BEGINNER
        INTERMEDIATE
        ADVANCED
        EXPERT
    }

    """
    Q&A answer type enumeration.
    Categorizes answer options for educational purposes.
    """
    enum AnswerType {
        CORRECT
        WRONG
        MIGHT_BE
        ALMOST_RIGHT
    }

    """
    Represents a Question Category for the Q&A system.
    """
    type QuestionCategory {
        id: ID!
        name: String!
        description: String!
        totalSubsets: Int!
        completionReward: Int!
        iconUrl: String
        isActive: Boolean!
        createdAt: Date!
        updatedAt: Date!
    }

    """
    Represents a Question Subset within a category.
    """
    type QuestionSubset {
        id: ID!
        categoryId: ID!
        category: QuestionCategory!
        subsetNumber: Int!
        subsetName: String!
        description: String
        totalQuestions: Int!
        difficulty: QuestionDifficulty!
        isUnlocked: Boolean!
        createdAt: Date!
        updatedAt: Date!
    }

    """
    Represents a single Q&A question with all answer options.
    """
    type Question {
        id: ID!
        subsetId: ID!
        subset: QuestionSubset!
        questionNumber: Int!
        questionText: String!
        explanation: String!
        correctAnswers: [String!]!
        wrongAnswers: [String!]!
        mightBeAnswers: [String!]!
        almostRightAnswers: [String!]!
        nutritionFocus: [String!]!
        difficulty: QuestionDifficulty!
        createdAt: Date!
        updatedAt: Date!
    }

    """
    Represents a user's progress on individual questions.
    """
    type UserQuestionProgress {
        id: ID!
        userId: ID!
        user: User!
        questionId: ID!
        question: Question!
        isCompleted: Boolean!
        isCorrect: Boolean
        selectedAnswer: String
        selectedAnswerType: AnswerType
        attemptsCount: Int!
        pointsEarned: Int!
        completedAt: Date
        createdAt: Date!
        updatedAt: Date!
    }

    """
    Represents a user's overall progress within a category.
    """
    type UserCategoryProgress {
        id: ID!
        userId: ID!
        user: User!
        categoryId: ID!
        category: QuestionCategory!
        completedQuestions: Int!
        totalQuestions: Int!
        correctAnswers: Int!
        wrongAnswers: Int!
        currentStreak: Int!
        bestStreak: Int!
        pointsEarned: Int!
        badgesEarned: [String!]!
        completionPercentage: Float!
        averageScore: Float!
        lastActivityAt: Date
        createdAt: Date!
        updatedAt: Date!
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
        # Q&A System integration
        qaPoints: Int
        qaBadges: [String]
        qaCurrentStreak: Int
        qaBestStreak: Int
        categoryProgress: [UserCategoryProgress]
        savedRecipes: [Recipe]
    }

    """
    Represents overall Q&A statistics for a user.
    """
    type UserQAStats {
        totalPoints: Int!
        totalCorrectAnswers: Int!
        totalQuestionsAttempted: Int!
        averageAccuracy: Float!
        currentGlobalStreak: Int!
        bestGlobalStreak: Int!
        totalBadges: Int!
        categoriesCompleted: Int!
        totalTimeSpent: Int!
        lastActivityAt: Date
        categoryStats: [UserCategoryProgress!]!
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
        videoUrl: String
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
    Represents an image attached to a notification.
    """
    type NotificationImage {
        url: String!
        alt: String
        caption: String
    }

    """
    Represents a notification sent to a user.
    Supports unlimited categories, rich content, and image attachments.
    """
    type Notification {
        id: ID!
        title: String!
        body: String!
        category: String!
        type: NotificationType!
        priority: NotificationPriority!
        recipient: User!
        sender: User
        images: [NotificationImage]
        metadata: String # JSON string for flexible metadata
        actionUrl: String
        actionText: String
        isRead: Boolean!
        readAt: Date
        isArchived: Boolean!
        archivedAt: Date
        expiresAt: Date
        scheduledFor: Date
        tags: [String]
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
    Represents nutrition information with additional fields for meal catalog.
    """
    type MealNutrition {
        calories: Int
        protein: Float
        carbohydrates: Float
        fat: Float
        sodium: Float
        fiber: Float
        sugar: Float
    }

    """
    Represents a recipe ingredient with quantity and unit.
    """
    type Ingredient {
        name: String!
        quantity: Float
        unit: String
    }

    """
    Represents a recipe with images, ingredients, and cooking instructions for meal catalog.
    """
    type MealRecipe {
        images: [String]
        ingredients: [Ingredient]
        instructions: String
    }

    """
    Represents a meal optimized for the meal catalog with enhanced fields.
    """
    type CatalogMeal {
        id: ID!
        mealName: String!
        mealType: MealType
        prepTime: Int
        activeTime: Int
        difficulty: Difficulty
        cuisine: String
        price: Float
        rating: Float
        nutrition: MealNutrition
        recipe: MealRecipe
        allergens: [String]
        dietaryTags: [String]
        restaurant: Restaurant
        source: String
        verified: Boolean
        createdAt: Date!
        updatedAt: Date!
    }

    """
    Result type for getMealsWithFilters query with pagination support.
    """
    type MealsWithFiltersResult {
        meals: [CatalogMeal!]!
        totalCount: Int!
        hasNextPage: Boolean!
    }

    """
    Search suggestions result type for autocomplete functionality.
    """
    type SearchSuggestions {
        meals: [String!]!
        ingredients: [String!]!
        cuisines: [String!]!
        tags: [String!]!
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
    Enhanced restaurant result type for local restaurant filtering.
    Includes filtering metadata and restaurant scoring information.
    """
    type LocalRestaurantsResult {
        source: String
        restaurants: [LocalExternalRestaurant]
        filteredCount: Int          # Total restaurants found before filtering
        localCount: Int             # Number of local restaurants after filtering
        filterCriteria: FilterCriteria
    }

    """
    Enhanced external restaurant type with local scoring information.
    """
    type LocalExternalRestaurant {
        placeId: String!
        name: String
        vicinity: String
        rating: Float
        userRatingsTotal: Int
        location: LatLng
        localScore: Int             # Local restaurant score (0-100)
        isChain: Boolean            # Whether this is identified as a chain restaurant
        website: String             # Restaurant website (if available)
    }

    """
    Filter criteria used for local restaurant filtering.
    """
    type FilterCriteria {
        minLocalScore: Int
        excludeChains: Boolean
        maxResults: Int
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
        findNearbyLocalRestaurants(
            latitude: Float!,
            longitude: Float!,
            radius: Int,
            keyword: String,
            excludeChains: Boolean,
            minLocalScore: Int,
            maxResults: Int
        ): LocalRestaurantsResult
        getNotification(id: ID!): Notification
        getNotifications(
            recipientId: ID,
            category: String,
            isRead: Boolean,
            isArchived: Boolean,
            page: Int,
            limit: Int
        ): [Notification]
        getUnreadNotificationCount(recipientId: ID!): Int
        getNotificationsByCategory(recipientId: ID!, category: String!): [Notification]
        getMealsWithFilters(
            page: Int!
            limit: Int!
            search: String
            diets: [String]
            caloriesMin: Int
            caloriesMax: Int
            proteinMin: Int
            proteinMax: Int
            prepTimeMax: Int
            cuisines: [String]
            allergenExclusions: [String]
        ): MealsWithFiltersResult!
        getSearchSuggestions(query: String!): SearchSuggestions!
        # Q&A System Queries
        getQuestionCategories: [QuestionCategory!]!
        getQuestionCategory(id: ID!): QuestionCategory
        getQuestionSubsets(categoryId: ID!): [QuestionSubset!]!
        getQuestionSubset(id: ID!): QuestionSubset
        getQuestions(subsetId: ID!): [Question!]!
        getQuestion(id: ID!): Question
        getRandomQuestion(categoryId: ID, difficulty: QuestionDifficulty): Question
        getUserCategoryProgress(userId: ID!, categoryId: ID): UserCategoryProgress
        getUserQuestionProgress(userId: ID!, questionId: ID!): UserQuestionProgress
        getQALeaderboard(categoryId: ID, limit: Int): [UserCategoryProgress!]!
        getUserQAStats(userId: ID!): UserQAStats
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
    Input type for notification image attachments.
    """
    input NotificationImageInput {
        url: String!
        alt: String
        caption: String
    }

    """
    Input type for creating a new notification.
    """
    input CreateNotificationInput {
        title: String!
        body: String!
        category: String!
        type: NotificationType
        priority: NotificationPriority
        recipientId: ID!
        senderId: ID
        images: [NotificationImageInput]
        metadata: String
        actionUrl: String
        actionText: String
        expiresAt: Date
        scheduledFor: Date
        tags: [String]
    }

    """
    Input type for updating a notification.
    """
    input UpdateNotificationInput {
        title: String
        body: String
        category: String
        type: NotificationType
        priority: NotificationPriority
        images: [NotificationImageInput]
        metadata: String
        actionUrl: String
        actionText: String
        isRead: Boolean
        isArchived: Boolean
        expiresAt: Date
        scheduledFor: Date
        tags: [String]
    }

    """
    Input type for submitting an answer to a Q&A question.
    """
    input SubmitAnswerInput {
        questionId: ID!
        selectedAnswer: String!
        timeSpent: Int
    }

    """
    Input type for creating or updating question categories.
    """
    input QuestionCategoryInput {
        name: String!
        description: String!
        totalSubsets: Int!
        completionReward: Int!
        iconUrl: String
        isActive: Boolean
    }

    """
    Input type for creating or updating question subsets.
    """
    input QuestionSubsetInput {
        categoryId: ID!
        subsetNumber: Int!
        subsetName: String!
        description: String
        totalQuestions: Int!
        difficulty: QuestionDifficulty!
        isUnlocked: Boolean
    }

    """
    Input type for creating or updating questions.
    """
    input QuestionInput {
        subsetId: ID!
        questionNumber: Int!
        questionText: String!
        explanation: String!
        correctAnswers: [String!]!
        wrongAnswers: [String!]!
        mightBeAnswers: [String!]!
        almostRightAnswers: [String!]!
        nutritionFocus: [String!]!
        difficulty: QuestionDifficulty!
    }

    """
    Payload returned after submitting an answer.
    """
    type SubmitAnswerPayload {
        isCorrect: Boolean!
        answerType: AnswerType!
        pointsEarned: Int!
        explanation: String!
        streakCount: Int!
        newBadges: [String!]!
        userQuestionProgress: UserQuestionProgress!
        userCategoryProgress: UserCategoryProgress!
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
        saveRecipe(recipeId: ID!): Recipe
        rejectRecipe(recipeId: ID!): Boolean
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
        createNotification(input: CreateNotificationInput!): Notification!
        updateNotification(id: ID!, input: UpdateNotificationInput!): Notification
        deleteNotification(id: ID!): Boolean
        markNotificationAsRead(id: ID!): Notification
        markNotificationAsUnread(id: ID!): Notification
        archiveNotification(id: ID!): Notification
        unarchiveNotification(id: ID!): Notification
        markAllNotificationsAsRead(recipientId: ID!): Boolean
        deleteAllNotifications(recipientId: ID!): Boolean
        # Q&A System Mutations
        submitAnswer(userId: ID!, input: SubmitAnswerInput!): SubmitAnswerPayload!
        createQuestionCategory(input: QuestionCategoryInput!): QuestionCategory!
        updateQuestionCategory(id: ID!, input: QuestionCategoryInput!): QuestionCategory
        deleteQuestionCategory(id: ID!): Boolean
        createQuestionSubset(input: QuestionSubsetInput!): QuestionSubset!
        updateQuestionSubset(id: ID!, input: QuestionSubsetInput!): QuestionSubset
        deleteQuestionSubset(id: ID!): Boolean
        createQuestion(input: QuestionInput!): Question!
        updateQuestion(id: ID!, input: QuestionInput!): Question
        deleteQuestion(id: ID!): Boolean
        unlockNextSubset(userId: ID!, categoryId: ID!): QuestionSubset
        resetUserProgress(userId: ID!, categoryId: ID): Boolean
        awardBadge(userId: ID!, badgeName: String!): Boolean
        claimReward(userId: ID!, categoryId: ID!): Boolean
    }
`;
