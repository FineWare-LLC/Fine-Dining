// @ts-nocheck
import { useQuery, useMutation } from '@apollo/client/react';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import HomeIcon from '@mui/icons-material/Home';
import LogoutIcon from '@mui/icons-material/Logout';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import {
    Box, Typography, Container, Grid, Card, CardContent, Button, AppBar, Toolbar,
    IconButton, CircularProgress, FormControl, InputLabel, Select, MenuItem,
    TextField, Paper, Chip, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Snackbar, Divider, Alert,
} from '@mui/material';
import { gql } from 'graphql-tag';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import {
    buildActiveMealPlanFeedbackContainerStyles,
    getActiveMealPlanRouteState,
    resolveMealPlanCalendarState,
} from '@/utils/activeMealPlan';

const GET_COOKBOOKS = gql`
    query GetCookbooksByUser($userId: ID!) {
        getCookbooksByUser(userId: $userId) {
            id name entries { id recipe { id recipeName } }
        }
    }
`;

const GET_MEAL_PLANS = gql`
    query GetMealPlans($userId: ID, $page: Int, $limit: Int) {
        getMealPlans(userId: $userId, page: $page, limit: $limit) {
            id title startDate endDate status totalCost totalCalories headcount
            solverMeta { solveTimeMs objectiveValue feasible solverStatus totalVariables totalConstraints }
            slots {
                id day date mealType servings costPerServing locked
                recipe { id recipeName }
                nutritionPerServing { calories protein carbohydrates fat fiber }
            }
        }
    }
`;

const GENERATE_PLAN = gql`
    mutation GenerateMealPlanFromCookbook(
        $cookbookId: ID!, $startDate: Date!, $endDate: Date!,
        $householdId: ID, $title: String, $objective: String
    ) {
        generateMealPlanFromCookbook(
            cookbookId: $cookbookId, startDate: $startDate, endDate: $endDate,
            householdId: $householdId, title: $title, objective: $objective
        ) {
            id title startDate endDate status totalCost totalCalories headcount
            solverMeta { solveTimeMs objectiveValue feasible solverStatus totalVariables totalConstraints }
            slots {
                id day date mealType servings costPerServing
                recipe { id recipeName }
                nutritionPerServing { calories protein carbohydrates fat fiber }
            }
        }
    }
`;

