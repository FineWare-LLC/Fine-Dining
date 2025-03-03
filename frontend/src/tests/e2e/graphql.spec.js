// tests/e2e/graphql.spec.js
import { test, expect } from '@playwright/test';

/**
 * Utility: Generic GraphQL Post
 * @param {import('@playwright/test').APIRequestContext} request
 * @param {string} query - The GraphQL query/mutation as string
 * @param {object} variables - Variables object
 * @returns {Promise<any>} JSON response
 */
async function gqlPost(request, query, variables = {}) {
    const response = await request.post('/api/graphql', {
        data: { query, variables },
    });
    return response.json();
}

test.describe('Fine Dining GraphQL API Tests', () => {
    let createdUserId;
    let createdRecipeId;
    let createdRestaurantId;
    let createdMealPlanId;
    let createdStatsId;

    /* --------------------------------------
     *  USER
     * ------------------------------------*/
    test('createUser', async ({ request }) => {
        const mutation = `
      mutation CreateAUser($input: CreateUserInput!) {
        createUser(input: $input) {
          id
          name
          email
        }
      }
    `;
        const variables = {
            input: {
                name: "John Doe",
                email: "john.doe@example.com",
                gender: "MALE",
                measurementSystem: "METRIC",
            },
        };

        const { data, errors } = await gqlPost(request, mutation, variables);
        expect(errors).toBeUndefined();
        expect(data.createUser).toBeTruthy();
        expect(data.createUser.id).toBeTruthy();
        createdUserId = data.createUser.id;
    });

    test('getUser', async ({ request }) => {
        const query = `
      query GetUser($id: ID!) {
        getUser(id: $id) {
          id
          name
          email
        }
      }
    `;
        const variables = { id: createdUserId };

        const { data, errors } = await gqlPost(request, query, variables);
        expect(errors).toBeUndefined();
        expect(data.getUser).toBeTruthy();
        expect(data.getUser.name).toBe("John Doe");
    });

    test('updateUser', async ({ request }) => {
        const mutation = `
      mutation UpdateAUser($id: ID!, $input: UpdateUserInput!) {
        updateUser(id: $id, input: $input) {
          id
          name
          dailyCalories
        }
      }
    `;
        const variables = {
            id: createdUserId,
            input: {
                name: "John The Updated",
                dailyCalories: 2100,
            },
        };

        const { data, errors } = await gqlPost(request, mutation, variables);
        expect(errors).toBeUndefined();
        expect(data.updateUser.name).toBe("John The Updated");
        expect(data.updateUser.dailyCalories).toBe(2100);
    });

    /* --------------------------------------
     *  RECIPE
     * ------------------------------------*/
    test('createRecipe', async ({ request }) => {
        const mutation = `
      mutation CreateARecipe($recipeName: String!, $ingredients: [String]!, $instructions: String!, $prepTime: Int!, $difficulty: Difficulty, $nutritionFacts: String) {
        createRecipe(recipeName: $recipeName, ingredients: $ingredients, instructions: $instructions, prepTime: $prepTime, difficulty: $difficulty, nutritionFacts: $nutritionFacts) {
          id
          recipeName
          instructions
        }
      }
    `;
        const variables = {
            recipeName: "Green Smoothie",
            ingredients: ["Spinach", "Banana", "Milk"],
            instructions: "Blend all ingredients",
            prepTime: 5,
            difficulty: "EASY",
            nutritionFacts: "Some facts",
        };
        const { data, errors } = await gqlPost(request, mutation, variables);
        expect(errors).toBeUndefined();
        createdRecipeId = data.createRecipe.id;
        expect(createdRecipeId).toBeTruthy();
    });

    test('getRecipe', async ({ request }) => {
        const query = `
      query GetRecipe($id: ID!) {
        getRecipe(id: $id) {
          id
          recipeName
          ingredients
          instructions
        }
      }
    `;
        const { data, errors } = await gqlPost(request, query, { id: createdRecipeId });
        expect(errors).toBeUndefined();
        expect(data.getRecipe.recipeName).toBe("Green Smoothie");
    });

    /* --------------------------------------
     *  RESTAURANT
     * ------------------------------------*/
    test('createRestaurant', async ({ request }) => {
        const mutation = `
      mutation CreateARestaurant($restaurantName: String!, $address: String!, $phone: String, $website: String) {
        createRestaurant(restaurantName: $restaurantName, address: $address, phone: $phone, website: $website) {
          id
          restaurantName
        }
      }
    `;
        const variables = {
            restaurantName: "The Healthy Spot",
            address: "123 Wellness Blvd",
            phone: "5551234567",
            website: "https://healthyspot.example.com",
        };
        const { data, errors } = await gqlPost(request, mutation, variables);
        expect(errors).toBeUndefined();
        createdRestaurantId = data.createRestaurant.id;
        expect(createdRestaurantId).toBeTruthy();
    });

    test('getRestaurant', async ({ request }) => {
        const query = `
      query GetRestaurant($id: ID!) {
        getRestaurant(id: $id) {
          id
          restaurantName
          address
        }
      }
    `;
        const { data, errors } = await gqlPost(request, query, { id: createdRestaurantId });
        expect(errors).toBeUndefined();
        expect(data.getRestaurant.restaurantName).toBe("The Healthy Spot");
    });

    /* --------------------------------------
     *  MEAL PLAN
     * ------------------------------------*/
    test('createMealPlan', async ({ request }) => {
        const mutation = `
      mutation CreateMealPlan($userId: ID!, $startDate: String!, $endDate: String!) {
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
            userId: createdUserId,
            startDate: "2025-05-01",
            endDate: "2025-05-07",
        };
        const { data, errors } = await gqlPost(request, mutation, variables);
        expect(errors).toBeUndefined();
        createdMealPlanId = data.createMealPlan.id;
        expect(createdMealPlanId).toBeTruthy();
    });

    test('getMealPlan', async ({ request }) => {
        const query = `
      query GetMealPlan($id: ID!) {
        getMealPlan(id: $id) {
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
        const { data, errors } = await gqlPost(request, query, { id: createdMealPlanId });
        expect(errors).toBeUndefined();
        expect(data.getMealPlan.user.id).toBe(createdUserId);
    });

    /* --------------------------------------
     *  STATS
     * ------------------------------------*/
    test('createStats', async ({ request }) => {
        const mutation = `
      mutation CreateStats($userId: ID!, $macros: String, $micros: String) {
        createStats(userId: $userId, macros: $macros, micros: $micros) {
          id
          macros
          micros
          user {
            id
            name
          }
        }
      }
    `;
        const variables = {
            userId: createdUserId,
            macros: "Protein: 150g",
            micros: "Iron: 18mg",
        };
        const { data, errors } = await gqlPost(request, mutation, variables);
        expect(errors).toBeUndefined();
        createdStatsId = data.createStats.id;
        expect(data.createStats.macros).toBe("Protein: 150g");
    });

    test('getStatsByUser', async ({ request }) => {
        const query = `
      query GetStats($userId: ID!) {
        getStatsByUser(userId: $userId) {
          id
          macros
          micros
        }
      }
    `;
        const { data, errors } = await gqlPost(request, query, { userId: createdUserId });
        expect(errors).toBeUndefined();
        expect(data.getStatsByUser.length).toBeGreaterThan(0);
    });

    /* --------------------------------------
     *  CLEANUP TESTS
     * ------------------------------------*/
    test('deleteMealPlan', async ({ request }) => {
        const mutation = `
      mutation DeleteMealPlan($id: ID!) {
        deleteMealPlan(id: $id)
      }
    `;
        const { data, errors } = await gqlPost(request, mutation, { id: createdMealPlanId });
        expect(errors).toBeUndefined();
        expect(data.deleteMealPlan).toBe(true);
    });

    test('deleteUser', async ({ request }) => {
        const mutation = `
      mutation DeleteAUser($id: ID!) {
        deleteUser(id: $id)
      }
    `;
        const { data, errors } = await gqlPost(request, mutation, { id: createdUserId });
        expect(errors).toBeUndefined();
        expect(data.deleteUser).toBe(true);
    });

    /* --------------------------------------
 * ADDITIONAL TESTS FOR EXTENDED COVERAGE
 * ------------------------------------*/

// 1) List All Users
    test('getUsers (list all)', async ({ request }) => {
        const query = `
    query GetAllUsers {
      getUsers {
        id
        name
        email
      }
    }
  `;
        const { data, errors } = await gqlPost(request, query);
        expect(errors).toBeUndefined();
        expect(Array.isArray(data.getUsers)).toBe(true);
        // Optional: expect(data.getUsers.length).toBeGreaterThan(0);
    });

// 2) List All Recipes
    test('getRecipes (list all)', async ({ request }) => {
        const query = `
    query GetAllRecipes {
      getRecipes {
        id
        recipeName
        ingredients
      }
    }
  `;
        const { data, errors } = await gqlPost(request, query);
        expect(errors).toBeUndefined();
        expect(Array.isArray(data.getRecipes)).toBe(true);
    });

// 3) List All Restaurants
    test('getRestaurants (list all)', async ({ request }) => {
        const query = `
    query GetAllRestaurants {
      getRestaurants {
        id
        restaurantName
        address
      }
    }
  `;
        const { data, errors } = await gqlPost(request, query);
        expect(errors).toBeUndefined();
        expect(Array.isArray(data.getRestaurants)).toBe(true);
    });

// 4) List All MealPlans
    test('getMealPlans (list all)', async ({ request }) => {
        const query = `
    query {
      getMealPlans {
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
        const { data, errors } = await gqlPost(request, query);
        expect(errors).toBeUndefined();
        expect(Array.isArray(data.getMealPlans)).toBe(true);
    });

// 5) Update a Recipe (Example)
    test('updateRecipe (debug)', async ({ request }) => {
        const mutation = `
    mutation UpdateARecipe($id: ID!, $recipeName: String!) {
      updateRecipe(id: $id, recipeName: $recipeName) {
        id
        recipeName
      }
    }
  `;
        const variables = {
            id: createdRecipeId,
            recipeName: "Green Smoothie Deluxe"
        };

        // Send the request
        const responseJson = await gqlPost(request, mutation, variables);

        // Log full response for debugging
        console.log('DEBUG: updateRecipe response:', JSON.stringify(responseJson, null, 2));

        // Check if the response has 'errors'
        const { data, errors } = responseJson;

        // Print out errors if present
        if (errors) {
            console.log('DEBUG: updateRecipe errors:', JSON.stringify(errors, null, 2));
        }

        // For debugging, we won't fail immediately if errors exist:
        // but you can remove this once you see the logs
        expect(errors).toBeUndefined();

        // Also check the data
        expect(data.updateRecipe).toBeTruthy();
        expect(data.updateRecipe.recipeName).toBe("Green Smoothie Deluxe");
    });

// 6) Delete a Recipe
    test('deleteRecipe (debug)', async ({ request }) => {
        const mutation = `
    mutation DeleteRecipe($id: ID!) {
      deleteRecipe(id: $id)
    }
  `;
        const responseJson = await gqlPost(request, mutation, { id: createdRecipeId });

        console.log('DEBUG: deleteRecipe response:', JSON.stringify(responseJson, null, 2));

        const { data, errors } = responseJson;
        if (errors) {
            console.log('DEBUG: deleteRecipe errors:', JSON.stringify(errors, null, 2));
        }

        expect(errors).toBeUndefined();
        // If your resolver returns boolean
        expect(data.deleteRecipe).toBe(true);
    });

// 7) Delete Restaurant
    test('deleteRestaurant (debug)', async ({ request }) => {
        const mutation = `
    mutation DeleteRestaurant($id: ID!) {
      deleteRestaurant(id: $id)
    }
  `;
        const responseJson = await gqlPost(request, mutation, { id: createdRestaurantId });

        console.log('DEBUG: deleteRestaurant response:', JSON.stringify(responseJson, null, 2));

        const { data, errors } = responseJson;
        if (errors) {
            console.log('DEBUG: deleteRestaurant errors:', JSON.stringify(errors, null, 2));
        }

        expect(errors).toBeUndefined();
        expect(data.deleteRestaurant).toBe(true);
    });

// 8) Delete Stats
    test('deleteStats (debug)', async ({ request }) => {
        const mutation = `
    mutation DeleteStats($id: ID!) {
      deleteStats(id: $id)
    }
  `;
        const responseJson = await gqlPost(request, mutation, { id: createdStatsId });

        console.log('DEBUG: deleteStats response:', JSON.stringify(responseJson, null, 2));

        const { data, errors } = responseJson;
        if (errors) {
            console.log('DEBUG: deleteStats errors:', JSON.stringify(errors, null, 2));
        }

        expect(errors).toBeUndefined();
        expect(data.deleteStats).toBe(true);
    });


});
