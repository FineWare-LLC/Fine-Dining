// @ts-nocheck
import { useQuery, useMutation } from '@apollo/client/react';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import BookmarkAddIcon from '@mui/icons-material/BookmarkAdd';
import FilterListIcon from '@mui/icons-material/FilterList';
import HomeIcon from '@mui/icons-material/Home';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import LogoutIcon from '@mui/icons-material/Logout';
import SearchIcon from '@mui/icons-material/Search';
import {
    Box, Typography, Container, Grid, Card, CardContent, CardActions,
    Button, TextField, Chip, AppBar, Toolbar, IconButton, InputAdornment,
    FormControl, InputLabel, Select, MenuItem, OutlinedInput, CircularProgress,
    Rating, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Alert,
} from '@mui/material';
import { gql } from 'graphql-tag';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import {
    buildCookbookLibraryFeedbackContainerStyles,
    buildCookbookLibraryFeedbackState,
} from '@/utils/cookbookFeedback';
import { buildCookbookSharingDisplayState } from '@/utils/cookbookSharing';

const SEARCH_RECIPES = gql`
    query SearchRecipesByDiet(
        $diets: [String], $allergenExclusions: [String], $cuisines: [String],
        $mealTypes: [String], $maxPrepTime: Int, $maxDifficulty: String,
        $page: Int, $limit: Int
    ) {
        searchRecipesByDiet(
            diets: $diets, allergenExclusions: $allergenExclusions,
            cuisines: $cuisines, mealTypes: $mealTypes,
            maxPrepTime: $maxPrepTime, maxDifficulty: $maxDifficulty,
            page: $page, limit: $limit
        ) {
            id recipeName servings prepTime cookTime totalTime difficulty
            cuisine dietaryTags allergens tags images estimatedCost costPerServing
            averageRating ratingCount
            nutritionPerServing { calories protein carbohydrates fat fiber }
        }
    }
`;

const GET_COOKBOOKS = gql`
    query GetCookbooksByUser($userId: ID!) {
        getCookbooksByUser(userId: $userId) { id name isPublic entries { recipe { id } } }
    }
`;

const ADD_RECIPE_TO_COOKBOOK = gql`
    mutation AddRecipeToCookbook($cookbookId: ID!, $entry: CookbookEntryInput!) {
        addRecipeToCookbook(cookbookId: $cookbookId, entry: $entry) { id }
    }
`;

const ALLERGENS = ['GLUTEN', 'DAIRY', 'NUTS', 'EGGS', 'SOY', 'SHELLFISH', 'FISH', 'SESAME'];
const DIETS = ['VEGAN', 'VEGETARIAN', 'KETO', 'PALEO', 'GLUTEN_FREE', 'DAIRY_FREE', 'MEDITERRANEAN', 'LOW_CARB'];
const MEAL_TYPES = ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK', 'DESSERT', 'SIDE'];

