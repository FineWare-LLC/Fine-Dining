// @ts-nocheck
import { useQuery, useMutation } from '@apollo/client/react';
import {
    Box, Typography, IconButton, Avatar, Chip, Snackbar, Alert,
    CircularProgress, Slider, TextField, BottomNavigation, BottomNavigationAction, Paper,
} from '@mui/material';
import { gql } from 'graphql-tag';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import {
    buildAuthFeedbackContainerStyles,
    buildFoodDislikeCaptureFeedbackState,
    hasMeaningfulFoodDislikes,
    resolveProfileCompletenessStep,
} from '@/context/authUtils';
import { saveHouseholdSetup } from '@/utils/householdSetup';

const GET_USER_CONSTRAINTS = gql`
    query GetUser($id: ID!) {
        getUser(id: $id) {
            id
            nutritionTargets {
                caloriesMin caloriesMax proteinMin proteinMax
                carbohydratesMin carbohydratesMax fatMin fatMax
                fiberMin fiberMax sugarMax sodiumMax
                cholesterolMax saturatedFatMax ironMin calciumMin
                vitaminCMin vitaminDMin vitaminB12Min potassiumMin
                magnesiumMin zincMin folateMin omega3Min
            }
            dietaryProfile {
                diets allergens excludedIngredients preferredCuisines
                mealsPerDay snacksPerDay dailyBudget maxPrepTimePerMeal maxDifficulty
            }
        }
    }
`;

const UPDATE_USER = gql`
    mutation UpdateUser($id: ID!, $input: UpdateUserInput!) {
        updateUser(id: $id, input: $input) { id }
    }
`;

const ALLERGENS = [
    { key: 'GLUTEN', label: 'Gluten', emoji: '🌾' },
    { key: 'DAIRY', label: 'Dairy', emoji: '🥛' },
    { key: 'NUTS', label: 'Nuts', emoji: '🥜' },
    { key: 'TREE_NUTS', label: 'Tree Nuts', emoji: '🌰' },
    { key: 'EGGS', label: 'Eggs', emoji: '🥚' },
    { key: 'SOY', label: 'Soy', emoji: '🫘' },
    { key: 'SHELLFISH', label: 'Shellfish', emoji: '🦐' },
    { key: 'FISH', label: 'Fish', emoji: '🐟' },
    { key: 'SESAME', label: 'Sesame', emoji: '🫓' },
    { key: 'WHEAT', label: 'Wheat', emoji: '🍞' },
];

const DIETS = [
    { key: 'VEGAN', label: 'Vegan', emoji: '🌱' },
    { key: 'VEGETARIAN', label: 'Vegetarian', emoji: '🥗' },
    { key: 'KETO', label: 'Keto', emoji: '🥑' },
    { key: 'PALEO', label: 'Paleo', emoji: '🍖' },
    { key: 'MEDITERRANEAN', label: 'Mediterranean', emoji: '🫒' },
    { key: 'WHOLE30', label: 'Whole30', emoji: '💪' },
    { key: 'LOW_CARB', label: 'Low Carb', emoji: '🥩' },
    { key: 'HIGH_PROTEIN', label: 'High Protein', emoji: '🏋️' },
    { key: 'DASH', label: 'DASH', emoji: '❤️' },
    { key: 'GLUTEN_FREE', label: 'Gluten Free', emoji: '🚫' },
    { key: 'DAIRY_FREE', label: 'Dairy Free', emoji: '🥥' },
];

const CUISINES = [
    { key: 'Italian', emoji: '🍝' }, { key: 'Mexican', emoji: '🌮' },
    { key: 'Chinese', emoji: '🥡' }, { key: 'Japanese', emoji: '🍣' },
    { key: 'Indian', emoji: '🍛' }, { key: 'Thai', emoji: '🍜' },
    { key: 'French', emoji: '🥐' }, { key: 'Mediterranean', emoji: '🫒' },
    { key: 'Korean', emoji: '🍚' }, { key: 'American', emoji: '🍔' },
    { key: 'Middle Eastern', emoji: '🧆' },
];

