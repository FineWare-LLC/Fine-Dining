/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /**
   * Custom scalar for Dates.
   * You might implement this scalar to validate proper ISO date strings.
   */
  Date: { input: any; output: any; }
};

/**
 * Account status enumeration.
 * States that describe the user's account lifecycle.
 */
export enum AccountStatus {
  Active = 'ACTIVE',
  Deleted = 'DELETED',
  Pending = 'PENDING',
  Suspended = 'SUSPENDED'
}

/** Input type for filtering meals by allergens. */
export type AllergensFilterInput = {
  excludeAllergens?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  includeAllergens?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

/** Payload type returned by loginUser containing a JWT token and user info. */
export type AuthPayload = {
  __typename?: 'AuthPayload';
  token: Scalars['String']['output'];
  user: User;
};

/**
 * Input type for creating a new user account.
 * Consider adding directives like @constraint if using validation libraries.
 */
export type CreateUserInput = {
  allergies?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  dailyCalories?: InputMaybe<Scalars['Int']['input']>;
  email: Scalars['String']['input'];
  foodGoals?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  gender: Gender;
  height?: InputMaybe<Scalars['Float']['input']>;
  measurementSystem: MeasurementSystem;
  name: Scalars['String']['input'];
  password: Scalars['String']['input'];
  role?: InputMaybe<UserRole>;
  weight?: InputMaybe<Scalars['Float']['input']>;
  weightGoal?: InputMaybe<WeightGoal>;
};

/** Input type for custom nutrition targets when generating an optimized meal plan. */
export type CustomNutritionTargetsInput = {
  carbohydratesMax?: InputMaybe<Scalars['Float']['input']>;
  carbohydratesMin?: InputMaybe<Scalars['Float']['input']>;
  fatMax?: InputMaybe<Scalars['Float']['input']>;
  fatMin?: InputMaybe<Scalars['Float']['input']>;
  proteinMax?: InputMaybe<Scalars['Float']['input']>;
  proteinMin?: InputMaybe<Scalars['Float']['input']>;
  sodiumMax?: InputMaybe<Scalars['Float']['input']>;
  sodiumMin?: InputMaybe<Scalars['Float']['input']>;
};

/**
 * Meal difficulty enumeration.
 * Reflects the complexity level of a recipe.
 */
export enum Difficulty {
  Easy = 'EASY',
  Hard = 'HARD',
  Intermediate = 'INTERMEDIATE'
}

/** Represents restaurant data fetched from an external API (e.g., Google Places). */
export type ExternalRestaurant = {
  __typename?: 'ExternalRestaurant';
  location?: Maybe<LatLng>;
  name?: Maybe<Scalars['String']['output']>;
  placeId: Scalars['String']['output'];
  rating?: Maybe<Scalars['Float']['output']>;
  userRatingsTotal?: Maybe<Scalars['Int']['output']>;
  vicinity?: Maybe<Scalars['String']['output']>;
};

/**
 * User gender enumeration.
 * Use this to ensure a valid, controlled list of genders.
 */
export enum Gender {
  Female = 'FEMALE',
  Male = 'MALE',
  Other = 'OTHER'
}

/** Represents a meal in a generated optimized meal plan. */
export type GeneratedMeal = {
  __typename?: 'GeneratedMeal';
  mealId: Scalars['ID']['output'];
  mealName: Scalars['String']['output'];
  nutrition: Nutrition;
  pricePerServing: Scalars['Float']['output'];
  servings: Scalars['Float']['output'];
  totalPrice: Scalars['Float']['output'];
};

/** Represents the result of a meal plan optimization. */
export type GeneratedMealPlanPayload = {
  __typename?: 'GeneratedMealPlanPayload';
  meals: Array<GeneratedMeal>;
  totalCost: Scalars['Float']['output'];
  totalNutrition: Nutrition;
};

/**
 * GeoJSON for location-based data.
 * Must conform to standard GeoJSON structures.
 */
export type GeoJson = {
  __typename?: 'GeoJSON';
  coordinates?: Maybe<Array<Maybe<Scalars['Float']['output']>>>;
  type?: Maybe<Scalars['String']['output']>;
};

/** Simple LatLng coordinate type. */
export type LatLng = {
  __typename?: 'LatLng';
  latitude?: Maybe<Scalars['Float']['output']>;
  longitude?: Maybe<Scalars['Float']['output']>;
};

/** Represents a Meal which can be tied to a recipe, restaurant, or be custom. */
export type Meal = {
  __typename?: 'Meal';
  allergens?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  createdAt: Scalars['Date']['output'];
  date: Scalars['Date']['output'];
  id: Scalars['ID']['output'];
  ingredients?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  mealName?: Maybe<Scalars['String']['output']>;
  mealPlan: MealPlan;
  mealType: MealType;
  notes?: Maybe<Scalars['String']['output']>;
  nutrition?: Maybe<Nutrition>;
  nutritionFacts?: Maybe<Scalars['String']['output']>;
  portionSize?: Maybe<Scalars['String']['output']>;
  price?: Maybe<Scalars['Float']['output']>;
  recipe?: Maybe<Recipe>;
  restaurant?: Maybe<Restaurant>;
  updatedAt: Scalars['Date']['output'];
};

/** Represents a MealPlan which groups multiple meals for a user. */
export type MealPlan = {
  __typename?: 'MealPlan';
  createdAt: Scalars['Date']['output'];
  endDate: Scalars['Date']['output'];
  id: Scalars['ID']['output'];
  meals: Array<Maybe<Meal>>;
  startDate: Scalars['Date']['output'];
  status?: Maybe<MealPlanStatus>;
  title?: Maybe<Scalars['String']['output']>;
  totalCalories?: Maybe<Scalars['Int']['output']>;
  updatedAt: Scalars['Date']['output'];
  user: User;
};

/**
 * MealPlan status enumeration.
 * Defines the lifecycle status of a meal plan.
 */
export enum MealPlanStatus {
  Active = 'ACTIVE',
  Cancelled = 'CANCELLED',
  Completed = 'COMPLETED',
  Draft = 'DRAFT'
}

/**
 * Meal type enumeration.
 * Defines when a meal is typically consumed.
 */
export enum MealType {
  Breakfast = 'BREAKFAST',
  Dinner = 'DINNER',
  Lunch = 'LUNCH',
  Snack = 'SNACK'
}

/**
 * Measurement system enumeration.
 * Only METRIC and IMPERIAL values are allowed.
 */
export enum MeasurementSystem {
  Imperial = 'IMPERIAL',
  Metric = 'METRIC'
}

/** Represents a menu item belonging to a restaurant. */
export type MenuItem = {
  __typename?: 'MenuItem';
  allergens?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  createdAt: Scalars['Date']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  mealName: Scalars['String']['output'];
  nutritionFacts?: Maybe<Scalars['String']['output']>;
  price?: Maybe<Scalars['Float']['output']>;
  restaurant: Restaurant;
  updatedAt: Scalars['Date']['output'];
};

/**
 * Mutation definitions for Fine Dining.
 * Each mutation should implement robust security, input validations, and logging.
 */
export type Mutation = {
  __typename?: 'Mutation';
  createMeal: Meal;
  createMealPlan: MealPlan;
  createMenuItem: MenuItem;
  createRecipe: Recipe;
  createRestaurant: Restaurant;
  createReview: Review;
  createStats: Stats;
  createUser: User;
  deleteMeal?: Maybe<Scalars['Boolean']['output']>;
  deleteMealPlan?: Maybe<Scalars['Boolean']['output']>;
  deleteMenuItem?: Maybe<Scalars['Boolean']['output']>;
  deleteRecipe?: Maybe<Scalars['Boolean']['output']>;
  deleteRestaurant?: Maybe<Scalars['Boolean']['output']>;
  deleteReview?: Maybe<Scalars['Boolean']['output']>;
  deleteStats?: Maybe<Scalars['Boolean']['output']>;
  deleteUser?: Maybe<Scalars['Boolean']['output']>;
  generateOptimizedMealPlan: GeneratedMealPlanPayload;
  loginUser?: Maybe<AuthPayload>;
  requestPasswordReset?: Maybe<Scalars['Boolean']['output']>;
  resetPassword?: Maybe<Scalars['Boolean']['output']>;
  updateMeal?: Maybe<Meal>;
  updateMealPlan?: Maybe<MealPlan>;
  updateMenuItem?: Maybe<MenuItem>;
  updateRecipe?: Maybe<Recipe>;
  updateRestaurant?: Maybe<Restaurant>;
  updateUser?: Maybe<User>;
  upsertQuestionnaire?: Maybe<Questionnaire>;
};


/**
 * Mutation definitions for Fine Dining.
 * Each mutation should implement robust security, input validations, and logging.
 */
export type MutationCreateMealArgs = {
  allergens?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  date: Scalars['Date']['input'];
  ingredients?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  mealName?: InputMaybe<Scalars['String']['input']>;
  mealPlanId: Scalars['ID']['input'];
  mealType: MealType;
  notes?: InputMaybe<Scalars['String']['input']>;
  nutrition?: InputMaybe<NutritionInput>;
  nutritionFacts?: InputMaybe<Scalars['String']['input']>;
  portionSize?: InputMaybe<Scalars['String']['input']>;
  price?: InputMaybe<Scalars['Float']['input']>;
  recipeId?: InputMaybe<Scalars['ID']['input']>;
  restaurantId?: InputMaybe<Scalars['ID']['input']>;
};


/**
 * Mutation definitions for Fine Dining.
 * Each mutation should implement robust security, input validations, and logging.
 */
export type MutationCreateMealPlanArgs = {
  endDate: Scalars['Date']['input'];
  startDate: Scalars['Date']['input'];
  status?: InputMaybe<MealPlanStatus>;
  title?: InputMaybe<Scalars['String']['input']>;
  totalCalories?: InputMaybe<Scalars['Int']['input']>;
  userId: Scalars['ID']['input'];
};


/**
 * Mutation definitions for Fine Dining.
 * Each mutation should implement robust security, input validations, and logging.
 */
export type MutationCreateMenuItemArgs = {
  allergens?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  description?: InputMaybe<Scalars['String']['input']>;
  mealName: Scalars['String']['input'];
  nutritionFacts?: InputMaybe<Scalars['String']['input']>;
  price?: InputMaybe<Scalars['Float']['input']>;
  restaurantId: Scalars['ID']['input'];
};


/**
 * Mutation definitions for Fine Dining.
 * Each mutation should implement robust security, input validations, and logging.
 */
export type MutationCreateRecipeArgs = {
  authorId?: InputMaybe<Scalars['ID']['input']>;
  difficulty?: InputMaybe<Difficulty>;
  estimatedCost?: InputMaybe<Scalars['Float']['input']>;
  images?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  ingredients: Array<InputMaybe<Scalars['String']['input']>>;
  instructions: Scalars['String']['input'];
  nutritionFacts?: InputMaybe<Scalars['String']['input']>;
  prepTime: Scalars['Int']['input'];
  recipeName: Scalars['String']['input'];
  tags?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


/**
 * Mutation definitions for Fine Dining.
 * Each mutation should implement robust security, input validations, and logging.
 */
export type MutationCreateRestaurantArgs = {
  address: Scalars['String']['input'];
  cuisineType?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  phone?: InputMaybe<Scalars['String']['input']>;
  priceRange?: InputMaybe<PriceRange>;
  restaurantName: Scalars['String']['input'];
  website?: InputMaybe<Scalars['String']['input']>;
};


/**
 * Mutation definitions for Fine Dining.
 * Each mutation should implement robust security, input validations, and logging.
 */
export type MutationCreateReviewArgs = {
  comment?: InputMaybe<Scalars['String']['input']>;
  rating: Scalars['Int']['input'];
  targetId: Scalars['ID']['input'];
  targetType: Scalars['String']['input'];
};


/**
 * Mutation definitions for Fine Dining.
 * Each mutation should implement robust security, input validations, and logging.
 */
export type MutationCreateStatsArgs = {
  caloriesConsumed?: InputMaybe<Scalars['Int']['input']>;
  macros?: InputMaybe<Scalars['String']['input']>;
  micros?: InputMaybe<Scalars['String']['input']>;
  steps?: InputMaybe<Scalars['Int']['input']>;
  userId: Scalars['ID']['input'];
  waterIntake?: InputMaybe<Scalars['Int']['input']>;
};


/**
 * Mutation definitions for Fine Dining.
 * Each mutation should implement robust security, input validations, and logging.
 */
export type MutationCreateUserArgs = {
  input: CreateUserInput;
};


/**
 * Mutation definitions for Fine Dining.
 * Each mutation should implement robust security, input validations, and logging.
 */
export type MutationDeleteMealArgs = {
  id: Scalars['ID']['input'];
};


/**
 * Mutation definitions for Fine Dining.
 * Each mutation should implement robust security, input validations, and logging.
 */
export type MutationDeleteMealPlanArgs = {
  id: Scalars['ID']['input'];
};


/**
 * Mutation definitions for Fine Dining.
 * Each mutation should implement robust security, input validations, and logging.
 */
export type MutationDeleteMenuItemArgs = {
  id: Scalars['ID']['input'];
};


/**
 * Mutation definitions for Fine Dining.
 * Each mutation should implement robust security, input validations, and logging.
 */
export type MutationDeleteRecipeArgs = {
  id: Scalars['ID']['input'];
};


/**
 * Mutation definitions for Fine Dining.
 * Each mutation should implement robust security, input validations, and logging.
 */
export type MutationDeleteRestaurantArgs = {
  id: Scalars['ID']['input'];
};


/**
 * Mutation definitions for Fine Dining.
 * Each mutation should implement robust security, input validations, and logging.
 */
export type MutationDeleteReviewArgs = {
  id: Scalars['ID']['input'];
};


/**
 * Mutation definitions for Fine Dining.
 * Each mutation should implement robust security, input validations, and logging.
 */
export type MutationDeleteStatsArgs = {
  id: Scalars['ID']['input'];
};


/**
 * Mutation definitions for Fine Dining.
 * Each mutation should implement robust security, input validations, and logging.
 */
export type MutationDeleteUserArgs = {
  id: Scalars['ID']['input'];
};


/**
 * Mutation definitions for Fine Dining.
 * Each mutation should implement robust security, input validations, and logging.
 */
export type MutationGenerateOptimizedMealPlanArgs = {
  customNutritionTargets?: InputMaybe<CustomNutritionTargetsInput>;
  selectedMealIds?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
};


/**
 * Mutation definitions for Fine Dining.
 * Each mutation should implement robust security, input validations, and logging.
 */
export type MutationLoginUserArgs = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
};


/**
 * Mutation definitions for Fine Dining.
 * Each mutation should implement robust security, input validations, and logging.
 */
export type MutationRequestPasswordResetArgs = {
  email: Scalars['String']['input'];
};


/**
 * Mutation definitions for Fine Dining.
 * Each mutation should implement robust security, input validations, and logging.
 */
export type MutationResetPasswordArgs = {
  newPassword: Scalars['String']['input'];
  resetToken: Scalars['String']['input'];
};


/**
 * Mutation definitions for Fine Dining.
 * Each mutation should implement robust security, input validations, and logging.
 */
export type MutationUpdateMealArgs = {
  allergens?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  date?: InputMaybe<Scalars['Date']['input']>;
  id: Scalars['ID']['input'];
  ingredients?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  mealName?: InputMaybe<Scalars['String']['input']>;
  mealType?: InputMaybe<MealType>;
  notes?: InputMaybe<Scalars['String']['input']>;
  nutrition?: InputMaybe<NutritionInput>;
  nutritionFacts?: InputMaybe<Scalars['String']['input']>;
  portionSize?: InputMaybe<Scalars['String']['input']>;
  price?: InputMaybe<Scalars['Float']['input']>;
  recipeId?: InputMaybe<Scalars['ID']['input']>;
  restaurantId?: InputMaybe<Scalars['ID']['input']>;
};


/**
 * Mutation definitions for Fine Dining.
 * Each mutation should implement robust security, input validations, and logging.
 */
export type MutationUpdateMealPlanArgs = {
  endDate?: InputMaybe<Scalars['Date']['input']>;
  id: Scalars['ID']['input'];
  startDate?: InputMaybe<Scalars['Date']['input']>;
  status?: InputMaybe<MealPlanStatus>;
  title?: InputMaybe<Scalars['String']['input']>;
  totalCalories?: InputMaybe<Scalars['Int']['input']>;
};


/**
 * Mutation definitions for Fine Dining.
 * Each mutation should implement robust security, input validations, and logging.
 */
export type MutationUpdateMenuItemArgs = {
  allergens?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  description?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  mealName?: InputMaybe<Scalars['String']['input']>;
  nutritionFacts?: InputMaybe<Scalars['String']['input']>;
  price?: InputMaybe<Scalars['Float']['input']>;
};


/**
 * Mutation definitions for Fine Dining.
 * Each mutation should implement robust security, input validations, and logging.
 */
export type MutationUpdateRecipeArgs = {
  difficulty?: InputMaybe<Difficulty>;
  estimatedCost?: InputMaybe<Scalars['Float']['input']>;
  id: Scalars['ID']['input'];
  images?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  ingredients?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  instructions?: InputMaybe<Scalars['String']['input']>;
  nutritionFacts?: InputMaybe<Scalars['String']['input']>;
  prepTime?: InputMaybe<Scalars['Int']['input']>;
  recipeName?: InputMaybe<Scalars['String']['input']>;
  tags?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


/**
 * Mutation definitions for Fine Dining.
 * Each mutation should implement robust security, input validations, and logging.
 */
export type MutationUpdateRestaurantArgs = {
  address?: InputMaybe<Scalars['String']['input']>;
  cuisineType?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  id: Scalars['ID']['input'];
  phone?: InputMaybe<Scalars['String']['input']>;
  priceRange?: InputMaybe<PriceRange>;
  restaurantName?: InputMaybe<Scalars['String']['input']>;
  website?: InputMaybe<Scalars['String']['input']>;
};


/**
 * Mutation definitions for Fine Dining.
 * Each mutation should implement robust security, input validations, and logging.
 */
export type MutationUpdateUserArgs = {
  id: Scalars['ID']['input'];
  input: UpdateUserInput;
};


/**
 * Mutation definitions for Fine Dining.
 * Each mutation should implement robust security, input validations, and logging.
 */
export type MutationUpsertQuestionnaireArgs = {
  id: Scalars['ID']['input'];
  input: QuestionnaireInput;
};

export type NearbyRestaurantsResult = {
  __typename?: 'NearbyRestaurantsResult';
  restaurants?: Maybe<Array<Maybe<ExternalRestaurant>>>;
  source?: Maybe<Scalars['String']['output']>;
};

/** Represents nutrition information for a meal. */
export type Nutrition = {
  __typename?: 'Nutrition';
  carbohydrates?: Maybe<Scalars['Float']['output']>;
  fat?: Maybe<Scalars['Float']['output']>;
  protein?: Maybe<Scalars['Float']['output']>;
  sodium?: Maybe<Scalars['Float']['output']>;
};

/** Input type for nutrition information. */
export type NutritionInput = {
  carbohydrates?: InputMaybe<Scalars['Float']['input']>;
  fat?: InputMaybe<Scalars['Float']['input']>;
  protein?: InputMaybe<Scalars['Float']['input']>;
  sodium?: InputMaybe<Scalars['Float']['input']>;
};

/** Input type for filtering meals by nutrition values. */
export type NutritionRangeInput = {
  carbohydratesMax?: InputMaybe<Scalars['Float']['input']>;
  carbohydratesMin?: InputMaybe<Scalars['Float']['input']>;
  fatMax?: InputMaybe<Scalars['Float']['input']>;
  fatMin?: InputMaybe<Scalars['Float']['input']>;
  proteinMax?: InputMaybe<Scalars['Float']['input']>;
  proteinMin?: InputMaybe<Scalars['Float']['input']>;
  sodiumMax?: InputMaybe<Scalars['Float']['input']>;
  sodiumMin?: InputMaybe<Scalars['Float']['input']>;
};

/** Represents nutrition targets for meal optimization. */
export type NutritionTargets = {
  __typename?: 'NutritionTargets';
  carbohydratesMax?: Maybe<Scalars['Float']['output']>;
  carbohydratesMin?: Maybe<Scalars['Float']['output']>;
  fatMax?: Maybe<Scalars['Float']['output']>;
  fatMin?: Maybe<Scalars['Float']['output']>;
  proteinMax?: Maybe<Scalars['Float']['output']>;
  proteinMin?: Maybe<Scalars['Float']['output']>;
  sodiumMax?: Maybe<Scalars['Float']['output']>;
  sodiumMin?: Maybe<Scalars['Float']['output']>;
};

/** Input type for nutrition targets. */
export type NutritionTargetsInput = {
  carbohydratesMax?: InputMaybe<Scalars['Float']['input']>;
  carbohydratesMin?: InputMaybe<Scalars['Float']['input']>;
  fatMax?: InputMaybe<Scalars['Float']['input']>;
  fatMin?: InputMaybe<Scalars['Float']['input']>;
  proteinMax?: InputMaybe<Scalars['Float']['input']>;
  proteinMin?: InputMaybe<Scalars['Float']['input']>;
  sodiumMax?: InputMaybe<Scalars['Float']['input']>;
  sodiumMin?: InputMaybe<Scalars['Float']['input']>;
};

/**
 * Simple key/value pair for restaurant opening hours.
 * For example: mon: "9AM-5PM"
 */
export type OpeningHour = {
  __typename?: 'OpeningHour';
  day?: Maybe<Scalars['String']['output']>;
  hours?: Maybe<Scalars['String']['output']>;
};

/** Statistics on presolve reduction. */
export type PresolveStats = {
  __typename?: 'PresolveStats';
  after: Scalars['Int']['output'];
  before: Scalars['Int']['output'];
};

/**
 * Restaurant price range enumeration.
 * Provides a controlled vocabulary for price classification.
 */
export enum PriceRange {
  Cheap = 'CHEAP',
  Expensive = 'EXPENSIVE',
  Luxury = 'LUXURY',
  Moderate = 'MODERATE'
}

/** Input type for filtering meals by price range. */
export type PriceRangeInput = {
  max?: InputMaybe<Scalars['Float']['input']>;
  min?: InputMaybe<Scalars['Float']['input']>;
};

/**
 * Query definitions for retrieving data in Fine Dining.
 * Each query includes security and validation considerations.
 */
export type Query = {
  __typename?: 'Query';
  findNearbyRestaurants?: Maybe<NearbyRestaurantsResult>;
  getAllMeals?: Maybe<Array<Maybe<Meal>>>;
  getMealPlan?: Maybe<MealPlan>;
  getMealPlans?: Maybe<Array<Maybe<MealPlan>>>;
  getMeals?: Maybe<Array<Maybe<Meal>>>;
  getMenuItem?: Maybe<MenuItem>;
  getMenuItemsByRestaurant?: Maybe<Array<Maybe<MenuItem>>>;
  getQuestionnaire?: Maybe<Questionnaire>;
  getRecipe?: Maybe<Recipe>;
  getRecipes?: Maybe<Array<Maybe<Recipe>>>;
  getRestaurant?: Maybe<Restaurant>;
  getRestaurants?: Maybe<Array<Maybe<Restaurant>>>;
  getReview?: Maybe<Review>;
  getReviewsForTarget?: Maybe<Array<Maybe<Review>>>;
  getStatsByUser?: Maybe<Array<Maybe<Stats>>>;
  getUser?: Maybe<User>;
  getUsers?: Maybe<Array<Maybe<User>>>;
  ping?: Maybe<Scalars['String']['output']>;
  presolveStats?: Maybe<PresolveStats>;
  searchRecipes?: Maybe<Array<Maybe<Recipe>>>;
  searchRestaurants?: Maybe<Array<Maybe<Restaurant>>>;
  searchUsers?: Maybe<Array<Maybe<User>>>;
};


/**
 * Query definitions for retrieving data in Fine Dining.
 * Each query includes security and validation considerations.
 */
export type QueryFindNearbyRestaurantsArgs = {
  keyword?: InputMaybe<Scalars['String']['input']>;
  latitude: Scalars['Float']['input'];
  longitude: Scalars['Float']['input'];
  radius?: InputMaybe<Scalars['Int']['input']>;
};


/**
 * Query definitions for retrieving data in Fine Dining.
 * Each query includes security and validation considerations.
 */
export type QueryGetAllMealsArgs = {
  allergensFilter?: InputMaybe<AllergensFilterInput>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  nutritionRange?: InputMaybe<NutritionRangeInput>;
  page?: InputMaybe<Scalars['Int']['input']>;
  priceRange?: InputMaybe<PriceRangeInput>;
};


/**
 * Query definitions for retrieving data in Fine Dining.
 * Each query includes security and validation considerations.
 */
export type QueryGetMealPlanArgs = {
  id: Scalars['ID']['input'];
};


/**
 * Query definitions for retrieving data in Fine Dining.
 * Each query includes security and validation considerations.
 */
export type QueryGetMealPlansArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  userId?: InputMaybe<Scalars['ID']['input']>;
};


/**
 * Query definitions for retrieving data in Fine Dining.
 * Each query includes security and validation considerations.
 */
export type QueryGetMealsArgs = {
  allergensFilter?: InputMaybe<AllergensFilterInput>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  mealPlanId?: InputMaybe<Scalars['ID']['input']>;
  nutritionRange?: InputMaybe<NutritionRangeInput>;
  page?: InputMaybe<Scalars['Int']['input']>;
  priceRange?: InputMaybe<PriceRangeInput>;
};


/**
 * Query definitions for retrieving data in Fine Dining.
 * Each query includes security and validation considerations.
 */
export type QueryGetMenuItemArgs = {
  id: Scalars['ID']['input'];
};


/**
 * Query definitions for retrieving data in Fine Dining.
 * Each query includes security and validation considerations.
 */
export type QueryGetMenuItemsByRestaurantArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  restaurantId: Scalars['ID']['input'];
};


