/**
 * Dashboard page — orchestrates the new meal planning canvas.
 */
import { useQuery, gql } from '@apollo/client';
import { 
    Box, 
    CssBaseline, 
    useTheme, 
    CircularProgress, 
    Typography, 
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Avatar,
    Button
} from '@mui/material';
import Head from 'next/head';
import React, { useEffect, useState } from 'react';
import NewHeader from '@/components/Dashboard/NewHeader';
import NewNavigationDrawer from '@/components/Dashboard/NewNavigationDrawer';
import GreetingSegment from '@/components/Dashboard/GreetingSegment';
import DayOverview from '@/components/Dashboard/DayOverview';
import HourlyMealPlanner from '@/components/Dashboard/HourlyMealPlanner';
import DailySummary from '@/components/Dashboard/DailySummary';
import DiscoveryHeader from '@/components/Dashboard/DiscoveryHeader';
import PlannerCanvas from '@/components/PlannerCanvas/PlannerCanvas';
import { useAuth } from '@/context/AuthContext';

/* ------------------------------------------------------------------------ */

export default function Dashboard() {
    // auth redirect stub
    /* const { isAuthenticated, loading } = useAuth();
  useEffect(()=>{ if (!loading && !isAuthenticated) router.push('/login'); },[loading]); */
    const { user } = useAuth();
    const [currentUser, setCurrentUser] = useState(null);
    const [isClient, setIsClient] = useState(false);
    const [hourlyMeals, setHourlyMeals] = useState({});
    const [showMealSelector, setShowMealSelector] = useState(false);
    const [selectedHourForMeal, setSelectedHourForMeal] = useState(null);

    useEffect(() => {
        setIsClient(true);
        setCurrentUser(user);
    }, [user]);


    // const { meal, loading: mealLoading, error: mealError } = useMeal();
    const theme = useTheme();

    // Use custom hooks for restaurant and optimization management
    // const {
    //     restaurants,
    //     source,
    //     isLoading: restaurantsLoading,
    //     restaurantsError,
    //     retryRestaurants,
    //     isEmpty: restaurantsEmpty,
    // } = useRestaurants();

    // const {
    //     selectedMeals,
    //     optimizedMealPlan,
    //     tabValue,
    //     optimizationLoading,
    //     optimizationError,
    //     handleMealSelection,
    //     handleNutritionTargetsChange,
    //     handleTabChange,
    //     handleGenerateOptimizedPlan,
    //     handleAddMeals,
    // } = useMealOptimization();

    // Hourly meal management functions
    const handleAddMealToHour = (hour) => {
        setSelectedHourForMeal(hour);
        setShowMealSelector(true);
    };

    const handleRemoveMealFromHour = (hour) => {
        setHourlyMeals(prev => {
            const updated = { ...prev };
            delete updated[hour];
            return updated;
        });
    };

    const handleHourlyMealSelection = (selectedMeal) => {
        if (selectedHourForMeal !== null && selectedMeal) {
            // Convert meal data to match our hourly meal format
            const hourlyMeal = {
                title: selectedMeal.mealName || selectedMeal.title,
                calories: selectedMeal.nutrition ? 
                    Math.round(
                        (selectedMeal.nutrition.carbohydrates || 0) * 4 +
                        (selectedMeal.nutrition.protein || 0) * 4 +
                        (selectedMeal.nutrition.fat || 0) * 9
                    ) : (selectedMeal.calories || 0),
                protein: selectedMeal.nutrition?.protein || selectedMeal.protein || 0,
                imageUrl: selectedMeal.recipe?.images?.[0] || selectedMeal.imageUrl || `https://source.unsplash.com/800x600/?food&sig=${selectedMeal.id}`,
            };

            setHourlyMeals(prev => ({
                ...prev,
                [selectedHourForMeal]: hourlyMeal
            }));
        }
        setShowMealSelector(false);
        setSelectedHourForMeal(null);
    };

    const handleCloseMealSelector = () => {
        setShowMealSelector(false);
        setSelectedHourForMeal(null);
    };

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
                    px: { xs: 2, sm: 3, md: 4 },
                    maxWidth: '1200px',
                    mx: 'auto',
                    display:'flex',
                    flexDirection:'column',
                    gap: { xs: 2, sm: 3 }
                }}
            >
                {/* Greeting Section */}
                <GreetingSegment userName={(isClient && currentUser?.name) || 'Guest'} />

                {/* Featured Meal Overview */}
                <DayOverview 
                    meal={{
                        title: "Grilled Salmon with Quinoa",
                        description: "A nutritious and delicious meal packed with omega-3 fatty acids and complete proteins.",
                        imageUrl: "https://source.unsplash.com/800x600/?salmon,quinoa,healthy"
                    }}
                />

                {/* Daily Summary */}
                <DailySummary />

                {/* Hourly Meal Planner */}
                <HourlyMealPlanner 
                    meals={hourlyMeals}
                    onAddMeal={handleAddMealToHour}
                    onRemoveMeal={handleRemoveMealFromHour}
                />

                {/* Discovery Section */}
                <DiscoveryHeader />

                {/* Placeholder for restaurant cards or additional content */}
                <Box sx={{ 
                    textAlign: 'center', 
                    py: 4, 
                    color: 'text.secondary',
                    borderRadius: 2,
                    bgcolor: 'background.paper',
                    border: '1px dashed',
                    borderColor: 'divider'
                }}>
                    <Typography variant="body2">
                        Restaurant discovery and additional features coming soon...
                    </Typography>
                </Box>

                {/* {source === 'overpass' && (
                    <Alert severity="warning" sx={{ my: 2 }}>
            Live results retrieved from OpenStreetMap; ratings unavailable.
                    </Alert>
                )} */}

                {/* {restaurantsLoading && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                        <CircularProgress />
                    </Box>
                )} */}

                {/* {restaurantsError && (
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
                )} */}

                {/* {restaurantsEmpty && (
                    <Typography variant="body2" color="text.secondary" align="center" sx={{ my: 2 }}>
            No nearby restaurants found.
                    </Typography>
                )} */}

                {/* {restaurants.map(r => (
                    <RestaurantCard key={r.placeId} restaurant={r} source={source} />
                ))} */}
            </Box>
            {/* <BottomSearchRail /> */}
            <NewNavigationDrawer />

            {/* Meal Selection Dialog */}
            <Dialog 
                open={showMealSelector} 
                onClose={handleCloseMealSelector}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    Select a Meal for {selectedHourForMeal !== null ? `${selectedHourForMeal}:00` : ''}
                </DialogTitle>
                <DialogContent>
                    {false ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                            <CircularProgress />
                        </Box>
                    ) : false ? (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            Error loading meals: Unknown error
                        </Alert>
                    ) : (
                        <List>
                            {/* Sample meals - in a real app, you'd fetch from your meal catalog */}
                            {[
                                {
                                    id: 1,
                                    mealName: 'Grilled Chicken Salad',
                                    nutrition: { protein: 35, carbohydrates: 15, fat: 8 },
                                    recipe: { images: ['https://source.unsplash.com/400x300/?chicken,salad'] }
                                },
                                {
                                    id: 2,
                                    mealName: 'Salmon with Quinoa',
                                    nutrition: { protein: 40, carbohydrates: 30, fat: 12 },
                                    recipe: { images: ['https://source.unsplash.com/400x300/?salmon,quinoa'] }
                                },
                                {
                                    id: 3,
                                    mealName: 'Vegetable Stir Fry',
                                    nutrition: { protein: 12, carbohydrates: 25, fat: 6 },
                                    recipe: { images: ['https://source.unsplash.com/400x300/?vegetables,stirfry'] }
                                },
                                {
                                    id: 4,
                                    mealName: 'Greek Yogurt with Berries',
                                    nutrition: { protein: 20, carbohydrates: 18, fat: 4 },
                                    recipe: { images: ['https://source.unsplash.com/400x300/?yogurt,berries'] }
                                },
                                {
                                    id: 5,
                                    mealName: 'Turkey Sandwich',
                                    nutrition: { protein: 25, carbohydrates: 35, fat: 10 },
                                    recipe: { images: ['https://source.unsplash.com/400x300/?turkey,sandwich'] }
                                }
                            ].map((meal) => (
                                <ListItem 
                                    key={meal.id}
                                    button
                                    onClick={() => handleHourlyMealSelection(meal)}
                                    sx={{ 
                                        borderRadius: 1, 
                                        mb: 1,
                                        '&:hover': {
                                            backgroundColor: 'action.hover'
                                        }
                                    }}
                                >
                                    <ListItemAvatar>
                                        <Avatar 
                                            src={meal.recipe?.images?.[0]}
                                            alt={meal.mealName}
                                            sx={{ width: 56, height: 56 }}
                                        />
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={meal.mealName}
                                        secondary={`${Math.round(
                                            (meal.nutrition.carbohydrates || 0) * 4 +
                                            (meal.nutrition.protein || 0) * 4 +
                                            (meal.nutrition.fat || 0) * 9
                                        )} cal • ${meal.nutrition.protein}g protein`}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseMealSelector}>Cancel</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
