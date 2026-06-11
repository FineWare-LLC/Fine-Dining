// @ts-nocheck
import { Box, Button, Tabs, Tab, CircularProgress, Typography, Alert } from '@mui/material';
import React from 'react';
import MealCatalog from './MealCatalog';
import NutritionRequirementsForm from './NutritionRequirementsForm';
import OptimizedMealPlanDisplay from './OptimizedMealPlanDisplay';
import { resolveMealPlanningEmptyState } from '@/utils/mealPlanningEmptyStates';

/**
 * MealPlanOptimizer - Extracted component for meal plan optimization functionality
 * Handles the tabs, forms, and optimization logic previously embedded in the dashboard
 */
const MealPlanOptimizer = ({
    selectedMeals = [],
    optimizedMealPlan = null,
    tabValue,
    optimizationLoading,
    optimizationError,
    onMealSelection,
    onMealSelectionData,
    onNutritionTargetsChange,
    onTabChange,
    onGenerateOptimizedPlan,
    onAddMeals,
}) => {
    const mealPlanOptimizerEmptyState = resolveMealPlanningEmptyState({
        surface: 'optimizer',
        selectedMeals,
        optimizedMealPlan,
    });

    const handleMealPlanOptimizerEmptyStateAction = () => {
        if (mealPlanOptimizerEmptyState.actionKind === 'open-catalog') {
            onTabChange?.(null, 0);
        }

        if (mealPlanOptimizerEmptyState.actionKind === 'generate-plan') {
            onGenerateOptimizedPlan?.();
        }
    };

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
                    onSelectMealData={onMealSelectionData}
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
                mealPlanOptimizerEmptyState.status === 'invalid' ? (
                    <Alert severity="warning" sx={{ mt: 3 }}>
                        {mealPlanOptimizerEmptyState.error.message}
                    </Alert>
                ) : optimizedMealPlan ? (
                    <OptimizedMealPlanDisplay mealPlan={optimizedMealPlan} />
                ) : (
                    <Box
                        role={mealPlanOptimizerEmptyState.role}
                        aria-live={mealPlanOptimizerEmptyState.ariaLive}
                        aria-atomic="true"
                        sx={{
                            mt: 3,
                            minHeight: mealPlanOptimizerEmptyState.minHeight,
                            textAlign: 'center',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 1.5,
                            borderRadius: 2,
                            border: '1px dashed rgba(255,255,255,0.16)',
                            backgroundColor: 'rgba(255,255,255,0.02)',
                            p: 3,
                        }}
                    >
                        <Typography variant="h6" component="p" sx={{ fontWeight: 700 }}>
                            {mealPlanOptimizerEmptyState.title}
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 520 }}>
                            {mealPlanOptimizerEmptyState.message}
                        </Typography>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleMealPlanOptimizerEmptyStateAction}
                        >
                            {mealPlanOptimizerEmptyState.actionLabel}
                        </Button>
                    </Box>
                )
            )}

            {/* Generate Button */}
            <Box sx={{ mt: 3, mb: 2, display: 'flex', justifyContent: 'center' }}>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={onGenerateOptimizedPlan}
                    disabled={optimizationLoading || selectedMeals.length === 0}
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
