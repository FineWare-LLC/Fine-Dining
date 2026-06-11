/**
 * @file PersonalizedMealPlan.js
 * @description Component to display and manage personalized meal plans with swap functionality
 */

import React, { useState, useEffect } from 'react';
import { useApolloClient } from '@apollo/client/react';
import {
    Box,
    Card,
    CardContent,
    CardMedia,
    Typography,
    Button,
    Chip,
    Grid,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Avatar,
    CircularProgress,
    Alert,
    LinearProgress,
    Tooltip,
    useTheme,
    alpha,
} from '@mui/material';
import {
    SwapHoriz as SwapIcon,
    Restaurant as RestaurantIcon,
    LocalOffer as PriceIcon,
    Timer as TimerIcon,
    Refresh as RefreshIcon,
    CheckCircle as CheckIcon,
    TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { useAuth } from '@/context/AuthContext';
import { generatePersonalizedMealPlan, findSimilarMeals } from '@/services/mealPlanGenerator';

export default function PersonalizedMealPlan() {
    const theme = useTheme();
    const apolloClient = useApolloClient();
    const { user } = useAuth();
    
    // State management
    const [mealPlan, setMealPlan] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [swapDialogOpen, setSwapDialogOpen] = useState(false);
    const [currentMealForSwap, setCurrentMealForSwap] = useState(null);
    const [similarMeals, setSimilarMeals] = useState([]);
    const [loadingSimilarMeals, setLoadingSimilarMeals] = useState(false);

    // Generate meal plan on component mount
    useEffect(() => {
        if (user?.id) {
            generateMealPlan();
        }
    }, [user]);

    const generateMealPlan = async () => {
        if (!user?.id) return;
        
        setLoading(true);
        setError(null);
        
        try {
            const result = await generatePersonalizedMealPlan(apolloClient, user.id);
            setMealPlan(result);
        } catch (err) {
            setError(err.message || 'Failed to generate meal plan');
            console.error('Error generating meal plan:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSwapMeal = async (meal) => {
        setCurrentMealForSwap(meal);
        setSwapDialogOpen(true);
        setLoadingSimilarMeals(true);
        
        try {
            const similar = await findSimilarMeals(apolloClient, meal.meal, user.id, 5);
            setSimilarMeals(similar);
        } catch (err) {
            console.error('Error finding similar meals:', err);
            setSimilarMeals([]);
        } finally {
            setLoadingSimilarMeals(false);
        }
    };

    const confirmSwapMeal = (newMeal) => {
        if (!currentMealForSwap) return;
        
        // Update meal plan with new meal
        setMealPlan(prevPlan => ({
            ...prevPlan,
            mealPlan: prevPlan.mealPlan.map(meal => 
                meal.mealName === currentMealForSwap.mealName 
                    ? {
                        ...meal,
                        meal: newMeal,
                        mealName: newMeal.mealName,
                        mealType: newMeal.mealType,
                        price: newMeal.price,
                        recipe: newMeal.recipe,
                        restaurant: newMeal.restaurant,
                        // Recalculate nutrition based on servings
                        totalCalories: (newMeal.nutrition?.calories || 0) * meal.servings,
                        totalProtein: (newMeal.nutrition?.protein || 0) * meal.servings,
                        totalCarbs: (newMeal.nutrition?.carbohydrates || 0) * meal.servings,
                        totalSodium: (newMeal.nutrition?.sodium || 0) * meal.servings,
                    }
                    : meal
            )
        }));
        
        setSwapDialogOpen(false);
        setCurrentMealForSwap(null);
        setSimilarMeals([]);
    };

    const getNutritionProgress = (current, target) => {
        if (!target || target === 0) return 0;
        return Math.min((current / target) * 100, 100);
    };

    const formatNutritionValue = (value, unit = 'g') => {
        return `${Math.round(value || 0)}${unit}`;
    };

    if (loading) {
        return (
            <Card sx={{ p: 4, textAlign: 'center' }}>
                <CircularProgress size={48} />
                <Typography variant="h6" sx={{ mt: 2 }}>
                    Generating your personalized meal plan...
                </Typography>
                <Typography variant="body2" color="textSecondary">
                    Using AI optimization to match your dietary preferences
                </Typography>
            </Card>
        );
    }

    if (error) {
        return (
            <Card sx={{ p: 3 }}>
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
                <Button
                    variant="contained"
                    startIcon={<RefreshIcon />}
                    onClick={generateMealPlan}
                    fullWidth
                >
                    Try Again
                </Button>
            </Card>
        );
    }

    if (!mealPlan) {
        return (
            <Card sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h6" gutterBottom>
                    Ready to create your personalized meal plan?
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                    We'll use your dietary preferences to optimize your meals
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<TrendingUpIcon />}
                    onClick={generateMealPlan}
                    size="large"
                >
                    Generate Meal Plan
                </Button>
            </Card>
        );
    }

    const { mealPlan: meals, totalNutrition, constraints, user: userInfo } = mealPlan;

    return (
        <Box>
            {/* Header */}
            <Box sx={{ mb: 3 }}>
                <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckIcon color="success" />
                    Your Personalized Meal Plan
                </Typography>
                <Typography variant="body2" color="textSecondary">
                    Optimized for {userInfo.name} • {userInfo.dietaryPattern ? `${userInfo.dietaryPattern.toLowerCase()} diet` : 'Custom preferences'}
                    {userInfo.allergies.length > 0 && ` • Allergen-free: ${userInfo.allergies.join(', ')}`}
                </Typography>
                <Button
                    size="small"
                    startIcon={<RefreshIcon />}
                    onClick={generateMealPlan}
                    sx={{ mt: 1 }}
                >
                    Generate New Plan
                </Button>
            </Box>

            {/* Nutrition Summary */}
            <Card sx={{ mb: 3, background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)` }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Daily Nutrition Summary
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={6} sm={3}>
                            <Box>
                                <Typography variant="body2" color="textSecondary">Calories</Typography>
                                <Typography variant="h6" color="primary">
                                    {formatNutritionValue(totalNutrition.calories, ' kcal')}
                                </Typography>
                                <LinearProgress 
                                    variant="determinate" 
                                    value={getNutritionProgress(totalNutrition.calories, constraints.calories.max)}
                                    sx={{ mt: 0.5, height: 4, borderRadius: 2 }}
                                />
                            </Box>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                            <Box>
                                <Typography variant="body2" color="textSecondary">Protein</Typography>
                                <Typography variant="h6" color="primary">
                                    {formatNutritionValue(totalNutrition.protein)}
                                </Typography>
                                <LinearProgress 
                                    variant="determinate" 
                                    value={getNutritionProgress(totalNutrition.protein, constraints.protein.max)}
                                    color="secondary"
                                    sx={{ mt: 0.5, height: 4, borderRadius: 2 }}
                                />
                            </Box>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                            <Box>
                                <Typography variant="body2" color="textSecondary">Carbs</Typography>
                                <Typography variant="h6" color="primary">
                                    {formatNutritionValue(totalNutrition.carbohydrates)}
                                </Typography>
                                <LinearProgress 
                                    variant="determinate" 
                                    value={getNutritionProgress(totalNutrition.carbohydrates, constraints.carbohydrates.max)}
                                    color="info"
                                    sx={{ mt: 0.5, height: 4, borderRadius: 2 }}
                                />
                            </Box>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                            <Box>
                                <Typography variant="body2" color="textSecondary">Sodium</Typography>
                                <Typography variant="h6" color="primary">
                                    {formatNutritionValue(totalNutrition.sodium, ' mg')}
                                </Typography>
                                <LinearProgress 
                                    variant="determinate" 
                                    value={getNutritionProgress(totalNutrition.sodium, constraints.sodium.max)}
                                    color="warning"
                                    sx={{ mt: 0.5, height: 4, borderRadius: 2 }}
                                />
                            </Box>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* Meal Cards */}
            <Grid container spacing={2}>
                {meals.map((meal, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                        <Card 
                            sx={{ 
                                height: '100%', 
                                display: 'flex', 
                                flexDirection: 'column',
                                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: theme.shadows[8],
                                }
                            }}
                        >
                            <CardMedia
                                component="img"
                                height="200"
                                image={meal.meal?.recipe?.images?.[0] || `https://source.unsplash.com/400x200/?food,${encodeURIComponent(meal.mealName)}`}
                                alt={meal.mealName}
                                sx={{ objectFit: 'cover' }}
                            />
                            <CardContent sx={{ flexGrow: 1, position: 'relative' }}>
                                {/* Swap Button */}
                                <Tooltip title="Swap for similar meal">
                                    <IconButton
                                        onClick={() => handleSwapMeal(meal)}
                                        sx={{
                                            position: 'absolute',
                                            top: 8,
                                            right: 8,
                                            backgroundColor: alpha(theme.palette.background.paper, 0.9),
                                            '&:hover': {
                                                backgroundColor: theme.palette.background.paper,
                                                color: theme.palette.primary.main,
                                            }
                                        }}
                                        size="small"
                                    >
                                        <SwapIcon />
                                    </IconButton>
                                </Tooltip>

                                <Typography variant="h6" gutterBottom>
                                    {meal.mealName}
                                </Typography>

                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                    {meal.restaurant && (
                                        <Chip
                                            icon={<RestaurantIcon />}
                                            label={meal.restaurant.restaurantName}
                                            size="small"
                                            variant="outlined"
                                            sx={{ mr: 1 }}
                                        />
                                    )}
                                    {meal.mealType && (
                                        <Chip
                                            label={meal.mealType.toLowerCase()}
                                            size="small"
                                            color="primary"
                                            variant="outlined"
                                        />
                                    )}
                                </Box>

                                <Typography variant="body2" color="textSecondary" gutterBottom>
                                    Servings: {meal.servings} • {formatNutritionValue(meal.totalCalories, ' kcal')}
                                </Typography>

                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                                    <Typography variant="caption" color="textSecondary">
                                        Protein: {formatNutritionValue(meal.totalProtein)}
                                    </Typography>
                                    <Typography variant="caption" color="textSecondary">
                                        Carbs: {formatNutritionValue(meal.totalCarbs)}
                                    </Typography>
                                </Box>

                                {meal.recipe?.tags && meal.recipe.tags.length > 0 && (
                                    <Box sx={{ mt: 2 }}>
                                        {meal.recipe.tags.slice(0, 3).map((tag, tagIndex) => (
                                            <Chip
                                                key={tagIndex}
                                                label={tag}
                                                size="small"
                                                sx={{ mr: 0.5, mb: 0.5 }}
                                            />
                                        ))}
                                    </Box>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Swap Dialog */}
            <Dialog 
                open={swapDialogOpen} 
                onClose={() => setSwapDialogOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    Swap "{currentMealForSwap?.mealName}" for a similar meal
                </DialogTitle>
                <DialogContent>
                    {loadingSimilarMeals ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                            <CircularProgress />
                        </Box>
                    ) : similarMeals.length > 0 ? (
                        <List>
                            {similarMeals.map((meal) => (
                                <ListItem
                                    key={meal.id}
                                    button
                                    onClick={() => confirmSwapMeal(meal)}
                                    sx={{
                                        border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
                                        borderRadius: 2,
                                        mb: 1,
                                        '&:hover': {
                                            backgroundColor: alpha(theme.palette.primary.main, 0.04),
                                        }
                                    }}
                                >
                                    <ListItemAvatar>
                                        <Avatar
                                            src={meal.recipe?.images?.[0] || `https://source.unsplash.com/100x100/?food,${encodeURIComponent(meal.mealName)}`}
                                            alt={meal.mealName}
                                        />
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={meal.mealName}
                                        secondary={
                                            <Box>
                                                <Typography variant="body2">
                                                    {formatNutritionValue(meal.nutrition?.calories, ' kcal')} • 
                                                    {formatNutritionValue(meal.nutrition?.protein)} protein • 
                                                    {formatNutritionValue(meal.nutrition?.carbohydrates)} carbs
                                                </Typography>
                                                {meal.restaurant && (
                                                    <Typography variant="caption" color="textSecondary">
                                                        from {meal.restaurant.restaurantName}
                                                    </Typography>
                                                )}
                                            </Box>
                                        }
                                    />
                                    {meal.price && (
                                        <Chip
                                            icon={<PriceIcon />}
                                            label={`$${meal.price.toFixed(2)}`}
                                            size="small"
                                            variant="outlined"
                                        />
                                    )}
                                </ListItem>
                            ))}
                        </List>
                    ) : (
                        <Alert severity="info">
                            No similar meals found that match your dietary preferences.
                        </Alert>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setSwapDialogOpen(false)}>
                        Cancel
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}