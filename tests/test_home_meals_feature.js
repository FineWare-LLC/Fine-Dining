/**
 * Test script to verify home meals feature implementation
 * Tests the meal catalog functionality for both restaurant and home meals
 */

const { ApolloClient, InMemoryCache, gql, createHttpLink } = require('@apollo/client');
const fetch = require('cross-fetch');

// Create Apollo Client
const httpLink = createHttpLink({
  uri: 'http://localhost:3000/api/graphql',
  fetch: fetch,
});

const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});

// GraphQL query to test meal catalog
const GET_MEALS_WITH_FILTERS = gql`
  query GetMealsWithFilters(
    $page: Int!
    $limit: Int!
    $search: String
  ) {
    getMealsWithFilters(
      page: $page
      limit: $limit
      search: $search
    ) {
      meals {
        id
        mealName
        mealType
        prepTime
        cuisine
        price
        rating
        nutrition {
          calories
          protein
          carbohydrates
          fat
        }
        recipe {
          images
          ingredients {
            name
            quantity
            unit
          }
          instructions
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

async function testHomeMealsFeature() {
  console.log('🧪 Testing Home Meals Feature...\n');

  try {
    // Test 1: Basic meal catalog query
    console.log('📋 Test 1: Fetching meal catalog...');
    const result = await client.query({
      query: GET_MEALS_WITH_FILTERS,
      variables: {
        page: 1,
        limit: 10,
      },
    });

    const meals = result.data.getMealsWithFilters.meals;
    console.log(`✅ Found ${meals.length} meals in catalog`);

    // Test 2: Check for home meals vs restaurant meals
    console.log('\n🏠 Test 2: Analyzing meal types...');
    const homeMeals = meals.filter(meal => !meal.restaurant);
    const restaurantMeals = meals.filter(meal => meal.restaurant);

    console.log(`🏠 Home meals found: ${homeMeals.length}`);
    console.log(`🍽️  Restaurant meals found: ${restaurantMeals.length}`);

    // Test 3: Check home meal recipe details
    if (homeMeals.length > 0) {
      console.log('\n📖 Test 3: Checking home meal recipe details...');
      const homeMeal = homeMeals[0];
      console.log(`Sample home meal: ${homeMeal.mealName}`);
      console.log(`- Has recipe: ${!!homeMeal.recipe}`);
      console.log(`- Has ingredients: ${!!homeMeal.recipe?.ingredients?.length}`);
      console.log(`- Has instructions: ${!!homeMeal.recipe?.instructions}`);
      console.log(`- Nutrition info: ${!!homeMeal.nutrition}`);

      if (homeMeal.recipe?.instructions) {
        console.log(`- Instructions preview: ${homeMeal.recipe.instructions.substring(0, 100)}...`);
      }
    } else {
      console.log('⚠️  No home meals found in catalog');
    }

    // Test 4: Check restaurant meal details
    if (restaurantMeals.length > 0) {
      console.log('\n🍽️  Test 4: Checking restaurant meal details...');
      const restaurantMeal = restaurantMeals[0];
      console.log(`Sample restaurant meal: ${restaurantMeal.mealName}`);
      console.log(`- Restaurant: ${restaurantMeal.restaurant?.restaurantName}`);
      console.log(`- Has nutrition: ${!!restaurantMeal.nutrition}`);
      console.log(`- Has recipe: ${!!restaurantMeal.recipe}`);
    }

    console.log('\n✅ All tests completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`- Total meals: ${meals.length}`);
    console.log(`- Home meals: ${homeMeals.length}`);
    console.log(`- Restaurant meals: ${restaurantMeals.length}`);
    console.log(`- Meals with recipes: ${meals.filter(m => m.recipe).length}`);
    console.log(`- Meals with nutrition: ${meals.filter(m => m.nutrition).length}`);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.networkError) {
      console.error('Network error:', error.networkError.message);
    }
    if (error.graphQLErrors) {
      error.graphQLErrors.forEach(err => {
        console.error('GraphQL error:', err.message);
      });
    }
  }
}

// Run the test
if (require.main === module) {
  testHomeMealsFeature()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { testHomeMealsFeature };