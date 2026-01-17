/**
 * MealCatalog.js
 *
 * Component to display the meal catalog and allow users to select meals.
 */

import { useQuery, gql } from '@apollo/client';
import FilterListIcon from '@mui/icons-material/FilterList';
import SearchIcon from '@mui/icons-material/Search';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Checkbox,
    CircularProgress,
    Chip,
    Stack,
    TextField,
    InputAdornment,
    IconButton,
    Collapse,
    Button,
} from '@mui/material';
import React, { useState } from 'react';

// Removed fake scraped data import to fix selection bug

// GraphQL query to fetch all available meals
const GET_ALL_MEALS = gql`
  query GetAllMeals($page: Int, $limit: Int) {
    getAllMeals(page: $page, limit: $limit) {
      id
      mealName
      price
      restaurant {
        id
        restaurantName
      }
      nutrition {
        carbohydrates
        protein
        fat
        sodium
      }
      allergens
    }
  }
`;

// GraphQL query to fetch menu items for a restaurant
const GET_MENU_ITEMS = gql`
  query GetMenuItems($restaurantId: ID!, $page: Int, $limit: Int) {
    getMenuItemsByRestaurant(restaurantId: $restaurantId, page: $page, limit: $limit) {
      id
      mealName
      price
      allergens
      nutritionFacts
    }
  }
`;

// Query to fetch restaurants for filter chips
const GET_RESTAURANTS = gql`
  query GetRestaurants($page: Int, $limit: Int) {
    getRestaurants(page: $page, limit: $limit) {
      id
      restaurantName
    }
  }
`;

/**
 * Displays the meal catalog with search, filtering, and selection capabilities.
 *
 * @param {Object} props - Component props
 * @param {Array} props.selectedMeals - Array of selected meal IDs
 * @param {Function} props.onSelectMeal - Callback when a meal is selected/deselected
 * @param {Function} [props.onAddMeals] - Handler for the "Add Selected" button
 * @param {string} [props.restaurantId] - Optional ID of restaurant to filter meals by
 * @returns {JSX.Element} The rendered component
 */
