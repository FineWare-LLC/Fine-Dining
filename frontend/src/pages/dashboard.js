/**
 * @file dashboard.js
 * @description Robust dashboard page for Fine Dining application.
 */

import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext'; // [cite: frontend/src/context/AuthContext.js]
import { useQuery } from '@apollo/client';
import {
    Container,
    Box,
    Grid,
    Typography,
    Card,
    CardContent,
    CircularProgress,
    Alert,
    Button
} from '@mui/material';

// Import the generated GraphQL query documents.
import { GetUserDocument, GetMealPlansDocument, GetStatsByUserDocument } from '@/gql/graphql';

export default function DashboardPage() {
    const { user, isAuthenticated, loading: authLoading } = useAuth();
    const router = useRouter();

    // Fetch user profile.
    const { data: userData, loading: userLoading, error: userError } = useQuery(GetUserDocument, {
        variables: { id: user?.id },
        skip: !user?.id,
    });

    // Fetch recent meal plans.
    const { data: mealPlansData, loading: mealPlansLoading, error: mealPlansError } = useQuery(GetMealPlansDocument, {
        variables: { userId: user?.id, limit: 5 },
        skip: !user?.id,
    });

    // Fetch user stats.
    const { data: statsData, loading: statsLoading, error: statsError } = useQuery(GetStatsByUserDocument, {
        variables: { userId: user?.id },
        skip: !user?.id,
    });

    // Redirect unauthenticated users.
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/signin'); // [cite: frontend/src/pages/signin.js]
        }
    }, [authLoading, isAuthenticated, router]);

    // Show a loading spinner if authentication or data queries are in progress.
    if (authLoading || userLoading || mealPlansLoading || statsLoading) {
        return (
            <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Container>
        );
    }

    // Display an error state if any query failed.
    if (userError || mealPlansError || statsError) {
        return (
            <Container sx={{ mt: 4 }}>
                <Alert severity="error">
                    Failed to load dashboard data. Please try refreshing the page.
                    {userError && <p>User Data Error: {userError.message}</p>}
                    {mealPlansError && <p>Meal Plan Error: {mealPlansError.message}</p>}
                    {statsError && <p>Stats Error: {statsError.message}</p>}
                </Alert>
            </Container>
        );
    }

    // Ensure user is authenticated before rendering dashboard content.
    if (!isAuthenticated || !user) {
        return (
            <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Typography>Redirecting...</Typography>
            </Container>
        );
    }

    const profile = userData?.getUser;
    const mealPlans = mealPlansData?.getMealPlans || [];
    const statsList = statsData?.getStatsByUser || [];
    const latestStats = statsList.length > 0 ? statsList[0] : null;

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom>
                Welcome back, {profile?.name || user.name}!
            </Typography>

            <Grid container spacing={3}>
                {/* Profile Summary Widget */}
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Profile Summary
                            </Typography>
                            <Typography variant="body2">Email: {profile?.email}</Typography>
                            <Typography variant="body2">
                                Daily Calories Goal: {profile?.dailyCalories || 'Not set'}
                            </Typography>
                            <Typography variant="body2">
                                Weight: {profile?.weight || 'N/A'} {profile?.measurementSystem === 'METRIC' ? 'kg' : 'lbs'}
                            </Typography>
                            <Button variant="outlined" size="small" sx={{ mt: 2 }} onClick={() => router.push('/profile')}>
                                Edit Profile
                            </Button>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Latest Stats Widget */}
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Today's Stats
                            </Typography>
                            {latestStats ? (
                                <>
                                    <Typography variant="body2">Calories Consumed: {latestStats.caloriesConsumed || 0}</Typography>
                                    <Typography variant="body2">Water Intake: {latestStats.waterIntake || 0} ml</Typography>
                                    <Typography variant="body2">Steps: {latestStats.steps || 0}</Typography>
                                </>
                            ) : (
                                <Typography variant="body2">No stats logged for today yet.</Typography>
                            )}
                            <Button variant="outlined" size="small" sx={{ mt: 2 }} onClick={() => router.push('/log-stats')}>
                                Log Today's Stats
                            </Button>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Meal Plan Overview Widget */}
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Recent Meal Plans
                            </Typography>
                            {mealPlans.length > 0 ? (
                                mealPlans.map((plan) => (
                                    <Box key={plan.id} mb={1}>
                                        <Typography variant="subtitle2">{plan.title || 'Untitled Plan'}</Typography>
                                        <Typography variant="caption">
                                            {new Date(plan.startDate).toLocaleDateString()} - {new Date(plan.endDate).toLocaleDateString()} ({plan.status})
                                        </Typography>
                                    </Box>
                                ))
                            ) : (
                                <Typography variant="body2">No meal plans found.</Typography>
                            )}
                            <Button variant="outlined" size="small" sx={{ mt: 2 }} onClick={() => router.push('/meal-plans')}>
                                View All Plans
                            </Button>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Container>
    );
}
