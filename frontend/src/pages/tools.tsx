// @ts-nocheck
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import LocalDrinkRoundedIcon from '@mui/icons-material/LocalDrinkRounded';
import MonitorWeightRoundedIcon from '@mui/icons-material/MonitorWeightRounded';
import ShoppingCartRoundedIcon from '@mui/icons-material/ShoppingCartRounded';
import SoupKitchenRoundedIcon from '@mui/icons-material/SoupKitchenRounded';
import { Alert, Box, Button, Chip, CircularProgress, Grid, LinearProgress, Paper, TextField, Typography } from '@mui/material';
import Head from 'next/head';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { usePlannerStore } from '@/components/legacy/PlannerCanvas/store/plannerStore';
import { useAuth } from '@/context/AuthContext';
import { resolvePantryAwareGroceryList } from '@/utils/pantryAwareness';
import { resolveGroceryListAggregation } from '@/utils/shoppingListAggregation';
import {
    buildPriceEstimationFeedbackContainerStyles,
    buildPriceEstimationFeedbackState,
    resolvePriceEstimationState,
} from '@/utils/priceEstimationFeedback';
import {
    buildAffiliateLinkSeparationFeedbackContainerStyles,
    buildAffiliateLinkSeparationFeedbackState,
    resolveAffiliateLinkSeparationState,
} from '@/utils/affiliateLinkSeparationFeedback';
import {
    buildStorePreferenceFeedbackContainerStyles,
    buildStorePreferenceFeedbackState,
    resolveStorePreferenceState,
} from '@/utils/storePreferenceFeedback';
import {
    buildGroceryListAggregationFeedbackState,
    buildPantryAwareGroceryListFeedbackState,
} from '@/utils/shoppingListFeedback';
import {
    buildSubstitutionSuggestionsFeedbackContainerStyles,
    buildSubstitutionSuggestionsFeedbackState,
    resolveSubstitutionSuggestions,
} from '@/utils/substitutionSuggestions';
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

function getSubstitutionSuggestionsMessageColor(state) {
    if (state === 'error') {
        return '#FFB3A7';
    }

    if (state === 'success') {
        return '#C6E8C5';
    }

    return 'rgba(255,255,255,0.78)';
}

