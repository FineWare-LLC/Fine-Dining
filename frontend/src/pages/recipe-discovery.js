/**
 * Recipe Discovery Page - Tinder-style recipe swiping interface
 * Users can swipe right to save recipes to their cookbook or left to pass
 */
import React, { useState } from 'react';
import {
    Box,
    Container,
    Typography,
    Chip,
    Stack,
    Paper,
    IconButton,
    Snackbar,
    Alert,
} from '@mui/material';
import {
    FilterList as FilterIcon,
    Tune as TuneIcon,
} from '@mui/icons-material';
import Head from 'next/head';
import MainLayout from '@/components/Layout/MainLayout';
import RecipeSwiper from '@/components/RecipeSwiper/RecipeSwiper';

export default function RecipeDiscoveryPage() {
    const [filters, setFilters] = useState({});
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const handleRecipeSaved = (recipe) => {
        setSnackbar({
            open: true,
            message: `Added "${recipe?.recipeName || 'Recipe'}" to your cookbook!`,
            severity: 'success',
        });
    };

    const handleRecipeRejected = () => {
        // Optional: track rejected recipes for better recommendations
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    const dietaryFilters = [
        'Vegetarian',
        'Vegan',
        'Gluten-Free',
        'Keto',
        'Low-Carb',
        'High-Protein',
    ];

    const toggleFilter = (filter) => {
        setFilters(prev => {
            const diets = prev.diets || [];
            if (diets.includes(filter)) {
                return { ...prev, diets: diets.filter(d => d !== filter) };
            }
            return { ...prev, diets: [...diets, filter] };
        });
    };

    return (
        <MainLayout title="Recipe Discovery - Fine Dining">
            <Head>
                <meta name="description" content="Discover new recipes by swiping - save the ones you love to your personal cookbook" />
            </Head>
            
            <Box
                sx={{
                    minHeight: '100vh',
                    pt: 10,
                    pb: 4,
                    background: 'linear-gradient(135deg, #FFF5F0 0%, #FFFFFF 50%, #F0F7FF 100%)',
                }}
            >
                <Container maxWidth="md">
                    {/* Header */}
                    <Box sx={{ textAlign: 'center', mb: 4 }}>
                        <Typography
                            variant="h4"
                            sx={{
                                fontWeight: 700,
                                background: 'linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)',
                                backgroundClip: 'text',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                mb: 1,
                            }}
                        >
                            Discover Recipes
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Swipe right to save, left to pass. Build your perfect cookbook!
                        </Typography>
                    </Box>

                    {/* Filter Chips */}
                    <Paper
                        elevation={0}
                        sx={{
                            p: 2,
                            mb: 3,
                            borderRadius: 3,
                            backgroundColor: 'rgba(255,255,255,0.8)',
                            backdropFilter: 'blur(10px)',
                        }}
                    >
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                            <FilterIcon fontSize="small" color="action" />
                            <Typography variant="subtitle2" color="text.secondary">
                                Quick Filters
                            </Typography>
                        </Stack>
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                            {dietaryFilters.map((filter) => (
                                <Chip
                                    key={filter}
                                    label={filter}
                                    onClick={() => toggleFilter(filter)}
                                    color={filters.diets?.includes(filter) ? 'primary' : 'default'}
                                    variant={filters.diets?.includes(filter) ? 'filled' : 'outlined'}
                                    size="small"
                                    sx={{ mb: 1 }}
                                />
                            ))}
                        </Stack>
                    </Paper>

                    {/* Recipe Swiper */}
                    <Box
                        sx={{
                            height: '600px',
                            position: 'relative',
                            borderRadius: 4,
                            overflow: 'hidden',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
                        }}
                    >
                        <RecipeSwiper
                            initialFilters={filters}
                            onRecipeSaved={handleRecipeSaved}
                            onRecipeRejected={handleRecipeRejected}
                        />
                    </Box>

                    {/* Instructions */}
                    <Box sx={{ textAlign: 'center', mt: 3 }}>
                        <Typography variant="body2" color="text.secondary">
                            💚 Swipe Right or tap Save to add to your cookbook
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            ❌ Swipe Left or tap Pass to skip
                        </Typography>
                    </Box>
                </Container>
            </Box>

            {/* Feedback Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity={snackbar.severity}
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </MainLayout>
    );
}
