import React from 'react';
import { Box, Button, Tabs, Tab, CircularProgress, Typography } from '@mui/material';
import MealCatalog from './MealCatalog';
import NutritionRequirementsForm from './NutritionRequirementsForm';
import OptimizedMealPlanDisplay from './OptimizedMealPlanDisplay';

/**
 * MealPlanOptimizer - Extracted component for meal plan optimization functionality
 * Handles the tabs, forms, and optimization logic previously embedded in the dashboard
 */
const MealPlanOptimizer = ({
  selectedMeals,
  optimizedMealPlan,
  tabValue,
  optimizationLoading,
  optimizationError,
  onMealSelection,
  onNutritionTargetsChange,
  onTabChange,
  onGenerateOptimizedPlan,
  onAddMeals,
}) => {
  return (
    <Box sx={{ width: '100%', mt: 3 }}>
      <Tabs
        value={tabValue}
        onChange={onTabChange}
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
          onSelectMeal={onMealSelection}
          onAddMeals={onAddMeals}
        />
      )}

      {/* Tab 2: Nutrition Requirements */}
      {tabValue === 1 && (
        <NutritionRequirementsForm
          onChange={onNutritionTargetsChange}
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
          onClick={onGenerateOptimizedPlan}
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
  );
};

export default React.memo(MealPlanOptimizer);