/**
 * Query definitions for retrieving data in Fine Dining.
 * Each query includes security and validation considerations.
 */
export type QueryGetQuestionnaireArgs = {
  id: Scalars['ID']['input'];
};


/**
 * Query definitions for retrieving data in Fine Dining.
 * Each query includes security and validation considerations.
 */
export type QueryGetRecipeArgs = {
  id: Scalars['ID']['input'];
};


/**
 * Query definitions for retrieving data in Fine Dining.
 * Each query includes security and validation considerations.
 */
export type QueryGetRecipesArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
};


/**
 * Query definitions for retrieving data in Fine Dining.
 * Each query includes security and validation considerations.
 */
export type QueryGetRestaurantArgs = {
  id: Scalars['ID']['input'];
};


/**
 * Query definitions for retrieving data in Fine Dining.
 * Each query includes security and validation considerations.
 */
export type QueryGetRestaurantsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
};


/**
 * Query definitions for retrieving data in Fine Dining.
 * Each query includes security and validation considerations.
 */
export type QueryGetReviewArgs = {
  id: Scalars['ID']['input'];
};


/**
 * Query definitions for retrieving data in Fine Dining.
 * Each query includes security and validation considerations.
 */
export type QueryGetReviewsForTargetArgs = {
  targetId: Scalars['ID']['input'];
  targetType: Scalars['String']['input'];
};


