// @ts-nocheck
import { Box, Button, Tabs, Tab, CircularProgress, Typography, Alert, Stack } from '@mui/material';
import React from 'react';
import MealCatalog from './MealCatalog';
import NutritionRequirementsForm from './NutritionRequirementsForm';
import OptimizedMealPlanDisplay from './OptimizedMealPlanDisplay';
import { buildMealPlanOptimizerFeedbackState } from '@/utils/mealPlanningEmptyStates';

const optimizerFeedbackPanelStyles = {
    mt: 3,
    minHeight: 72,
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
};

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
    const mealPlanOptimizerFeedbackState = buildMealPlanOptimizerFeedbackState({
        isLoading: optimizationLoading,
        optimizationError,
        selectedMeals,
        optimizedMealPlan,
    });

    const handleMealPlanOptimizerEmptyStateAction = () => {
        if (mealPlanOptimizerFeedbackState.kind !== 'empty') {
            return;
        }

        if (mealPlanOptimizerFeedbackState.actionKind === 'open-catalog') {
            onTabChange?.(null, 0);
        }

        if (mealPlanOptimizerFeedbackState.actionKind === 'generate-plan') {
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
                mealPlanOptimizerFeedbackState.kind === 'loading' ? (
                    <Box
                        role="status"
                        aria-live="polite"
                        aria-atomic="true"
                        aria-busy="true"
                        sx={optimizerFeedbackPanelStyles}
                    >
                        <CircularProgress
                            size={20}
                            color="primary"
                            aria-label="Generating optimized meal plan"
                        />
                        <Typography variant="h6" component="p" sx={{ fontWeight: 700 }}>
                            {mealPlanOptimizerFeedbackState.title}
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 520 }}>
                            {mealPlanOptimizerFeedbackState.message}
                        </Typography>
                    </Box>
                ) : mealPlanOptimizerFeedbackState.kind === 'error' ? (
                    <Alert
                        severity="error"
                        role="alert"
                        aria-live="assertive"
                        aria-atomic="true"
                        sx={{
                            ...optimizerFeedbackPanelStyles,
                            alignItems: 'center',
                            justifyContent: 'center',
                            textAlign: 'center',
                        }}
                    >
                        {mealPlanOptimizerFeedbackState.message}
                    </Alert>
                ) : mealPlanOptimizerFeedbackState.kind === 'invalid' ? (
                    <Alert
                        severity="warning"
                        role="alert"
                        aria-live="assertive"
                        aria-atomic="true"
                        sx={{ mt: 3, minHeight: 72, alignItems: 'center' }}
                    >
                        {mealPlanOptimizerFeedbackState.message}
                    </Alert>
                ) : mealPlanOptimizerFeedbackState.kind === 'success' ? (
                    <Box
                        role={mealPlanOptimizerFeedbackState.role}
                        aria-live={mealPlanOptimizerFeedbackState.ariaLive}
                        aria-atomic="true"
                        aria-busy={mealPlanOptimizerFeedbackState.ariaBusy ? 'true' : 'false'}
                        sx={{
                            ...optimizerFeedbackPanelStyles,
                            minHeight: mealPlanOptimizerFeedbackState.minHeight,
                            alignItems: 'stretch',
                            justifyContent: 'flex-start',
                            textAlign: 'left',
                        }}
                    >
                        {(mealPlanOptimizerFeedbackState.warnings || []).length > 0 && (
                            <Stack spacing={1} sx={{ width: '100%', mb: 2 }}>
                                {mealPlanOptimizerFeedbackState.warnings.map((warning) => (
                                    <Alert
                                        key={warning}
                                        severity="warning"
                                        role="status"
                                        aria-live="polite"
                                        aria-atomic="true"
                                    >
                                        {warning}
                                    </Alert>
                                ))}
                            </Stack>
                        )}
                        <OptimizedMealPlanDisplay mealPlan={optimizedMealPlan} />
                    </Box>
                ) : (
                    <Box
                        role={mealPlanOptimizerFeedbackState.role}
                        aria-live={mealPlanOptimizerFeedbackState.ariaLive}
                        aria-atomic="true"
                        sx={{
                            ...optimizerFeedbackPanelStyles,
                            minHeight: mealPlanOptimizerFeedbackState.minHeight,
                        }}
                    >
                        <Typography variant="h6" component="p" sx={{ fontWeight: 700 }}>
                            {mealPlanOptimizerFeedbackState.title}
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 520 }}>
                            {mealPlanOptimizerFeedbackState.message}
                        </Typography>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleMealPlanOptimizerEmptyStateAction}
                        >
                            {mealPlanOptimizerFeedbackState.actionLabel}
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

        </Box>
    );
};

export default React.memo(MealPlanOptimizer);
