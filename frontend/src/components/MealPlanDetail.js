/**
 * MealPlanDetail Component - Displays individual meal plan details
 * Client-side only component (imported dynamically with ssr: false)
 */
import React from 'react';
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import { 
    Container, 
    Typography, 
    CircularProgress, 
    Alert, 
    List, 
    ListItem, 
    ListItemText, 
    Button, 
    Box,
    Paper,
    Divider
} from '@mui/material';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';

const GET_MEAL_PLAN = gql`
  query GetMealPlan($id: ID!) {
    getMealPlan(id: $id) {
      id
      title
      startDate
      endDate
      totalCalories
      status
      meals {
        id
        mealName
        mealType
        price
      }
    }
  }
`;

export default function MealPlanDetail() {
    const router = useRouter();
    const { id } = router.query;
    const { user } = useAuth();

    const { data, loading, error } = useQuery(GET_MEAL_PLAN, {
        skip: !id || !user,
        variables: { id },
        fetchPolicy: 'network-only',
    });

    const plan = data?.getMealPlan;

    return (
        <Container maxWidth="md" sx={{ pt: 4, pb: 4 }}>
            <Button 
                onClick={() => router.back()} 
                sx={{ mb: 3 }}
                variant="outlined"
            >
                ← Back to Meal Plans
            </Button>

            {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                </Box>
            )}

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    Failed to load meal plan. Please try again.
                </Alert>
            )}

            {plan && (
                <Paper elevation={0} sx={{ p: 3, borderRadius: 2, backgroundColor: 'background.paper' }}>
                    <Typography variant="h4" gutterBottom fontWeight={600}>
                        {plan.title || 'Meal Plan'}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', gap: 3, mb: 3, flexWrap: 'wrap' }}>
                        <Typography variant="body1" color="text.secondary">
                            📅 {plan.startDate} - {plan.endDate}
                        </Typography>
                        {plan.totalCalories && (
                            <Typography variant="body1" color="text.secondary">
                                🔥 {plan.totalCalories} calories/day
                            </Typography>
                        )}
                        {plan.status && (
                            <Typography variant="body1" color="text.secondary">
                                Status: {plan.status}
                            </Typography>
                        )}
                    </Box>

                    <Divider sx={{ mb: 2 }} />

                    <Typography variant="h6" gutterBottom>
                        Meals in this plan
                    </Typography>

                    {plan.meals && plan.meals.length > 0 ? (
                        <List>
                            {plan.meals.map((meal) => (
                                <ListItem 
                                    key={meal.id}
                                    sx={{ 
                                        borderRadius: 1, 
                                        mb: 1,
                                        backgroundColor: 'grey.50',
                                        '&:hover': { backgroundColor: 'grey.100' }
                                    }}
                                >
                                    <ListItemText 
                                        primary={meal.mealName}
                                        secondary={
                                            <>
                                                {meal.mealType && <span>{meal.mealType}</span>}
                                                {meal.price && <span> • ${meal.price.toFixed(2)}</span>}
                                            </>
                                        }
                                    />
                                </ListItem>
                            ))}
                        </List>
                    ) : (
                        <Typography variant="body2" color="text.secondary">
                            No meals added to this plan yet.
                        </Typography>
                    )}
                </Paper>
            )}

            {!loading && !error && !plan && (
                <Alert severity="info">
                    Meal plan not found.
                </Alert>
            )}
        </Container>
    );
}
