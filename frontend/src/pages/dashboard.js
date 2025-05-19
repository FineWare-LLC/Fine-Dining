/**
 * Dashboard page — orchestrates all dashboard atoms.
 */
import React, { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import { Box, Button, CssBaseline, useTheme, CircularProgress, Typography, Tabs, Tab, Alert } from '@mui/material';
import { useMutation, useLazyQuery, useQuery, gql } from '@apollo/client';
import NewHeader from '@/components/Dashboard/NewHeader';
import GreetingSegment from '@/components/Dashboard/GreetingSegment';
import DailySummary from '@/components/Dashboard/DailySummary';
import MealCard from '@/components/Dashboard/MealCard';
import DiscoveryHeader from '@/components/Dashboard/DiscoveryHeader';
import RestaurantCard from '@/components/Dashboard/RestaurantCard';
import BottomSearchRail from "@/components/Dashboard/BottomSearchRail.js";
import NewNavigationDrawer from '@/components/Dashboard/NewNavigationDrawer';
import OptimizedMealPlanDisplay from '@/components/Dashboard/OptimizedMealPlanDisplay';
import MealCatalog from '@/components/Dashboard/MealCatalog';
import NutritionRequirementsForm from '@/components/Dashboard/NutritionRequirementsForm';
import { useDashStore } from '@/components/Dashboard/store';
import { useAuth } from '@/context/AuthContext';

const GENERATE_OPTIMIZED_MEAL_PLAN = gql`
  mutation GenerateOptimizedMealPlan($selectedMealIds: [ID], $customNutritionTargets: CustomNutritionTargetsInput) {
    generateOptimizedMealPlan(selectedMealIds: $selectedMealIds, customNutritionTargets: $customNutritionTargets) {
      meals {
        mealId
        mealName
        servings
        pricePerServing
        totalPrice
        nutrition {
          carbohydrates
          protein
          fat
          sodium
        }
      }
      totalCost
      totalNutrition {
        carbohydrates
        protein
        fat
        sodium
      }
    }
  }
`;

const FIND_NEARBY_RESTAURANTS = gql`
  query FindNearbyRestaurants(
    $latitude: Float!
    $longitude: Float!
    $radius: Int!
    $keyword: String
  ) {
    findNearbyRestaurants(
      latitude: $latitude
      longitude: $longitude
      radius: $radius
      keyword: $keyword
    ) {
      source
      restaurants {
        placeId
        name
        vicinity
        rating
        userRatingsTotal
        location {
          latitude
          longitude
        }
      }
    }
  }
`;

/* ------------------------------------------------------------------------ */
/* Data hooks powered by GraphQL.                                         */

const GET_MEALS = gql`
  query GetAllMeals($page: Int, $limit: Int) {
    getAllMeals(page: $page, limit: $limit) {
      id
      mealName
      mealType
      nutrition {
        carbohydrates
        protein
        fat
      }
      recipe { images }
    }
  }
`;

const useDailyMeals = (count = 3) => {
  const { data } = useQuery(GET_MEALS, {
    variables: { page: 1, limit: count },
    fetchPolicy: 'network-only',
  });

  const meals = useMemo(() =>
    (data?.getAllMeals || []).map((m, i) => ({
      timeLabel: m.mealType
        ? m.mealType.toLowerCase().replace('_', ' ').replace(/^./, c => c.toUpperCase())
        : `Meal ${i + 1}`,
      title: m.mealName,
      calories: Math.round(
        (m.nutrition.carbohydrates || 0) * 4 +
        (m.nutrition.protein || 0) * 4 +
        (m.nutrition.fat || 0) * 9
      ),
      protein: m.nutrition.protein || 0,
      imageUrl: m.recipe?.images?.[0] || `https://source.unsplash.com/800x600/?food&sig=${m.id}`,
    })),
  [data]);

  return meals;
};

const useHeroMeal = () => useDailyMeals(1)[0];
const useMeal = useHeroMeal;
/* ------------------------------------------------------------------------ */

export default function Dashboard() {
  // auth redirect stub
  /* const { isAuthenticated, loading } = useAuth();
  useEffect(()=>{ if (!loading && !isAuthenticated) router.push('/login'); },[loading]); */

  const { user } = useAuth();

  const meal        = useMeal();
  const [fetchRestaurants, {
    loading: restaurantsLoading,
    error: restaurantsError,
    data: restaurantsData,
  }] = useLazyQuery(FIND_NEARBY_RESTAURANTS);
  const theme       = useTheme();
  const searchTerm  = useDashStore(s => s.searchTerm);
  const { restaurants = [], source } =
    restaurantsData?.findNearbyRestaurants || {};

  // Fetch nearby restaurants based on browser geolocation
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        fetchRestaurants({
          variables: {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            radius: 1500
          }
        });
      },
      (err) => {
        console.warn('Geolocation error — falling back to Newport, TN coords:', err);
        // Newport, TN approximate coordinates
        fetchRestaurants({
          variables: {
            latitude: 35.968,
            longitude: -83.187,
            radius: 1500
          }
        });
      }
    );
  }, [fetchRestaurants]);

  // State for tabs
  const [tabValue, setTabValue] = useState(0);

  // State for optimized meal plan
  const [optimizedMealPlan, setOptimizedMealPlan] = useState(null);

  // State for selected meals
  const [selectedMeals, setSelectedMeals] = useState([]);

  // State for custom nutrition targets
  const [customNutritionTargets, setCustomNutritionTargets] = useState(null);

  // GraphQL mutation for generating optimized meal plan
  const [generateOptimizedMealPlan, { loading: optimizationLoading, error: optimizationError }] =
    useMutation(GENERATE_OPTIMIZED_MEAL_PLAN, {
      onCompleted: (data) => {
        setOptimizedMealPlan(data.generateOptimizedMealPlan);
        // Switch to the results tab
        setTabValue(2);
      },
      onError: (error) => {
        console.error('Error generating optimized meal plan:', error);
        // You could add error handling UI here
      }
    });

  // Handle generate button click
  const handleGenerateOptimizedPlan = () => {
    setOptimizedMealPlan(null); // Clear any previous results
    generateOptimizedMealPlan({
      variables: {
        selectedMealIds: selectedMeals.length > 0 ? selectedMeals : undefined,
        customNutritionTargets: customNutritionTargets
      }
    });
  };

  // Handle meal selection
  const handleMealSelection = (mealId) => {
    setSelectedMeals(prev => {
      if (prev.includes(mealId)) {
        return prev.filter(id => id !== mealId);
      } else {
        return [...prev, mealId];
      }
    });
  };

  // Handle nutrition targets change
  const handleNutritionTargetsChange = (values) => {
    setCustomNutritionTargets(values);
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const filtered = useMemo(
    () =>
      restaurants.filter((r) =>
        (r.name || '').toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [restaurants, searchTerm],
  );

  return (
    <>
      <Head><title>Fine Dining Dashboard</title></Head>
      <CssBaseline />
      <NewHeader user={user} />
      <Box
        component="main"
        sx={{
          pt:`calc(${theme.mixins.toolbar.minHeight}px + 8px)`,
          pb:'90px',
          px:2,
          display:'flex',
          flexDirection:'column',
        }}
      >
        <GreetingSegment userName={user?.name || 'Guest'} />
        <DailySummary meal={meal} />

        {/* Tabs for Meal Plan Optimization */}
        <Box sx={{ width: '100%', mt: 3 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="fullWidth"
            indicatorColor="primary"
            textColor="primary"
            aria-label="meal plan optimization tabs"
          >
            <Tab label="Meal Catalog" />
            <Tab label="Nutrition Requirements" />
            <Tab label="Results" />
          </Tabs>

          {/* Tab 1: Meal Catalog */}
          {tabValue === 0 && (
            <MealCatalog
              selectedMeals={selectedMeals}
              onSelectMeal={handleMealSelection}
            />
          )}

          {/* Tab 2: Nutrition Requirements */}
          {tabValue === 1 && (
            <NutritionRequirementsForm
              onChange={handleNutritionTargetsChange}
            />
          )}

          {/* Tab 3: Results */}
          {tabValue === 2 && (
            <>
              {optimizedMealPlan ? (
                <OptimizedMealPlanDisplay mealPlan={optimizedMealPlan} />
              ) : (
                <Box sx={{ mt: 3, textAlign: 'center' }}>
                  <Typography variant="body1" color="text.secondary" gutterBottom>
                    No optimized meal plan generated yet.
                  </Typography>
                </Box>
              )}
            </>
          )}

          {/* Generate Button */}
          <Box sx={{ mt: 3, mb: 2, display: 'flex', justifyContent: 'center' }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleGenerateOptimizedPlan}
              disabled={optimizationLoading}
              startIcon={optimizationLoading ? <CircularProgress size={20} color="inherit" /> : null}
            >
              {optimizationLoading ? 'Generating...' : 'Generate Optimized Meal Plan'}
            </Button>
          </Box>

          {/* Display optimization error if any */}
          {optimizationError && (
            <Box sx={{ mt: 2, color: 'error.main', textAlign: 'center' }}>
              Error: {optimizationError.message || 'Failed to generate meal plan'}
            </Box>
          )}
        </Box>

        <MealCard meal={meal} />

        <DiscoveryHeader />

        {source === 'overpass' && (
          <Alert severity="warning" sx={{ my: 2 }}>
            Live results retrieved from OpenStreetMap; ratings unavailable.
          </Alert>
        )}

        {restaurantsLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
            <CircularProgress />
          </Box>
        )}

        {restaurantsError && (
          <Box sx={{ my: 2, textAlign: 'center' }}>
            <Typography color="error" gutterBottom>
              Failed to load nearby restaurants.
            </Typography>
            <Button 
              variant="outlined" 
              size="small" 
              onClick={() => {
                // Retry with current location or fallback
                if (navigator.geolocation) {
                  navigator.geolocation.getCurrentPosition(
                    (pos) => {
                      fetchRestaurants({
                        variables: {
                          latitude: pos.coords.latitude,
                          longitude: pos.coords.longitude,
                          radius: 1500
                        }
                      });
                    },
                    (err) => {
                      console.warn('Geolocation error on retry — falling back to Newport, TN coords:', err);
                      // Newport, TN approximate coordinates
                      fetchRestaurants({
                        variables: {
                          latitude: 35.968,
                          longitude: -83.187,
                          radius: 1500
                        }
                      });
                    }
                  );
                } else {
                  // Fallback if geolocation is not available
                  fetchRestaurants({
                    variables: {
                      latitude: 35.968,
                      longitude: -83.187,
                      radius: 1500
                    }
                  });
                }
              }}
            >
              Retry
            </Button>
          </Box>
        )}

        {!restaurantsLoading && !restaurantsError && filtered.length === 0 && (
          <Typography variant="body2" color="text.secondary" align="center" sx={{ my: 2 }}>
            No nearby restaurants found.
          </Typography>
        )}

        {filtered.map(r => (
          <RestaurantCard key={r.placeId} restaurant={r} source={source} />
        ))}
      </Box>
      <BottomSearchRail />
      <NewNavigationDrawer />
    </>
  );
}
