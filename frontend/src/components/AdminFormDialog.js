import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Grid,
  Chip,
  Typography,
  Alert
} from '@mui/material';

const AdminFormDialog = ({
  open,
  onClose,
  dialogType,
  selectedItem,
  onSave,
  createRecipe,
  createRestaurant,
  updateUser,
  refetchUsers,
  refetchRecipes,
  refetchRestaurants
}) => {
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (selectedItem) {
      setFormData(selectedItem);
    } else {
      setFormData({});
    }
    setError('');
  }, [selectedItem, dialogType]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');
    
    try {
      switch (dialogType) {
        case 'createUser':
          // For user creation, you would typically call a createUser mutation
          // This is a placeholder since the mutation wasn't defined in the original file
          console.log('Creating user:', formData);
          break;
          
        case 'editUser':
          await updateUser({
            variables: {
              id: selectedItem.id,
              input: {
                name: formData.name,
                email: formData.email,
                role: formData.role,
                accountStatus: formData.accountStatus
              }
            }
          });
          refetchUsers();
          break;
          
        case 'createRecipe':
          await createRecipe({
            variables: {
              recipeName: formData.recipeName,
              ingredients: formData.ingredients ? formData.ingredients.split(',').map(i => i.trim()) : [],
              instructions: formData.instructions,
              prepTime: parseInt(formData.prepTime),
              difficulty: formData.difficulty,
              nutritionFacts: formData.nutritionFacts,
              tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : [],
              images: formData.images ? formData.images.split(',').map(i => i.trim()) : [],
              estimatedCost: parseFloat(formData.estimatedCost)
            }
          });
          refetchRecipes();
          break;
          
        case 'editRecipe':
          // Similar to create but with update mutation
          console.log('Editing recipe:', formData);
          break;
          
        case 'createRestaurant':
          await createRestaurant({
            variables: {
              restaurantName: formData.restaurantName,
              address: formData.address,
              phone: formData.phone,
              website: formData.website,
              cuisineType: formData.cuisineType ? formData.cuisineType.split(',').map(c => c.trim()) : [],
              priceRange: formData.priceRange
            }
          });
          refetchRestaurants();
          break;
          
        case 'editRestaurant':
          // Similar to create but with update mutation
          console.log('Editing restaurant:', formData);
          break;
          
        default:
          console.log('Unknown dialog type:', dialogType);
      }
      
      onClose();
    } catch (err) {
      setError(err.message || 'An error occurred while saving');
      console.error('Save error:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderUserForm = () => (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Name"
          value={formData.name || ''}
          onChange={(e) => handleInputChange('name', e.target.value)}
          required
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Email"
          type="email"
          value={formData.email || ''}
          onChange={(e) => handleInputChange('email', e.target.value)}
          required
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth>
          <InputLabel>Role</InputLabel>
          <Select
            value={formData.role || 'USER'}
            label="Role"
            onChange={(e) => handleInputChange('role', e.target.value)}
          >
            <MenuItem value="USER">User</MenuItem>
            <MenuItem value="PREMIUM">Premium</MenuItem>
            <MenuItem value="ADMIN">Admin</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth>
          <InputLabel>Account Status</InputLabel>
          <Select
            value={formData.accountStatus || 'ACTIVE'}
            label="Account Status"
            onChange={(e) => handleInputChange('accountStatus', e.target.value)}
          >
            <MenuItem value="ACTIVE">Active</MenuItem>
            <MenuItem value="INACTIVE">Inactive</MenuItem>
            <MenuItem value="SUSPENDED">Suspended</MenuItem>
          </Select>
        </FormControl>
      </Grid>
    </Grid>
  );

  const renderRecipeForm = () => (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Recipe Name"
          value={formData.recipeName || ''}
          onChange={(e) => handleInputChange('recipeName', e.target.value)}
          required
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Ingredients (comma-separated)"
          multiline
          rows={3}
          value={formData.ingredients || ''}
          onChange={(e) => handleInputChange('ingredients', e.target.value)}
          placeholder="Ingredient 1, Ingredient 2, Ingredient 3"
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Instructions"
          multiline
          rows={4}
          value={formData.instructions || ''}
          onChange={(e) => handleInputChange('instructions', e.target.value)}
          required
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Prep Time (minutes)"
          type="number"
          value={formData.prepTime || ''}
          onChange={(e) => handleInputChange('prepTime', e.target.value)}
          required
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth>
          <InputLabel>Difficulty</InputLabel>
          <Select
            value={formData.difficulty || 'EASY'}
            label="Difficulty"
            onChange={(e) => handleInputChange('difficulty', e.target.value)}
          >
            <MenuItem value="EASY">Easy</MenuItem>
            <MenuItem value="MEDIUM">Medium</MenuItem>
            <MenuItem value="HARD">Hard</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Estimated Cost ($)"
          type="number"
          step="0.01"
          value={formData.estimatedCost || ''}
          onChange={(e) => handleInputChange('estimatedCost', e.target.value)}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Tags (comma-separated)"
          value={formData.tags || ''}
          onChange={(e) => handleInputChange('tags', e.target.value)}
          placeholder="healthy, quick, vegetarian"
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Images (comma-separated URLs)"
          value={formData.images || ''}
          onChange={(e) => handleInputChange('images', e.target.value)}
          placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Nutrition Facts"
          multiline
          rows={2}
          value={formData.nutritionFacts || ''}
          onChange={(e) => handleInputChange('nutritionFacts', e.target.value)}
          placeholder="Calories: 250, Protein: 20g, Carbs: 30g, Fat: 10g"
        />
      </Grid>
    </Grid>
  );

  const renderRestaurantForm = () => (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Restaurant Name"
          value={formData.restaurantName || ''}
          onChange={(e) => handleInputChange('restaurantName', e.target.value)}
          required
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Address"
          value={formData.address || ''}
          onChange={(e) => handleInputChange('address', e.target.value)}
          required
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Phone"
          value={formData.phone || ''}
          onChange={(e) => handleInputChange('phone', e.target.value)}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Website"
          value={formData.website || ''}
          onChange={(e) => handleInputChange('website', e.target.value)}
          placeholder="https://restaurant-website.com"
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Cuisine Type (comma-separated)"
          value={formData.cuisineType || ''}
          onChange={(e) => handleInputChange('cuisineType', e.target.value)}
          placeholder="Italian, Mediterranean, Seafood"
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth>
          <InputLabel>Price Range</InputLabel>
          <Select
            value={formData.priceRange || 'MODERATE'}
            label="Price Range"
            onChange={(e) => handleInputChange('priceRange', e.target.value)}
          >
            <MenuItem value="BUDGET">Budget ($)</MenuItem>
            <MenuItem value="MODERATE">Moderate ($$)</MenuItem>
            <MenuItem value="EXPENSIVE">Expensive ($$$)</MenuItem>
            <MenuItem value="LUXURY">Luxury ($$$$)</MenuItem>
          </Select>
        </FormControl>
      </Grid>
    </Grid>
  );

  const getDialogTitle = () => {
    switch (dialogType) {
      case 'createUser': return 'Create New User';
      case 'editUser': return 'Edit User';
      case 'createRecipe': return 'Create New Recipe';
      case 'editRecipe': return 'Edit Recipe';
      case 'createRestaurant': return 'Create New Restaurant';
      case 'editRestaurant': return 'Edit Restaurant';
      default: return 'Form';
    }
  };

  const renderForm = () => {
    switch (dialogType) {
      case 'createUser':
      case 'editUser':
        return renderUserForm();
      case 'createRecipe':
      case 'editRecipe':
        return renderRecipeForm();
      case 'createRestaurant':
      case 'editRestaurant':
        return renderRestaurantForm();
      default:
        return <Typography>Unknown form type</Typography>;
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{getDialogTitle()}</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {renderForm()}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button 
          onClick={handleSave} 
          variant="contained" 
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AdminFormDialog;