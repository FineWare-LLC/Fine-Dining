// @ts-nocheck
import { gql } from '@apollo/client';
import { useMutation } from '@apollo/client/react';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import { Box, Button, Chip, CircularProgress, Grid, Paper, TextField, Typography } from '@mui/material';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import {
    buildAuthFeedbackContainerStyles,
    buildDietPreferenceRankingFeedbackState,
    buildUpdatedAuthUserSnapshot,
} from '@/context/authUtils';

const UPDATE_USER = gql`
    mutation UpdateUser($id: ID!, $input: UpdateUserInput!) {
        updateUser(id: $id, input: $input) {
            id
            dailyCalories
            allergies
            foodGoals
            dietaryProfile {
                diets
                excludedIngredients
                preferredCuisines
            }
        }
    }
`;

const options = {
    diets: ['High protein', 'Mediterranean', 'Vegetarian', 'Low carb', 'Gluten free', 'Heart healthy'],
    allergies: ['Dairy', 'Peanuts', 'Tree nuts', 'Shellfish', 'Soy', 'Wheat'],
    cuisines: ['American', 'Mediterranean', 'Mexican', 'Asian', 'Italian', 'Indian'],
};

function toggleValue(values, value) {
    return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}

export default function OnboardingPage() {
    const { user, token, login } = useAuth();
    const router = useRouter();
    const [dailyCalories, setDailyCalories] = useState(user?.dailyCalories || 2200);
    const [diets, setDiets] = useState([]);
    const [allergies, setAllergies] = useState([]);
    const [cuisines, setCuisines] = useState([]);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        if (!successMessage) {
            return;
        }

        const redirectTimer = setTimeout(() => {
            router.push('/dashboard').catch(() => {});
        }, 0);

        return () => clearTimeout(redirectTimer);
    }, [router, successMessage]);

    const [updateUser, { loading }] = useMutation(UPDATE_USER, {
        onCompleted: (data) => {
            const updatedSnapshot = buildUpdatedAuthUserSnapshot(user, data?.updateUser);

            if (!token || !updatedSnapshot) {
                setError('Your session could not be updated. Please sign in again.');
                setSuccessMessage('');
                return;
            }

            const sessionResult = login(token, updatedSnapshot);
            if (!sessionResult.ok) {
                setError(sessionResult.error?.message || 'Your session could not be updated. Please sign in again.');
                setSuccessMessage('');
                return;
            }

            setSuccessMessage('Diet preferences saved. Redirecting to your dashboard...');
        },
        onError: (err) => {
            setError(err.message);
            setSuccessMessage('');
        },
    });

    const save = async () => {
        setError('');
        setSuccessMessage('');
        await updateUser({
            variables: {
                id: user.id,
                input: {
                    dailyCalories: Number(dailyCalories),
                    allergies,
                    foodGoals: diets,
                    dietaryProfile: {
                        diets: diets.map((diet) => diet.toUpperCase().replaceAll(' ', '_')),
                        allergens: allergies.map((allergy) => allergy.toUpperCase().replaceAll(' ', '_')),
                        excludedIngredients: [],
                        preferredCuisines: cuisines,
                    },
                },
            },
        });
    };

    const feedback = buildDietPreferenceRankingFeedbackState({
        isLoading: loading,
        errorMessage: error,
        successMessage,
        hasDietGoals: diets.length > 0,
    });
    const feedbackSurfaceStyles = buildAuthFeedbackContainerStyles(feedback.state);

    return (
        <ProtectedRoute allowedRoles={['USER', 'PREMIUM', 'PRO', 'ADMIN']}>
            <Head><title>Onboarding - Fine Dining</title></Head>
            <MainLayout>
                <Box sx={{ maxWidth: 980 }}>
                    <Typography sx={{ color: '#F08E5D', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.75rem' }}>Onboarding</Typography>
                    <Typography sx={{ color: '#fff', fontSize: { xs: '2rem', md: '3rem' }, fontWeight: 800, mt: 1 }}>Tune your diet workspace</Typography>
                    <Typography sx={{ color: 'rgba(255,255,255,0.72)', mt: 1, mb: 4 }}>These choices power recommendations, meal plans, grocery lists, and tracker targets.</Typography>
                    <Box
                        id="diet-preference-ranking-feedback"
                        role={feedback.role}
                        aria-live={feedback.ariaLive}
                        aria-atomic="true"
                        sx={{
                            minHeight: feedback.minHeight,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                            mb: 2,
                            px: 1.5,
                            py: 1,
                            borderRadius: 1.5,
                            ...feedbackSurfaceStyles,
                        }}
                    >
                        {feedback.showSpinner && <CircularProgress size={18} />}
                        <Typography
                            variant="body2"
                            sx={{
                                color: feedback.state === 'error'
                                    ? 'error.main'
                                    : feedback.state === 'success'
                                        ? 'success.main'
                                        : 'text.secondary',
                                fontWeight: feedback.state === 'success' ? 700 : 400,
                            }}
                        >
                            {feedback.message}
                        </Typography>
                    </Box>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={4}>
                            <Paper sx={{ p: 3, bgcolor: '#1C1815', border: '1px solid rgba(255,255,255,0.08)' }}>
                                <Typography sx={{ color: '#fff', fontWeight: 700, mb: 2 }}>Daily target</Typography>
                                <TextField fullWidth type="number" label="Calories" value={dailyCalories} onChange={(event) => setDailyCalories(event.target.value)} />
                            </Paper>
                        </Grid>
                        {[
                            ['Diet styles', options.diets, diets, setDiets],
                            ['Allergies', options.allergies, allergies, setAllergies],
                            ['Favorite cuisines', options.cuisines, cuisines, setCuisines],
                        ].map(([title, values, selected, setter]) => (
                            <Grid item xs={12} md={8} key={title}>
                                <Paper sx={{ p: 3, bgcolor: '#1C1815', border: '1px solid rgba(255,255,255,0.08)' }}>
                                    <Typography sx={{ color: '#fff', fontWeight: 700, mb: 2 }}>{title}</Typography>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                        {values.map((value) => (
                                            <Chip
                                                key={value}
                                                label={value}
                                                onClick={() => setter(toggleValue(selected, value))}
                                                color={selected.includes(value) ? 'primary' : 'default'}
                                                icon={selected.includes(value) ? <CheckCircleRoundedIcon /> : undefined}
                                                disabled={loading}
                                            />
                                        ))}
                                    </Box>
                                </Paper>
                            </Grid>
                        ))}
                    </Grid>
                    <Button variant="contained" size="large" onClick={save} disabled={loading} sx={{ mt: 4 }}>Save and open dashboard</Button>
                </Box>
            </MainLayout>
        </ProtectedRoute>
    );
}
