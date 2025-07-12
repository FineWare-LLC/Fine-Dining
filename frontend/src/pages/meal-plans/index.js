import { gql, useQuery, useMutation } from '@apollo/client';
import { Container, Typography, List, ListItem, ListItemText, Button, CircularProgress, Alert } from '@mui/material';
import Link from 'next/link';
import React from 'react';
import { useAuth } from '@/context/AuthContext';

const GET_MEAL_PLANS = gql`
  query GetMealPlans($userId: ID) {
    getMealPlans(userId: $userId) {
      id
      title
      startDate
      endDate
    }
  }
`;

const CREATE_MEAL_PLAN = gql`
  mutation CreateMealPlan($userId: ID!, $startDate: Date!, $endDate: Date!) {
    createMealPlan(userId: $userId, startDate: $startDate, endDate: $endDate) {
      id
    }
  }
`;

export default function MealPlansPage() {
    const { user } = useAuth();
    const { data, loading, error, refetch } = useQuery(GET_MEAL_PLANS, {
        skip: !user,
        variables: { userId: user?.id },
        fetchPolicy: 'network-only',
    });

    const [createMealPlan, { loading: creating }] = useMutation(CREATE_MEAL_PLAN, {
        onCompleted: () => refetch(),
    });

    const handleCreate = () => {
        if (!user) return;
        const start = new Date();
        const end = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);
        const startDate = start.toISOString().split('T')[0];
        const endDate = end.toISOString().split('T')[0];
        createMealPlan({ variables: { userId: user.id, startDate, endDate } });
    };

    return (
        <Container maxWidth="sm">
            <Typography variant="h5" gutterBottom>
        Meal Plans
            </Typography>
            <Button variant="contained" onClick={handleCreate} disabled={creating} sx={{ mb: 2 }}>
                {creating ? 'Creating...' : 'Create Meal Plan'}
            </Button>
            {loading && <CircularProgress />}
            {error && <Alert severity="error">Failed to load meal plans.</Alert>}
            <List>
                {data?.getMealPlans?.map((plan) => (
                    <ListItem button component={Link} href={`/meal-plans/${plan.id}`} key={plan.id}>
                        <ListItemText
                            primary={plan.title || `${plan.startDate} - ${plan.endDate}`}
                        />
                    </ListItem>
                ))}
            </List>
        </Container>
    );
}
