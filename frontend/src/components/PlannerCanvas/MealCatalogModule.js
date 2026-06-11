/**
 * MealCatalogModule.js
 * 
 * Meal Catalog component implementing the blueprint specifications:
 * - Card gallery with edge-to-edge imagery and generous whitespace
 * - Fit Chip indicators showing how meals match current targets
 * - Faceted filters and smart search with autosuggest
 * - Infinite scroll with skeleton loading
 * - Quick View overlay with detailed nutrition info
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery } from '@apollo/client/react';
import { gql } from '@apollo/client';
import {
    Box,
    Card,
    CardMedia,
    CardContent,
    Typography,
    Chip,
    TextField,
    InputAdornment,
    IconButton,
    Button,
    Drawer,
    Stack,
    Slider,
    FormControlLabel,
    Checkbox,
    Autocomplete,
    CircularProgress,
    Skeleton,
    Dialog,
    DialogContent,
    DialogTitle,
    DialogActions,
    Grid,
    Divider,
    Tooltip,
    Fab,
    useTheme,
    alpha,
} from '@mui/material';
import {
    Search as SearchIcon,
    FilterList as FilterIcon,
    Add as AddIcon,
    Info as InfoIcon,
    KeyboardArrowUp as ArrowUpIcon,
    Close as CloseIcon,
    Verified as VerifiedIcon,
    Restaurant as RestaurantIcon,
    Home as HomeIcon,
} from '@mui/icons-material';
import { FixedSizeList as List } from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';

import { usePlannerStore } from './store/plannerStore';

// GraphQL queries

const GET_MEALS_WITH_FILTERS = gql`
    query GetMealsWithFilters(
        $page: Int!
        $limit: Int!
        $search: String
        $diets: [String]
        $caloriesMin: Int
        $caloriesMax: Int
        $proteinMin: Int
        $proteinMax: Int
        $prepTimeMax: Int
        $cuisines: [String]
        $allergenExclusions: [String]
    ) {
        getMealsWithFilters(
            page: $page
            limit: $limit
            search: $search
            diets: $diets
            caloriesMin: $caloriesMin
            caloriesMax: $caloriesMax
            proteinMin: $proteinMin
            proteinMax: $proteinMax
            prepTimeMax: $prepTimeMax
            cuisines: $cuisines
            allergenExclusions: $allergenExclusions
        ) {
            meals {
                id
                mealName
                mealType
                prepTime
                activeTime
                difficulty
                cuisine
                price
                rating
                nutrition {
                    calories
                    protein
                    carbohydrates
                    fat
                    sodium
                    fiber
                    sugar
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

const GET_SEARCH_SUGGESTIONS = gql`
    query GetSearchSuggestions($query: String!) {
        getSearchSuggestions(query: $query) {
            meals
            ingredients
            cuisines
            tags
        }
    }
`;

const calculateFitScore = (meal, nutritionTargets) => {
    if (!meal.nutrition || !nutritionTargets) return 'unknown';
    
    const { nutrition } = meal;
    const scores = [];
    
    ['calories', 'protein', 'carbohydrates', 'fat', 'sodium'].forEach(nutrient => {
        const target = nutritionTargets[nutrient];
        const value = nutrition[nutrient];
        
        if (target && value !== undefined) {
            if (value >= target.min && value <= target.max) {
                scores.push(1); 
            } else if (value >= target.min * 0.8 && value <= target.max * 1.2) {
                scores.push(0.7); 
            } else if (value >= target.min * 0.6 && value <= target.max * 1.4) {
                scores.push(0.4); 
            } else {
                scores.push(0); 
            }
        }
    });
    
    if (scores.length === 0) return 'unknown';
    
    const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    
    if (avgScore >= 0.9) return 'perfect';
    if (avgScore >= 0.7) return 'good';
    if (avgScore >= 0.4) return 'adjustment';
    return 'conflict';
};

const getFitChipProps = (fitScore) => {
    switch (fitScore) {
        case 'perfect':
            return { label: 'Perfect Fit', color: 'success', variant: 'filled' };
        case 'good':
            return { label: 'Good Fit', color: 'primary', variant: 'filled' };
        case 'adjustment':
            return { label: 'Needs Adjustment', color: 'warning', variant: 'outlined' };
        case 'conflict':
            return { label: 'Conflicts', color: 'error', variant: 'outlined' };
        default:
            return { label: 'Unknown', color: 'default', variant: 'outlined' };
    }
};

const MealCard = ({ meal, onQuickView, onAddMeal }) => {
    const theme = useTheme();
    const { nutritionTargets } = usePlannerStore();
    
    const fitScore = calculateFitScore(meal, nutritionTargets);
    const fitChipProps = getFitChipProps(fitScore);
    
    const imageUrl = meal.recipe?.images?.[0] || `https://source.unsplash.com/400x300/?food,${meal.cuisine}&sig=${meal.id}`;
    
    return (
        <Card
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 3,
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[8],
                },
            }}
            onClick={() => onQuickView(meal)}
        >
            <Box sx={{ position: 'relative' }}>
                <CardMedia
                    component="img"
                    height="200"
                    image={imageUrl}
                    alt={meal.mealName}
                    sx={{ objectFit: 'cover' }}
                />
                
                <Chip
                    {...fitChipProps}
                    size="small"
                    sx={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        fontWeight: 600,
                        fontSize: '0.75rem',
                    }}
                />
                
                {meal.verified && (
                    <Tooltip title="USDA Verified">
                        <VerifiedIcon
                            sx={{
                                position: 'absolute',
                                top: 12,
                                left: 12,
                                color: theme.palette.primary.main,
                                backgroundColor: 'white',
                                borderRadius: '50%',
                                fontSize: 20,
                            }}
                        />
                    </Tooltip>
                )}
                
                <IconButton
                    onClick={(e) => {
                        e.stopPropagation();
                        onAddMeal(meal);
                    }}
                    sx={{
                        position: 'absolute',
                        bottom: 8,
                        right: 8,
                        backgroundColor: alpha(theme.palette.primary.main, 0.9),
                        color: 'white',
                        '&:hover': {
                            backgroundColor: theme.palette.primary.main,
                            transform: 'scale(1.1)',
                        },
                    }}
                    size="small"
                >
                    <AddIcon />
                </IconButton>
            </Box>
            
            <CardContent sx={{ flex: 1, p: 2 }}>
                <Typography variant="h6" component="h3" gutterBottom noWrap>
                    {meal.mealName}
                </Typography>
                
                <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                    <Chip
                        label={`${meal.nutrition?.calories || 0} cal`}
                        size="small"
                        variant="outlined"
                    />
                    <Chip
                        label={`${meal.nutrition?.protein || 0}g protein`}
                        size="small"
                        variant="outlined"
                    />
                    {meal.prepTime && (
                        <Chip
                            label={`${meal.prepTime}min`}
                            size="small"
                            variant="outlined"
                        />
                    )}
                    <Chip
                        icon={meal.restaurant ? <RestaurantIcon /> : <HomeIcon />}
                        label={meal.restaurant ? 'Restaurant' : 'Home'}
                        size="small"
                        variant="filled"
                        sx={{
                            backgroundColor: meal.restaurant 
                                ? alpha(theme.palette.warning.main, 0.2)
                                : alpha(theme.palette.success.main, 0.2),
                            color: meal.restaurant 
                                ? theme.palette.warning.main
                                : theme.palette.success.main,
                            '& .MuiChip-icon': {
                                color: 'inherit',
                            },
                        }}
                    />
                </Stack>
                
                <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
                    {meal.dietaryTags?.slice(0, 3).map((tag) => (
                        <Chip
                            key={tag}
                            label={tag}
                            size="small"
                            sx={{
                                fontSize: '0.7rem',
                                height: 20,
                                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                color: theme.palette.primary.main,
                            }}
                        />
                    ))}
                </Stack>
            </CardContent>
        </Card>
    );
};

const QuickViewDialog = ({ meal, open, onClose, onAddMeal }) => {
    const theme = useTheme();
    
    if (!meal) return null;
    
    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: { borderRadius: 3 }
            }}
        >
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5">{meal.mealName}</Typography>
                <IconButton onClick={onClose} size="small">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            
            <DialogContent>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <Box
                            component="img"
                            src={meal.recipe?.images?.[0] || `https://source.unsplash.com/400x300/?food,${meal.cuisine}&sig=${meal.id}`}
                            alt={meal.mealName}
                            sx={{
                                width: '100%',
                                height: 250,
                                objectFit: 'cover',
                                borderRadius: 2,
                            }}
                        />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                        <Stack spacing={2}>
                            <Box>
                                <Typography variant="body2" color="text.secondary">
                                    {meal.cuisine} • {meal.prepTime}min prep • {meal.difficulty}
                                </Typography>
                                {meal.restaurant && (
                                    <Typography variant="body2" color="text.secondary">
                                        From {meal.restaurant.restaurantName}
                                    </Typography>
                                )}
                            </Box>
                            
                            <Box>
                                <Typography variant="h6" gutterBottom>Nutrition Facts</Typography>
                                <Grid container spacing={1}>
                                    {Object.entries(meal.nutrition || {}).map(([nutrient, value]) => (
                                        <Grid item xs={6} key={nutrient}>
                                            <Typography variant="body2">
                                                <strong>{nutrient.charAt(0).toUpperCase() + nutrient.slice(1)}:</strong> {value}
                                                {nutrient === 'calories' ? '' : 'g'}
                                            </Typography>
                                        </Grid>
                                    ))}
                                </Grid>
                            </Box>
                            
                            {meal.allergens?.length > 0 && (
                                <Box>
                                    <Typography variant="h6" gutterBottom>Allergens</Typography>
                                    <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
                                        {meal.allergens.map((allergen) => (
                                            <Chip
                                                key={allergen}
                                                label={allergen}
                                                size="small"
                                                color="warning"
                                                variant="outlined"
                                            />
                                        ))}
                                    </Stack>
                                </Box>
                            )}
                            
                            {meal.recipe?.ingredients && (
                                <Box>
                                    <Typography variant="h6" gutterBottom>Ingredients</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {meal.recipe.ingredients.map(ing => ing.name).join(', ')}
                                    </Typography>
                                </Box>
                            )}
                            
                            {meal.recipe?.instructions && !meal.restaurant && (
                                <Box>
                                    <Typography variant="h6" gutterBottom>Cooking Instructions</Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
                                        {meal.recipe.instructions}
                                    </Typography>
                                </Box>
                            )}
                        </Stack>
                    </Grid>
                </Grid>
            </DialogContent>
            
            <DialogActions sx={{ p: 3 }}>
                <Button onClick={onClose}>Close</Button>
                <Button
                    variant="contained"
                    onClick={() => {
                        onAddMeal(meal);
                        onClose();
                    }}
                    startIcon={<AddIcon />}
                >
                    Add to Plan
                </Button>
            </DialogActions>
        </Dialog>
    );
};

const MealCatalogModule = () => {
    const theme = useTheme();
    const { nutritionTargets, addMealToPlan } = usePlannerStore();
    
    const [searchTerm, setSearchTerm] = useState('');
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [quickViewMeal, setQuickViewMeal] = useState(null);
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [page, setPage] = useState(1);
    const [allMeals, setAllMeals] = useState([]);
    
    const [filters, setFilters] = useState({
        diets: [],
        caloriesRange: [0, 1000],
        proteinRange: [0, 100],
        prepTimeMax: 120,
        cuisines: [],
        allergenExclusions: [],
    });
    
    const { data, loading, error, fetchMore } = useQuery(GET_MEALS_WITH_FILTERS, {
        variables: {
            page: 1,
            limit: 20,
            search: searchTerm || undefined,
            diets: filters.diets.length ? filters.diets : undefined,
            caloriesMin: filters.caloriesRange[0],
            caloriesMax: filters.caloriesRange[1],
            proteinMin: filters.proteinRange[0],
            proteinMax: filters.proteinRange[1],
            prepTimeMax: filters.prepTimeMax,
            cuisines: filters.cuisines.length ? filters.cuisines : undefined,
            allergenExclusions: filters.allergenExclusions.length ? filters.allergenExclusions : undefined,
        },
        fetchPolicy: 'cache-and-network',
        onCompleted: (data) => {
            if (data?.getMealsWithFilters?.meals) {
                setAllMeals(data.getMealsWithFilters.meals);
            }
        },
    });
    
    const { data: suggestionsData } = useQuery(GET_SEARCH_SUGGESTIONS, {
        variables: { query: searchTerm },
        skip: !searchTerm || searchTerm.length < 2,
    });
    
    const handleAddMeal = useCallback((meal) => {
        const hour = new Date().getHours();
        let mealType = 'snacks';
        if (hour >= 6 && hour < 11) mealType = 'breakfast';
        else if (hour >= 11 && hour < 16) mealType = 'lunch';
        else if (hour >= 16 && hour < 22) mealType = 'dinner';
        
        addMealToPlan(meal, mealType, 1);
    }, [addMealToPlan]);
    
    const handleLoadMore = useCallback(() => {
        if (data?.getMealsWithFilters?.hasNextPage && !loading) {
            fetchMore({
                variables: { page: page + 1 },
                updateQuery: (prev, { fetchMoreResult }) => {
                    if (!fetchMoreResult) return prev;
                    
                    const newMeals = [...allMeals, ...fetchMoreResult.getMealsWithFilters.meals];
                    setAllMeals(newMeals);
                    setPage(page + 1);
                    
                    return {
                        getMealsWithFilters: {
                            ...fetchMoreResult.getMealsWithFilters,
                            meals: newMeals,
                        },
                    };
                },
            });
        }
    }, [data, loading, fetchMore, page, allMeals]);
    
    const filteredMeals = useMemo(() => {
        if (!allMeals) return [];
        
        return allMeals.filter(meal => {
            const fitScore = calculateFitScore(meal, nutritionTargets);
            return fitScore !== 'conflict';
        });
    }, [allMeals, nutritionTargets]);
    
    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
                <Stack spacing={2}>
                    <TextField
                        fullWidth
                        placeholder="Search meals, ingredients, or cuisines..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton onClick={() => setFiltersOpen(true)}>
                                        <FilterIcon />
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                    />
                    
                    {(filters.diets.length > 0 || filters.cuisines.length > 0) && (
                        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                            {filters.diets.map((diet) => (
                                <Chip
                                    key={diet}
                                    label={diet}
                                    size="small"
                                    onDelete={() => setFilters(prev => ({
                                        ...prev,
                                        diets: prev.diets.filter(d => d !== diet)
                                    }))}
                                />
                            ))}
                            {filters.cuisines.map((cuisine) => (
                                <Chip
                                    key={cuisine}
                                    label={cuisine}
                                    size="small"
                                    onDelete={() => setFilters(prev => ({
                                        ...prev,
                                        cuisines: prev.cuisines.filter(c => c !== cuisine)
                                    }))}
                                />
                            ))}
                        </Stack>
                    )}
                </Stack>
            </Box>
            
            <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
                {loading && allMeals.length === 0 ? (
                    <Grid container spacing={2}>
                        {Array.from({ length: 8 }).map((_, index) => (
                            <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                                <Card sx={{ height: 320 }}>
                                    <Skeleton variant="rectangular" height={200} />
                                    <CardContent>
                                        <Skeleton variant="text" height={32} />
                                        <Skeleton variant="text" height={24} />
                                        <Skeleton variant="text" height={20} />
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                ) : (
                    <Grid container spacing={2}>
                        {filteredMeals.map((meal) => (
                            <Grid item xs={12} sm={6} md={4} lg={3} key={meal.id}>
                                <MealCard
                                    meal={meal}
                                    onQuickView={setQuickViewMeal}
                                    onAddMeal={handleAddMeal}
                                />
                            </Grid>
                        ))}
                        
                        {data?.getMealsWithFilters?.hasNextPage && (
                            <Grid item xs={12}>
                                <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                                    <Button
                                        onClick={handleLoadMore}
                                        disabled={loading}
                                        startIcon={loading ? <CircularProgress size={20} /> : null}
                                    >
                                        {loading ? 'Loading...' : 'Load More'}
                                    </Button>
                                </Box>
                            </Grid>
                        )}
                    </Grid>
                )}
                
                {!loading && filteredMeals.length === 0 && (
                    <Box sx={{ textAlign: 'center', py: 8 }}>
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                            No meals found
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Try adjusting your search or filters
                        </Typography>
                    </Box>
                )}
            </Box>
            
            {showScrollTop && (
                <Fab
                    size="small"
                    color="primary"
                    sx={{ position: 'fixed', bottom: 24, right: 24 }}
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                >
                    <ArrowUpIcon />
                </Fab>
            )}
            
            <QuickViewDialog
                meal={quickViewMeal}
                open={!!quickViewMeal}
                onClose={() => setQuickViewMeal(null)}
                onAddMeal={handleAddMeal}
            />
            
            <Drawer
                anchor="right"
                open={filtersOpen}
                onClose={() => setFiltersOpen(false)}
                PaperProps={{ sx: { width: 320, p: 2 } }}
            >
                <Typography variant="h6" gutterBottom>
                    Filters
                </Typography>
                <Button
                    fullWidth
                    variant="contained"
                    onClick={() => setFiltersOpen(false)}
                    sx={{ mt: 2 }}
                >
                    Apply Filters
                </Button>
            </Drawer>
        </Box>
    );
};

export default MealCatalogModule;