/**
 * MealCatalog.js
 * 
 * Component to display the meal catalog and allow users to select meals.
 */

import React, { useState, useEffect } from 'react';
import { useQuery, gql } from '@apollo/client';
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
  Button
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

// GraphQL query to fetch all available meals
const GET_ALL_MEALS = gql`
  query GetAllMeals($page: Int, $limit: Int) {
    getAllMeals(page: $page, limit: $limit) {
      id
      mealName
      price
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

/**
 * Displays the meal catalog with search, filtering, and selection capabilities.
 * 
 * @param {Object} props - Component props
 * @param {Array} props.selectedMeals - Array of selected meal IDs
 * @param {Function} props.onSelectMeal - Callback function when a meal is selected/deselected
 * @returns {JSX.Element} The rendered component
 */
const MealCatalog = ({ selectedMeals = [], onSelectMeal }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);

  // Fetch meals from the server
  const { loading, error, data } = useQuery(GET_ALL_MEALS, {
    variables: { page, limit },
    fetchPolicy: 'network-only' // Don't use cache for this query
  });

  // Filter meals based on search term
  const filteredMeals = data?.getAllMeals?.filter(meal => 
    meal.mealName.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

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
              )
            }}
          />
          <IconButton 
            color={showFilters ? "primary" : "default"} 
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
              <Chip label="McDonald's" onClick={() => {}} />
              <Chip label="Walmart" onClick={() => {}} />
              <Chip label="Taco Bell" onClick={() => {}} />
              <Chip label="Subway" onClick={() => {}} />
              <Chip label="Burger King" onClick={() => {}} />
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
                      <TableCell align="right">${meal.price.toFixed(2)}</TableCell>
                      <TableCell align="right">{meal.nutrition.carbohydrates}g</TableCell>
                      <TableCell align="right">{meal.nutrition.protein}g</TableCell>
                      <TableCell align="right">{meal.nutrition.fat}g</TableCell>
                      <TableCell align="right">{meal.nutrition.sodium}mg</TableCell>
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
            disabled={!data || data.getAllMeals.length < limit || loading} 
            onClick={() => setPage(page + 1)}
          >
            Next
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default MealCatalog;
