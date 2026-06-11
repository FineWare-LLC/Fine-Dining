/**
 * Add Recipe Page - Create new recipes to add to the database
 */
import React, { useState } from 'react';
import {
    Box,
    Container,
    Typography,
    TextField,
    Button,
    Paper,
    Grid,
    Chip,
    Stack,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    IconButton,
    Alert,
    Snackbar,
    Divider,
    InputAdornment,
} from '@mui/material';
import {
    Add as AddIcon,
    Delete as DeleteIcon,
    CloudUpload as UploadIcon,
    Restaurant as RestaurantIcon,
} from '@mui/icons-material';
import Head from 'next/head';
import { useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client';
import MainLayout from '@/components/Layout/MainLayout';

const CREATE_RECIPE_MUTATION = gql`
    mutation CreateRecipe(
        $recipeName: String!
        $ingredients: [String]!
        $instructions: String!
        $prepTime: Int!
        $difficulty: Difficulty
        $nutritionFacts: String
        $tags: [String]
        $images: [String]
        $estimatedCost: Float
    ) {
        createRecipe(
            recipeName: $recipeName
            ingredients: $ingredients
            instructions: $instructions
            prepTime: $prepTime
            difficulty: $difficulty
            nutritionFacts: $nutritionFacts
            tags: $tags
            images: $images
            estimatedCost: $estimatedCost
        ) {
            id
            recipeName
        }
    }
`;

export default function AddRecipePage() {
    const [formData, setFormData] = useState({
        recipeName: '',
        ingredients: [''],
        instructions: '',
        prepTime: 30,
        difficulty: 'EASY',
        tags: [],
        estimatedCost: '',
        nutritionFacts: '',
    });
    const [newTag, setNewTag] = useState('');
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const [createRecipe, { loading }] = useMutation(CREATE_RECIPE_MUTATION, {
        onCompleted: (data) => {
            setSnackbar({
                open: true,
                message: `Recipe "${data.createRecipe.recipeName}" created successfully!`,
                severity: 'success',
            });
            // Reset form
            setFormData({
                recipeName: '',
                ingredients: [''],
                instructions: '',
                prepTime: 30,
                difficulty: 'EASY',
                tags: [],
                estimatedCost: '',
                nutritionFacts: '',
            });
        },
        onError: (error) => {
            setSnackbar({
                open: true,
                message: `Error: ${error.message}`,
                severity: 'error',
            });
        },
    });

    const handleInputChange = (field) => (event) => {
        setFormData({ ...formData, [field]: event.target.value });
    };

    const handleIngredientChange = (index) => (event) => {
        const newIngredients = [...formData.ingredients];
        newIngredients[index] = event.target.value;
        setFormData({ ...formData, ingredients: newIngredients });
    };

    const addIngredient = () => {
        setFormData({ ...formData, ingredients: [...formData.ingredients, ''] });
    };

    const removeIngredient = (index) => {
        const newIngredients = formData.ingredients.filter((_, i) => i !== index);
        setFormData({ ...formData, ingredients: newIngredients.length ? newIngredients : [''] });
    };

    const addTag = () => {
        if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
            setFormData({ ...formData, tags: [...formData.tags, newTag.trim()] });
            setNewTag('');
        }
    };

    const removeTag = (tagToRemove) => {
        setFormData({ ...formData, tags: formData.tags.filter(tag => tag !== tagToRemove) });
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        
        const variables = {
            recipeName: formData.recipeName,
            ingredients: formData.ingredients.filter(i => i.trim()),
            instructions: formData.instructions,
            prepTime: parseInt(formData.prepTime, 10),
            difficulty: formData.difficulty,
            tags: formData.tags,
            estimatedCost: formData.estimatedCost ? parseFloat(formData.estimatedCost) : null,
            nutritionFacts: formData.nutritionFacts || null,
            images: [],
        };

        createRecipe({ variables });
    };

    return (
        <MainLayout title="Add Recipe - Fine Dining">
            <Head>
                <meta name="description" content="Add a new recipe to your cookbook" />
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
                        <RestaurantIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
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
                            Add New Recipe
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Share your culinary creations with the community
                        </Typography>
                    </Box>

                    {/* Form */}
                    <Paper
                        component="form"
                        onSubmit={handleSubmit}
                        elevation={0}
                        sx={{
                            p: 4,
                            borderRadius: 3,
                            backgroundColor: 'rgba(255,255,255,0.9)',
                            backdropFilter: 'blur(10px)',
                        }}
                    >
                        <Grid container spacing={3}>
                            {/* Recipe Name */}
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Recipe Name"
                                    value={formData.recipeName}
                                    onChange={handleInputChange('recipeName')}
                                    required
                                    placeholder="e.g., Grandma's Famous Pasta"
                                />
                            </Grid>

                            {/* Prep Time & Difficulty */}
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Prep Time"
                                    type="number"
                                    value={formData.prepTime}
                                    onChange={handleInputChange('prepTime')}
                                    required
                                    InputProps={{
                                        endAdornment: <InputAdornment position="end">minutes</InputAdornment>,
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth>
                                    <InputLabel>Difficulty</InputLabel>
                                    <Select
                                        value={formData.difficulty}
                                        label="Difficulty"
                                        onChange={handleInputChange('difficulty')}
                                    >
                                        <MenuItem value="EASY">Easy</MenuItem>
                                        <MenuItem value="INTERMEDIATE">Intermediate</MenuItem>
                                        <MenuItem value="HARD">Hard</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            {/* Estimated Cost */}
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Estimated Cost"
                                    type="number"
                                    value={formData.estimatedCost}
                                    onChange={handleInputChange('estimatedCost')}
                                    InputProps={{
                                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                                    }}
                                    placeholder="0.00"
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <Divider sx={{ my: 1 }} />
                            </Grid>

                            {/* Ingredients */}
                            <Grid item xs={12}>
                                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                                    Ingredients
                                </Typography>
                                {formData.ingredients.map((ingredient, index) => (
                                    <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            value={ingredient}
                                            onChange={handleIngredientChange(index)}
                                            placeholder={`Ingredient ${index + 1}`}
                                        />
                                        <IconButton
                                            onClick={() => removeIngredient(index)}
                                            disabled={formData.ingredients.length === 1}
                                            color="error"
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </Box>
                                ))}
                                <Button
                                    startIcon={<AddIcon />}
                                    onClick={addIngredient}
                                    size="small"
                                    sx={{ mt: 1 }}
                                >
                                    Add Ingredient
                                </Button>
                            </Grid>

                            {/* Instructions */}
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Instructions"
                                    value={formData.instructions}
                                    onChange={handleInputChange('instructions')}
                                    required
                                    multiline
                                    rows={6}
                                    placeholder="Step-by-step cooking instructions..."
                                />
                            </Grid>

                            {/* Tags */}
                            <Grid item xs={12}>
                                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                                    Tags
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                                    <TextField
                                        size="small"
                                        value={newTag}
                                        onChange={(e) => setNewTag(e.target.value)}
                                        placeholder="Add a tag"
                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                                    />
                                    <Button onClick={addTag} variant="outlined" size="small">
                                        Add
                                    </Button>
                                </Box>
                                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                    {formData.tags.map((tag) => (
                                        <Chip
                                            key={tag}
                                            label={tag}
                                            onDelete={() => removeTag(tag)}
                                            size="small"
                                            sx={{ mb: 1 }}
                                        />
                                    ))}
                                </Stack>
                            </Grid>

                            {/* Nutrition Facts */}
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Nutrition Facts (optional)"
                                    value={formData.nutritionFacts}
                                    onChange={handleInputChange('nutritionFacts')}
                                    multiline
                                    rows={3}
                                    placeholder="Calories, protein, carbs, etc."
                                />
                            </Grid>

                            {/* Submit */}
                            <Grid item xs={12}>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    size="large"
                                    fullWidth
                                    disabled={loading || !formData.recipeName || !formData.instructions}
                                    sx={{
                                        py: 1.5,
                                        background: 'linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)',
                                        '&:hover': {
                                            background: 'linear-gradient(135deg, #E55A2B 0%, #E8820D 100%)',
                                        },
                                    }}
                                >
                                    {loading ? 'Creating...' : 'Create Recipe'}
                                </Button>
                            </Grid>
                        </Grid>
                    </Paper>
                </Container>
            </Box>

            {/* Feedback Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={5000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    severity={snackbar.severity}
                    variant="filled"
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </MainLayout>
    );
}
