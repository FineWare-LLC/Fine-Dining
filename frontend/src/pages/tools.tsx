// @ts-nocheck
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import LocalDrinkRoundedIcon from '@mui/icons-material/LocalDrinkRounded';
import MonitorWeightRoundedIcon from '@mui/icons-material/MonitorWeightRounded';
import ShoppingCartRoundedIcon from '@mui/icons-material/ShoppingCartRounded';
import SoupKitchenRoundedIcon from '@mui/icons-material/SoupKitchenRounded';
import { Alert, Box, Button, Chip, CircularProgress, Grid, LinearProgress, Paper, TextField, Typography } from '@mui/material';
import Head from 'next/head';
import React, { useEffect, useMemo, useState } from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { usePlannerStore } from '@/components/legacy/PlannerCanvas/store/plannerStore';
import { useAuth } from '@/context/AuthContext';
import { resolvePantryAwareGroceryList } from '@/utils/pantryAwareness';
import { resolveGroceryListAggregation } from '@/utils/shoppingListAggregation';
import {
    buildGroceryListAggregationFeedbackState,
    buildPantryAwareGroceryListFeedbackState,
} from '@/utils/shoppingListFeedback';
import {
    DEFAULT_PANTRY_ITEMS,
    getPantryStorageAdapter,
    loadPantryItems,
    persistPantryItems,
    normalizePantryItems,
} from '@/utils/pantryStorage';

const toolCards = [
    { title: 'Water', icon: <LocalDrinkRoundedIcon />, value: '5 / 8 cups', progress: 62, tier: 'Free' },
    { title: 'Weight', icon: <MonitorWeightRoundedIcon />, value: '184 lb', progress: 35, tier: 'Free' },
    { title: 'Macros', icon: <SoupKitchenRoundedIcon />, value: '146g protein', progress: 74, tier: 'Free' },
    { title: 'Groceries', icon: <ShoppingCartRoundedIcon />, value: '18 items', progress: 45, tier: 'User' },
];

const GROCERY_ACTION_HREFS = {
    'open-planner': '/planner',
    'refresh-planner': '/planner',
    'upgrade-account': '/account',
};

function getGroceryListSurfaceStyles(state) {
    if (state === 'error') {
        return {
            bgcolor: 'rgba(244, 67, 54, 0.08)',
            border: '1px solid rgba(244, 67, 54, 0.2)',
        };
    }

    if (state === 'success') {
        return {
            bgcolor: 'rgba(76, 175, 80, 0.08)',
            border: '1px solid rgba(76, 175, 80, 0.2)',
        };
    }

    if (state === 'blocked') {
        return {
            bgcolor: 'rgba(243, 199, 103, 0.08)',
            border: '1px solid rgba(243, 199, 103, 0.18)',
        };
    }

    return {
        bgcolor: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
    };
}

function getGroceryListMessageColor(state) {
    if (state === 'error') {
        return '#FFB3A7';
    }

    if (state === 'success') {
        return '#C6E8C5';
    }

    if (state === 'blocked') {
        return '#F3C767';
    }

    return 'rgba(255,255,255,0.78)';
}

