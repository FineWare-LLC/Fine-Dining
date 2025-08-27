import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Typography,
    Card,
    CardContent,
    Grid,
    Switch,
    FormControlLabel,
    Button,
    Divider,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    TextField,
    Alert,
    Chip,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    CircularProgress
} from '@mui/material';
import {
    ArrowBack as ArrowBackIcon,
    Notifications as NotificationsIcon,
    Security as SecurityIcon,
    Person as PersonIcon,
    Palette as PaletteIcon,
    Language as LanguageIcon,
    Delete as DeleteIcon,
    Edit as EditIcon
} from '@mui/icons-material';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@mui/material/styles';
import dynamic from 'next/dynamic';

const ThemeToggle = dynamic(() => import('../components/ThemeToggle'), { ssr: false });

export default function SettingsPage() {
    const router = useRouter();
    const { user, logout } = useAuth();
    const theme = useTheme();
    
    // State for different settings sections
    const [accountSettings, setAccountSettings] = useState({
        email: user?.email || '',
        name: user?.name || '',
        measurementSystem: 'metric',
        language: 'en',
        timezone: 'UTC'
    });
    
    const [notificationSettings, setNotificationSettings] = useState({
        emailNotifications: true,
        pushNotifications: true,
        mealReminders: true,
        weeklyReports: false,
        marketingEmails: false
    });
    
    const [privacySettings, setPrivacySettings] = useState({
        profileVisibility: 'private',
        dataSharing: false,
        analyticsTracking: true
    });
    
    const [dietaryPreferences, setDietaryPreferences] = useState({
        diets: [],
        allergens: [],
        cuisinePreferences: []
    });
    
    const [loading, setLoading] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');
    const [deleteAccountDialog, setDeleteAccountDialog] = useState(false);
    
    // Available options
    const availableDiets = ['Vegetarian', 'Vegan', 'Keto', 'Paleo', 'Mediterranean', 'Low-Carb', 'Gluten-Free'];
    const availableAllergens = ['Nuts', 'Dairy', 'Eggs', 'Soy', 'Shellfish', 'Fish', 'Wheat', 'Sesame'];
    const availableCuisines = ['Italian', 'Asian', 'Mexican', 'Indian', 'Mediterranean', 'American', 'French', 'Thai'];
    
    const handleAccountSettingChange = (field, value) => {
        setAccountSettings(prev => ({
            ...prev,
            [field]: value
        }));
    };
    
    const handleNotificationChange = (field) => {
        setNotificationSettings(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };
    
    const handlePrivacyChange = (field, value) => {
        setPrivacySettings(prev => ({
            ...prev,
            [field]: typeof value === 'boolean' ? value : !prev[field]
        }));
    };
    
    const handleDietaryPreferenceAdd = (category, item) => {
        setDietaryPreferences(prev => ({
            ...prev,
            [category]: [...prev[category], item]
        }));
    };
    
    const handleDietaryPreferenceRemove = (category, item) => {
        setDietaryPreferences(prev => ({
            ...prev,
            [category]: prev[category].filter(i => i !== item)
        }));
    };
    
    const handleSaveSettings = async () => {
        setLoading(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            setSaveMessage('Settings saved successfully!');
            setTimeout(() => setSaveMessage(''), 3000);
        } catch (error) {
            setSaveMessage('Error saving settings. Please try again.');
        } finally {
            setLoading(false);
        }
    };
    
    const handleDeleteAccount = async () => {
        setLoading(true);
        try {
            // Simulate API call for account deletion
            await new Promise(resolve => setTimeout(resolve, 1000));
            logout();
            router.push('/');
        } catch (error) {
            setSaveMessage('Error deleting account. Please try again.');
        } finally {
            setLoading(false);
            setDeleteAccountDialog(false);
        }
    };
    
    return (
        <>
            <Head>
                <title>Settings - Fine Dining</title>
                <meta name="description" content="Manage your account settings and preferences" />
            </Head>
            
            <Container maxWidth="md" sx={{ py: 4 }}>
                {/* Header */}
                <Box sx={{ mb: 4 }}>
                    <Button
                        startIcon={<ArrowBackIcon />}
                        onClick={() => router.back()}
                        sx={{ mb: 2 }}
                    >
                        Back
                    </Button>
                    <Typography variant="h4" component="h1" gutterBottom>
                        Settings
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Manage your account settings and preferences
                    </Typography>
                </Box>
                
                {saveMessage && (
                    <Alert 
                        severity={saveMessage.includes('Error') ? 'error' : 'success'} 
                        sx={{ mb: 3 }}
                    >
                        {saveMessage}
                    </Alert>
                )}
                
                <Grid container spacing={3}>
                    {/* Account Settings */}
                    <Grid item xs={12}>
                        <Card>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <PersonIcon sx={{ mr: 1 }} />
                                    <Typography variant="h6">Account Settings</Typography>
                                </Box>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Full Name"
                                            value={accountSettings.name}
                                            onChange={(e) => handleAccountSettingChange('name', e.target.value)}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Email"
                                            type="email"
                                            value={accountSettings.email}
                                            onChange={(e) => handleAccountSettingChange('email', e.target.value)}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={4}>
                                        <FormControl fullWidth>
                                            <InputLabel>Measurement System</InputLabel>
                                            <Select
                                                value={accountSettings.measurementSystem}
                                                label="Measurement System"
                                                onChange={(e) => handleAccountSettingChange('measurementSystem', e.target.value)}
                                            >
                                                <MenuItem value="metric">Metric</MenuItem>
                                                <MenuItem value="imperial">Imperial</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12} sm={4}>
                                        <FormControl fullWidth>
                                            <InputLabel>Language</InputLabel>
                                            <Select
                                                value={accountSettings.language}
                                                label="Language"
                                                onChange={(e) => handleAccountSettingChange('language', e.target.value)}
                                            >
                                                <MenuItem value="en">English</MenuItem>
                                                <MenuItem value="es">Spanish</MenuItem>
                                                <MenuItem value="fr">French</MenuItem>
                                                <MenuItem value="de">German</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12} sm={4}>
                                        <FormControl fullWidth>
                                            <InputLabel>Timezone</InputLabel>
                                            <Select
                                                value={accountSettings.timezone}
                                                label="Timezone"
                                                onChange={(e) => handleAccountSettingChange('timezone', e.target.value)}
                                            >
                                                <MenuItem value="UTC">UTC</MenuItem>
                                                <MenuItem value="America/New_York">Eastern Time</MenuItem>
                                                <MenuItem value="America/Chicago">Central Time</MenuItem>
                                                <MenuItem value="America/Denver">Mountain Time</MenuItem>
                                                <MenuItem value="America/Los_Angeles">Pacific Time</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>
                    
                    {/* Theme Settings */}
                    <Grid item xs={12}>
                        <Card>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <PaletteIcon sx={{ mr: 1 }} />
                                    <Typography variant="h6">Appearance</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Typography variant="body1" sx={{ mr: 2 }}>
                                        Dark Mode
                                    </Typography>
                                    <ThemeToggle />
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                    
                    {/* Notification Settings */}
                    <Grid item xs={12}>
                        <Card>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <NotificationsIcon sx={{ mr: 1 }} />
                                    <Typography variant="h6">Notifications</Typography>
                                </Box>
                                <List>
                                    <ListItem>
                                        <ListItemText 
                                            primary="Email Notifications" 
                                            secondary="Receive notifications via email"
                                        />
                                        <ListItemSecondaryAction>
                                            <Switch
                                                checked={notificationSettings.emailNotifications}
                                                onChange={() => handleNotificationChange('emailNotifications')}
                                            />
                                        </ListItemSecondaryAction>
                                    </ListItem>
                                    <ListItem>
                                        <ListItemText 
                                            primary="Push Notifications" 
                                            secondary="Receive push notifications in your browser"
                                        />
                                        <ListItemSecondaryAction>
                                            <Switch
                                                checked={notificationSettings.pushNotifications}
                                                onChange={() => handleNotificationChange('pushNotifications')}
                                            />
                                        </ListItemSecondaryAction>
                                    </ListItem>
                                    <ListItem>
                                        <ListItemText 
                                            primary="Meal Reminders" 
                                            secondary="Get reminded about your planned meals"
                                        />
                                        <ListItemSecondaryAction>
                                            <Switch
                                                checked={notificationSettings.mealReminders}
                                                onChange={() => handleNotificationChange('mealReminders')}
                                            />
                                        </ListItemSecondaryAction>
                                    </ListItem>
                                    <ListItem>
                                        <ListItemText 
                                            primary="Weekly Reports" 
                                            secondary="Receive weekly nutrition and meal planning reports"
                                        />
                                        <ListItemSecondaryAction>
                                            <Switch
                                                checked={notificationSettings.weeklyReports}
                                                onChange={() => handleNotificationChange('weeklyReports')}
                                            />
                                        </ListItemSecondaryAction>
                                    </ListItem>
                                    <ListItem>
                                        <ListItemText 
                                            primary="Marketing Emails" 
                                            secondary="Receive promotional emails and updates"
                                        />
                                        <ListItemSecondaryAction>
                                            <Switch
                                                checked={notificationSettings.marketingEmails}
                                                onChange={() => handleNotificationChange('marketingEmails')}
                                            />
                                        </ListItemSecondaryAction>
                                    </ListItem>
                                </List>
                            </CardContent>
                        </Card>
                    </Grid>
                    
                    {/* Dietary Preferences */}
                    <Grid item xs={12}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Dietary Preferences
                                </Typography>
                                
                                <Box sx={{ mb: 3 }}>
                                    <Typography variant="subtitle1" gutterBottom>
                                        Diets
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                                        {dietaryPreferences.diets.map((diet) => (
                                            <Chip
                                                key={diet}
                                                label={diet}
                                                onDelete={() => handleDietaryPreferenceRemove('diets', diet)}
                                                color="primary"
                                            />
                                        ))}
                                    </Box>
                                    <FormControl size="small" sx={{ minWidth: 120 }}>
                                        <InputLabel>Add Diet</InputLabel>
                                        <Select
                                            label="Add Diet"
                                            value=""
                                            onChange={(e) => {
                                                if (e.target.value && !dietaryPreferences.diets.includes(e.target.value)) {
                                                    handleDietaryPreferenceAdd('diets', e.target.value);
                                                }
                                            }}
                                        >
                                            {availableDiets.map((diet) => (
                                                <MenuItem key={diet} value={diet}>
                                                    {diet}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Box>
                                
                                <Box sx={{ mb: 3 }}>
                                    <Typography variant="subtitle1" gutterBottom>
                                        Allergens to Avoid
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                                        {dietaryPreferences.allergens.map((allergen) => (
                                            <Chip
                                                key={allergen}
                                                label={allergen}
                                                onDelete={() => handleDietaryPreferenceRemove('allergens', allergen)}
                                                color="error"
                                            />
                                        ))}
                                    </Box>
                                    <FormControl size="small" sx={{ minWidth: 120 }}>
                                        <InputLabel>Add Allergen</InputLabel>
                                        <Select
                                            label="Add Allergen"
                                            value=""
                                            onChange={(e) => {
                                                if (e.target.value && !dietaryPreferences.allergens.includes(e.target.value)) {
                                                    handleDietaryPreferenceAdd('allergens', e.target.value);
                                                }
                                            }}
                                        >
                                            {availableAllergens.map((allergen) => (
                                                <MenuItem key={allergen} value={allergen}>
                                                    {allergen}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Box>
                                
                                <Box>
                                    <Typography variant="subtitle1" gutterBottom>
                                        Preferred Cuisines
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                                        {dietaryPreferences.cuisinePreferences.map((cuisine) => (
                                            <Chip
                                                key={cuisine}
                                                label={cuisine}
                                                onDelete={() => handleDietaryPreferenceRemove('cuisinePreferences', cuisine)}
                                                color="secondary"
                                            />
                                        ))}
                                    </Box>
                                    <FormControl size="small" sx={{ minWidth: 120 }}>
                                        <InputLabel>Add Cuisine</InputLabel>
                                        <Select
                                            label="Add Cuisine"
                                            value=""
                                            onChange={(e) => {
                                                if (e.target.value && !dietaryPreferences.cuisinePreferences.includes(e.target.value)) {
                                                    handleDietaryPreferenceAdd('cuisinePreferences', e.target.value);
                                                }
                                            }}
                                        >
                                            {availableCuisines.map((cuisine) => (
                                                <MenuItem key={cuisine} value={cuisine}>
                                                    {cuisine}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                    
                    {/* Privacy Settings */}
                    <Grid item xs={12}>
                        <Card>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <SecurityIcon sx={{ mr: 1 }} />
                                    <Typography variant="h6">Privacy & Security</Typography>
                                </Box>
                                <List>
                                    <ListItem>
                                        <ListItemText 
                                            primary="Profile Visibility" 
                                            secondary="Control who can see your profile"
                                        />
                                        <ListItemSecondaryAction>
                                            <FormControl size="small" sx={{ minWidth: 120 }}>
                                                <Select
                                                    value={privacySettings.profileVisibility}
                                                    onChange={(e) => handlePrivacyChange('profileVisibility', e.target.value)}
                                                >
                                                    <MenuItem value="public">Public</MenuItem>
                                                    <MenuItem value="friends">Friends Only</MenuItem>
                                                    <MenuItem value="private">Private</MenuItem>
                                                </Select>
                                            </FormControl>
                                        </ListItemSecondaryAction>
                                    </ListItem>
                                    <ListItem>
                                        <ListItemText 
                                            primary="Data Sharing" 
                                            secondary="Allow sharing anonymized data for research"
                                        />
                                        <ListItemSecondaryAction>
                                            <Switch
                                                checked={privacySettings.dataSharing}
                                                onChange={() => handlePrivacyChange('dataSharing')}
                                            />
                                        </ListItemSecondaryAction>
                                    </ListItem>
                                    <ListItem>
                                        <ListItemText 
                                            primary="Analytics Tracking" 
                                            secondary="Help improve the app with usage analytics"
                                        />
                                        <ListItemSecondaryAction>
                                            <Switch
                                                checked={privacySettings.analyticsTracking}
                                                onChange={() => handlePrivacyChange('analyticsTracking')}
                                            />
                                        </ListItemSecondaryAction>
                                    </ListItem>
                                </List>
                            </CardContent>
                        </Card>
                    </Grid>
                    
                    {/* Action Buttons */}
                    <Grid item xs={12}>
                        <Card>
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={handleSaveSettings}
                                        disabled={loading}
                                        startIcon={loading ? <CircularProgress size={20} /> : null}
                                    >
                                        {loading ? 'Saving...' : 'Save Settings'}
                                    </Button>
                                    
                                    <Button
                                        variant="outlined"
                                        color="error"
                                        onClick={() => setDeleteAccountDialog(true)}
                                        startIcon={<DeleteIcon />}
                                    >
                                        Delete Account
                                    </Button>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Container>
            
            {/* Delete Account Confirmation Dialog */}
            <Dialog
                open={deleteAccountDialog}
                onClose={() => setDeleteAccountDialog(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Delete Account</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete your account? This action cannot be undone and will permanently remove all your data, meal plans, and preferences.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteAccountDialog(false)}>
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleDeleteAccount} 
                        color="error" 
                        variant="contained"
                        disabled={loading}
                    >
                        {loading ? 'Deleting...' : 'Delete Account'}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}