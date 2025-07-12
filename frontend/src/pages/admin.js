import { useQuery, useMutation, gql } from '@apollo/client';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    Add as AddIcon,
    People as PeopleIcon,
    Restaurant as RestaurantIcon,
    MenuBook as MenuBookIcon,
    Analytics as AnalyticsIcon,
} from '@mui/icons-material';
import {
    Box,
    Container,
    Typography,
    Tabs,
    Tab,
    Paper,
    Grid,
    Card,
    CardContent,
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
    useTheme,
} from '@mui/material';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

// GraphQL Queries
const GET_USERS = gql`
  query GetUsers($page: Int, $limit: Int) {
    getUsers(page: $page, limit: $limit) {
      id
      name
      email
      role
      accountStatus
      createdAt
      updatedAt
    }
  }
`;

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
const DELETE_USER = gql`
  mutation DeleteUser($id: ID!) {
    deleteUser(id: $id)
  }
`;

const DELETE_RECIPE = gql`
  mutation DeleteRecipe($id: ID!) {
    deleteRecipe(id: $id)
  }
`;

const DELETE_RESTAURANT = gql`
  mutation DeleteRestaurant($id: ID!) {
    deleteRestaurant(id: $id)
  }
`;

const CREATE_USER = gql`
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
      id
      name
      email
      role
      accountStatus
    }
  }
`;

const UPDATE_USER = gql`
  mutation UpdateUser($id: ID!, $input: UpdateUserInput!) {
    updateUser(id: $id, input: $input) {
      id
      name
      email
      role
      accountStatus
    }
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

function TabPanel({ children, value, index, ...other }) {
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`admin-tabpanel-${index}`}
            aria-labelledby={`admin-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
        </div>
    );
}

// Dashboard Overview Component
function DashboardOverview() {
    const { data: usersData } = useQuery(GET_USERS, { variables: { limit: 1000 } });
    const { data: recipesData } = useQuery(GET_RECIPES, { variables: { limit: 1000 } });
    const { data: restaurantsData } = useQuery(GET_RESTAURANTS, { variables: { limit: 1000 } });
    const { data: mealsData } = useQuery(GET_ALL_MEALS, { variables: { limit: 1000 } });

    const stats = [
        {
            title: 'Total Users',
            value: usersData?.getUsers?.length || 0,
            icon: <PeopleIcon sx={{ fontSize: 40 }} />,
            color: '#1976d2',
        },
        {
            title: 'Total Recipes',
            value: recipesData?.getRecipes?.length || 0,
            icon: <MenuBookIcon sx={{ fontSize: 40 }} />,
            color: '#388e3c',
        },
        {
            title: 'Total Restaurants',
            value: restaurantsData?.getRestaurants?.length || 0,
            icon: <RestaurantIcon sx={{ fontSize: 40 }} />,
            color: '#f57c00',
        },
        {
            title: 'Total Meals',
            value: mealsData?.getAllMeals?.length || 0,
            icon: <AnalyticsIcon sx={{ fontSize: 40 }} />,
            color: '#7b1fa2',
        },
    ];

    return (
        <Grid container spacing={3}>
            {stats.map((stat, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                    <Card>
                        <CardContent>
                            <Box display="flex" alignItems="center" justifyContent="space-between">
                                <Box>
                                    <Typography color="textSecondary" gutterBottom variant="h6">
                                        {stat.title}
                                    </Typography>
                                    <Typography variant="h4" component="h2">
                                        {stat.value}
                                    </Typography>
                                </Box>
                                <Box sx={{ color: stat.color }}>
                                    {stat.icon}
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            ))}
        </Grid>
    );
}