export default function PlannerPage() {
    const { logout, user } = useAuth();
    const router = useRouter();
    const activeMealPlanRouteState = getActiveMealPlanRouteState(router.query, {
        isLoading: !router.isReady,
    });
    const activeMealPlanFeedbackStyles = buildActiveMealPlanFeedbackContainerStyles(
        activeMealPlanRouteState.feedback.state,
    );

    const [selectedCookbook, setSelectedCookbook] = useState('');
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [days, setDays] = useState(7);
    const [objective, setObjective] = useState('minimize_cost');
    const [title, setTitle] = useState('');
    const [generating, setGenerating] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const { data: cbData } = useQuery(GET_COOKBOOKS, { variables: { userId: user?.id }, skip: !user?.id });
    const { data: plansData, refetch: refetchPlans } = useQuery(GET_MEAL_PLANS, {
        variables: { userId: user?.id, page: 1, limit: 10 }, skip: !user?.id,
    });
    const [generatePlan] = useMutation(GENERATE_PLAN);

    const cookbooks = cbData?.getCookbooksByUser || [];
    const plans = plansData?.getMealPlans || [];

    const endDateStr = (() => {
        const d = new Date(startDate);
        d.setDate(d.getDate() + days);
        return d.toISOString().split('T')[0];
    })();

    const handleGenerate = async () => {
        if (!selectedCookbook) return;
        setGenerating(true);
        try {
            await generatePlan({
                variables: {
                    cookbookId: selectedCookbook,
                    startDate: new Date(startDate).toISOString(),
                    endDate: new Date(endDateStr).toISOString(),
                    title: title || `Meal Plan (${days} days)`,
                    objective,
                },
            });
            setSnackbar({ open: true, message: 'Meal plan generated!', severity: 'success' });
            refetchPlans();
        } catch (err) {
            setSnackbar({ open: true, message: err.message, severity: 'error' });
        }
        setGenerating(false);
    };

    return (
        <ProtectedRoute allowedRoles={['USER', 'PREMIUM', 'PRO', 'ADMIN']}>
            <Head><title>Meal Planner - Fine Dining</title></Head>
            <MainLayout>
                <Typography variant="h4" sx={{ fontFamily: '"Fraunces", serif', fontWeight: 700, color: '#fff', mb: 4 }}>
                    Meal Planner
                </Typography>
                <Box
                    id="active-meal-plan-feedback"
                    role={activeMealPlanRouteState.feedback.role}
                    aria-live={activeMealPlanRouteState.feedback.ariaLive}
                    aria-atomic="true"
                    aria-busy={activeMealPlanRouteState.feedback.state === 'loading' ? 'true' : 'false'}
                    sx={{
                        mb: 3,
                        minHeight: activeMealPlanRouteState.feedback.minHeight,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        px: 1.5,
                        py: 1,
                        borderRadius: 1.5,
                        ...activeMealPlanFeedbackStyles,
                    }}
                >
                    {activeMealPlanRouteState.feedback.showSpinner && (
                        <CircularProgress size={18} />
                    )}
                    <Typography
                        variant="body2"
                        sx={{
                            color: activeMealPlanRouteState.feedback.state === 'error'
                                ? 'error.main'
                                : activeMealPlanRouteState.feedback.state === 'success'
                                    ? 'success.main'
                                    : 'text.secondary',
                            fontWeight: activeMealPlanRouteState.feedback.state === 'success' ? 700 : 400,
                        }}
                    >
                        {activeMealPlanRouteState.feedback.message}
                    </Typography>
                </Box>
                    {/* Generator */}
                    <Paper sx={{ p: 3, mb: 4 }}>
                        <Typography variant="h6" gutterBottom>Generate New Plan</Typography>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} sm={3}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Cookbook</InputLabel>
                                    <Select value={selectedCookbook} onChange={(e) => setSelectedCookbook(e.target.value)} label="Cookbook">
                                        {cookbooks.map((cb) => (
                                            <MenuItem key={cb.id} value={cb.id}>{cb.name} ({cb.entries?.length || 0})</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={6} sm={2}>
                                <TextField fullWidth size="small" label="Start Date" type="date"
                                    value={startDate} onChange={(e) => setStartDate(e.target.value)}
                                    InputLabelProps={{ shrink: true }} />
                            </Grid>
                            <Grid item xs={6} sm={1}>
                                <TextField fullWidth size="small" label="Days" type="number"
                                    value={days} onChange={(e) => setDays(Math.max(1, parseInt(e.target.value) || 1))} />
                            </Grid>
                            <Grid item xs={12} sm={2}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Objective</InputLabel>
                                    <Select value={objective} onChange={(e) => setObjective(e.target.value)} label="Objective">
                                        <MenuItem value="minimize_cost">Minimize Cost</MenuItem>
                                        <MenuItem value="maximize_preference">Maximize Preference</MenuItem>
                                        <MenuItem value="balanced">Balanced</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={2}>
                                <TextField fullWidth size="small" label="Plan Title" value={title}
                                    onChange={(e) => setTitle(e.target.value)} />
                            </Grid>
                            <Grid item xs={12} sm={2}>
                                <Button fullWidth variant="contained" startIcon={generating ? <CircularProgress size={20} /> : <PlayArrowIcon />}
                                    onClick={handleGenerate} disabled={!selectedCookbook || generating}>
                                    {generating ? 'Generating...' : 'Generate'}
                                </Button>
                            </Grid>
                        </Grid>
                    </Paper>

                    {/* Existing Plans */}
                    {plans.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 6 }}>
                            <Typography variant="h6" color="text.secondary">No meal plans yet. Generate one above!</Typography>
                        </Box>
                    ) : plans.map((plan) => {
                        const calendarState = resolveMealPlanCalendarState(plan.slots);
                        const dayGroups = calendarState.dayGroups || {};
                        return (
                            <Paper key={plan.id} sx={{ p: 3, mb: 3 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                    <Box>
                                        <Typography variant="h6">{plan.title || 'Meal Plan'}</Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {new Date(plan.startDate).toLocaleDateString()} – {new Date(plan.endDate).toLocaleDateString()}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        <Chip label={plan.status} size="small" color={plan.status === 'ACTIVE' ? 'success' : 'default'} />
                                        {plan.solverMeta?.feasible && <Chip label="Feasible" size="small" color="info" />}
                                        <Chip label={`$${(plan.totalCost || 0).toFixed(2)}`} size="small" />
                                        <Chip label={`${Math.round(plan.totalCalories || 0)} cal total`} size="small" variant="outlined" />
                                    </Box>
                                </Box>

                                {plan.solverMeta && (
                                    <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
                                        Solved in {(plan.solverMeta.solveTimeMs || 0).toFixed(0)}ms · {plan.solverMeta.totalVariables} vars · {plan.solverMeta.totalConstraints} constraints · Status: {plan.solverMeta.solverStatus}
                                    </Typography>
                                )}

                                {calendarState.status === 'invalid' && (
                                    <Alert severity="warning" sx={{ mb: 2 }}>
                                        {calendarState.error.message}
                                    </Alert>
                                )}

                                {calendarState.status === 'empty' && (
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                        No scheduled meals in this plan yet.
                                    </Typography>
                                )}

                                {Object.entries(dayGroups).map(([day, slots]) => (
                                    <Box key={day} sx={{ mb: 2 }}>
                                        <Typography variant="subtitle2" sx={{ mb: 1 }}>Day {day}</Typography>
                                        <TableContainer>
                                            <Table size="small">
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell>Meal</TableCell>
                                                        <TableCell>Recipe</TableCell>
                                                        <TableCell align="right">Servings</TableCell>
                                                        <TableCell align="right">Calories</TableCell>
                                                        <TableCell align="right">Protein</TableCell>
                                                        <TableCell align="right">Cost</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {slots.map((slot) => (
                                                        <TableRow key={slot.id}>
                                                            <TableCell><Chip label={slot.mealType} size="small" /></TableCell>
                                                            <TableCell>{slot.recipe?.recipeName || '—'}</TableCell>
                                                            <TableCell align="right">{slot.servings}</TableCell>
                                                            <TableCell align="right">{Math.round(slot.nutritionPerServing?.calories * slot.servings || 0)}</TableCell>
                                                            <TableCell align="right">{Math.round(slot.nutritionPerServing?.protein * slot.servings || 0)}g</TableCell>
                                                            <TableCell align="right">${(slot.costPerServing * slot.servings || 0).toFixed(2)}</TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    </Box>
                                ))}
                            </Paper>
                        );
                    })}

            <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
                <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
            </Snackbar>
            </MainLayout>
        </ProtectedRoute>
    );
}