export default function RecipesPage() {
    const { logout, user } = useAuth();
    const router = useRouter();

    const [filters, setFilters] = useState({
        diets: [], allergenExclusions: [], cuisines: [],
        mealTypes: [], maxPrepTime: null, maxDifficulty: null,
    });
    const [showFilters, setShowFilters] = useState(false);
    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [selectedRecipe, setSelectedRecipe] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const { data, loading } = useQuery(SEARCH_RECIPES, {
        variables: { ...filters, page: 1, limit: 30 },
    });
    const {
        data: cookbooksData,
        loading: cookbooksLoading,
        error: cookbooksError,
        refetch: refetchCookbooks,
    } = useQuery(GET_COOKBOOKS, {
        variables: { userId: user?.id },
        skip: !user?.id,
    });
    const [addRecipeMutation] = useMutation(ADD_RECIPE_TO_COOKBOOK);

    const recipes = data?.searchRecipesByDiet || [];
    const cookbooks = Array.isArray(cookbooksData?.getCookbooksByUser) ? cookbooksData.getCookbooksByUser : [];
    const cookbookFeedback = buildCookbookLibraryFeedbackState({
        isLoading: cookbooksLoading,
        error: cookbooksError,
        cookbooks: cookbooksData?.getCookbooksByUser,
        emptyMessage: 'Create one from your cookbook page to start saving recipes.',
        emptyActionLabel: 'Open cookbooks',
        emptyActionKind: 'open-cookbooks-page',
        errorMessage: 'We could not read your saved recipe state. Please refresh the page.',
    });

    const handleCookbookFeedbackAction = () => {
        if (cookbookFeedback.actionKind === 'retry-cookbooks') {
            refetchCookbooks().catch(() => {});
            return;
        }

        if (cookbookFeedback.actionKind === 'open-cookbooks-page') {
            router.push('/cookbook').catch(() => {});
        }
    };

    const handleAddToCookbook = async (cookbookId) => {
        try {
            await addRecipeMutation({
                variables: {
                    cookbookId,
                    entry: { recipeId: selectedRecipe.id, desiredServings: 1, preferenceScore: 5 },
                },
            });
            setSnackbar({ open: true, message: 'Recipe added to cookbook!', severity: 'success' });
            setAddDialogOpen(false);
        } catch (err) {
            setSnackbar({ open: true, message: err.message, severity: 'error' });
        }
    };

    return (
        <ProtectedRoute allowedRoles={['USER', 'PREMIUM', 'PRO', 'ADMIN']}>
            <Head><title>Browse Recipes - Fine Dining</title></Head>
            <MainLayout>
                <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="h4" sx={{ fontFamily: '"Fraunces", serif', fontWeight: 700, color: '#fff' }}>
                        Browse Recipes
                    </Typography>
                    <IconButton 
                        onClick={() => setShowFilters(!showFilters)}
                        sx={{ 
                            bgcolor: showFilters ? 'primary.main' : 'rgba(255,255,255,0.05)',
                            color: showFilters ? '#14110F' : '#F08E5D',
                            '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                        }}
                    >
                        <FilterListIcon />
                    </IconButton>
                </Box>

                <Box sx={{ mb: 3 }}>
                    <TextField
                        fullWidth
                        placeholder="Search for recipes, ingredients, cuisines..."
                        variant="outlined"
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon sx={{ color: 'rgba(255,255,255,0.3)' }} />
                                </InputAdornment>
                            ),
                            sx: {
                                bgcolor: 'rgba(255,255,255,0.03)',
                                borderRadius: '16px',
                                border: '1px solid rgba(255,255,255,0.06)',
                                '& fieldset': { border: 'none' },
                            }
                        }}
                    />
                </Box>

                {showFilters && (
                        <Box sx={{ mb: 3, p: 2, bgcolor: 'background.paper', borderRadius: 2 }}>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>Dietary Filters</InputLabel>
                                        <Select multiple value={filters.diets}
                                            onChange={(e) => setFilters({ ...filters, diets: e.target.value })}
                                            input={<OutlinedInput label="Dietary Filters" />}
                                            renderValue={(sel) => sel.map((s) => <Chip key={s} label={s} size="small" sx={{ mr: 0.5 }} />)}
                                        >
                                            {DIETS.map((d) => <MenuItem key={d} value={d}>{d}</MenuItem>)}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>Exclude Allergens</InputLabel>
                                        <Select multiple value={filters.allergenExclusions}
                                            onChange={(e) => setFilters({ ...filters, allergenExclusions: e.target.value })}
                                            input={<OutlinedInput label="Exclude Allergens" />}
                                            renderValue={(sel) => sel.map((s) => <Chip key={s} label={s} size="small" color="error" sx={{ mr: 0.5 }} />)}
                                        >
                                            {ALLERGENS.map((a) => <MenuItem key={a} value={a}>{a}</MenuItem>)}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>Meal Type</InputLabel>
                                        <Select multiple value={filters.mealTypes}
                                            onChange={(e) => setFilters({ ...filters, mealTypes: e.target.value })}
                                            input={<OutlinedInput label="Meal Type" />}
                                        >
                                            {MEAL_TYPES.map((m) => <MenuItem key={m} value={m}>{m}</MenuItem>)}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={6} sm={4}>
                                    <TextField fullWidth size="small" label="Max Prep Time (min)" type="number"
                                        value={filters.maxPrepTime || ''}
                                        onChange={(e) => setFilters({ ...filters, maxPrepTime: e.target.value ? parseInt(e.target.value) : null })}
                                    />
                                </Grid>
                                <Grid item xs={6} sm={4}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>Max Difficulty</InputLabel>
                                        <Select value={filters.maxDifficulty || ''}
                                            onChange={(e) => setFilters({ ...filters, maxDifficulty: e.target.value || null })}
                                            label="Max Difficulty"
                                        >
                                            <MenuItem value="">Any</MenuItem>
                                            <MenuItem value="EASY">Easy</MenuItem>
                                            <MenuItem value="INTERMEDIATE">Intermediate</MenuItem>
                                            <MenuItem value="HARD">Hard</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                            </Grid>
                        </Box>
                    )}

                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
                    ) : recipes.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 8 }}>
                            <Typography variant="h6" color="text.secondary">No recipes found. Try adjusting your filters.</Typography>
                        </Box>
                    ) : (
                        <Grid container spacing={3}>
                            {recipes.map((recipe) => (
                                <Grid item xs={12} sm={6} md={4} key={recipe.id}>
                                    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                        <CardContent sx={{ flexGrow: 1 }}>
                                            <Typography variant="h6" gutterBottom noWrap>{recipe.recipeName}</Typography>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                                <Rating value={recipe.averageRating || 0} precision={0.5} readOnly size="small" />
                                                <Typography variant="caption" color="text.secondary">({recipe.ratingCount || 0})</Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                                                <Chip icon={<AccessTimeIcon />} label={`${recipe.totalTime || recipe.prepTime}m`} size="small" />
                                                <Chip label={recipe.difficulty} size="small" color={recipe.difficulty === 'EASY' ? 'success' : recipe.difficulty === 'HARD' ? 'error' : 'warning'} />
                                                {recipe.cuisine && <Chip label={recipe.cuisine} size="small" variant="outlined" />}
                                            </Box>
                                            {recipe.nutritionPerServing && (
                                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                                                    <Chip icon={<LocalFireDepartmentIcon />} label={`${Math.round(recipe.nutritionPerServing.calories)} cal`} size="small" variant="outlined" />
                                                    <Chip label={`${Math.round(recipe.nutritionPerServing.protein)}g protein`} size="small" variant="outlined" />
                                                </Box>
                                            )}
                                            {recipe.dietaryTags?.length > 0 && (
                                                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                                    {recipe.dietaryTags.slice(0, 3).map((tag) => (
                                                        <Chip key={tag} label={tag} size="small" color="info" variant="outlined" />
                                                    ))}
                                                </Box>
                                            )}
                                            {recipe.costPerServing > 0 && (
                                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                                    ${recipe.costPerServing.toFixed(2)} / serving
                                                </Typography>
                                            )}
                                        </CardContent>
                                        <CardActions>
                                            <Button size="small" startIcon={<BookmarkAddIcon />}
                                                onClick={() => { setSelectedRecipe(recipe); setAddDialogOpen(true); }}>
                                                Add to Cookbook
                                            </Button>
                                        </CardActions>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    )}
            {/* Add to Cookbook Dialog */}
            <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)}>
                <DialogTitle>Add &ldquo;{selectedRecipe?.recipeName}&rdquo; to Cookbook</DialogTitle>
                <DialogContent>
                    {cookbookFeedback.state === 'loading' ? (
                        <Box
                            role={cookbookFeedback.role}
                            aria-live={cookbookFeedback.ariaLive}
                            aria-busy={cookbookFeedback.ariaBusy}
                            aria-atomic="true"
                            sx={{
                                py: 4,
                                px: 2,
                                minHeight: cookbookFeedback.minHeight,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 1.25,
                                borderRadius: 1,
                                ...buildCookbookLibraryFeedbackContainerStyles(cookbookFeedback.state),
                            }}
                        >
                            {cookbookFeedback.showSpinner && <CircularProgress />}
                            <Typography variant="body2" color="text.secondary">
                                {cookbookFeedback.message}
                            </Typography>
                        </Box>
                    ) : cookbookFeedback.state === 'error' ? (
                        <Box
                            role={cookbookFeedback.role}
                            aria-live={cookbookFeedback.ariaLive}
                            aria-atomic="true"
                            sx={{
                                py: 4,
                                px: 2,
                                minHeight: cookbookFeedback.minHeight,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 1.25,
                                borderRadius: 1,
                                ...buildCookbookLibraryFeedbackContainerStyles(cookbookFeedback.state),
                            }}
                        >
                            <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                {cookbookFeedback.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 420, textAlign: 'center' }}>
                                {cookbookFeedback.message}
                            </Typography>
                            <Button variant="outlined" size="small" color="error" onClick={handleCookbookFeedbackAction}>
                                {cookbookFeedback.actionLabel}
                            </Button>
                        </Box>
                    ) : cookbookFeedback.state === 'empty' ? (
                        <Box
                            role={cookbookFeedback.role}
                            aria-live={cookbookFeedback.ariaLive}
                            aria-busy={cookbookFeedback.ariaBusy}
                            aria-atomic="true"
                            sx={{
                                py: 4,
                                px: 2,
                                minHeight: cookbookFeedback.minHeight,
                                textAlign: 'center',
                                ...buildCookbookLibraryFeedbackContainerStyles(cookbookFeedback.state),
                            }}
                        >
                            <Typography variant="h6" color="text.secondary" gutterBottom>
                                {cookbookFeedback.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                {cookbookFeedback.message}
                            </Typography>
                            <Button variant="outlined" size="small" onClick={handleCookbookFeedbackAction}>
                                {cookbookFeedback.actionLabel}
                            </Button>
                        </Box>
                    ) : (
                        cookbooks.map((cb) => {
                            const sharingState = buildCookbookSharingDisplayState(cb);

                            return (
                                <Button
                                    key={cb.id}
                                    fullWidth
                                    variant="outlined"
                                    sx={{ mb: 1, justifyContent: 'flex-start', textTransform: 'none' }}
                                    onClick={() => handleAddToCookbook(cb.id)}
                                >
                                    <Box sx={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                                        <Box sx={{ minWidth: 0, textAlign: 'left' }}>
                                            <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                                                {cb.name}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {cb.entries?.length || 0} recipes
                                            </Typography>
                                        </Box>
                                        <Chip
                                            size="small"
                                            label={sharingState.label}
                                            color={sharingState.color}
                                            variant={sharingState.variant}
                                            aria-label={sharingState.ariaLabel}
                                        />
                                    </Box>
                                </Button>
                            );
                        })
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setAddDialogOpen(false)}>Cancel</Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
                <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>{snackbar.message}</Alert>
            </Snackbar>
            </MainLayout>
        </ProtectedRoute>
    );
}