export default function ToolsPage() {
    const { user } = useAuth();
    const selectedMeals = usePlannerStore((state) => state.selectedMeals);
    const isGenerating = usePlannerStore((state) => state.isGenerating);
    const [pantryItem, setPantryItem] = useState('');
    const [pantry, setPantry] = useState(() => [...DEFAULT_PANTRY_ITEMS]);
    const [pantryLoaded, setPantryLoaded] = useState(false);
    const tier = user?.subscriptionPlan || 'FREE';
    const locked = tier === 'FREE';

    const groceryAggregationState = useMemo(
        () => resolveGroceryListAggregation(selectedMeals),
        [selectedMeals],
    );
    const groceryFeedbackState = useMemo(
        () => buildGroceryListAggregationFeedbackState({
            isLoading: isGenerating,
            locked,
            aggregationState: groceryAggregationState,
        }),
        [groceryAggregationState, isGenerating, locked],
    );
    const groceryItems = Array.isArray(groceryAggregationState.items) ? groceryAggregationState.items : [];
    const pantryAwareGroceryList = useMemo(
        () => resolvePantryAwareGroceryList(groceryItems, pantry),
        [groceryItems, pantry],
    );
    const pantryAwareItems = pantryAwareGroceryList.status === 'resolved' ? pantryAwareGroceryList.items : [];
    const pantryFeedbackState = useMemo(
        () => buildPantryAwareGroceryListFeedbackState({
            baseFeedbackState: groceryFeedbackState,
            pantryAwareGroceryList,
            groceryItems,
        }),
        [groceryFeedbackState, groceryItems, pantryAwareGroceryList],
    );
    const groceryActionHref = groceryFeedbackState.actionKind
        ? GROCERY_ACTION_HREFS[groceryFeedbackState.actionKind] || null
        : null;
    const pantryActionHref = pantryFeedbackState?.actionKind
        ? GROCERY_ACTION_HREFS[pantryFeedbackState.actionKind] || null
        : null;

    useEffect(() => {
        const pantryStorage = getPantryStorageAdapter();
        setPantry(loadPantryItems(pantryStorage, DEFAULT_PANTRY_ITEMS));
        setPantryLoaded(true);
    }, []);

    useEffect(() => {
        if (!pantryLoaded) {
            return;
        }

        persistPantryItems(getPantryStorageAdapter(), pantry);
    }, [pantry, pantryLoaded]);

    const addPantry = () => {
        const canonicalPantryItem = normalizePantryItems([pantryItem])[0];

        if (!canonicalPantryItem) return;

        setPantry((items) => [canonicalPantryItem, ...items].slice(0, 20));
        setPantryItem('');
    };

    return (
        <ProtectedRoute allowedRoles={['USER', 'PREMIUM', 'PRO', 'ADMIN']}>
            <Head><title>Diet tools - Fine Dining</title></Head>
            <MainLayout>
                <Box sx={{ mb: 4 }}>
                    <Typography sx={{ color: '#F08E5D', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.75rem' }}>Diet suite</Typography>
                    <Typography sx={{ color: '#fff', fontSize: { xs: '2rem', md: '3rem' }, fontWeight: 800, mt: 1 }}>Track, shop, and prep</Typography>
                    <Typography sx={{ color: 'rgba(255,255,255,0.72)', mt: 1 }}>A practical workspace for the daily habits around your meal plan.</Typography>
                </Box>
                <Grid container spacing={3}>
                    {toolCards.map((card) => (
                        <Grid item xs={12} sm={6} md={3} key={card.title}>
                            <Paper sx={{ p: 3, bgcolor: '#1C1815', border: '1px solid rgba(255,255,255,0.08)', minHeight: 170 }}>
                                <Box sx={{ color: '#F08E5D' }}>{card.icon}</Box>
                                <Typography sx={{ color: '#fff', fontWeight: 800, mt: 2 }}>{card.title}</Typography>
                                <Typography sx={{ color: 'rgba(255,255,255,0.74)', mt: 0.5 }}>{card.value}</Typography>
                                <LinearProgress variant="determinate" value={card.progress} sx={{ mt: 2, height: 8, borderRadius: 4 }} />
                                <Chip label={card.tier} size="small" sx={{ mt: 2 }} color={card.tier === 'User' && locked ? 'warning' : 'default'} />
                            </Paper>
                        </Grid>
                    ))}
                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 3, bgcolor: '#1C1815', border: '1px solid rgba(255,255,255,0.08)' }}>
                            <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: '1.25rem' }}>Pantry</Typography>
                            <Typography sx={{ color: 'rgba(255,255,255,0.72)', mt: 0.5 }}>Use pantry staples to guide recipe and grocery recommendations.</Typography>
                            <Box sx={{ display: 'flex', gap: 1, mt: 3 }}>
                                <TextField fullWidth label="Add pantry item" value={pantryItem} onChange={(event) => setPantryItem(event.target.value)} disabled={locked} />
                                <Button variant="contained" onClick={addPantry} disabled={locked} aria-label="Add pantry item"><AddRoundedIcon /></Button>
                            </Box>
                            {locked && <Typography sx={{ color: '#F3C767', mt: 2 }}>Pantry management unlocks on User accounts.</Typography>}
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 3 }}>
                                {pantry.map((item) => <Chip key={item} label={item} sx={{ bgcolor: 'rgba(255,255,255,0.12)', color: '#fff' }} />)}
                            </Box>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 3, bgcolor: '#1C1815', border: '1px solid rgba(255,255,255,0.08)' }}>
                            <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: '1.25rem' }}>Pantry-aware grocery list</Typography>
                            <Typography sx={{ color: 'rgba(255,255,255,0.72)', mt: 0.5 }}>Generated from your plan, then trimmed by pantry staples and nutrition targets.</Typography>
                            <Box
                                role={pantryFeedbackState.role}
                                aria-live={pantryFeedbackState.ariaLive}
                                aria-busy={pantryFeedbackState.ariaBusy}
                                aria-atomic="true"
                                sx={{
                                    mt: 2,
                                    minHeight: pantryFeedbackState.minHeight + 88,
                                    p: 2,
                                    borderRadius: 2,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 1.5,
                                    ...getGroceryListSurfaceStyles(pantryFeedbackState.state),
                                }}
                            >
                                <Box sx={{ display: 'flex', gap: 1.5, alignItems: pantryFeedbackState.showSpinner ? 'center' : 'flex-start' }}>
                                    {pantryFeedbackState.showSpinner && <CircularProgress size={18} />}
                                    <Box sx={{ minWidth: 0, flex: 1 }}>
                                        {pantryFeedbackState.title && (
                                            <Typography sx={{ color: '#fff', fontWeight: 800 }}>
                                                {pantryFeedbackState.title}
                                            </Typography>
                                        )}
                                        <Typography sx={{ color: getGroceryListMessageColor(pantryFeedbackState.state) }}>
                                            {pantryFeedbackState.message}
                                        </Typography>
                                    </Box>
                                    {pantryFeedbackState.actionLabel && pantryActionHref && (
                                        <Button
                                            href={pantryActionHref}
                                            variant={pantryFeedbackState.state === 'error' ? 'contained' : 'outlined'}
                                            size="small"
                                        >
                                            {pantryFeedbackState.actionLabel}
                                        </Button>
                                    )}
                                </Box>
                                {pantryFeedbackState.state === 'success' ? (
                                    pantryAwareItems.length > 0 ? (
                                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                            {pantryAwareItems.map((item) => (
                                                <Chip
                                                    key={`${item.normalizedName}-${item.unit}`}
                                                    label={`${item.name} · ${item.quantity} ${item.unit}`}
                                                    sx={{ bgcolor: 'rgba(255,255,255,0.12)', color: '#fff' }}
                                                />
                                            ))}
                                        </Box>
                                    ) : (
                                        <Typography sx={{ color: 'rgba(255,255,255,0.66)' }}>
                                            Your pantry already covers this grocery list.
                                        </Typography>
                                    )
                                ) : null}
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>
            </MainLayout>
        </ProtectedRoute>
    );
}
