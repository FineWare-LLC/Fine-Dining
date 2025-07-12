// tests/e2e/fullResolvers.spec.js
import { faker } from '@faker-js/faker';
import { test, expect } from '@playwright/test';

/**
 * Helper: Post to /api/graphql with a given query/mutation + variables.
 */
async function gqlPost(request, query, variables = {}) {
    const response = await request.post('/api/graphql', {
        headers: { 'Content-Type': 'application/json' },
        data: { query, variables },
    });
    return response.json();
}

test.describe('Fine Dining GraphQL API (Full Resolvers)', () => {
    // We will store IDs from "create" tests so we can clean up afterward.
    let userId;
    let userEmail;
    let userPassword;
    let recipeId;
    let restaurantId;
    let mealPlanId;
    let statsId;

    //
    // --- 1) CREATE USER ---
    //
    test('createUser', async ({ request }) => {
        // Generate random user fields with Faker
        userEmail = faker.internet.email();
        userPassword = faker.internet.password();

        const mutation = `
      mutation ($input: CreateUserInput!) {
        createUser(input: $input) {
          id
          name
          email
        }
      }
    `;
        const variables = {
            input: {
                name: faker.person.fullName(),
                email: userEmail,
                password: userPassword, // Make sure your schema expects this!
                gender: faker.helpers.arrayElement(['MALE', 'FEMALE', 'OTHER']),
                measurementSystem: faker.helpers.arrayElement(['METRIC', 'IMPERIAL']),
            },
        };

        const { data, errors } = await gqlPost(request, mutation, variables);

        expect(errors).toBeUndefined();
        expect(data.createUser).toBeTruthy();

        userId = data.createUser.id;
        expect(userId).toBeTruthy();
    });

    //
    // --- 2) LOGIN USER ---
    //
    test('loginUser', async ({ request }) => {
        // Attempt to log in using the same random email/password from createUser
        const mutation = `
      mutation ($email: String!, $password: String!) {
        loginUser(email: $email, password: $password) {
          token
          user {
            id
            email
          }
        }
      }
    `;
        const variables = {
            email: userEmail,
            password: userPassword,
        };

        const { data, errors } = await gqlPost(request, mutation, variables);
        expect(errors).toBeUndefined();

        // The returned token is also testable, if you want to verify it exists
        expect(data.loginUser.token).toBeTruthy();
        expect(data.loginUser.user.email).toBe(userEmail);
    });

    //
    // --- 3) GET/UPDATE USER ---
    //
    test('getUser', async ({ request }) => {
        const query = `
      query ($id: ID!) {
        getUser(id: $id) {
          id
          name
          email
        }
      }
    `;
        const { data, errors } = await gqlPost(request, query, { id: userId });
        expect(errors).toBeUndefined();
        expect(data.getUser.email).toBe(userEmail);
    });

    test('updateUser', async ({ request }) => {
        const mutation = `
      mutation ($id: ID!, $input: UpdateUserInput!) {
        updateUser(id: $id, input: $input) {
          id
          name
          dailyCalories
        }
      }
    `;
        const variables = {
            id: userId,
            input: {
                name: 'Updated Name',
                dailyCalories: 2400,
            },
        };
        const { data, errors } = await gqlPost(request, mutation, variables);
        expect(errors).toBeUndefined();
        expect(data.updateUser.name).toBe('Updated Name');
        expect(data.updateUser.dailyCalories).toBe(2400);
    });

    //
    // --- 4) CREATE/GET/UPDATE/DELETE RECIPE ---
    //
    test('createRecipe', async ({ request }) => {
        const mutation = `
      mutation ($recipeName: String!, $ingredients: [String]!, $instructions: String!, $prepTime: Int!, $difficulty: Difficulty, $nutritionFacts: String) {
        createRecipe(
          recipeName: $recipeName
          ingredients: $ingredients
          instructions: $instructions
          prepTime: $prepTime
          difficulty: $difficulty
          nutritionFacts: $nutritionFacts
        ) {
          id
          recipeName
          instructions
        }
      }
    `;
        const variables = {
            recipeName: 'Example Smoothie',
            ingredients: ['Banana', 'Oats', 'Milk'],
            instructions: 'Blend thoroughly.',
            prepTime: 3,
            difficulty: 'EASY',
            nutritionFacts: 'Approx 250 kcal',
        };
        const { data, errors } = await gqlPost(request, mutation, variables);
        expect(errors).toBeUndefined();
        recipeId = data.createRecipe.id;
        expect(recipeId).toBeTruthy();
    });

    test('getRecipe', async ({ request }) => {
        const query = `
      query ($id: ID!) {
        getRecipe(id: $id) {
          id
          recipeName
          instructions
        }
      }
    `;
        const { data, errors } = await gqlPost(request, query, { id: recipeId });
        expect(errors).toBeUndefined();
        expect(data.getRecipe.recipeName).toBe('Example Smoothie');
    });

    test('updateRecipe', async ({ request }) => {
        const mutation = `
      mutation ($id: ID!, $recipeName: String, $instructions: String) {
        updateRecipe(id: $id, recipeName: $recipeName, instructions: $instructions) {
          id
          recipeName
          instructions
        }
      }
    `;
        const { data, errors } = await gqlPost(request, mutation, {
            id: recipeId,
            recipeName: 'Enhanced Smoothie',
            instructions: 'Blend with ice. Enjoy!',
        });
        expect(errors).toBeUndefined();
        expect(data.updateRecipe.recipeName).toBe('Enhanced Smoothie');
        expect(data.updateRecipe.instructions).toContain('ice');
    });

    //
    // --- 5) CREATE/GET/DELETE RESTAURANT ---
    //
    test('createRestaurant', async ({ request }) => {
        const mutation = `
      mutation ($restaurantName: String!, $address: String!, $phone: String, $website: String) {
        createRestaurant(
          restaurantName: $restaurantName
          address: $address
          phone: $phone
          website: $website
        ) {
          id
          restaurantName
        }
      }
    `;
        const vars = {
            restaurantName: 'Test Cafe',
            address: '123 Fake Rd.',
            phone: faker.phone.number('##########'),
            website: faker.internet.url(),
        };
        const { data, errors } = await gqlPost(request, mutation, vars);
        expect(errors).toBeUndefined();
        restaurantId = data.createRestaurant.id;
        expect(restaurantId).toBeTruthy();
    });

    test('getRestaurant', async ({ request }) => {
        const query = `
      query ($id: ID!) {
        getRestaurant(id: $id) {
          id
          restaurantName
          address
        }
      }
    `;
        const { data, errors } = await gqlPost(request, query, { id: restaurantId });
        expect(errors).toBeUndefined();
        expect(data.getRestaurant.restaurantName).toBe('Test Cafe');
    });

    //
    // --- 6) CREATE/GET/DELETE MEAL PLAN ---
    //
    test('createMealPlan', async ({ request }) => {
        const mutation = `
      mutation ($userId: ID!, $startDate: String!, $endDate: String!) {
        createMealPlan(userId: $userId, startDate: $startDate, endDate: $endDate) {
          id
          startDate
          endDate
          user {
            id
            name
          }
        }
      }
    `;
        const variables = {
            userId,
            startDate: '2025-01-01',
            endDate: '2025-01-07',
        };
        const { data, errors } = await gqlPost(request, mutation, variables);
        expect(errors).toBeUndefined();
        mealPlanId = data.createMealPlan.id;
        expect(mealPlanId).toBeTruthy();
        // Confirm user relationship is correct
        expect(data.createMealPlan.user.id).toBe(userId);
    });

    test('getMealPlan', async ({ request }) => {
        const query = `
      query ($id: ID!) {
        getMealPlan(id: $id) {
          id
          startDate
          endDate
          user {
            id
            email
          }
        }
      }
    `;
        const { data, errors } = await gqlPost(request, query, { id: mealPlanId });
        expect(errors).toBeUndefined();
        expect(data.getMealPlan.user.id).toBe(userId);
        expect(data.getMealPlan.user.email).toBe(userEmail);
    });

    //
    // --- 7) CREATE/GET/DELETE STATS ---
    //
    test('createStats', async ({ request }) => {
        const mutation = `
      mutation ($userId: ID!, $macros: String, $micros: String) {
        createStats(userId: $userId, macros: $macros, micros: $micros) {
          id
          macros
          micros
          user {
            id
            email
          }
        }
      }
    `;
        const vars = {
            userId,
            macros: 'Protein: 120g',
            micros: 'Iron: 10mg',
        };
        const { data, errors } = await gqlPost(request, mutation, vars);
        expect(errors).toBeUndefined();
        statsId = data.createStats.id;
        expect(data.createStats.macros).toBe('Protein: 120g');
        expect(data.createStats.user.email).toBe(userEmail);
    });

    test('getStatsByUser', async ({ request }) => {
        const query = `
      query ($userId: ID!) {
        getStatsByUser(userId: $userId) {
          id
          macros
          micros
        }
      }
    `;
        const { data, errors } = await gqlPost(request, query, { userId });
        expect(errors).toBeUndefined();
        // Should at least have the one record we just made
        expect(data.getStatsByUser.length).toBeGreaterThan(0);
    });

    //
    // --- 8) "LIST ALL" QUERIES ---
    //
    test('getUsers (list all)', async ({ request }) => {
        const query = 'query { getUsers { id email } }';
        const { data, errors } = await gqlPost(request, query);
        expect(errors).toBeUndefined();
        expect(Array.isArray(data.getUsers)).toBe(true);
    });

    test('getRecipes (list all)', async ({ request }) => {
        const query = 'query { getRecipes { id recipeName } }';
        const { data, errors } = await gqlPost(request, query);
        expect(errors).toBeUndefined();
        expect(Array.isArray(data.getRecipes)).toBe(true);
    });

    test('getRestaurants (list all)', async ({ request }) => {
        const query = 'query { getRestaurants { id restaurantName } }';
        const { data, errors } = await gqlPost(request, query);
        expect(errors).toBeUndefined();
        expect(Array.isArray(data.getRestaurants)).toBe(true);
    });

    test('getMealPlans (list all)', async ({ request }) => {
        const query = 'query { getMealPlans { id startDate endDate user { id } } }';
        const { data, errors } = await gqlPost(request, query);
        expect(errors).toBeUndefined();
        expect(Array.isArray(data.getMealPlans)).toBe(true);
    });

    //
    // --- 9) CLEAN-UP: DELETE STUFF ---
    //
    test('deleteRecipe', async ({ request }) => {
        const mutation = 'mutation ($id: ID!) { deleteRecipe(id: $id) }';
        const { data, errors } = await gqlPost(request, mutation, { id: recipeId });
        expect(errors).toBeUndefined();
        expect(data.deleteRecipe).toBe(true);
    });

    test('deleteRestaurant', async ({ request }) => {
        const mutation = 'mutation ($id: ID!) { deleteRestaurant(id: $id) }';
        const { data, errors } = await gqlPost(request, mutation, { id: restaurantId });
        expect(errors).toBeUndefined();
        expect(data.deleteRestaurant).toBe(true);
    });

    test('deleteMealPlan', async ({ request }) => {
        const mutation = 'mutation ($id: ID!) { deleteMealPlan(id: $id) }';
        const { data, errors } = await gqlPost(request, mutation, { id: mealPlanId });
        expect(errors).toBeUndefined();
        expect(data.deleteMealPlan).toBe(true);
    });

    test('deleteStats', async ({ request }) => {
        const mutation = 'mutation ($id: ID!) { deleteStats(id: $id) }';
        const { data, errors } = await gqlPost(request, mutation, { id: statsId });
        expect(errors).toBeUndefined();
        expect(data.deleteStats).toBe(true);
    });

    test('deleteUser', async ({ request }) => {
        const mutation = 'mutation ($id: ID!) { deleteUser(id: $id) }';
        const { data, errors } = await gqlPost(request, mutation, { id: userId });
        expect(errors).toBeUndefined();
        expect(data.deleteUser).toBe(true);
    });
});
