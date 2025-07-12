/**
 * Dashboard page — orchestrates all dashboard atoms.
 */
import { useQuery, gql } from '@apollo/client';
import { Box, CssBaseline, useTheme, CircularProgress, Typography, Alert, Button } from '@mui/material';
import Head from 'next/head';
import React, { useEffect, useMemo, useState } from 'react';
import BottomSearchRail from '@/components/Dashboard/BottomSearchRail.js';
import DailySummary from '@/components/Dashboard/DailySummary';
import DiscoveryHeader from '@/components/Dashboard/DiscoveryHeader';
import GreetingSegment from '@/components/Dashboard/GreetingSegment';
import MealCard from '@/components/Dashboard/MealCard';
import MealPlanOptimizer from '@/components/Dashboard/MealPlanOptimizer';
import NewHeader from '@/components/Dashboard/NewHeader';
import NewNavigationDrawer from '@/components/Dashboard/NewNavigationDrawer';
import RestaurantCard from '@/components/Dashboard/RestaurantCard';
import { useAuth } from '@/context/AuthContext';
import useMealOptimization from '@/hooks/useMealOptimization';
import useRestaurants from '@/hooks/useRestaurants';

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
        (m.nutrition.fat || 0) * 9,
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

                {/* Meal Plan Optimization */}
                <MealPlanOptimizer
                    selectedMeals={selectedMeals}
                    optimizedMealPlan={optimizedMealPlan}
                    tabValue={tabValue}
                    optimizationLoading={optimizationLoading}
                    optimizationError={optimizationError}
                    onMealSelection={handleMealSelection}
                    onNutritionTargetsChange={handleNutritionTargetsChange}
                    onTabChange={handleTabChange}
                    onGenerateOptimizedPlan={handleGenerateOptimizedPlan}
                    onAddMeals={handleAddMeals}
                />

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