/**
 * Query definitions for retrieving data in Fine Dining.
 * Each query includes security and validation considerations.
 */
export type QueryGetStatsByUserArgs = {
  userId: Scalars['ID']['input'];
};


/**
 * Query definitions for retrieving data in Fine Dining.
 * Each query includes security and validation considerations.
 */
export type QueryGetUserArgs = {
  id: Scalars['ID']['input'];
};


/**
 * Query definitions for retrieving data in Fine Dining.
 * Each query includes security and validation considerations.
 */
export type QueryGetUsersArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
};


/**
 * Query definitions for retrieving data in Fine Dining.
 * Each query includes security and validation considerations.
 */
export type QuerySearchRecipesArgs = {
  keyword: Scalars['String']['input'];
};


/**
 * Query definitions for retrieving data in Fine Dining.
 * Each query includes security and validation considerations.
 */
export type QuerySearchRestaurantsArgs = {
  keyword: Scalars['String']['input'];
};


/**
 * Query definitions for retrieving data in Fine Dining.
 * Each query includes security and validation considerations.
 */
export type QuerySearchUsersArgs = {
  keyword: Scalars['String']['input'];
};

export type Questionnaire = {
  __typename?: 'Questionnaire';
  activityLevel?: Maybe<Scalars['Int']['output']>;
  allergies?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  dietaryPattern?: Maybe<Scalars['String']['output']>;
  disallowedIngredients?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
};

