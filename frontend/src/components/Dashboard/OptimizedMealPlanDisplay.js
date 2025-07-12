/**
 * OptimizedMealPlanDisplay.js
 *
 * Component to display the results of an optimized meal plan.
 */

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
    Divider,
    Chip,
    Stack,
} from '@mui/material';
import React from 'react';

/**
 * Displays the optimized meal plan with meals, servings, prices, and nutrition totals.
 *
 * @param {Object} props - Component props
 * @param {Object} props.mealPlan - The optimized meal plan data
 * @param {Array} props.mealPlan.meals - Array of meals in the plan
 * @param {number} props.mealPlan.totalCost - Total cost of the meal plan
 * @param {Object} props.mealPlan.totalNutrition - Total nutrition values
 * @returns {JSX.Element} The rendered component
 */
const OptimizedMealPlanDisplay = ({ mealPlan }) => {
    if (!mealPlan || !mealPlan.meals || mealPlan.meals.length === 0) {
        return null;
    }

    return (
        <Card sx={{ mb: 3, mt: 2 }}>
            <CardContent>
                <Typography variant="h6" component="div" gutterBottom>
          Optimized Meal Plan
                </Typography>

                <Typography variant="body2" color="text.secondary" gutterBottom>
          This plan is optimized to meet your nutritional targets at the lowest possible cost.
                </Typography>

                <TableContainer component={Paper} variant="outlined" sx={{ mt: 2 }}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Meal</TableCell>
                                <TableCell align="right">Servings</TableCell>
                                <TableCell align="right">Price/Serving</TableCell>
                                <TableCell align="right">Total Price</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {mealPlan.meals.map((meal) => (
                                <TableRow key={meal.mealId}>
                                    <TableCell component="th" scope="row">
                                        {meal.mealName}
                                    </TableCell>
                                    <TableCell align="right">{meal.servings.toFixed(1)}</TableCell>
                                    <TableCell align="right">${meal.pricePerServing.toFixed(2)}</TableCell>
                                    <TableCell align="right">${meal.totalPrice.toFixed(2)}</TableCell>
                                </TableRow>
                            ))}
                            <TableRow>
                                <TableCell colSpan={3} align="right" sx={{ fontWeight: 'bold' }}>
                  Total Cost:
                                </TableCell>
                                <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                  ${mealPlan.totalCost.toFixed(2)}
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </TableContainer>

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle1" gutterBottom>
          Nutrition Totals
                </Typography>

                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                    <Chip
                        label={`Carbs: ${Math.round(mealPlan.totalNutrition.carbohydrates)}g`}
                        color="primary"
                        variant="outlined"
                    />
                    <Chip
                        label={`Protein: ${Math.round(mealPlan.totalNutrition.protein)}g`}
                        color="secondary"
                        variant="outlined"
                    />
                    <Chip
                        label={`Fat: ${Math.round(mealPlan.totalNutrition.fat)}g`}
                        color="warning"
                        variant="outlined"
                    />
                    <Chip
                        label={`Sodium: ${Math.round(mealPlan.totalNutrition.sodium)}mg`}
                        color="error"
                        variant="outlined"
                    />
                </Stack>
            </CardContent>
        </Card>
    );
};

export default OptimizedMealPlanDisplay;