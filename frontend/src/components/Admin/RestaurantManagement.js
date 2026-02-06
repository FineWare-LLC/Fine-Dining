import { gql } from '@apollo/client';
import { useQuery, useMutation } from '@apollo/client/react';
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
const GET_RESTAURANTS = gql`
  query GetRestaurants($page: Int, $limit: Int) {
    getRestaurants(page: $page, limit: $limit) {
      id
      restaurantName
      address
      phone
      website
      cuisineType
      priceRange
      createdAt
    }
  }
`;

// GraphQL Mutations
const DELETE_RESTAURANT = gql`
  mutation DeleteRestaurant($id: ID!) {
    deleteRestaurant(id: $id)
  }
`;

const CREATE_RESTAURANT = gql`
  mutation CreateRestaurant(
    $restaurantName: String!
    $address: String!
    $phone: String
    $website: String
    $cuisineType: [String]
    $priceRange: PriceRange
  ) {
    createRestaurant(
      restaurantName: $restaurantName
      address: $address
      phone: $phone
      website: $website
      cuisineType: $cuisineType
      priceRange: $priceRange
    ) {
      id
      restaurantName
      address
      phone
      website
      cuisineType
      priceRange
    }
  }
`;

export default function RestaurantManagement() {
    const [page, setPage] = useState(1);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingRestaurant, setEditingRestaurant] = useState(null);
    const [formData, setFormData] = useState({
        restaurantName: '',
        address: '',
        phone: '',
        website: '',
        cuisineType: '',
        priceRange: 'BUDGET',
    });

    const { data, loading, error, refetch } = useQuery(GET_RESTAURANTS, {
        variables: { page, limit: 50 },
    });

    const [deleteRestaurant] = useMutation(DELETE_RESTAURANT, {
        onCompleted: () => refetch(),
    });

    const [createRestaurant] = useMutation(CREATE_RESTAURANT, {
        onCompleted: () => {
            refetch();
            setOpenDialog(false);
            setFormData({
                restaurantName: '',
                address: '',
                phone: '',
                website: '',
                cuisineType: '',
                priceRange: 'BUDGET',
            });
        },
    });

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this restaurant?')) {
            await deleteRestaurant({ variables: { id } });
        }
    };

    const handleEdit = (restaurant) => {
        setEditingRestaurant(restaurant);
        setFormData({
            restaurantName: restaurant.restaurantName,
            address: restaurant.address,
            phone: restaurant.phone || '',
            website: restaurant.website || '',
            cuisineType: restaurant.cuisineType?.join(', ') || '',
            priceRange: restaurant.priceRange || 'BUDGET',
        });
        setOpenDialog(true);
    };

    const handleSubmit = async () => {
        const variables = {
            restaurantName: formData.restaurantName,
            address: formData.address,
            phone: formData.phone || null,
            website: formData.website || null,
            cuisineType: formData.cuisineType.split(',').map(item => item.trim()).filter(item => item),
            priceRange: formData.priceRange,
        };

        await createRestaurant({ variables });
    };

    if (loading) return <CircularProgress />;
    if (error) return <Alert severity="error">Error loading restaurants: {error.message}</Alert>;

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h5">Restaurant Management</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setOpenDialog(true)}
                >
          Add Restaurant
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Restaurant Name</TableCell>
                            <TableCell>Address</TableCell>
                            <TableCell>Phone</TableCell>
                            <TableCell>Cuisine Type</TableCell>
                            <TableCell>Price Range</TableCell>
                            <TableCell>Created</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {data?.getRestaurants?.map((restaurant) => (
                            <TableRow key={restaurant.id}>
                                <TableCell>{restaurant.restaurantName}</TableCell>
                                <TableCell>{restaurant.address}</TableCell>
                                <TableCell>{restaurant.phone || 'N/A'}</TableCell>
                                <TableCell>
                                    {restaurant.cuisineType?.map((cuisine, index) => (
                                        <Chip key={index} label={cuisine} size="small" sx={{ mr: 0.5 }} />
                                    ))}
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={restaurant.priceRange}
                                        color={restaurant.priceRange === 'EXPENSIVE' ? 'error' : restaurant.priceRange === 'MODERATE' ? 'warning' : 'success'}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>{new Date(restaurant.createdAt).toLocaleDateString()}</TableCell>
                                <TableCell>
                                    <IconButton onClick={() => handleEdit(restaurant)} size="small">
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton onClick={() => handleDelete(restaurant.id)} size="small" color="error">
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{editingRestaurant ? 'Edit Restaurant' : 'Add New Restaurant'}</DialogTitle>
                <DialogContent>
                    <TextField
                        margin="dense"
                        label="Restaurant Name"
                        fullWidth
                        variant="outlined"
                        value={formData.restaurantName}
                        onChange={(e) => setFormData({ ...formData, restaurantName: e.target.value })}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        margin="dense"
                        label="Address"
                        fullWidth
                        variant="outlined"
                        multiline
                        rows={2}
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        margin="dense"
                        label="Phone"
                        fullWidth
                        variant="outlined"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        margin="dense"
                        label="Website"
                        fullWidth
                        variant="outlined"
                        value={formData.website}
                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        margin="dense"
                        label="Cuisine Types (comma separated)"
                        fullWidth
                        variant="outlined"
                        value={formData.cuisineType}
                        onChange={(e) => setFormData({ ...formData, cuisineType: e.target.value })}
                        sx={{ mb: 2 }}
                    />
                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel>Price Range</InputLabel>
                        <Select
                            value={formData.priceRange}
                            label="Price Range"
                            onChange={(e) => setFormData({ ...formData, priceRange: e.target.value })}
                        >
                            <MenuItem value="BUDGET">Budget</MenuItem>
                            <MenuItem value="MODERATE">Moderate</MenuItem>
                            <MenuItem value="EXPENSIVE">Expensive</MenuItem>
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained">
                        {editingRestaurant ? 'Update' : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