const MealCatalog = ({ selectedMeals = [], onSelectMeal, onAddMeals, restaurantId }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [restaurantFilter, setRestaurantFilter] = useState(null);
    const [page, setPage] = useState(1);
    const [limit] = useState(20);

    // Fetch meals or menu items from the server
    const { loading, error, data } = useQuery(
        restaurantId ? GET_MENU_ITEMS : GET_ALL_MEALS,
        {
            variables: restaurantId ? { restaurantId, page, limit } : { page, limit },
            fetchPolicy: 'network-only',
        },
    );

    // Get initial items based on query type
    const allItems = restaurantId ? data?.getMenuItemsByRestaurant : data?.getAllMeals;

    // Fetch local restaurants for filters
    const { data: restaurantData } = useQuery(GET_RESTAURANTS, {
        variables: { page: 1, limit: 50 },
        fetchPolicy: 'cache-first',
    });
    const restaurants = restaurantData?.getRestaurants || [];

    // Use only real API data - no fake scraped data mixing
    const mealsToDisplay = allItems || [];

    // Filter meals based on search term and restaurant filter
    const filteredMeals = mealsToDisplay.filter(meal => {
        const matchesSearch = meal.mealName
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase());
        const matchesRestaurant = !restaurantFilter ||
      (meal.restaurant && meal.restaurant.restaurantName === restaurantFilter);
        return matchesSearch && matchesRestaurant;
    });

    // Handle meal selection
    const handleMealSelection = (mealId) => {
        if (onSelectMeal) {
            onSelectMeal(mealId);
        }
    };

    // Check if a meal is selected
    const isMealSelected = (mealId) => {
        return selectedMeals.includes(mealId);
    };

    // Handle Add Selected button click
    const handleAddSelected = () => {
        if (onAddMeals) {
            const mealsToAdd = filteredMeals.filter(m => selectedMeals.includes(m.id));
            onAddMeals(mealsToAdd, 'DINNER');
        }
    };

    return (
        <Card sx={{ mb: 3, mt: 2 }}>
            <CardContent>
                <Typography variant="h6" component="div" gutterBottom>
          Meal Catalog
                </Typography>

                <Typography variant="body2" color="text.secondary" gutterBottom>
          Browse and select meals to include in your optimized meal plan.
                </Typography>

                {/* Search and filter controls */}
                <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                    <TextField
                        placeholder="Search meals..."
                        variant="outlined"
                        size="small"
                        fullWidth
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                        }}
                    />
                    <IconButton
                        color={showFilters ? 'primary' : 'default'}
                        onClick={() => setShowFilters(!showFilters)}
                        sx={{ ml: 1 }}
                    >
                        <FilterListIcon />
                    </IconButton>
                </Box>

                {/* Collapsible filters */}
                <Collapse in={showFilters}>
                    <Box sx={{ mb: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                        <Typography variant="subtitle2" gutterBottom>
              Filters
                        </Typography>
                        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                            <Chip
                                label="All"
                                onClick={() => setRestaurantFilter(null)}
                                color={restaurantFilter === null ? 'primary' : 'default'}
                            />
                            {restaurants.map((r) => (
                                <Chip
                                    key={r.id}
                                    label={r.restaurantName}
                                    onClick={() => setRestaurantFilter(r.restaurantName)}
                                    color={restaurantFilter === r.restaurantName ? 'primary' : 'default'}
                                />
                            ))}
                        </Stack>
                    </Box>
                </Collapse>

                {/* Meal table */}
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                        <CircularProgress />
                    </Box>
                ) : error ? (
                    <Typography color="error" sx={{ p: 2 }}>
            Error loading meals: {error.message}
                    </Typography>
                ) : (
                    <TableContainer component={Paper} variant="outlined">
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell padding="checkbox">
                                        <Checkbox
                                            disabled
                                            indeterminate={selectedMeals.length > 0 && selectedMeals.length < filteredMeals.length}
                                            checked={filteredMeals.length > 0 && selectedMeals.length === filteredMeals.length}
                                        />
                                    </TableCell>
                                    <TableCell>Meal</TableCell>
                                    <TableCell align="right">Price</TableCell>
                                    <TableCell align="right">Carbs</TableCell>
                                    <TableCell align="right">Protein</TableCell>
                                    <TableCell align="right">Fat</TableCell>
                                    <TableCell align="right">Sodium</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredMeals.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} align="center">
                      No meals found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredMeals.map((meal) => (
                                        <TableRow
                                            key={meal.id}
                                            hover
                                            onClick={() => handleMealSelection(meal.id)}
                                            selected={isMealSelected(meal.id)}
                                        >
                                            <TableCell padding="checkbox">
                                                <Checkbox
                                                    checked={isMealSelected(meal.id)}
                                                    onChange={() => handleMealSelection(meal.id)}
                                                />
                                            </TableCell>
                                            <TableCell component="th" scope="row">
                                                {meal.mealName}
                                            </TableCell>
                                            <TableCell align="right">${(meal.price || 0).toFixed(2)}</TableCell>
                                            <TableCell align="right">{meal.nutrition?.carbohydrates || 'N/A'}g</TableCell>
                                            <TableCell align="right">{meal.nutrition?.protein || 'N/A'}g</TableCell>
                                            <TableCell align="right">{meal.nutrition?.fat || 'N/A'}g</TableCell>
                                            <TableCell align="right">{meal.nutrition?.sodium || 'N/A'}mg</TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}

                {/* Pagination controls */}
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                    <Button
                        disabled={page === 1 || loading}
                        onClick={() => setPage(page - 1)}
                    >
            Previous
                    </Button>
                    <Typography variant="body2" sx={{ alignSelf: 'center' }}>
            Page {page}
                    </Typography>
                    <Button
                        disabled={!data || (allItems && allItems.length < limit) || loading}
                        onClick={() => setPage(page + 1)}
                    >
            Next
                    </Button>
                </Box>

                {/* Add Selected button */}
                {onAddMeals && (
                    <Box sx={{ mt: 2, textAlign: 'right' }}>
                        <Button
                            variant="contained"
                            color="primary"
                            disabled={selectedMeals.length === 0}
                            onClick={handleAddSelected}
                        >
              Add Selected
                        </Button>
                    </Box>
                )}
            </CardContent>
        </Card>
    );
};

export default MealCatalog;