function getPriceEstimationMessageColor(state) {
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

function getAffiliateLinkSeparationMessageColor(state) {
    if (state === 'error') {
        return '#FFB3A7';
    }

    if (state === 'success') {
        return '#C6E8C5';
    }

    return 'rgba(255,255,255,0.78)';
}

function getStorePreferenceMessageColor(state) {
    if (state === 'error') {
        return '#FFB3A7';
    }

    if (state === 'success') {
        return '#C6E8C5';
    }

    return 'rgba(255,255,255,0.78)';
}

function buildSubstitutionCandidateSearchText(candidate) {
    return [
        candidate?.mealName,
        candidate?.recipeName,
        candidate?.name,
        candidate?.label,
        candidate?.description,
        ...(Array.isArray(candidate?.ingredients) ? candidate.ingredients : []),
    ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
}

export default function ToolsPage() {
    const { user } = useAuth();
    const selectedMeals = usePlannerStore((state) => state.selectedMeals);
    const isGenerating = usePlannerStore((state) => state.isGenerating);
    const [pantryItem, setPantryItem] = useState('');
    const [pantry, setPantry] = useState(() => [...DEFAULT_PANTRY_ITEMS]);
    const [pantryLoaded, setPantryLoaded] = useState(false);
    const [substitutionIngredient, setSubstitutionIngredient] = useState('');
    const [submittedSubstitutionIngredient, setSubmittedSubstitutionIngredient] = useState('');
    const [substitutionResult, setSubstitutionResult] = useState(null);
    const [substitutionSearchPending, setSubstitutionSearchPending] = useState(false);
    const substitutionSearchTimeoutRef = useRef(null);
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
    const priceEstimationState = useMemo(
        () => resolvePriceEstimationState(selectedMeals),
        [selectedMeals],
    );
    const priceFeedbackState = useMemo(
        () => buildPriceEstimationFeedbackState({
            isLoading: isGenerating,
            locked,
            priceEstimationState,
        }),
        [isGenerating, locked, priceEstimationState],
    );
    const groceryActionHref = groceryFeedbackState.actionKind
        ? GROCERY_ACTION_HREFS[groceryFeedbackState.actionKind] || null
        : null;
    const pantryActionHref = pantryFeedbackState?.actionKind
        ? GROCERY_ACTION_HREFS[pantryFeedbackState.actionKind] || null
        : null;
    const priceActionHref = priceFeedbackState?.actionKind
        ? GROCERY_ACTION_HREFS[priceFeedbackState.actionKind] || null
        : null;
    const affiliateLinkSeparationState = useMemo(
        () => resolveAffiliateLinkSeparationState(selectedMeals),
        [selectedMeals],
    );
    const affiliateLinkFeedbackState = useMemo(
        () => buildAffiliateLinkSeparationFeedbackState({
            isLoading: isGenerating,
            affiliateLinkSeparationState,
        }),
        [affiliateLinkSeparationState, isGenerating],
    );
    const affiliateLinkFeedbackStyles = useMemo(
        () => buildAffiliateLinkSeparationFeedbackContainerStyles(affiliateLinkFeedbackState.state),
        [affiliateLinkFeedbackState.state],
    );
    const storePreferenceState = useMemo(
        () => resolveStorePreferenceState(selectedMeals),
        [selectedMeals],
    );
    const storePreferenceFeedbackState = useMemo(
        () => buildStorePreferenceFeedbackState({
            isLoading: isGenerating,
            storePreferenceState,
        }),
        [isGenerating, storePreferenceState],
    );
    const storePreferenceFeedbackStyles = useMemo(
        () => buildStorePreferenceFeedbackContainerStyles(storePreferenceFeedbackState.state),
        [storePreferenceFeedbackState.state],
    );
    const storePreferenceActionHref = storePreferenceFeedbackState?.actionKind
        ? GROCERY_ACTION_HREFS[storePreferenceFeedbackState.actionKind] || null
        : null;
    const affiliateLinkActionHref = affiliateLinkFeedbackState.actionKind
        ? GROCERY_ACTION_HREFS[affiliateLinkFeedbackState.actionKind] || null
        : null;
    const substitutionCandidates = useMemo(() => {
        const pantryCandidates = pantry.map((item, index) => ({
            id: `pantry-${index}-${item.toLowerCase().replace(/\s+/g, '-')}`,
            mealName: item,
            allergens: [],
            dietaryTags: [],
            ingredients: [item],
        }));

        const groceryCandidates = groceryItems.map((item) => ({
            id: `grocery-${item.normalizedName}-${item.unit}`,
            mealName: item.name,
            allergens: [],
            dietaryTags: [],
            ingredients: [item.name],
        }));

        return [...pantryCandidates, ...groceryCandidates];
    }, [groceryItems, pantry]);
    const normalizedSubstitutionIngredient = substitutionIngredient.trim().toLowerCase();
    const matchingSubstitutionCandidates = useMemo(() => {
        if (!normalizedSubstitutionIngredient) {
            return [];
        }

        return substitutionCandidates.filter((candidate) => (
            buildSubstitutionCandidateSearchText(candidate).includes(normalizedSubstitutionIngredient)
        ));
    }, [normalizedSubstitutionIngredient, substitutionCandidates]);
    const substitutionSuggestionsState = useMemo(
        () => buildSubstitutionSuggestionsFeedbackState({
            isLoading: substitutionSearchPending,
            suggestionsState: substitutionResult,
            missingIngredient: submittedSubstitutionIngredient,
        }),
        [submittedSubstitutionIngredient, substitutionResult, substitutionSearchPending],
    );
    const substitutionFeedbackStyles = useMemo(
        () => buildSubstitutionSuggestionsFeedbackContainerStyles(substitutionSuggestionsState.state),
        [substitutionSuggestionsState.state],
    );
    const substitutionSuggestions = substitutionResult?.status === 'resolved'
        ? substitutionResult.items
        : [];

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

    useEffect(() => () => {
        if (substitutionSearchTimeoutRef.current !== null) {
            clearTimeout(substitutionSearchTimeoutRef.current);
            substitutionSearchTimeoutRef.current = null;
        }
    }, []);

    const addPantry = () => {
        const canonicalPantryItem = normalizePantryItems([pantryItem])[0];

        if (!canonicalPantryItem) return;

        setPantry((items) => [canonicalPantryItem, ...items].slice(0, 20));
        setPantryItem('');
    };

    const resetSubstitutionSearch = () => {
        if (substitutionSearchTimeoutRef.current !== null) {
            clearTimeout(substitutionSearchTimeoutRef.current);
            substitutionSearchTimeoutRef.current = null;
        }

        setSubstitutionIngredient('');
        setSubmittedSubstitutionIngredient('');
        setSubstitutionResult(null);
        setSubstitutionSearchPending(false);
    };

    const findSubstitutionSuggestions = () => {
        const trimmedIngredient = substitutionIngredient.trim();

        if (!trimmedIngredient) {
            resetSubstitutionSearch();
            return;
        }

        if (substitutionSearchTimeoutRef.current !== null) {
            clearTimeout(substitutionSearchTimeoutRef.current);
        }

        setSubmittedSubstitutionIngredient(trimmedIngredient);
        setSubstitutionSearchPending(true);
        substitutionSearchTimeoutRef.current = setTimeout(() => {
            setSubstitutionResult(resolveSubstitutionSuggestions({
                missingIngredient: trimmedIngredient,
                user: user || {},
                candidates: matchingSubstitutionCandidates,
            }));
            setSubstitutionSearchPending(false);
            substitutionSearchTimeoutRef.current = null;
        }, 0);
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
                    <Grid item xs={12}>
                        <Paper
                            sx={{
                                p: 3,
                                bgcolor: '#1C1815',
                                border: '1px solid rgba(255,255,255,0.08)',
                                ...storePreferenceFeedbackStyles,
                            }}
                        >
                            <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: '1.25rem' }}>Store preference</Typography>
                            <Typography sx={{ color: 'rgba(255,255,255,0.72)', mt: 0.5 }}>
                                Preferred stores steer shopping links and price estimates toward where you actually shop.
                            </Typography>
                            <Box
                                role={storePreferenceFeedbackState.role}
                                aria-live={storePreferenceFeedbackState.ariaLive}
                                aria-busy={storePreferenceFeedbackState.ariaBusy}
                                aria-atomic="true"
                                sx={{
                                    mt: 2,
                                    minHeight: storePreferenceFeedbackState.minHeight + 88,
                                    p: 2,
                                    borderRadius: 2,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 1.5,
                                }}
                            >
                                <Box sx={{ display: 'flex', gap: 1.5, alignItems: storePreferenceFeedbackState.showSpinner ? 'center' : 'flex-start' }}>
                                    {storePreferenceFeedbackState.showSpinner && <CircularProgress size={18} />}
                                    <Box sx={{ minWidth: 0, flex: 1 }}>
                                        {storePreferenceFeedbackState.title && (
                                            <Typography sx={{ color: '#fff', fontWeight: 800 }}>
                                                {storePreferenceFeedbackState.title}
                                            </Typography>
                                        )}
                                        {storePreferenceFeedbackState.state === 'error' ? (
                                            <Alert severity="error" sx={{ mt: 0.5 }}>
                                                {storePreferenceFeedbackState.message}
                                            </Alert>
                                        ) : (
                                            <Typography sx={{ color: getStorePreferenceMessageColor(storePreferenceFeedbackState.state) }}>
                                                {storePreferenceFeedbackState.message}
                                            </Typography>
                                        )}
                                    </Box>
                                    {storePreferenceFeedbackState.actionLabel && storePreferenceActionHref && (
                                        <Button
                                            href={storePreferenceActionHref}
                                            variant={storePreferenceFeedbackState.state === 'error' ? 'contained' : 'outlined'}
                                            size="small"
                                        >
                                            {storePreferenceFeedbackState.actionLabel}
                                        </Button>
                                    )}
                                </Box>
                                {storePreferenceFeedbackState.state === 'success' ? (
                                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                        <Chip
                                            label={storePreferenceState.preferredStore}
                                            sx={{ bgcolor: 'rgba(255,255,255,0.12)', color: '#fff' }}
                                        />
                                        <Chip
                                            label={`${storePreferenceState.matchedMealCount} of ${storePreferenceState.totalMealCount} ${storePreferenceState.totalMealCount === 1 ? 'meal' : 'meals'} matched`}
                                            sx={{ bgcolor: 'rgba(255,255,255,0.12)', color: '#fff' }}
                                        />
                                        {storePreferenceState.labeledMealCount > storePreferenceState.matchedMealCount && (
                                            <Chip
                                                label={`${storePreferenceState.labeledMealCount - storePreferenceState.matchedMealCount} ${storePreferenceState.labeledMealCount - storePreferenceState.matchedMealCount === 1 ? 'meal' : 'meals'} use a different store`}
                                                sx={{ bgcolor: 'rgba(255,255,255,0.12)', color: '#fff' }}
                                            />
                                        )}
                                        {storePreferenceState.missingMealCount > 0 && (
                                            <Chip
                                                label={`${storePreferenceState.missingMealCount} ${storePreferenceState.missingMealCount === 1 ? 'meal' : 'meals'} still need a store label`}
                                                sx={{ bgcolor: 'rgba(255,255,255,0.12)', color: '#fff' }}
                                            />
                                        )}
                                    </Box>
                                ) : null}
                            </Box>
                        </Paper>
                    </Grid>
                    <Grid item xs={12}>
                        <Paper sx={{ p: 3, bgcolor: '#1C1815', border: '1px solid rgba(255,255,255,0.08)' }}>
                            <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: '1.25rem' }}>Spend estimate</Typography>
                            <Typography sx={{ color: 'rgba(255,255,255,0.72)', mt: 0.5 }}>
                                Estimate your grocery spend from the current meal plan and surface fallback pricing when data is incomplete.
                            </Typography>
                            <Box
                                role={priceFeedbackState.role}
                                aria-live={priceFeedbackState.ariaLive}
                                aria-busy={priceFeedbackState.ariaBusy}
                                aria-atomic="true"
                                sx={{
                                    mt: 2,
                                    minHeight: priceFeedbackState.minHeight + 88,
                                    p: 2,
                                    borderRadius: 2,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 1.5,
                                    ...buildPriceEstimationFeedbackContainerStyles(priceFeedbackState.state),
                                }}
                            >
                                <Box sx={{ display: 'flex', gap: 1.5, alignItems: priceFeedbackState.showSpinner ? 'center' : 'flex-start' }}>
                                    {priceFeedbackState.showSpinner && <CircularProgress size={18} />}
                                    <Box sx={{ minWidth: 0, flex: 1 }}>
                                        {priceFeedbackState.title && (
                                            <Typography sx={{ color: '#fff', fontWeight: 800 }}>
                                                {priceFeedbackState.title}
                                            </Typography>
                                        )}
                                        {priceFeedbackState.state === 'error' ? (
                                            <Alert severity="error" sx={{ mt: 0.5 }}>
                                                {priceFeedbackState.message}
                                            </Alert>
                                        ) : (
                                            <Typography sx={{ color: getPriceEstimationMessageColor(priceFeedbackState.state) }}>
                                                {priceFeedbackState.message}
                                            </Typography>
                                        )}
                                    </Box>
                                    {priceFeedbackState.actionLabel && priceActionHref && (
                                        <Button
                                            href={priceActionHref}
                                            variant={priceFeedbackState.state === 'error' ? 'contained' : 'outlined'}
                                            size="small"
                                        >
                                            {priceFeedbackState.actionLabel}
                                        </Button>
                                    )}
                                </Box>
                                {priceFeedbackState.state === 'success' && priceEstimationState.status === 'resolved' ? (
                                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                        <Chip
                                            label={new Intl.NumberFormat('en-US', {
                                                style: 'currency',
                                                currency: priceEstimationState.currency || 'USD',
                                            }).format(priceEstimationState.estimatedSpend || 0)}
                                            sx={{ bgcolor: 'rgba(255,255,255,0.12)', color: '#fff' }}
                                        />
                                        <Chip
                                            label={`${priceEstimationState.pricedMealCount} priced ${priceEstimationState.pricedMealCount === 1 ? 'meal' : 'meals'}`}
                                            sx={{ bgcolor: 'rgba(255,255,255,0.12)', color: '#fff' }}
                                        />
                                        {priceEstimationState.fallbackMealCount > 0 && (
                                            <Chip
                                                label={`${priceEstimationState.fallbackMealCount} fallback ${priceEstimationState.fallbackMealCount === 1 ? 'estimate' : 'estimates'}`}
                                                sx={{ bgcolor: 'rgba(255,255,255,0.12)', color: '#fff' }}
                                            />
                                        )}
                                        {priceEstimationState.confidencePercent !== null && (
                                            <Chip
                                                label={`Confidence ${priceEstimationState.confidencePercent}%`}
                                                sx={{ bgcolor: 'rgba(255,255,255,0.12)', color: '#fff' }}
                                            />
                                        )}
                                    </Box>
                                ) : null}
                            </Box>
                        </Paper>
                    </Grid>
                    <Grid item xs={12}>
                        <Paper sx={{ p: 3, bgcolor: '#1C1815', border: '1px solid rgba(255,255,255,0.08)' }}>
                            <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: '1.25rem' }}>Shopping link hygiene</Typography>
                            <Typography sx={{ color: 'rgba(255,255,255,0.72)', mt: 0.5 }}>
                                Keep merchant metadata in purchase options instead of recipe text.
                            </Typography>
                            <Box
                                role={affiliateLinkFeedbackState.role}
                                aria-live={affiliateLinkFeedbackState.ariaLive}
                                aria-busy={affiliateLinkFeedbackState.ariaBusy}
                                aria-atomic="true"
                                sx={{
                                    mt: 2,
                                    minHeight: affiliateLinkFeedbackState.minHeight + 88,
                                    p: 2,
                                    borderRadius: 2,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 1.5,
                                    ...affiliateLinkFeedbackStyles,
                                }}
                            >
                                <Box sx={{ display: 'flex', gap: 1.5, alignItems: affiliateLinkFeedbackState.showSpinner ? 'center' : 'flex-start' }}>
                                    {affiliateLinkFeedbackState.showSpinner && <CircularProgress size={18} />}
                                    <Box sx={{ minWidth: 0, flex: 1 }}>
                                        {affiliateLinkFeedbackState.title && (
                                            <Typography sx={{ color: '#fff', fontWeight: 800 }}>
                                                {affiliateLinkFeedbackState.title}
                                            </Typography>
                                        )}
                                        {affiliateLinkFeedbackState.state === 'error' ? (
                                            <Alert severity="error" sx={{ mt: 0.5 }}>
                                                {affiliateLinkFeedbackState.message}
                                            </Alert>
                                        ) : (
                                            <Typography sx={{ color: getAffiliateLinkSeparationMessageColor(affiliateLinkFeedbackState.state) }}>
                                                {affiliateLinkFeedbackState.message}
                                            </Typography>
                                        )}
                                    </Box>
                                    {affiliateLinkFeedbackState.actionLabel && affiliateLinkActionHref && (
                                        <Button
                                            href={affiliateLinkActionHref}
                                            variant={affiliateLinkFeedbackState.state === 'error' ? 'contained' : 'outlined'}
                                            size="small"
                                        >
                                            {affiliateLinkFeedbackState.actionLabel}
                                        </Button>
                                    )}
                                </Box>
                                {affiliateLinkFeedbackState.state === 'success' && affiliateLinkSeparationState.status === 'resolved' ? (
                                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                        <Chip
                                            label={`${affiliateLinkSeparationState.selectedMealCount} ${affiliateLinkSeparationState.selectedMealCount === 1 ? 'meal' : 'meals'} checked`}
                                            sx={{ bgcolor: 'rgba(255,255,255,0.12)', color: '#fff' }}
                                        />
                                        <Chip
                                            label={`${affiliateLinkSeparationState.linkedPurchaseOptionCount} purchase ${affiliateLinkSeparationState.linkedPurchaseOptionCount === 1 ? 'option' : 'options'}`}
                                            sx={{ bgcolor: 'rgba(255,255,255,0.12)', color: '#fff' }}
                                        />
                                    </Box>
                                ) : null}
                            </Box>
                        </Paper>
                    </Grid>
                    <Grid item xs={12}>
                        <Paper sx={{ p: 3, bgcolor: '#1C1815', border: '1px solid rgba(255,255,255,0.08)' }}>
                            <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: '1.25rem' }}>Substitution suggestions</Typography>
                            <Typography sx={{ color: 'rgba(255,255,255,0.72)', mt: 0.5 }}>
                                Search pantry staples and grocery items for practical substitutes when a recipe ingredient is missing.
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, mt: 3, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                                <TextField
                                    fullWidth
                                    sx={{ flex: 1, minWidth: { xs: '100%', sm: 280 } }}
                                    label="Missing ingredient"
                                    placeholder="e.g. chicken or yogurt"
                                    value={substitutionIngredient}
                                    onChange={(event) => setSubstitutionIngredient(event.target.value)}
                                />
                                <Button
                                    variant="contained"
                                    onClick={findSubstitutionSuggestions}
                                    disabled={!normalizedSubstitutionIngredient || substitutionSearchPending}
                                >
                                    Find substitutes
                                </Button>
                                <Button
                                    variant="outlined"
                                    onClick={resetSubstitutionSearch}
                                    disabled={
                                        !substitutionIngredient
                                        && !submittedSubstitutionIngredient
                                        && !substitutionResult
                                        && !substitutionSearchPending
                                    }
                                >
                                    Clear
                                </Button>
                            </Box>
                            <Box
                                role={substitutionSuggestionsState.role}
                                aria-live={substitutionSuggestionsState.ariaLive}
                                aria-busy={substitutionSuggestionsState.ariaBusy}
                                aria-atomic="true"
                                sx={{
                                    mt: 2,
                                    minHeight: substitutionSuggestionsState.minHeight + 88,
                                    p: 2,
                                    borderRadius: 2,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 1.5,
                                    ...substitutionFeedbackStyles,
                                }}
                            >
                                <Box sx={{ display: 'flex', gap: 1.5, alignItems: substitutionSuggestionsState.showSpinner ? 'center' : 'flex-start' }}>
                                    {substitutionSuggestionsState.showSpinner && <CircularProgress size={18} />}
                                    <Box sx={{ minWidth: 0, flex: 1 }}>
                                        {substitutionSuggestionsState.title && (
                                            <Typography sx={{ color: '#fff', fontWeight: 800 }}>
                                                {substitutionSuggestionsState.title}
                                            </Typography>
                                        )}
                                        {substitutionSuggestionsState.state === 'error' ? (
                                            <Alert severity="error" sx={{ mt: 0.5 }}>
                                                {substitutionSuggestionsState.message}
                                            </Alert>
                                        ) : (
                                            <Typography sx={{ color: getSubstitutionSuggestionsMessageColor(substitutionSuggestionsState.state) }}>
                                                {substitutionSuggestionsState.message}
                                            </Typography>
                                        )}
                                    </Box>
                                </Box>
                                {substitutionSuggestionsState.state === 'success' && substitutionSuggestions.length > 0 ? (
                                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                        {substitutionSuggestions.map((item) => (
                                            <Chip
                                                key={item.id}
                                                label={item.name}
                                                sx={{ bgcolor: 'rgba(255,255,255,0.12)', color: '#fff' }}
                                            />
                                        ))}
                                    </Box>
                                ) : null}
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>
            </MainLayout>
        </ProtectedRoute>
    );
}
