import { useQuery, useMutation, gql } from '@apollo/client';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    Add as AddIcon,
} from '@mui/icons-material';
import {
    Box,
    Typography,
    Paper,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert,
    CircularProgress,
    Chip,
} from '@mui/material';
import React, { useState } from 'react';

// GraphQL Queries
const GET_RECIPES = gql`
  query GetRecipes($page: Int, $limit: Int) {
    getRecipes(page: $page, limit: $limit) {
      id
      recipeName
      difficulty
      prepTime
      estimatedCost
      createdAt
      author {
        id
        name
      }
    }
  }
`;

// GraphQL Mutations
const DELETE_RECIPE = gql`
  mutation DeleteRecipe($id: ID!) {
    deleteRecipe(id: $id)
  }
`;

const CREATE_RECIPE = gql`
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
      difficulty
      prepTime
      estimatedCost
    }
  }
`;

export default function RecipeManagement() {
    const [page, setPage] = useState(1);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingRecipe, setEditingRecipe] = useState(null);
    const [formData, setFormData] = useState({
        recipeName: '',
        ingredients: '',
        instructions: '',
        prepTime: '',
        difficulty: 'EASY',
        nutritionFacts: '',
        tags: '',
        images: '',
        estimatedCost: '',
    });

    const { data, loading, error, refetch } = useQuery(GET_RECIPES, {
        variables: { page, limit: 50 },
    });

    const [deleteRecipe] = useMutation(DELETE_RECIPE, {
        onCompleted: () => refetch(),
    });

    const [createRecipe] = useMutation(CREATE_RECIPE, {
        onCompleted: () => {
            refetch();
            setOpenDialog(false);
            setFormData({
                recipeName: '',
                ingredients: '',
                instructions: '',
                prepTime: '',
                difficulty: 'EASY',
                nutritionFacts: '',
                tags: '',
                images: '',
                estimatedCost: '',
            });
        },
    });

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this recipe?')) {
            await deleteRecipe({ variables: { id } });
        }
    };

    const handleEdit = (recipe) => {
        setEditingRecipe(recipe);
        setFormData({
            recipeName: recipe.recipeName,
            ingredients: recipe.ingredients?.join(', ') || '',
            instructions: recipe.instructions || '',
            prepTime: recipe.prepTime?.toString() || '',
            difficulty: recipe.difficulty || 'EASY',
            nutritionFacts: recipe.nutritionFacts || '',
            tags: recipe.tags?.join(', ') || '',
            images: recipe.images?.join(', ') || '',
            estimatedCost: recipe.estimatedCost?.toString() || '',
        });
        setOpenDialog(true);
    };

    const handleSubmit = async () => {
        const variables = {
            recipeName: formData.recipeName,
            ingredients: formData.ingredients.split(',').map(item => item.trim()).filter(item => item),
            instructions: formData.instructions,
            prepTime: parseInt(formData.prepTime) || 0,
            difficulty: formData.difficulty,
            nutritionFacts: formData.nutritionFacts,
            tags: formData.tags.split(',').map(item => item.trim()).filter(item => item),
            images: formData.images.split(',').map(item => item.trim()).filter(item => item),
            estimatedCost: parseFloat(formData.estimatedCost) || 0,
        };

        await createRecipe({ variables });
    };

    if (loading) return <CircularProgress />;
    if (error) return <Alert severity="error">Error loading recipes: {error.message}</Alert>;

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h5">Recipe Management</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setOpenDialog(true)}
                >
          Add Recipe
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Recipe Name</TableCell>
                            <TableCell>Author</TableCell>
                            <TableCell>Difficulty</TableCell>
                            <TableCell>Prep Time</TableCell>
                            <TableCell>Cost</TableCell>
                            <TableCell>Created</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {data?.getRecipes?.map((recipe) => (
                            <TableRow key={recipe.id}>
                                <TableCell>{recipe.recipeName}</TableCell>
                                <TableCell>{recipe.author?.name || 'Unknown'}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={recipe.difficulty}
                                        color={recipe.difficulty === 'HARD' ? 'error' : recipe.difficulty === 'MEDIUM' ? 'warning' : 'success'}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>{recipe.prepTime} min</TableCell>
                                <TableCell>${recipe.estimatedCost?.toFixed(2) || 'N/A'}</TableCell>
                                <TableCell>{new Date(recipe.createdAt).toLocaleDateString()}</TableCell>
                                <TableCell>
                                    <IconButton onClick={() => handleEdit(recipe)} size="small">
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton onClick={() => handleDelete(recipe.id)} size="small" color="error">
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle>{editingRecipe ? 'Edit Recipe' : 'Add New Recipe'}</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Recipe Name"
                        fullWidth
                        variant="outlined"
                        value={formData.recipeName}
                        onChange={(e) => setFormData({ ...formData, recipeName: e.target.value })}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        margin="dense"
                        label="Ingredients (comma separated)"
                        fullWidth
                        variant="outlined"
                        multiline
                        rows={3}
                        value={formData.ingredients}
                        onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        margin="dense"
                        label="Instructions"
                        fullWidth
                        variant="outlined"
                        multiline
                        rows={4}
                        value={formData.instructions}
                        onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        margin="dense"
                        label="Prep Time (minutes)"
                        type="number"
                        fullWidth
                        variant="outlined"
                        value={formData.prepTime}
                        onChange={(e) => setFormData({ ...formData, prepTime: e.target.value })}
                        sx={{ mb: 2 }}
                    />
                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel>Difficulty</InputLabel>
                        <Select
                            value={formData.difficulty}
                            label="Difficulty"
                            onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                        >
                            <MenuItem value="EASY">Easy</MenuItem>
                            <MenuItem value="MEDIUM">Medium</MenuItem>
                            <MenuItem value="HARD">Hard</MenuItem>
                        </Select>
                    </FormControl>
                    <TextField
                        margin="dense"
                        label="Nutrition Facts"
                        fullWidth
                        variant="outlined"
                        multiline
                        rows={2}
                        value={formData.nutritionFacts}
                        onChange={(e) => setFormData({ ...formData, nutritionFacts: e.target.value })}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        margin="dense"
                        label="Tags (comma separated)"
                        fullWidth
                        variant="outlined"
                        value={formData.tags}
                        onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        margin="dense"
                        label="Images (comma separated URLs)"
                        fullWidth
                        variant="outlined"
                        value={formData.images}
                        onChange={(e) => setFormData({ ...formData, images: e.target.value })}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        margin="dense"
                        label="Estimated Cost ($)"
                        type="number"
                        fullWidth
                        variant="outlined"
                        value={formData.estimatedCost}
                        onChange={(e) => setFormData({ ...formData, estimatedCost: e.target.value })}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained">
                        {editingRecipe ? 'Update' : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
