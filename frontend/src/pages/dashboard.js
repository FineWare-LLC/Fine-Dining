/**
 * Dashboard page — orchestrates all dashboard atoms.
 */
import React, { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import { Box, Button, CssBaseline, useTheme, CircularProgress, Typography, Tabs, Tab, Alert } from '@mui/material';
import { useQuery, gql } from '@apollo/client';
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
import { useAuth } from '@/context/AuthContext';
import useRestaurants from '@/hooks/useRestaurants';
import useMealOptimization from '@/hooks/useMealOptimization';

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
  const { data, loading, error } = useQuery(GET_MEALS, {
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

  return { meals, loading, error };
};

const useHeroMeal = () => {
  const { meals, loading, error } = useDailyMeals(1);
  return { meal: meals[0], loading, error };
};
const useMeal = useHeroMeal;
/* ------------------------------------------------------------------------ */

export default function Dashboard() {
  // auth redirect stub
  /* const { isAuthenticated, loading } = useAuth();
  useEffect(()=>{ if (!loading && !isAuthenticated) router.push('/login'); },[loading]); */
  const { user } = useAuth();
  const [currentUser, setCurrentUser] = useState(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setCurrentUser(user);
  }, [user]);


  const { meal, loading: mealLoading, error: mealError } = useMeal();
  const theme = useTheme();

  // Use custom hooks for restaurant and optimization management
  const {
    restaurants,
    source,
    isLoading: restaurantsLoading,
    restaurantsError,
    retryRestaurants,
    isEmpty: restaurantsEmpty,
  } = useRestaurants();

  const {
    selectedMeals,
    optimizedMealPlan,
    tabValue,
    optimizationLoading,
    optimizationError,
    handleMealSelection,
    handleNutritionTargetsChange,
    handleTabChange,
    handleGenerateOptimizedPlan,
    handleAddMeals,
  } = useMealOptimization();

  return (
    <>
      <Head><title>Fine Dining Dashboard</title></Head>
      <CssBaseline />
      <NewHeader user={isClient ? currentUser : null} />
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
        <GreetingSegment userName={(isClient && currentUser?.name) || 'Guest'} />

        {/* Meal Loading Error */}
        {mealError && (
          <Box sx={{ my: 2, textAlign: 'center' }}>
            <Alert severity="error" sx={{ mb: 2 }}>
              Error loading meals: {mealError.message || 'Internal server error.'}
            </Alert>
          </Box>
        )}

        {/* Meal Loading Indicator */}
        {mealLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
            <CircularProgress />
            <Typography variant="body2" sx={{ ml: 2, alignSelf: 'center' }}>
              Loading meals...
            </Typography>
          </Box>
        )}

        {/* Daily Summary - only show if meal is loaded and no error */}
        {!mealLoading && !mealError && (
          <DailySummary meals={meal ? [meal] : []} />
        )}

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
              onAddMeals={handleAddMeals}
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

        {/* Meal Card - only show if meal is loaded and no error */}
        {!mealLoading && !mealError && meal && (
          <MealCard meal={meal} />
        )}

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
              onClick={retryRestaurants}
            >
              Retry
            </Button>
          </Box>
        )}

        {restaurantsEmpty && (
          <Typography variant="body2" color="text.secondary" align="center" sx={{ my: 2 }}>
            No nearby restaurants found.
          </Typography>
        )}

        {restaurants.map(r => (
          <RestaurantCard key={r.placeId} restaurant={r} source={source} />
        ))}
      </Box>
      <BottomSearchRail />
      <NewNavigationDrawer />
    </>
  );
}
