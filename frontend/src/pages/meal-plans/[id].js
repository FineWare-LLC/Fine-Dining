import { gql, useQuery } from '@apollo/client';
import { Container, Typography, CircularProgress, Alert, List, ListItem, ListItemText, Button } from '@mui/material';
import { useRouter } from 'next/router';
import React from 'react';
import { useAuth } from '@/context/AuthContext';

const GET_MEAL_PLAN = gql`
  query GetMealPlan($id: ID!) {
    getMealPlan(id: $id) {
      id
      title
      startDate
      endDate
      meals {
        id
        mealName
      }
    }
  }
`;

export default function MealPlanDetailPage() {
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
        <Container maxWidth="sm">
            <Button onClick={() => router.back()} sx={{ mb: 2 }}>
        Back
            </Button>
            {loading && <CircularProgress />}
            {error && <Alert severity="error">Failed to load meal plan.</Alert>}
            {plan && (
                <>
                    <Typography variant="h5" gutterBottom>
                        {plan.title || 'Meal Plan'}
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                        {plan.startDate} - {plan.endDate}
                    </Typography>
                    <List>
                        {plan.meals.map((meal) => (
                            <ListItem key={meal.id}>
                                <ListItemText primary={meal.mealName} />
                            </ListItem>
                        ))}
                    </List>
                </>
            )}
        </Container>
    );
}