export type QuestionnaireInput = {
  activityLevel?: InputMaybe<Scalars['Int']['input']>;
  allergies?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  dietaryPattern?: InputMaybe<Scalars['String']['input']>;
  disallowedIngredients?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

/** Represents a Recipe with details including instructions, ingredients, and ratings. */
export type Recipe = {
  __typename?: 'Recipe';
  author?: Maybe<User>;
  averageRating?: Maybe<Scalars['Float']['output']>;
  createdAt: Scalars['Date']['output'];
  difficulty: Difficulty;
  estimatedCost?: Maybe<Scalars['Float']['output']>;
  id: Scalars['ID']['output'];
  images?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  ingredients: Array<Maybe<Scalars['String']['output']>>;
  instructions: Scalars['String']['output'];
  nutritionFacts?: Maybe<Scalars['String']['output']>;
  prepTime: Scalars['Int']['output'];
  ratingCount?: Maybe<Scalars['Int']['output']>;
  recipeName: Scalars['String']['output'];
  tags?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  updatedAt: Scalars['Date']['output'];
};

/** Represents a Restaurant with location, contact, and rating details. */
export type Restaurant = {
  __typename?: 'Restaurant';
  address: Scalars['String']['output'];
  averageRating?: Maybe<Scalars['Float']['output']>;
  createdAt: Scalars['Date']['output'];
  cuisineType?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  id: Scalars['ID']['output'];
  location?: Maybe<GeoJson>;
  openingHours?: Maybe<Array<Maybe<OpeningHour>>>;
  phone?: Maybe<Scalars['String']['output']>;
  priceRange?: Maybe<PriceRange>;
  ratingCount?: Maybe<Scalars['Int']['output']>;
  restaurantName: Scalars['String']['output'];
  updatedAt: Scalars['Date']['output'];
  website?: Maybe<Scalars['String']['output']>;
};

/** Represents a Review made by a user on either a Recipe or Restaurant. */
export type Review = {
  __typename?: 'Review';
  comment?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['Date']['output'];
  id: Scalars['ID']['output'];
  rating: Scalars['Int']['output'];
  targetId: Scalars['ID']['output'];
  targetType: Scalars['String']['output'];
  updatedAt: Scalars['Date']['output'];
  user: User;
};

/** Represents nutritional and activity statistics logged by a user. */
export type Stats = {
  __typename?: 'Stats';
  caloriesConsumed?: Maybe<Scalars['Int']['output']>;
  createdAt: Scalars['Date']['output'];
  dateLogged: Scalars['Date']['output'];
  id: Scalars['ID']['output'];
  macros?: Maybe<Scalars['String']['output']>;
  micros?: Maybe<Scalars['String']['output']>;
  steps?: Maybe<Scalars['Int']['output']>;
  updatedAt: Scalars['Date']['output'];
  user: User;
  waterIntake?: Maybe<Scalars['Int']['output']>;
};

/** Input type for updating a user. */
export type UpdateUserInput = {
  accountStatus?: InputMaybe<AccountStatus>;
  allergies?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  dailyCalories?: InputMaybe<Scalars['Int']['input']>;
  foodGoals?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  height?: InputMaybe<Scalars['Float']['input']>;
  measurementSystem?: InputMaybe<MeasurementSystem>;
  name?: InputMaybe<Scalars['String']['input']>;
  nutritionTargets?: InputMaybe<NutritionTargetsInput>;
  password?: InputMaybe<Scalars['String']['input']>;
  role?: InputMaybe<UserRole>;
  weight?: InputMaybe<Scalars['Float']['input']>;
  weightGoal?: InputMaybe<WeightGoal>;
};

/**
 * Represents a User with robust fields.
 * Note: Passwords are handled separately for security.
 */
export type User = {
  __typename?: 'User';
  accountStatus: AccountStatus;
  allergies?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  avatarUrl?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['Date']['output'];
  dailyCalories?: Maybe<Scalars['Int']['output']>;
  email: Scalars['String']['output'];
  foodGoals?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  gender: Gender;
  height?: Maybe<Scalars['Float']['output']>;
  id: Scalars['ID']['output'];
  lastLogin?: Maybe<Scalars['Date']['output']>;
  measurementSystem: MeasurementSystem;
  name: Scalars['String']['output'];
  nutritionTargets?: Maybe<NutritionTargets>;
  questionnaire?: Maybe<Questionnaire>;
  role: UserRole;
  updatedAt: Scalars['Date']['output'];
  weight?: Maybe<Scalars['Float']['output']>;
  weightGoal?: Maybe<WeightGoal>;
};

/**
 * Role-based user enumeration.
 * Restricts users to known roles for authorization purposes.
 */
export enum UserRole {
  Admin = 'ADMIN',
  Premium = 'PREMIUM',
  User = 'USER'
}

/**
 * User weight goal enumeration.
 * Valid weight goals for users.
 */
export enum WeightGoal {
  Gain = 'GAIN',
  Lose = 'LOSE',
  Maintain = 'MAINTAIN'
}

export type CreateUserMutationVariables = Exact<{
  input: CreateUserInput;
}>;


export type CreateUserMutation = { __typename?: 'Mutation', createUser: { __typename?: 'User', id: string, name: string, email: string, role: UserRole, accountStatus: AccountStatus } };

export type UpdateUserMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: UpdateUserInput;
}>;


export type UpdateUserMutation = { __typename?: 'Mutation', updateUser?: { __typename?: 'User', id: string, name: string, email: string, role: UserRole, accountStatus: AccountStatus, dailyCalories?: number | null, weight?: number | null, height?: number | null } | null };

export type DeleteUserMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteUserMutation = { __typename?: 'Mutation', deleteUser?: boolean | null };

export type LoginUserMutationVariables = Exact<{
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
}>;


export type LoginUserMutation = { __typename?: 'Mutation', loginUser?: { __typename?: 'AuthPayload', token: string, user: { __typename?: 'User', id: string, name: string, email: string, role: UserRole } } | null };

export type RequestPasswordResetMutationVariables = Exact<{
  email: Scalars['String']['input'];
}>;


export type RequestPasswordResetMutation = { __typename?: 'Mutation', requestPasswordReset?: boolean | null };

export type ResetPasswordMutationVariables = Exact<{
  resetToken: Scalars['String']['input'];
  newPassword: Scalars['String']['input'];
}>;


export type ResetPasswordMutation = { __typename?: 'Mutation', resetPassword?: boolean | null };

export type CreateRecipeMutationVariables = Exact<{
  recipeName: Scalars['String']['input'];
  ingredients: Array<InputMaybe<Scalars['String']['input']>> | InputMaybe<Scalars['String']['input']>;
  instructions: Scalars['String']['input'];
  prepTime: Scalars['Int']['input'];
  difficulty?: InputMaybe<Difficulty>;
  nutritionFacts?: InputMaybe<Scalars['String']['input']>;
  tags?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>> | InputMaybe<Scalars['String']['input']>>;
  images?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>> | InputMaybe<Scalars['String']['input']>>;
  estimatedCost?: InputMaybe<Scalars['Float']['input']>;
  authorId?: InputMaybe<Scalars['ID']['input']>;
}>;


export type CreateRecipeMutation = { __typename?: 'Mutation', createRecipe: { __typename?: 'Recipe', id: string, recipeName: string, prepTime: number, difficulty: Difficulty, author?: { __typename?: 'User', id: string, name: string } | null } };

export type UpdateRecipeMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  recipeName?: InputMaybe<Scalars['String']['input']>;
  ingredients?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>> | InputMaybe<Scalars['String']['input']>>;
  instructions?: InputMaybe<Scalars['String']['input']>;
  prepTime?: InputMaybe<Scalars['Int']['input']>;
  difficulty?: InputMaybe<Difficulty>;
  nutritionFacts?: InputMaybe<Scalars['String']['input']>;
  tags?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>> | InputMaybe<Scalars['String']['input']>>;
  images?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>> | InputMaybe<Scalars['String']['input']>>;
  estimatedCost?: InputMaybe<Scalars['Float']['input']>;
}>;


export type UpdateRecipeMutation = { __typename?: 'Mutation', updateRecipe?: { __typename?: 'Recipe', id: string, recipeName: string, prepTime: number, difficulty: Difficulty, updatedAt: any } | null };

export type DeleteRecipeMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteRecipeMutation = { __typename?: 'Mutation', deleteRecipe?: boolean | null };

export type CreateRestaurantMutationVariables = Exact<{
  restaurantName: Scalars['String']['input'];
  address: Scalars['String']['input'];
  phone?: InputMaybe<Scalars['String']['input']>;
  website?: InputMaybe<Scalars['String']['input']>;
  cuisineType?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>> | InputMaybe<Scalars['String']['input']>>;
  priceRange?: InputMaybe<PriceRange>;
}>;


export type CreateRestaurantMutation = { __typename?: 'Mutation', createRestaurant: { __typename?: 'Restaurant', id: string, restaurantName: string, address: string } };

export type UpdateRestaurantMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  restaurantName?: InputMaybe<Scalars['String']['input']>;
  address?: InputMaybe<Scalars['String']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
  website?: InputMaybe<Scalars['String']['input']>;
  cuisineType?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>> | InputMaybe<Scalars['String']['input']>>;
  priceRange?: InputMaybe<PriceRange>;
}>;


export type UpdateRestaurantMutation = { __typename?: 'Mutation', updateRestaurant?: { __typename?: 'Restaurant', id: string, restaurantName: string, address: string, updatedAt: any } | null };

export type DeleteRestaurantMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteRestaurantMutation = { __typename?: 'Mutation', deleteRestaurant?: boolean | null };

export type CreateMealPlanMutationVariables = Exact<{
  userId: Scalars['ID']['input'];
  startDate: Scalars['Date']['input'];
  endDate: Scalars['Date']['input'];
  title?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<MealPlanStatus>;
  totalCalories?: InputMaybe<Scalars['Int']['input']>;
}>;


export type CreateMealPlanMutation = { __typename?: 'Mutation', createMealPlan: { __typename?: 'MealPlan', id: string, title?: string | null, startDate: any, endDate: any, user: { __typename?: 'User', id: string } } };

export type UpdateMealPlanMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  startDate?: InputMaybe<Scalars['Date']['input']>;
  endDate?: InputMaybe<Scalars['Date']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<MealPlanStatus>;
  totalCalories?: InputMaybe<Scalars['Int']['input']>;
}>;


