/****************************************************************
 * FILE: /src/graphql/schema/resolvers/index.js
 * Consolidates Query, Mutation, and Field resolvers into
 * a single export for a GraphQL schema.
 ****************************************************************/

import { Query } from './queries';
import { Mutation } from './mutations';
import { MealPlan, Meal, Stats, Review, MenuItem, DateScalar } from './resolversFields';

/**
 * @file index.js
 * @description Combines separate sets of resolvers (Queries, Mutations,
 * Field-level resolvers, custom scalars, etc.) into one object
 * that can be exported to the GraphQL schema creation process.
 */

export const resolvers = {
    Date: DateScalar,
    Query,
    Mutation,
    MealPlan,
    Meal,
    Stats,
    Review,
    MenuItem
};
