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
const GET_ALL_MEALS = gql`
  query GetAllMeals($page: Int, $limit: Int) {
    getAllMeals(page: $page, limit: $limit) {
      id
      mealName
      mealType
      price
      nutrition {
        carbohydrates
        protein
        fat
        sodium
      }
      allergens
    }
  }
`;

// GraphQL Mutations
const CREATE_MEAL = gql`
  mutation CreateMeal(
    $mealName: String!
    $mealType: MealType!
    $price: Float!
    $mealPlanId: ID!
    $date: Date!
    $nutrition: NutritionInput
    $allergens: [String]
    $ingredients: [String]
  ) {
    createMeal(
      mealName: $mealName
      mealType: $mealType
      price: $price
      mealPlanId: $mealPlanId
      date: $date
      nutrition: $nutrition
      allergens: $allergens
      ingredients: $ingredients
    ) {
      id
      mealName
      mealType
      price
      nutrition {
        carbohydrates
        protein
        fat
        sodium
      }
      allergens
    }
  }
`;

export default function MealManagement() {
    const [page, setPage] = useState(1);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingMeal, setEditingMeal] = useState(null);
    const [formData, setFormData] = useState({
        mealName: '',
        mealType: 'BREAKFAST',
        price: '',
        mealPlanId: '',
        date: '',
        protein: '',
        carbohydrates: '',
        fat: '',
        sodium: '',
        allergens: '',
        ingredients: '',
    });

    const { data, loading, error, refetch } = useQuery(GET_ALL_MEALS, {
        variables: { page, limit: 50 },
    });

    const [createMeal] = useMutation(CREATE_MEAL, {
        onCompleted: () => {
            refetch();
            setOpenDialog(false);
            setFormData({
                mealName: '',
                mealType: 'BREAKFAST',
                price: '',
                mealPlanId: '',
                date: '',
                protein: '',
                carbohydrates: '',
                fat: '',
                sodium: '',
                allergens: '',
                ingredients: '',
            });
        },
    });

    const handleEdit = (meal) => {
        setEditingMeal(meal);
        setFormData({
            mealName: meal.mealName,
            mealType: meal.mealType,
            price: meal.price?.toString() || '',
            mealPlanId: meal.mealPlanId || '',
            date: meal.date || '',
            protein: meal.nutrition?.protein?.toString() || '',
            carbohydrates: meal.nutrition?.carbohydrates?.toString() || '',
            fat: meal.nutrition?.fat?.toString() || '',
            sodium: meal.nutrition?.sodium?.toString() || '',
            allergens: meal.allergens?.join(', ') || '',
            ingredients: meal.ingredients?.join(', ') || '',
        });
        setOpenDialog(true);
    };

    const handleSubmit = async () => {
        const variables = {
            mealName: formData.mealName,
            mealType: formData.mealType,
            price: parseFloat(formData.price) || 0,
            mealPlanId: formData.mealPlanId,
            date: new Date(formData.date),
            nutrition: {
                protein: parseFloat(formData.protein) || 0,
                carbohydrates: parseFloat(formData.carbohydrates) || 0,
                fat: parseFloat(formData.fat) || 0,
                sodium: parseFloat(formData.sodium) || 0,
            },
            allergens: formData.allergens.split(',').map(item => item.trim()).filter(item => item),
            ingredients: formData.ingredients.split(',').map(item => item.trim()).filter(item => item),
        };

        await createMeal({ variables });
    };

    if (loading) return <CircularProgress />;
    if (error) return <Alert severity="error">Error loading meals: {error.message}</Alert>;

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h5">Meal Management</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setOpenDialog(true)}
                >
          Add Meal
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Meal Name</TableCell>
                            <TableCell>Type</TableCell>
                            <TableCell>Price</TableCell>
                            <TableCell>Protein</TableCell>
                            <TableCell>Carbs</TableCell>
                            <TableCell>Fat</TableCell>
                            <TableCell>Allergens</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {data?.getAllMeals?.map((meal) => (
                            <TableRow key={meal.id}>
                                <TableCell>{meal.mealName}</TableCell>
                                <TableCell>
                                    <Chip label={meal.mealType} size="small" />
                                </TableCell>
                                <TableCell>${meal.price?.toFixed(2) || 'N/A'}</TableCell>
                                <TableCell>{meal.nutrition?.protein || 0}g</TableCell>
                                <TableCell>{meal.nutrition?.carbohydrates || 0}g</TableCell>
                                <TableCell>{meal.nutrition?.fat || 0}g</TableCell>
                                <TableCell>
                                    {meal.allergens?.map((allergen, index) => (
                                        <Chip key={index} label={allergen} size="small" sx={{ mr: 0.5 }} />
                                    ))}
                                </TableCell>
                                <TableCell>
                                    <IconButton onClick={() => handleEdit(meal)} size="small">
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton size="small" color="error">
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle>{editingMeal ? 'Edit Meal' : 'Add New Meal'}</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Meal Name"
                        fullWidth
                        variant="outlined"
                        value={formData.mealName}
                        onChange={(e) => setFormData({ ...formData, mealName: e.target.value })}
                        sx={{ mb: 2 }}
                    />
                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel>Meal Type</InputLabel>
                        <Select
                            value={formData.mealType}
                            label="Meal Type"
                            onChange={(e) => setFormData({ ...formData, mealType: e.target.value })}
                        >
                            <MenuItem value="BREAKFAST">Breakfast</MenuItem>
                            <MenuItem value="LUNCH">Lunch</MenuItem>
                            <MenuItem value="DINNER">Dinner</MenuItem>
                            <MenuItem value="SNACK">Snack</MenuItem>
                        </Select>
                    </FormControl>
                    <TextField
                        margin="dense"
                        label="Price ($)"
                        type="number"
                        fullWidth
                        variant="outlined"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        margin="dense"
                        label="Meal Plan ID"
                        fullWidth
                        variant="outlined"
                        value={formData.mealPlanId}
                        onChange={(e) => setFormData({ ...formData, mealPlanId: e.target.value })}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        margin="dense"
                        label="Date"
                        type="date"
                        fullWidth
                        variant="outlined"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        InputLabelProps={{ shrink: true }}
                        sx={{ mb: 2 }}
                    />
                    <Typography variant="h6" sx={{ mb: 1 }}>Nutrition Information</Typography>
                    <TextField
                        margin="dense"
                        label="Protein (g)"
                        type="number"
                        fullWidth
                        variant="outlined"
                        value={formData.protein}
                        onChange={(e) => setFormData({ ...formData, protein: e.target.value })}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        margin="dense"
                        label="Carbohydrates (g)"
                        type="number"
                        fullWidth
                        variant="outlined"
                        value={formData.carbohydrates}
                        onChange={(e) => setFormData({ ...formData, carbohydrates: e.target.value })}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        margin="dense"
                        label="Fat (g)"
                        type="number"
                        fullWidth
                        variant="outlined"
                        value={formData.fat}
                        onChange={(e) => setFormData({ ...formData, fat: e.target.value })}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        margin="dense"
                        label="Sodium (mg)"
                        type="number"
                        fullWidth
                        variant="outlined"
                        value={formData.sodium}
                        onChange={(e) => setFormData({ ...formData, sodium: e.target.value })}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        margin="dense"
                        label="Allergens (comma separated)"
                        fullWidth
                        variant="outlined"
                        value={formData.allergens}
                        onChange={(e) => setFormData({ ...formData, allergens: e.target.value })}
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
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained">
                        {editingMeal ? 'Update' : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