export type UpdateMealPlanMutation = { __typename?: 'Mutation', updateMealPlan?: { __typename?: 'MealPlan', id: string, title?: string | null, startDate: any, endDate: any, status?: MealPlanStatus | null, updatedAt: any } | null };

export type DeleteMealPlanMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteMealPlanMutation = { __typename?: 'Mutation', deleteMealPlan?: boolean | null };

export type CreateMealMutationVariables = Exact<{
  mealPlanId: Scalars['ID']['input'];
  date: Scalars['Date']['input'];
  mealType: MealType;
  recipeId?: InputMaybe<Scalars['ID']['input']>;
  restaurantId?: InputMaybe<Scalars['ID']['input']>;
  mealName?: InputMaybe<Scalars['String']['input']>;
  price?: InputMaybe<Scalars['Float']['input']>;
  ingredients?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>> | InputMaybe<Scalars['String']['input']>>;
  nutrition?: InputMaybe<NutritionInput>;
  allergens?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>> | InputMaybe<Scalars['String']['input']>>;
  nutritionFacts?: InputMaybe<Scalars['String']['input']>;
  portionSize?: InputMaybe<Scalars['String']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
}>;


export type CreateMealMutation = { __typename?: 'Mutation', createMeal: { __typename?: 'Meal', id: string, mealName?: string | null, mealType: MealType, date: any, price?: number | null, allergens?: Array<string | null> | null, nutrition?: { __typename?: 'Nutrition', carbohydrates?: number | null, protein?: number | null, fat?: number | null, sodium?: number | null } | null } };

export type UpdateMealMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  date?: InputMaybe<Scalars['Date']['input']>;
  mealType?: InputMaybe<MealType>;
  recipeId?: InputMaybe<Scalars['ID']['input']>;
  restaurantId?: InputMaybe<Scalars['ID']['input']>;
  mealName?: InputMaybe<Scalars['String']['input']>;
  price?: InputMaybe<Scalars['Float']['input']>;
  ingredients?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>> | InputMaybe<Scalars['String']['input']>>;
  nutrition?: InputMaybe<NutritionInput>;
  allergens?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>> | InputMaybe<Scalars['String']['input']>>;
  nutritionFacts?: InputMaybe<Scalars['String']['input']>;
  portionSize?: InputMaybe<Scalars['String']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
}>;


export type UpdateMealMutation = { __typename?: 'Mutation', updateMeal?: { __typename?: 'Meal', id: string, mealName?: string | null, mealType: MealType, date: any, price?: number | null, allergens?: Array<string | null> | null, updatedAt: any, nutrition?: { __typename?: 'Nutrition', carbohydrates?: number | null, protein?: number | null, fat?: number | null, sodium?: number | null } | null } | null };

export type DeleteMealMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteMealMutation = { __typename?: 'Mutation', deleteMeal?: boolean | null };

export type CreateStatsMutationVariables = Exact<{
  userId: Scalars['ID']['input'];
  macros?: InputMaybe<Scalars['String']['input']>;
  micros?: InputMaybe<Scalars['String']['input']>;
  caloriesConsumed?: InputMaybe<Scalars['Int']['input']>;
  waterIntake?: InputMaybe<Scalars['Int']['input']>;
  steps?: InputMaybe<Scalars['Int']['input']>;
}>;


export type CreateStatsMutation = { __typename?: 'Mutation', createStats: { __typename?: 'Stats', id: string, dateLogged: any, caloriesConsumed?: number | null } };

export type DeleteStatsMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteStatsMutation = { __typename?: 'Mutation', deleteStats?: boolean | null };

export type CreateReviewMutationVariables = Exact<{
  targetType: Scalars['String']['input'];
  targetId: Scalars['ID']['input'];
  rating: Scalars['Int']['input'];
  comment?: InputMaybe<Scalars['String']['input']>;
}>;


export type CreateReviewMutation = { __typename?: 'Mutation', createReview: { __typename?: 'Review', id: string, rating: number, comment?: string | null, targetType: string, targetId: string } };

export type DeleteReviewMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteReviewMutation = { __typename?: 'Mutation', deleteReview?: boolean | null };

export type GetUserQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetUserQuery = { __typename?: 'Query', getUser?: { __typename?: 'User', id: string, name: string, email: string, role: UserRole, accountStatus: AccountStatus, weight?: number | null, height?: number | null, gender: Gender, measurementSystem: MeasurementSystem, dailyCalories?: number | null, avatarUrl?: string | null, createdAt: any } | null };

