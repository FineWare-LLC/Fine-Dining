/**
 * @fileoverview MealPlanViewer component
 */
import React from 'react';
import {
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
  Divider
} from '@mui/material';

/**
 * MealPlanViewer component
 * Renders metadata and meals for a meal plan returned by the `getMealPlan` query.
 *
 * @param {Object} props
 * @param {Object} props.mealPlan - Meal plan data
 * @returns {JSX.Element|null}
 */
const MealPlanViewer = ({ mealPlan }) => {
  if (!mealPlan) return null;

  const {
    title,
    startDate,
    endDate,
    status,
    totalCalories,
    meals,
    user
  } = mealPlan;

  return (
    <Card sx={{ mb: 3, mt: 2 }}>
      <CardContent>
        <Typography variant="h6" component="div" gutterBottom>
          {title || 'Meal Plan'}
        </Typography>

        <Typography variant="body2" color="text.secondary" gutterBottom>
          {user?.name ? `Created for ${user.name}` : null}
        </Typography>

        <Typography variant="body2" color="text.secondary" gutterBottom>
          {new Date(startDate).toLocaleDateString()} – {new Date(endDate).toLocaleDateString()}
        </Typography>

        {status && (
          <Typography variant="body2" gutterBottom>
            Status: {status}
          </Typography>
        )}
        {typeof totalCalories === 'number' && (
          <Typography variant="body2" gutterBottom>
            Total Calories: {totalCalories}
          </Typography>
        )}

        <Divider sx={{ my: 2 }} />

        {meals && meals.length > 0 ? (
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Meal</TableCell>
                  <TableCell align="right">Type</TableCell>
                  <TableCell align="right">Date</TableCell>
                  <TableCell align="right">Price</TableCell>
                  <TableCell align="right">Carbs</TableCell>
                  <TableCell align="right">Protein</TableCell>
                  <TableCell align="right">Fat</TableCell>
                  <TableCell align="right">Sodium</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {meals.map((meal) => (
                  <TableRow key={meal.id}>
                    <TableCell component="th" scope="row">
                      {meal.mealName}
                    </TableCell>
                    <TableCell align="right">{meal.mealType}</TableCell>
                    <TableCell align="right">
                      {meal.date ? new Date(meal.date).toLocaleDateString() : ''}
                    </TableCell>
                    <TableCell align="right">
                      {meal.price != null ? `$${meal.price.toFixed(2)}` : ''}
                    </TableCell>
                    <TableCell align="right">
                      {meal.nutrition?.carbohydrates ?? ''}
                    </TableCell>
                    <TableCell align="right">
                      {meal.nutrition?.protein ?? ''}
                    </TableCell>
                    <TableCell align="right">
                      {meal.nutrition?.fat ?? ''}
                    </TableCell>
                    <TableCell align="right">
                      {meal.nutrition?.sodium ?? ''}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No meals found.
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default MealPlanViewer;