const STEPS = ['diet', 'allergens', 'cuisines', 'nutrition', 'lifestyle'];

export default function ConstraintsPage() {
    const { logout, user } = useAuth();
    const router = useRouter();
    const [step, setStep] = useState(0);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [saving, setSaving] = useState(false);

    const [dietary, setDietary] = useState({
        diets: [], allergens: [], excludedIngredients: [], preferredCuisines: [],
        mealsPerDay: 3, snacksPerDay: 1, dailyBudget: null, maxPrepTimePerMeal: null, maxDifficulty: null,
    });
    const [nutrition, setNutrition] = useState({
        caloriesMin: 1800, caloriesMax: 2500, proteinMin: 50, proteinMax: null,
        carbohydratesMin: 0, carbohydratesMax: null, fatMin: 0, fatMax: 78,
        fiberMin: 25, fiberMax: null, sugarMax: null, sodiumMax: null,
        cholesterolMax: null, saturatedFatMax: null,
        ironMin: null, calciumMin: null, vitaminCMin: null, vitaminDMin: null,
    });
    const [excludeInput, setExcludeInput] = useState('');

    const { data, loading, error, refetch } = useQuery(GET_USER_CONSTRAINTS, {
        variables: { id: user?.id }, skip: !user?.id,
    });
    const [updateUserMutation] = useMutation(UPDATE_USER);

    useEffect(() => {
        if (data?.getUser) {
            const u = data.getUser;
            if (u.dietaryProfile) setDietary((prev) => ({ ...prev, ...u.dietaryProfile }));
            if (u.nutritionTargets) setNutrition((prev) => ({ ...prev, ...u.nutritionTargets }));
            setStep((current) => {
                const resumeStep = resolveProfileCompletenessStep(u);
                return current === resumeStep ? current : resumeStep;
            });
        }
    }, [data]);

    const toggleItem = (field, key) => {
        setDietary((prev) => ({
            ...prev,
            [field]: prev[field].includes(key)
                ? prev[field].filter((k) => k !== key)
                : [...prev[field], key],
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const cleaned = {};
            for (const [k, v] of Object.entries(nutrition)) {
                cleaned[k] = v === '' || v === null ? null : Number(v);
            }
            await saveHouseholdSetup({
                updateUser: updateUserMutation,
                userId: user.id,
                dietaryProfile: dietary,
                nutritionTargets: cleaned,
                refetch,
            });
            setSnackbar({ open: true, message: 'Food dislikes saved! 🎉', severity: 'success' });
        } catch (err) {
            setSnackbar({ open: true, message: 'Could not save your food dislikes. Please try again.', severity: 'error' });
        }
        setSaving(false);
    };

    const go = (href) => router.push(href).catch(() => {});
    const firstName = user?.name?.split(' ')[0] || 'there';
    const feedback = buildFoodDislikeCaptureFeedbackState({
        isLoading: loading || saving,
        errorMessage: error ? 'Could not load your food dislikes. Please try again.' : snackbar.open && snackbar.severity === 'error' ? snackbar.message : '',
        successMessage: snackbar.open && snackbar.severity === 'success' ? snackbar.message : '',
        hasFoodDislikes:
            hasMeaningfulFoodDislikes(data?.getUser?.dietaryProfile?.excludedIngredients) ||
            hasMeaningfulFoodDislikes(dietary.excludedIngredients),
        loadingMessage: saving ? 'Saving your food dislikes...' : 'Checking your food dislikes...',
    });
    const feedbackStyles = buildAuthFeedbackContainerStyles(feedback.state);
    const isProfileBusy = loading || saving || !!error;

    const stepTitles = [
        { title: 'What do you eat?', sub: 'Pick any diets that fit your lifestyle' },
        { title: 'Any allergies?', sub: 'Tap anything you need to avoid' },
        { title: 'Favorite cuisines?', sub: 'We\'ll prioritize meals you love' },
        { title: 'Nutrition goals', sub: 'Slide to set your daily targets' },
        { title: 'Almost done!', sub: 'A few more details about your meals' },
    ];

    const chipStyle = (active) => ({
        px: 1.5, py: 2.8,
        fontSize: '0.88rem',
        fontWeight: active ? 600 : 400,
        borderRadius: '14px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        bgcolor: active ? 'rgba(240,142,93,0.18)' : 'rgba(255,255,255,0.04)',
        color: active ? '#F3C767' : 'rgba(255,255,255,0.55)',
        border: active ? '1.5px solid rgba(240,142,93,0.5)' : '1.5px solid rgba(255,255,255,0.08)',
        '&:hover': {
            bgcolor: active ? 'rgba(240,142,93,0.25)' : 'rgba(255,255,255,0.08)',
            borderColor: active ? 'rgba(240,142,93,0.6)' : 'rgba(255,255,255,0.15)',
        },
    });

    const NutritionSlider = ({ label, unit, min, max, value, onChange, color = '#F08E5D' }) => (
        <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography sx={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>
                    {label}
                </Typography>
                <Typography sx={{ fontSize: '0.85rem', color, fontWeight: 600 }}>
                    {value[0]}–{value[1]} {unit}
                </Typography>
            </Box>
            <Slider
                value={value}
                min={min}
                max={max}
                onChange={(_, v) => onChange(v)}
                sx={{
                    color,
                    height: 6,
                    '& .MuiSlider-thumb': {
                        width: 20, height: 20,
                        bgcolor: '#fff',
                        border: `3px solid ${color}`,
                        '&:hover': { boxShadow: `0 0 12px ${color}44` },
                    },
                    '& .MuiSlider-track': { border: 'none' },
                    '& .MuiSlider-rail': { bgcolor: 'rgba(255,255,255,0.08)' },
                }}
            />
        </Box>
    );

    return (
        <ProtectedRoute allowedRoles={['USER', 'PREMIUM', 'PRO', 'ADMIN']}>
            <Head><title>My Preferences - Fine Dining</title></Head>

            <MainLayout>
                <Box sx={{ py: { xs: 2, md: 4 } }}>
                    <Box
                        id="food-dislike-capture-feedback"
                        role={feedback.role}
                        aria-live={feedback.ariaLive}
                        aria-atomic="true"
                        sx={{
                            minHeight: feedback.minHeight,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                            px: 1.5,
                            py: 1,
                            mb: 2,
                            borderRadius: 1.5,
                            ...feedbackStyles,
                        }}
                    >
                        {feedback.showSpinner && <CircularProgress size={18} />}
                        <Typography
                            variant="body2"
                            sx={{
                                color: feedback.state === 'error' ? 'error.main' : feedback.state === 'success' ? 'success.main' : 'text.secondary',
                                fontWeight: feedback.state === 'success' ? 700 : 400,
                            }}
                        >
                            {feedback.message}
                        </Typography>
                    </Box>

                {/* Progress dots */}
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.8, py: 2 }}>
                    {STEPS.map((_, i) => (
                        <Box
                            key={i}
                            onClick={() => setStep(i)}
                            sx={{
                                width: step === i ? 24 : 8, height: 8,
                                borderRadius: 4,
                                bgcolor: i <= step ? '#F08E5D' : 'rgba(255,255,255,0.1)',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                            }}
                        />
                    ))}
                </Box>

                {/* Step Title */}
                <Box sx={{ px: 3, pb: 2.5 }}>
                    <Typography sx={{ fontFamily: '"Fraunces", serif', fontWeight: 700, fontSize: '1.65rem', color: '#fff', lineHeight: 1.2, mb: 0.5 }}>
                        {stepTitles[step].title}
                    </Typography>
                    <Typography sx={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.4)' }}>
                        {stepTitles[step].sub}
                    </Typography>
                </Box>

                {/* Step Content */}
                <Box sx={{ px: 2.5, minHeight: 320, pointerEvents: isProfileBusy ? 'none' : 'auto', opacity: isProfileBusy ? 0.72 : 1 }}>
                    {/* Step 0: Diets */}
                    {step === 0 && (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {DIETS.map((d) => (
                                <Chip
                                    key={d.key}
                                    label={`${d.emoji} ${d.label}`}
                                    onClick={() => toggleItem('diets', d.key)}
                                    sx={chipStyle(dietary.diets.includes(d.key))}
                                />
                            ))}
                        </Box>
                    )}

                    {/* Step 1: Allergens */}
                    {step === 1 && (
                        <Box>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                                {ALLERGENS.map((a) => (
                                    <Chip
                                        key={a.key}
                                        label={`${a.emoji} ${a.label}`}
                                        onClick={() => toggleItem('allergens', a.key)}
                                        sx={chipStyle(dietary.allergens.includes(a.key))}
                                    />
                                ))}
                            </Box>
                            <Typography sx={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', mb: 1 }}>
                                Exclude specific ingredients
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <TextField
                                    fullWidth size="small" placeholder="e.g. cilantro, mushrooms..."
                                    value={excludeInput}
                                    onChange={(e) => setExcludeInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            const val = excludeInput.trim();
                                            if (val && !dietary.excludedIngredients.includes(val)) {
                                                setDietary({ ...dietary, excludedIngredients: [...dietary.excludedIngredients, val] });
                                                setExcludeInput('');
                                            }
                                        }
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: '12px',
                                            bgcolor: 'rgba(255,255,255,0.04)',
                                            color: '#fff',
                                            '& fieldset': { borderColor: 'rgba(255,255,255,0.08)' },
                                            '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.15)' },
                                            '&.Mui-focused fieldset': { borderColor: '#F08E5D' },
                                        },
                                    }}
                                />
                            </Box>
                            {dietary.excludedIngredients.length > 0 && (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1.5 }}>
                                    {dietary.excludedIngredients.map((ing) => (
                                        <Chip
                                            key={ing} label={ing} size="small"
                                            onDelete={() => setDietary({ ...dietary, excludedIngredients: dietary.excludedIngredients.filter((i) => i !== ing) })}
                                            sx={{ bgcolor: 'rgba(244,67,54,0.12)', color: '#ff8a80', borderRadius: '10px', '& .MuiChip-deleteIcon': { color: '#ff8a80' } }}
                                        />
                                    ))}
                                </Box>
                            )}
                        </Box>
                    )}

                    {/* Step 2: Cuisines */}
                    {step === 2 && (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {CUISINES.map((c) => (
                                <Chip
                                    key={c.key}
                                    label={`${c.emoji} ${c.key}`}
                                    onClick={() => toggleItem('preferredCuisines', c.key)}
                                    sx={chipStyle(dietary.preferredCuisines.includes(c.key))}
                                />
                            ))}
                        </Box>
                    )}

                    {/* Step 3: Nutrition */}
                    {step === 3 && (
                        <Box>
                            <NutritionSlider
                                label="Calories" unit="kcal" min={1000} max={4000}
                                value={[nutrition.caloriesMin || 1800, nutrition.caloriesMax || 2500]}
                                onChange={([lo, hi]) => setNutrition({ ...nutrition, caloriesMin: lo, caloriesMax: hi })}
                                color="#F08E5D"
                            />
                            <NutritionSlider
                                label="Protein" unit="g" min={0} max={300}
                                value={[nutrition.proteinMin || 0, nutrition.proteinMax || 200]}
                                onChange={([lo, hi]) => setNutrition({ ...nutrition, proteinMin: lo, proteinMax: hi })}
                                color="#F3C767"
                            />
                            <NutritionSlider
                                label="Carbs" unit="g" min={0} max={500}
                                value={[nutrition.carbohydratesMin || 0, nutrition.carbohydratesMax || 350]}
                                onChange={([lo, hi]) => setNutrition({ ...nutrition, carbohydratesMin: lo, carbohydratesMax: hi })}
                                color="#7FAF7C"
                            />
                            <NutritionSlider
                                label="Fat" unit="g" min={0} max={200}
                                value={[nutrition.fatMin || 0, nutrition.fatMax || 100]}
                                onChange={([lo, hi]) => setNutrition({ ...nutrition, fatMin: lo, fatMax: hi })}
                                color="#E57373"
                            />
                            <NutritionSlider
                                label="Fiber" unit="g" min={0} max={80}
                                value={[nutrition.fiberMin || 0, nutrition.fiberMax || 50]}
                                onChange={([lo, hi]) => setNutrition({ ...nutrition, fiberMin: lo, fiberMax: hi })}
                                color="#81C784"
                            />
                        </Box>
                    )}

                    {/* Step 4: Lifestyle */}
                    {step === 4 && (
                        <Box>
                            {/* Meals per day */}
                            <Box sx={{ mb: 3.5 }}>
                                <Typography sx={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', fontWeight: 500, mb: 1.5 }}>
                                    Meals per day
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    {[1, 2, 3, 4, 5].map((n) => (
                                        <Box
                                            key={n}
                                            onClick={() => setDietary({ ...dietary, mealsPerDay: n })}
                                            sx={{
                                                flex: 1, py: 1.5,
                                                borderRadius: '12px', textAlign: 'center', cursor: 'pointer',
                                                bgcolor: dietary.mealsPerDay === n ? 'rgba(240,142,93,0.18)' : 'rgba(255,255,255,0.04)',
                                                border: dietary.mealsPerDay === n ? '1.5px solid rgba(240,142,93,0.5)' : '1.5px solid rgba(255,255,255,0.08)',
                                                color: dietary.mealsPerDay === n ? '#F3C767' : 'rgba(255,255,255,0.5)',
                                                fontWeight: dietary.mealsPerDay === n ? 700 : 400,
                                                fontSize: '1rem',
                                                transition: 'all 0.2s ease',
                                            }}
                                        >
                                            {n}
                                        </Box>
                                    ))}
                                </Box>
                            </Box>

                            {/* Snacks per day */}
                            <Box sx={{ mb: 3.5 }}>
                                <Typography sx={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', fontWeight: 500, mb: 1.5 }}>
                                    Snacks per day
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    {[0, 1, 2, 3].map((n) => (
                                        <Box
                                            key={n}
                                            onClick={() => setDietary({ ...dietary, snacksPerDay: n })}
                                            sx={{
                                                flex: 1, py: 1.5,
                                                borderRadius: '12px', textAlign: 'center', cursor: 'pointer',
                                                bgcolor: dietary.snacksPerDay === n ? 'rgba(127,175,124,0.18)' : 'rgba(255,255,255,0.04)',
                                                border: dietary.snacksPerDay === n ? '1.5px solid rgba(127,175,124,0.5)' : '1.5px solid rgba(255,255,255,0.08)',
                                                color: dietary.snacksPerDay === n ? '#7FAF7C' : 'rgba(255,255,255,0.5)',
                                                fontWeight: dietary.snacksPerDay === n ? 700 : 400,
                                                fontSize: '1rem',
                                                transition: 'all 0.2s ease',
                                            }}
                                        >
                                            {n}
                                        </Box>
                                    ))}
                                </Box>
                            </Box>

                            {/* Budget */}
                            <Box sx={{ mb: 3.5 }}>
                                <Typography sx={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', fontWeight: 500, mb: 1 }}>
                                    Daily food budget
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    {[
                                        { val: 10, label: '$10' }, { val: 15, label: '$15' },
                                        { val: 20, label: '$20' }, { val: 30, label: '$30' },
                                        { val: null, label: 'Any' },
                                    ].map((b) => (
                                        <Box
                                            key={b.label}
                                            onClick={() => setDietary({ ...dietary, dailyBudget: b.val })}
                                            sx={{
                                                flex: 1, py: 1.5,
                                                borderRadius: '12px', textAlign: 'center', cursor: 'pointer',
                                                bgcolor: dietary.dailyBudget === b.val ? 'rgba(243,199,103,0.18)' : 'rgba(255,255,255,0.04)',
                                                border: dietary.dailyBudget === b.val ? '1.5px solid rgba(243,199,103,0.5)' : '1.5px solid rgba(255,255,255,0.08)',
                                                color: dietary.dailyBudget === b.val ? '#F3C767' : 'rgba(255,255,255,0.5)',
                                                fontWeight: dietary.dailyBudget === b.val ? 700 : 400,
                                                fontSize: '0.85rem',
                                                transition: 'all 0.2s ease',
                                            }}
                                        >
                                            {b.label}
                                        </Box>
                                    ))}
                                </Box>
                            </Box>

                            {/* Max prep time */}
                            <Box sx={{ mb: 3 }}>
                                <Typography sx={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', fontWeight: 500, mb: 1 }}>
                                    Max prep time per meal
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    {[
                                        { val: 15, label: '15min' }, { val: 30, label: '30min' },
                                        { val: 60, label: '1hr' }, { val: null, label: 'Any' },
                                    ].map((t) => (
                                        <Box
                                            key={t.label}
                                            onClick={() => setDietary({ ...dietary, maxPrepTimePerMeal: t.val })}
                                            sx={{
                                                flex: 1, py: 1.5,
                                                borderRadius: '12px', textAlign: 'center', cursor: 'pointer',
                                                bgcolor: dietary.maxPrepTimePerMeal === t.val ? 'rgba(240,142,93,0.18)' : 'rgba(255,255,255,0.04)',
                                                border: dietary.maxPrepTimePerMeal === t.val ? '1.5px solid rgba(240,142,93,0.5)' : '1.5px solid rgba(255,255,255,0.08)',
                                                color: dietary.maxPrepTimePerMeal === t.val ? '#F08E5D' : 'rgba(255,255,255,0.5)',
                                                fontWeight: dietary.maxPrepTimePerMeal === t.val ? 700 : 400,
                                                fontSize: '0.85rem',
                                                transition: 'all 0.2s ease',
                                            }}
                                        >
                                            {t.label}
                                        </Box>
                                    ))}
                                </Box>
                            </Box>
                        </Box>
                    )}
                </Box>

                {/* Navigation Buttons */}
                <Box sx={{ px: 2.5, pt: 3, display: 'flex', gap: 1.5 }}>
                    {step > 0 && (
                        <Box
                            onClick={() => setStep(step - 1)}
                            sx={{
                                flex: 1, py: 1.5,
                                borderRadius: '14px', textAlign: 'center', cursor: 'pointer',
                                border: '1.5px solid rgba(255,255,255,0.1)',
                                color: 'rgba(255,255,255,0.5)',
                                fontSize: '0.95rem', fontWeight: 500,
                                transition: 'all 0.2s ease',
                                '&:hover': { borderColor: 'rgba(255,255,255,0.2)' },
                            }}
                        >
                            Back
                        </Box>
                    )}
                    <Box
                        onClick={() => {
                            if (step < STEPS.length - 1) {
                                setStep(step + 1);
                            } else {
                                handleSave();
                            }
                        }}
                        sx={{
                            flex: step > 0 ? 2 : 1, py: 1.5,
                            borderRadius: '14px', textAlign: 'center', cursor: 'pointer',
                            background: step === STEPS.length - 1
                                ? 'linear-gradient(135deg, #F08E5D, #F3C767)'
                                : 'linear-gradient(135deg, #F08E5D, #D86E3D)',
                            color: step === STEPS.length - 1 ? '#14110F' : '#fff',
                            fontSize: '0.95rem',
                            fontWeight: 700,
                            transition: 'all 0.2s ease',
                            '&:hover': { opacity: 0.9 },
                            '&:active': { transform: 'scale(0.98)' },
                        }}
                    >
                        {saving ? '...' : step === STEPS.length - 1 ? 'Save Preferences ✨' : 'Next'}
                    </Box>
                </Box>

                </Box>
            </MainLayout>

            <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
                <Alert severity={snackbar.severity} sx={{ borderRadius: '12px' }}>{snackbar.message}</Alert>
            </Snackbar>
        </ProtectedRoute>
    );
}