export type GetUsersQueryVariables = Exact<{
  page?: InputMaybe<Scalars['Int']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GetUsersQuery = { __typename?: 'Query', getUsers?: Array<{ __typename?: 'User', id: string, name: string, email: string, role: UserRole } | null> | null };

export type SearchUsersQueryVariables = Exact<{
  keyword: Scalars['String']['input'];
}>;


export type SearchUsersQuery = { __typename?: 'Query', searchUsers?: Array<{ __typename?: 'User', id: string, name: string, email: string } | null> | null };

export type GetRecipeQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetRecipeQuery = { __typename?: 'Query', getRecipe?: { __typename?: 'Recipe', id: string, recipeName: string, ingredients: Array<string | null>, instructions: string, prepTime: number, difficulty: Difficulty, nutritionFacts?: string | null, tags?: Array<string | null> | null, images?: Array<string | null> | null, estimatedCost?: number | null, averageRating?: number | null, ratingCount?: number | null, author?: { __typename?: 'User', id: string, name: string } | null } | null };

export type GetRecipesQueryVariables = Exact<{
  page?: InputMaybe<Scalars['Int']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GetRecipesQuery = { __typename?: 'Query', getRecipes?: Array<{ __typename?: 'Recipe', id: string, recipeName: string, difficulty: Difficulty, averageRating?: number | null, author?: { __typename?: 'User', id: string, name: string } | null } | null> | null };

export type SearchRecipesQueryVariables = Exact<{
  keyword: Scalars['String']['input'];
}>;


export type SearchRecipesQuery = { __typename?: 'Query', searchRecipes?: Array<{ __typename?: 'Recipe', id: string, recipeName: string, difficulty: Difficulty } | null> | null };

export type GetRestaurantQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetRestaurantQuery = { __typename?: 'Query', getRestaurant?: { __typename?: 'Restaurant', id: string, restaurantName: string, address: string, phone?: string | null, website?: string | null, cuisineType?: Array<string | null> | null, priceRange?: PriceRange | null, averageRating?: number | null, ratingCount?: number | null } | null };

export type GetRestaurantsQueryVariables = Exact<{
  page?: InputMaybe<Scalars['Int']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GetRestaurantsQuery = { __typename?: 'Query', getRestaurants?: Array<{ __typename?: 'Restaurant', id: string, restaurantName: string, address: string, cuisineType?: Array<string | null> | null, averageRating?: number | null } | null> | null };

export type SearchRestaurantsQueryVariables = Exact<{
  keyword: Scalars['String']['input'];
}>;


export type SearchRestaurantsQuery = { __typename?: 'Query', searchRestaurants?: Array<{ __typename?: 'Restaurant', id: string, restaurantName: string, address: string } | null> | null };

export type GetMealPlanQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetMealPlanQuery = { __typename?: 'Query', getMealPlan?: { __typename?: 'MealPlan', id: string, title?: string | null, startDate: any, endDate: any, status?: MealPlanStatus | null, totalCalories?: number | null, user: { __typename?: 'User', id: string, name: string }, meals: Array<{ __typename?: 'Meal', id: string, mealName?: string | null, mealType: MealType, date: any, price?: number | null, allergens?: Array<string | null> | null, nutrition?: { __typename?: 'Nutrition', carbohydrates?: number | null, protein?: number | null, fat?: number | null, sodium?: number | null } | null } | null> } | null };

export type GetMealPlansQueryVariables = Exact<{
  userId?: InputMaybe<Scalars['ID']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GetMealPlansQuery = { __typename?: 'Query', getMealPlans?: Array<{ __typename?: 'MealPlan', id: string, title?: string | null, startDate: any, endDate: any, status?: MealPlanStatus | null, user: { __typename?: 'User', id: string } } | null> | null };

export type GetStatsByUserQueryVariables = Exact<{
  userId: Scalars['ID']['input'];
}>;


export type GetStatsByUserQuery = { __typename?: 'Query', getStatsByUser?: Array<{ __typename?: 'Stats', id: string, dateLogged: any, macros?: string | null, micros?: string | null, caloriesConsumed?: number | null, waterIntake?: number | null, steps?: number | null } | null> | null };

export type GetReviewQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetReviewQuery = { __typename?: 'Query', getReview?: { __typename?: 'Review', id: string, rating: number, comment?: string | null, targetType: string, targetId: string, createdAt: any, user: { __typename?: 'User', id: string, name: string } } | null };

export type GetReviewsForTargetQueryVariables = Exact<{
  targetType: Scalars['String']['input'];
  targetId: Scalars['ID']['input'];
}>;


export type GetReviewsForTargetQuery = { __typename?: 'Query', getReviewsForTarget?: Array<{ __typename?: 'Review', id: string, rating: number, comment?: string | null, createdAt: any, user: { __typename?: 'User', id: string, name: string } } | null> | null };

export type FindNearbyRestaurantsQueryVariables = Exact<{
  latitude: Scalars['Float']['input'];
  longitude: Scalars['Float']['input'];
  radius: Scalars['Int']['input'];
  keyword?: InputMaybe<Scalars['String']['input']>;
}>;


export type FindNearbyRestaurantsQuery = { __typename?: 'Query', findNearbyRestaurants?: { __typename?: 'NearbyRestaurantsResult', source?: string | null, restaurants?: Array<{ __typename?: 'ExternalRestaurant', placeId: string, name?: string | null, vicinity?: string | null, rating?: number | null, userRatingsTotal?: number | null, location?: { __typename?: 'LatLng', latitude?: number | null, longitude?: number | null } | null } | null> | null } | null };

export type PingQueryVariables = Exact<{ [key: string]: never; }>;


export type PingQuery = { __typename?: 'Query', ping?: string | null };

export type GenerateOptimizedMealPlanMutationVariables = Exact<{ [key: string]: never; }>;


export type GenerateOptimizedMealPlanMutation = { __typename?: 'Mutation', generateOptimizedMealPlan: { __typename?: 'GeneratedMealPlanPayload', totalCost: number, meals: Array<{ __typename?: 'GeneratedMeal', mealId: string, mealName: string, servings: number, pricePerServing: number, totalPrice: number, nutrition: { __typename?: 'Nutrition', carbohydrates?: number | null, protein?: number | null, fat?: number | null, sodium?: number | null } }>, totalNutrition: { __typename?: 'Nutrition', carbohydrates?: number | null, protein?: number | null, fat?: number | null, sodium?: number | null } } };


export const CreateUserDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateUser"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateUserInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createUser"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"accountStatus"}}]}}]}}]} as unknown as DocumentNode<CreateUserMutation, CreateUserMutationVariables>;
export const UpdateUserDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateUser"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateUserInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateUser"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"accountStatus"}},{"kind":"Field","name":{"kind":"Name","value":"dailyCalories"}},{"kind":"Field","name":{"kind":"Name","value":"weight"}},{"kind":"Field","name":{"kind":"Name","value":"height"}}]}}]}}]} as unknown as DocumentNode<UpdateUserMutation, UpdateUserMutationVariables>;
export const DeleteUserDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteUser"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteUser"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<DeleteUserMutation, DeleteUserMutationVariables>;
export const LoginUserDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"LoginUser"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"email"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"password"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"loginUser"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"email"},"value":{"kind":"Variable","name":{"kind":"Name","value":"email"}}},{"kind":"Argument","name":{"kind":"Name","value":"password"},"value":{"kind":"Variable","name":{"kind":"Name","value":"password"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"token"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"role"}}]}}]}}]}}]} as unknown as DocumentNode<LoginUserMutation, LoginUserMutationVariables>;
export const RequestPasswordResetDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RequestPasswordReset"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"email"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"requestPasswordReset"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"email"},"value":{"kind":"Variable","name":{"kind":"Name","value":"email"}}}]}]}}]} as unknown as DocumentNode<RequestPasswordResetMutation, RequestPasswordResetMutationVariables>;
export const ResetPasswordDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ResetPassword"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"resetToken"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"newPassword"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"resetPassword"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"resetToken"},"value":{"kind":"Variable","name":{"kind":"Name","value":"resetToken"}}},{"kind":"Argument","name":{"kind":"Name","value":"newPassword"},"value":{"kind":"Variable","name":{"kind":"Name","value":"newPassword"}}}]}]}}]} as unknown as DocumentNode<ResetPasswordMutation, ResetPasswordMutationVariables>;
export const CreateRecipeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateRecipe"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"recipeName"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"ingredients"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"instructions"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"prepTime"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"difficulty"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Difficulty"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"nutritionFacts"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"tags"}},"type":{"kind":"ListType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"images"}},"type":{"kind":"ListType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"estimatedCost"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Float"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"authorId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createRecipe"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"recipeName"},"value":{"kind":"Variable","name":{"kind":"Name","value":"recipeName"}}},{"kind":"Argument","name":{"kind":"Name","value":"ingredients"},"value":{"kind":"Variable","name":{"kind":"Name","value":"ingredients"}}},{"kind":"Argument","name":{"kind":"Name","value":"instructions"},"value":{"kind":"Variable","name":{"kind":"Name","value":"instructions"}}},{"kind":"Argument","name":{"kind":"Name","value":"prepTime"},"value":{"kind":"Variable","name":{"kind":"Name","value":"prepTime"}}},{"kind":"Argument","name":{"kind":"Name","value":"difficulty"},"value":{"kind":"Variable","name":{"kind":"Name","value":"difficulty"}}},{"kind":"Argument","name":{"kind":"Name","value":"nutritionFacts"},"value":{"kind":"Variable","name":{"kind":"Name","value":"nutritionFacts"}}},{"kind":"Argument","name":{"kind":"Name","value":"tags"},"value":{"kind":"Variable","name":{"kind":"Name","value":"tags"}}},{"kind":"Argument","name":{"kind":"Name","value":"images"},"value":{"kind":"Variable","name":{"kind":"Name","value":"images"}}},{"kind":"Argument","name":{"kind":"Name","value":"estimatedCost"},"value":{"kind":"Variable","name":{"kind":"Name","value":"estimatedCost"}}},{"kind":"Argument","name":{"kind":"Name","value":"authorId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"authorId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"recipeName"}},{"kind":"Field","name":{"kind":"Name","value":"prepTime"}},{"kind":"Field","name":{"kind":"Name","value":"difficulty"}},{"kind":"Field","name":{"kind":"Name","value":"author"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]} as unknown as DocumentNode<CreateRecipeMutation, CreateRecipeMutationVariables>;
export const UpdateRecipeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateRecipe"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"recipeName"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"ingredients"}},"type":{"kind":"ListType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"instructions"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"prepTime"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"difficulty"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Difficulty"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"nutritionFacts"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"tags"}},"type":{"kind":"ListType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"images"}},"type":{"kind":"ListType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"estimatedCost"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Float"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateRecipe"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"recipeName"},"value":{"kind":"Variable","name":{"kind":"Name","value":"recipeName"}}},{"kind":"Argument","name":{"kind":"Name","value":"ingredients"},"value":{"kind":"Variable","name":{"kind":"Name","value":"ingredients"}}},{"kind":"Argument","name":{"kind":"Name","value":"instructions"},"value":{"kind":"Variable","name":{"kind":"Name","value":"instructions"}}},{"kind":"Argument","name":{"kind":"Name","value":"prepTime"},"value":{"kind":"Variable","name":{"kind":"Name","value":"prepTime"}}},{"kind":"Argument","name":{"kind":"Name","value":"difficulty"},"value":{"kind":"Variable","name":{"kind":"Name","value":"difficulty"}}},{"kind":"Argument","name":{"kind":"Name","value":"nutritionFacts"},"value":{"kind":"Variable","name":{"kind":"Name","value":"nutritionFacts"}}},{"kind":"Argument","name":{"kind":"Name","value":"tags"},"value":{"kind":"Variable","name":{"kind":"Name","value":"tags"}}},{"kind":"Argument","name":{"kind":"Name","value":"images"},"value":{"kind":"Variable","name":{"kind":"Name","value":"images"}}},{"kind":"Argument","name":{"kind":"Name","value":"estimatedCost"},"value":{"kind":"Variable","name":{"kind":"Name","value":"estimatedCost"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"recipeName"}},{"kind":"Field","name":{"kind":"Name","value":"prepTime"}},{"kind":"Field","name":{"kind":"Name","value":"difficulty"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<UpdateRecipeMutation, UpdateRecipeMutationVariables>;
export const DeleteRecipeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteRecipe"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteRecipe"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<DeleteRecipeMutation, DeleteRecipeMutationVariables>;
export const CreateRestaurantDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateRestaurant"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"restaurantName"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"address"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"phone"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"website"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"cuisineType"}},"type":{"kind":"ListType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"priceRange"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"PriceRange"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createRestaurant"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"restaurantName"},"value":{"kind":"Variable","name":{"kind":"Name","value":"restaurantName"}}},{"kind":"Argument","name":{"kind":"Name","value":"address"},"value":{"kind":"Variable","name":{"kind":"Name","value":"address"}}},{"kind":"Argument","name":{"kind":"Name","value":"phone"},"value":{"kind":"Variable","name":{"kind":"Name","value":"phone"}}},{"kind":"Argument","name":{"kind":"Name","value":"website"},"value":{"kind":"Variable","name":{"kind":"Name","value":"website"}}},{"kind":"Argument","name":{"kind":"Name","value":"cuisineType"},"value":{"kind":"Variable","name":{"kind":"Name","value":"cuisineType"}}},{"kind":"Argument","name":{"kind":"Name","value":"priceRange"},"value":{"kind":"Variable","name":{"kind":"Name","value":"priceRange"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"restaurantName"}},{"kind":"Field","name":{"kind":"Name","value":"address"}}]}}]}}]} as unknown as DocumentNode<CreateRestaurantMutation, CreateRestaurantMutationVariables>;
export const UpdateRestaurantDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateRestaurant"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"restaurantName"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"address"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"phone"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"website"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"cuisineType"}},"type":{"kind":"ListType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"priceRange"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"PriceRange"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateRestaurant"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"restaurantName"},"value":{"kind":"Variable","name":{"kind":"Name","value":"restaurantName"}}},{"kind":"Argument","name":{"kind":"Name","value":"address"},"value":{"kind":"Variable","name":{"kind":"Name","value":"address"}}},{"kind":"Argument","name":{"kind":"Name","value":"phone"},"value":{"kind":"Variable","name":{"kind":"Name","value":"phone"}}},{"kind":"Argument","name":{"kind":"Name","value":"website"},"value":{"kind":"Variable","name":{"kind":"Name","value":"website"}}},{"kind":"Argument","name":{"kind":"Name","value":"cuisineType"},"value":{"kind":"Variable","name":{"kind":"Name","value":"cuisineType"}}},{"kind":"Argument","name":{"kind":"Name","value":"priceRange"},"value":{"kind":"Variable","name":{"kind":"Name","value":"priceRange"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"restaurantName"}},{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<UpdateRestaurantMutation, UpdateRestaurantMutationVariables>;
export const DeleteRestaurantDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteRestaurant"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteRestaurant"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<DeleteRestaurantMutation, DeleteRestaurantMutationVariables>;
export const CreateMealPlanDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateMealPlan"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"startDate"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Date"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"endDate"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Date"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"title"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"status"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"MealPlanStatus"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"totalCalories"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createMealPlan"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"userId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userId"}}},{"kind":"Argument","name":{"kind":"Name","value":"startDate"},"value":{"kind":"Variable","name":{"kind":"Name","value":"startDate"}}},{"kind":"Argument","name":{"kind":"Name","value":"endDate"},"value":{"kind":"Variable","name":{"kind":"Name","value":"endDate"}}},{"kind":"Argument","name":{"kind":"Name","value":"title"},"value":{"kind":"Variable","name":{"kind":"Name","value":"title"}}},{"kind":"Argument","name":{"kind":"Name","value":"status"},"value":{"kind":"Variable","name":{"kind":"Name","value":"status"}}},{"kind":"Argument","name":{"kind":"Name","value":"totalCalories"},"value":{"kind":"Variable","name":{"kind":"Name","value":"totalCalories"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"startDate"}},{"kind":"Field","name":{"kind":"Name","value":"endDate"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]}}]} as unknown as DocumentNode<CreateMealPlanMutation, CreateMealPlanMutationVariables>;
export const UpdateMealPlanDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateMealPlan"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"startDate"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Date"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"endDate"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Date"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"title"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"status"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"MealPlanStatus"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"totalCalories"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateMealPlan"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"startDate"},"value":{"kind":"Variable","name":{"kind":"Name","value":"startDate"}}},{"kind":"Argument","name":{"kind":"Name","value":"endDate"},"value":{"kind":"Variable","name":{"kind":"Name","value":"endDate"}}},{"kind":"Argument","name":{"kind":"Name","value":"title"},"value":{"kind":"Variable","name":{"kind":"Name","value":"title"}}},{"kind":"Argument","name":{"kind":"Name","value":"status"},"value":{"kind":"Variable","name":{"kind":"Name","value":"status"}}},{"kind":"Argument","name":{"kind":"Name","value":"totalCalories"},"value":{"kind":"Variable","name":{"kind":"Name","value":"totalCalories"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"startDate"}},{"kind":"Field","name":{"kind":"Name","value":"endDate"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<UpdateMealPlanMutation, UpdateMealPlanMutationVariables>;
export const DeleteMealPlanDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteMealPlan"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteMealPlan"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<DeleteMealPlanMutation, DeleteMealPlanMutationVariables>;
export const CreateMealDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateMeal"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"mealPlanId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"date"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Date"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"mealType"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"MealType"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"recipeId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"restaurantId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"mealName"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"price"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Float"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"ingredients"}},"type":{"kind":"ListType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"nutrition"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"NutritionInput"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"allergens"}},"type":{"kind":"ListType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"nutritionFacts"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"portionSize"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"notes"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createMeal"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"mealPlanId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"mealPlanId"}}},{"kind":"Argument","name":{"kind":"Name","value":"date"},"value":{"kind":"Variable","name":{"kind":"Name","value":"date"}}},{"kind":"Argument","name":{"kind":"Name","value":"mealType"},"value":{"kind":"Variable","name":{"kind":"Name","value":"mealType"}}},{"kind":"Argument","name":{"kind":"Name","value":"recipeId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"recipeId"}}},{"kind":"Argument","name":{"kind":"Name","value":"restaurantId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"restaurantId"}}},{"kind":"Argument","name":{"kind":"Name","value":"mealName"},"value":{"kind":"Variable","name":{"kind":"Name","value":"mealName"}}},{"kind":"Argument","name":{"kind":"Name","value":"price"},"value":{"kind":"Variable","name":{"kind":"Name","value":"price"}}},{"kind":"Argument","name":{"kind":"Name","value":"ingredients"},"value":{"kind":"Variable","name":{"kind":"Name","value":"ingredients"}}},{"kind":"Argument","name":{"kind":"Name","value":"nutrition"},"value":{"kind":"Variable","name":{"kind":"Name","value":"nutrition"}}},{"kind":"Argument","name":{"kind":"Name","value":"allergens"},"value":{"kind":"Variable","name":{"kind":"Name","value":"allergens"}}},{"kind":"Argument","name":{"kind":"Name","value":"nutritionFacts"},"value":{"kind":"Variable","name":{"kind":"Name","value":"nutritionFacts"}}},{"kind":"Argument","name":{"kind":"Name","value":"portionSize"},"value":{"kind":"Variable","name":{"kind":"Name","value":"portionSize"}}},{"kind":"Argument","name":{"kind":"Name","value":"notes"},"value":{"kind":"Variable","name":{"kind":"Name","value":"notes"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"mealName"}},{"kind":"Field","name":{"kind":"Name","value":"mealType"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"nutrition"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"carbohydrates"}},{"kind":"Field","name":{"kind":"Name","value":"protein"}},{"kind":"Field","name":{"kind":"Name","value":"fat"}},{"kind":"Field","name":{"kind":"Name","value":"sodium"}}]}},{"kind":"Field","name":{"kind":"Name","value":"allergens"}}]}}]}}]} as unknown as DocumentNode<CreateMealMutation, CreateMealMutationVariables>;
export const UpdateMealDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateMeal"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"date"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Date"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"mealType"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"MealType"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"recipeId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"restaurantId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"mealName"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"price"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Float"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"ingredients"}},"type":{"kind":"ListType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"nutrition"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"NutritionInput"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"allergens"}},"type":{"kind":"ListType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"nutritionFacts"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"portionSize"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"notes"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateMeal"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"date"},"value":{"kind":"Variable","name":{"kind":"Name","value":"date"}}},{"kind":"Argument","name":{"kind":"Name","value":"mealType"},"value":{"kind":"Variable","name":{"kind":"Name","value":"mealType"}}},{"kind":"Argument","name":{"kind":"Name","value":"recipeId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"recipeId"}}},{"kind":"Argument","name":{"kind":"Name","value":"restaurantId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"restaurantId"}}},{"kind":"Argument","name":{"kind":"Name","value":"mealName"},"value":{"kind":"Variable","name":{"kind":"Name","value":"mealName"}}},{"kind":"Argument","name":{"kind":"Name","value":"price"},"value":{"kind":"Variable","name":{"kind":"Name","value":"price"}}},{"kind":"Argument","name":{"kind":"Name","value":"ingredients"},"value":{"kind":"Variable","name":{"kind":"Name","value":"ingredients"}}},{"kind":"Argument","name":{"kind":"Name","value":"nutrition"},"value":{"kind":"Variable","name":{"kind":"Name","value":"nutrition"}}},{"kind":"Argument","name":{"kind":"Name","value":"allergens"},"value":{"kind":"Variable","name":{"kind":"Name","value":"allergens"}}},{"kind":"Argument","name":{"kind":"Name","value":"nutritionFacts"},"value":{"kind":"Variable","name":{"kind":"Name","value":"nutritionFacts"}}},{"kind":"Argument","name":{"kind":"Name","value":"portionSize"},"value":{"kind":"Variable","name":{"kind":"Name","value":"portionSize"}}},{"kind":"Argument","name":{"kind":"Name","value":"notes"},"value":{"kind":"Variable","name":{"kind":"Name","value":"notes"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"mealName"}},{"kind":"Field","name":{"kind":"Name","value":"mealType"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"nutrition"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"carbohydrates"}},{"kind":"Field","name":{"kind":"Name","value":"protein"}},{"kind":"Field","name":{"kind":"Name","value":"fat"}},{"kind":"Field","name":{"kind":"Name","value":"sodium"}}]}},{"kind":"Field","name":{"kind":"Name","value":"allergens"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<UpdateMealMutation, UpdateMealMutationVariables>;
export const DeleteMealDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteMeal"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteMeal"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<DeleteMealMutation, DeleteMealMutationVariables>;
export const CreateStatsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateStats"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"macros"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"micros"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"caloriesConsumed"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"waterIntake"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"steps"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createStats"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"userId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userId"}}},{"kind":"Argument","name":{"kind":"Name","value":"macros"},"value":{"kind":"Variable","name":{"kind":"Name","value":"macros"}}},{"kind":"Argument","name":{"kind":"Name","value":"micros"},"value":{"kind":"Variable","name":{"kind":"Name","value":"micros"}}},{"kind":"Argument","name":{"kind":"Name","value":"caloriesConsumed"},"value":{"kind":"Variable","name":{"kind":"Name","value":"caloriesConsumed"}}},{"kind":"Argument","name":{"kind":"Name","value":"waterIntake"},"value":{"kind":"Variable","name":{"kind":"Name","value":"waterIntake"}}},{"kind":"Argument","name":{"kind":"Name","value":"steps"},"value":{"kind":"Variable","name":{"kind":"Name","value":"steps"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"dateLogged"}},{"kind":"Field","name":{"kind":"Name","value":"caloriesConsumed"}}]}}]}}]} as unknown as DocumentNode<CreateStatsMutation, CreateStatsMutationVariables>;
export const DeleteStatsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteStats"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteStats"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<DeleteStatsMutation, DeleteStatsMutationVariables>;
export const CreateReviewDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateReview"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"targetType"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"targetId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"rating"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"comment"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createReview"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"targetType"},"value":{"kind":"Variable","name":{"kind":"Name","value":"targetType"}}},{"kind":"Argument","name":{"kind":"Name","value":"targetId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"targetId"}}},{"kind":"Argument","name":{"kind":"Name","value":"rating"},"value":{"kind":"Variable","name":{"kind":"Name","value":"rating"}}},{"kind":"Argument","name":{"kind":"Name","value":"comment"},"value":{"kind":"Variable","name":{"kind":"Name","value":"comment"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"rating"}},{"kind":"Field","name":{"kind":"Name","value":"comment"}},{"kind":"Field","name":{"kind":"Name","value":"targetType"}},{"kind":"Field","name":{"kind":"Name","value":"targetId"}}]}}]}}]} as unknown as DocumentNode<CreateReviewMutation, CreateReviewMutationVariables>;
export const DeleteReviewDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteReview"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteReview"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<DeleteReviewMutation, DeleteReviewMutationVariables>;
export const GetUserDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetUser"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getUser"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"accountStatus"}},{"kind":"Field","name":{"kind":"Name","value":"weight"}},{"kind":"Field","name":{"kind":"Name","value":"height"}},{"kind":"Field","name":{"kind":"Name","value":"gender"}},{"kind":"Field","name":{"kind":"Name","value":"measurementSystem"}},{"kind":"Field","name":{"kind":"Name","value":"dailyCalories"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]} as unknown as DocumentNode<GetUserQuery, GetUserQueryVariables>;
export const GetUsersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetUsers"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"page"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getUsers"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"page"},"value":{"kind":"Variable","name":{"kind":"Name","value":"page"}}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"role"}}]}}]}}]} as unknown as DocumentNode<GetUsersQuery, GetUsersQueryVariables>;
export const SearchUsersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SearchUsers"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"keyword"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"searchUsers"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"keyword"},"value":{"kind":"Variable","name":{"kind":"Name","value":"keyword"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}}]}}]} as unknown as DocumentNode<SearchUsersQuery, SearchUsersQueryVariables>;
export const GetRecipeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetRecipe"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getRecipe"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"recipeName"}},{"kind":"Field","name":{"kind":"Name","value":"ingredients"}},{"kind":"Field","name":{"kind":"Name","value":"instructions"}},{"kind":"Field","name":{"kind":"Name","value":"prepTime"}},{"kind":"Field","name":{"kind":"Name","value":"difficulty"}},{"kind":"Field","name":{"kind":"Name","value":"nutritionFacts"}},{"kind":"Field","name":{"kind":"Name","value":"tags"}},{"kind":"Field","name":{"kind":"Name","value":"images"}},{"kind":"Field","name":{"kind":"Name","value":"estimatedCost"}},{"kind":"Field","name":{"kind":"Name","value":"averageRating"}},{"kind":"Field","name":{"kind":"Name","value":"ratingCount"}},{"kind":"Field","name":{"kind":"Name","value":"author"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]} as unknown as DocumentNode<GetRecipeQuery, GetRecipeQueryVariables>;
export const GetRecipesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetRecipes"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"page"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getRecipes"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"page"},"value":{"kind":"Variable","name":{"kind":"Name","value":"page"}}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"recipeName"}},{"kind":"Field","name":{"kind":"Name","value":"difficulty"}},{"kind":"Field","name":{"kind":"Name","value":"averageRating"}},{"kind":"Field","name":{"kind":"Name","value":"author"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]} as unknown as DocumentNode<GetRecipesQuery, GetRecipesQueryVariables>;
export const SearchRecipesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SearchRecipes"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"keyword"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"searchRecipes"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"keyword"},"value":{"kind":"Variable","name":{"kind":"Name","value":"keyword"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"recipeName"}},{"kind":"Field","name":{"kind":"Name","value":"difficulty"}}]}}]}}]} as unknown as DocumentNode<SearchRecipesQuery, SearchRecipesQueryVariables>;
export const GetRestaurantDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetRestaurant"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getRestaurant"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"restaurantName"}},{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"website"}},{"kind":"Field","name":{"kind":"Name","value":"cuisineType"}},{"kind":"Field","name":{"kind":"Name","value":"priceRange"}},{"kind":"Field","name":{"kind":"Name","value":"averageRating"}},{"kind":"Field","name":{"kind":"Name","value":"ratingCount"}}]}}]}}]} as unknown as DocumentNode<GetRestaurantQuery, GetRestaurantQueryVariables>;
export const GetRestaurantsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetRestaurants"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"page"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getRestaurants"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"page"},"value":{"kind":"Variable","name":{"kind":"Name","value":"page"}}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"restaurantName"}},{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"cuisineType"}},{"kind":"Field","name":{"kind":"Name","value":"averageRating"}}]}}]}}]} as unknown as DocumentNode<GetRestaurantsQuery, GetRestaurantsQueryVariables>;
export const SearchRestaurantsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SearchRestaurants"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"keyword"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"searchRestaurants"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"keyword"},"value":{"kind":"Variable","name":{"kind":"Name","value":"keyword"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"restaurantName"}},{"kind":"Field","name":{"kind":"Name","value":"address"}}]}}]}}]} as unknown as DocumentNode<SearchRestaurantsQuery, SearchRestaurantsQueryVariables>;
export const GetMealPlanDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetMealPlan"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getMealPlan"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"startDate"}},{"kind":"Field","name":{"kind":"Name","value":"endDate"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"totalCalories"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"meals"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"mealName"}},{"kind":"Field","name":{"kind":"Name","value":"mealType"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"nutrition"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"carbohydrates"}},{"kind":"Field","name":{"kind":"Name","value":"protein"}},{"kind":"Field","name":{"kind":"Name","value":"fat"}},{"kind":"Field","name":{"kind":"Name","value":"sodium"}}]}},{"kind":"Field","name":{"kind":"Name","value":"allergens"}}]}}]}}]}}]} as unknown as DocumentNode<GetMealPlanQuery, GetMealPlanQueryVariables>;
export const GetMealPlansDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetMealPlans"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"page"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getMealPlans"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"userId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userId"}}},{"kind":"Argument","name":{"kind":"Name","value":"page"},"value":{"kind":"Variable","name":{"kind":"Name","value":"page"}}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"startDate"}},{"kind":"Field","name":{"kind":"Name","value":"endDate"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]}}]} as unknown as DocumentNode<GetMealPlansQuery, GetMealPlansQueryVariables>;
export const GetStatsByUserDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetStatsByUser"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getStatsByUser"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"userId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"dateLogged"}},{"kind":"Field","name":{"kind":"Name","value":"macros"}},{"kind":"Field","name":{"kind":"Name","value":"micros"}},{"kind":"Field","name":{"kind":"Name","value":"caloriesConsumed"}},{"kind":"Field","name":{"kind":"Name","value":"waterIntake"}},{"kind":"Field","name":{"kind":"Name","value":"steps"}}]}}]}}]} as unknown as DocumentNode<GetStatsByUserQuery, GetStatsByUserQueryVariables>;
export const GetReviewDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetReview"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getReview"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"rating"}},{"kind":"Field","name":{"kind":"Name","value":"comment"}},{"kind":"Field","name":{"kind":"Name","value":"targetType"}},{"kind":"Field","name":{"kind":"Name","value":"targetId"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]} as unknown as DocumentNode<GetReviewQuery, GetReviewQueryVariables>;
export const GetReviewsForTargetDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetReviewsForTarget"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"targetType"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"targetId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getReviewsForTarget"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"targetType"},"value":{"kind":"Variable","name":{"kind":"Name","value":"targetType"}}},{"kind":"Argument","name":{"kind":"Name","value":"targetId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"targetId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"rating"}},{"kind":"Field","name":{"kind":"Name","value":"comment"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]} as unknown as DocumentNode<GetReviewsForTargetQuery, GetReviewsForTargetQueryVariables>;
export const FindNearbyRestaurantsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"FindNearbyRestaurants"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"latitude"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Float"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"longitude"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Float"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"radius"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"keyword"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"findNearbyRestaurants"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"latitude"},"value":{"kind":"Variable","name":{"kind":"Name","value":"latitude"}}},{"kind":"Argument","name":{"kind":"Name","value":"longitude"},"value":{"kind":"Variable","name":{"kind":"Name","value":"longitude"}}},{"kind":"Argument","name":{"kind":"Name","value":"radius"},"value":{"kind":"Variable","name":{"kind":"Name","value":"radius"}}},{"kind":"Argument","name":{"kind":"Name","value":"keyword"},"value":{"kind":"Variable","name":{"kind":"Name","value":"keyword"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"source"}},{"kind":"Field","name":{"kind":"Name","value":"restaurants"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"placeId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"vicinity"}},{"kind":"Field","name":{"kind":"Name","value":"rating"}},{"kind":"Field","name":{"kind":"Name","value":"userRatingsTotal"}},{"kind":"Field","name":{"kind":"Name","value":"location"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"latitude"}},{"kind":"Field","name":{"kind":"Name","value":"longitude"}}]}}]}}]}}]}}]} as unknown as DocumentNode<FindNearbyRestaurantsQuery, FindNearbyRestaurantsQueryVariables>;
export const PingDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Ping"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"ping"}}]}}]} as unknown as DocumentNode<PingQuery, PingQueryVariables>;
export const GenerateOptimizedMealPlanDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"GenerateOptimizedMealPlan"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"generateOptimizedMealPlan"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"meals"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"mealId"}},{"kind":"Field","name":{"kind":"Name","value":"mealName"}},{"kind":"Field","name":{"kind":"Name","value":"servings"}},{"kind":"Field","name":{"kind":"Name","value":"pricePerServing"}},{"kind":"Field","name":{"kind":"Name","value":"totalPrice"}},{"kind":"Field","name":{"kind":"Name","value":"nutrition"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"carbohydrates"}},{"kind":"Field","name":{"kind":"Name","value":"protein"}},{"kind":"Field","name":{"kind":"Name","value":"fat"}},{"kind":"Field","name":{"kind":"Name","value":"sodium"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalCost"}},{"kind":"Field","name":{"kind":"Name","value":"totalNutrition"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"carbohydrates"}},{"kind":"Field","name":{"kind":"Name","value":"protein"}},{"kind":"Field","name":{"kind":"Name","value":"fat"}},{"kind":"Field","name":{"kind":"Name","value":"sodium"}}]}}]}}]}}]} as unknown as DocumentNode<GenerateOptimizedMealPlanMutation, GenerateOptimizedMealPlanMutationVariables>;