// User Management Component
function UserManagement() {
    const [page, setPage] = useState(1);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: 'USER',
        password: '',
    });

    const { data, loading, error, refetch } = useQuery(GET_USERS, {
        variables: { page, limit: 50 },
    });

    const [deleteUser] = useMutation(DELETE_USER, {
        onCompleted: () => refetch(),
    });

    const [createUser] = useMutation(CREATE_USER, {
        onCompleted: () => {
            refetch();
            setOpenDialog(false);
            setFormData({ name: '', email: '', role: 'USER', password: '' });
        },
    });

    const [updateUser] = useMutation(UPDATE_USER, {
        onCompleted: () => {
            refetch();
            setOpenDialog(false);
            setEditingUser(null);
            setFormData({ name: '', email: '', role: 'USER', password: '' });
        },
    });

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            await deleteUser({ variables: { id } });
        }
    };

    const handleEdit = (user) => {
        setEditingUser(user);
        setFormData({
            name: user.name,
            email: user.email,
            role: user.role,
            password: '',
        });
        setOpenDialog(true);
    };

    const handleSubmit = async () => {
        if (editingUser) {
            await updateUser({
                variables: {
                    id: editingUser.id,
                    input: {
                        name: formData.name,
                        email: formData.email,
                        role: formData.role,
                    },
                },
            });
        } else {
            await createUser({
                variables: {
                    input: {
                        name: formData.name,
                        email: formData.email,
                        role: formData.role,
                        password: formData.password,
                    },
                },
            });
        }
    };

    if (loading) return <CircularProgress />;
    if (error) return <Alert severity="error">Error loading users: {error.message}</Alert>;

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h5">User Management</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setOpenDialog(true)}
                >
          Add User
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Role</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Created</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {data?.getUsers?.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell>{user.name}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={user.role}
                                        color={user.role === 'ADMIN' ? 'error' : user.role === 'PREMIUM' ? 'warning' : 'default'}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={user.accountStatus}
                                        color={user.accountStatus === 'ACTIVE' ? 'success' : 'default'}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                                <TableCell>
                                    <IconButton onClick={() => handleEdit(user)} size="small">
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton onClick={() => handleDelete(user.id)} size="small" color="error">
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{editingUser ? 'Edit User' : 'Add New User'}</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Name"
                        fullWidth
                        variant="outlined"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        margin="dense"
                        label="Email"
                        type="email"
                        fullWidth
                        variant="outlined"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        sx={{ mb: 2 }}
                    />
                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel>Role</InputLabel>
                        <Select
                            value={formData.role}
                            label="Role"
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        >
                            <MenuItem value="USER">User</MenuItem>
                            <MenuItem value="PREMIUM">Premium</MenuItem>
                            <MenuItem value="ADMIN">Admin</MenuItem>
                        </Select>
                    </FormControl>
                    {!editingUser && (
                        <TextField
                            margin="dense"
                            label="Password"
                            type="password"
                            fullWidth
                            variant="outlined"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained">
                        {editingUser ? 'Update' : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

// Recipe Management Component
function RecipeManagement() {
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

// Restaurant Management Component
function RestaurantManagement() {
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
                        autoFocus
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

// Meal Management Component
function MealManagement() {
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

export default function AdminDashboard() {
    const [tabValue, setTabValue] = useState(0);
    const { user, loading } = useAuth();
    const router = useRouter();
    const theme = useTheme();

    useEffect(() => {
        if (!loading && (!user || user.role !== 'ADMIN')) {
            router.push('/signin');
        }
    }, [user, loading, router]);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <CircularProgress />
            </Box>
        );
    }

    if (!user || user.role !== 'ADMIN') {
        return null;
    }

    return (
        <>
            <Head>
                <title>Admin Dashboard - Fine Dining</title>
            </Head>

            <Container maxWidth="xl" sx={{ py: 4 }}>
                <Typography variant="h3" component="h1" gutterBottom>
          Admin Dashboard
                </Typography>

                <Paper sx={{ width: '100%', mb: 2 }}>
                    <Tabs
                        value={tabValue}
                        onChange={handleTabChange}
                        indicatorColor="primary"
                        textColor="primary"
                        variant="scrollable"
                        scrollButtons="auto"
                    >
                        <Tab label="Overview" icon={<AnalyticsIcon />} />
                        <Tab label="Users" icon={<PeopleIcon />} />
                        <Tab label="Recipes" icon={<MenuBookIcon />} />
                        <Tab label="Restaurants" icon={<RestaurantIcon />} />
                        <Tab label="Meals" />
                    </Tabs>

                    <TabPanel value={tabValue} index={0}>
                        <DashboardOverview />
                    </TabPanel>

                    <TabPanel value={tabValue} index={1}>
                        <UserManagement />
                    </TabPanel>

                    <TabPanel value={tabValue} index={2}>
                        <RecipeManagement />
                    </TabPanel>

                    <TabPanel value={tabValue} index={3}>
                        <RestaurantManagement />
                    </TabPanel>

                    <TabPanel value={tabValue} index={4}>
                        <MealManagement />
                    </TabPanel>
                </Paper>
            </Container>
        </>
    );
}
