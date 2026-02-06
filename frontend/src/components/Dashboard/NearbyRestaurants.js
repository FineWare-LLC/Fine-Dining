/**
 * NearbyRestaurants.tsx
 * Obtains location, calls /api/places, renders 20 items with required attribution slot.
 */
import React, { useEffect, useState, useCallback } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    CircularProgress,
    Alert,
    Button,
    TextField,
    Autocomplete,
    Chip,
    Rating,
    IconButton,
    useTheme,
    Stack,
    Paper,
    Divider,
} from '@mui/material';
import {
    LocationOn as LocationOnIcon,
    Restaurant as RestaurantIcon,
    Star as StarIcon,
    AccessTime as AccessTimeIcon,
    Directions as DirectionsIcon,
    Refresh as RefreshIcon,
    MyLocation as MyLocationIcon,
} from '@mui/icons-material';

const NearbyRestaurants = () => {
    const theme = useTheme();
    const [places, setPlaces] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [locationError, setLocationError] = useState(null);
    const [userLocation, setUserLocation] = useState(null);
    const [radius, setRadius] = useState(1500);
    const [cityInput, setCityInput] = useState('');
    const [useManualLocation, setUseManualLocation] = useState(false);

    // City suggestions for fallback
    const citySuggestions = [
        'New York, NY',
        'Los Angeles, CA',
        'Chicago, IL',
        'Houston, TX',
        'Phoenix, AZ',
        'Philadelphia, PA',
        'San Antonio, TX',
        'San Diego, CA',
        'Dallas, TX',
        'San Jose, CA',
    ];

    // Get user's geolocation
    const getCurrentLocation = useCallback(() => {
        if (!navigator.geolocation) {
            setLocationError('Geolocation is not supported by this browser');
            setUseManualLocation(true);
            return;
        }

        setLoading(true);
        setLocationError(null);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const location = {
                    lat: position.coords.latitude,
                    lon: position.coords.longitude,
                };
                setUserLocation(location);
                setUseManualLocation(false);
                fetchNearbyRestaurants(location);
            },
            (error) => {
                console.error('Geolocation error:', error);
                let errorMessage = 'Unable to get your location';
                
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = 'Location access denied. Please enter a city manually.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = 'Location information unavailable. Please enter a city manually.';
                        break;
                    case error.TIMEOUT:
                        errorMessage = 'Location request timed out. Please enter a city manually.';
                        break;
                }
                
                setLocationError(errorMessage);
                setUseManualLocation(true);
                setLoading(false);
            },
            {
                enableHighAccuracy: true,
                timeout: 8000,
                maximumAge: 60000, // Cache position for 1 minute
            }
        );
    }, []);

    // Geocode city name to coordinates (simplified - in production, use a geocoding service)
    const geocodeCity = async (cityName) => {
        // This is a simplified fallback - in production, you'd use a proper geocoding API
        // For demo purposes, we'll use some major city coordinates
        const cityCoords = {
            'New York, NY': { lat: 40.7128, lon: -74.0060 },
            'Los Angeles, CA': { lat: 34.0522, lon: -118.2437 },
            'Chicago, IL': { lat: 41.8781, lon: -87.6298 },
            'Houston, TX': { lat: 29.7604, lon: -95.3698 },
            'Phoenix, AZ': { lat: 33.4484, lon: -112.0740 },
            'Philadelphia, PA': { lat: 39.9526, lon: -75.1652 },
            'San Antonio, TX': { lat: 29.4241, lon: -98.4936 },
            'San Diego, CA': { lat: 32.7157, lon: -117.1611 },
            'Dallas, TX': { lat: 32.7767, lon: -96.7970 },
            'San Jose, CA': { lat: 37.3382, lon: -121.8863 },
        };

        return cityCoords[cityName] || null;
    };

    // Handle manual city selection
    const handleCitySelect = async (city) => {
        if (!city) return;
        
        setLoading(true);
        setError(null);
        
        const coordinates = await geocodeCity(city);
        if (coordinates) {
            setUserLocation(coordinates);
            fetchNearbyRestaurants(coordinates);
        } else {
            setError(`Unable to find coordinates for ${city}`);
            setLoading(false);
        }
    };

    // Fetch nearby restaurants from API
    const fetchNearbyRestaurants = async (location) => {
        try {
            const response = await fetch(
                `/api/places?lat=${location.lat}&lon=${location.lon}&radius=${radius}&limit=20`
            );
            
            if (!response.ok) {
                throw new Error(`API request failed: ${response.status}`);
            }
            
            const data = await response.json();
            setPlaces(data);
            setError(null);
        } catch (err) {
            console.error('Error fetching restaurants:', err);
            setError('Could not load nearby restaurants. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Handle radius change and refresh
    const handleRadiusChange = (newRadius) => {
        setRadius(newRadius);
        if (userLocation) {
            setLoading(true);
            fetchNearbyRestaurants(userLocation);
        }
    };

    // Initial load
    useEffect(() => {
        getCurrentLocation();
    }, [getCurrentLocation]);

    // Format distance
    const formatDistance = (distanceM) => {
        if (distanceM < 1000) {
            return `${Math.round(distanceM)} m`;
        }
        return `${(distanceM / 1000).toFixed(1)} km`;
    };

    // Handle directions
    const handleDirections = (place) => {
        const url = `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lon}`;
        window.open(url, '_blank');
    };

    return (
        <Paper
            elevation={2}
            sx={{
                borderRadius: 3,
                overflow: 'hidden',
                background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                p: 3,
                mt: 2,
            }}
        >
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <RestaurantIcon color="primary" sx={{ fontSize: 28 }} />
                    <Typography variant="h5" fontWeight="bold" color="primary">
                        Nearby Restaurants
                    </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', gap: 1 }}>
                    {/* Radius selector */}
                    <Chip
                        label={`${radius}m radius`}
                        onClick={() => {
                            const newRadius = radius === 1500 ? 3000 : radius === 3000 ? 5000 : 1500;
                            handleRadiusChange(newRadius);
                        }}
                        variant="outlined"
                        sx={{ cursor: 'pointer' }}
                    />
                    
                    {/* Refresh button */}
                    <IconButton
                        onClick={getCurrentLocation}
                        disabled={loading}
                        sx={{
                            backgroundColor: 'rgba(25, 118, 210, 0.1)',
                            '&:hover': { backgroundColor: 'rgba(25, 118, 210, 0.2)' },
                        }}
                    >
                        <RefreshIcon />
                    </IconButton>
                </Box>
            </Box>

            {/* Location Controls */}
            {(locationError || useManualLocation) && (
                <Box sx={{ mb: 3 }}>
                    <Alert severity="info" sx={{ mb: 2 }}>
                        {locationError || 'Enter a city to find nearby restaurants'}
                    </Alert>
                    
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Autocomplete
                            options={citySuggestions}
                            value={cityInput}
                            onChange={(event, newValue) => {
                                setCityInput(newValue);
                                if (newValue) {
                                    handleCitySelect(newValue);
                                }
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Enter city"
                                    variant="outlined"
                                    size="small"
                                    sx={{ minWidth: 200 }}
                                />
                            )}
                            disabled={loading}
                        />
                        
                        <Button
                            variant="outlined"
                            startIcon={<MyLocationIcon />}
                            onClick={getCurrentLocation}
                            disabled={loading}
                            size="small"
                        >
                            Use My Location
                        </Button>
                    </Stack>
                </Box>
            )}

            {/* Loading State */}
            {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
                    <CircularProgress size={40} />
                    <Typography variant="body2" sx={{ ml: 2 }}>
                        {userLocation ? 'Finding nearby restaurants...' : 'Getting your location...'}
                    </Typography>
                </Box>
            )}

            {/* Error State */}
            {error && !loading && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {/* Results */}
            {places && !loading && (
                <>
                    {places.length === 0 ? (
                        <Alert severity="info">
                            No restaurants found in this area. Try increasing the search radius or selecting a different location.
                        </Alert>
                    ) : (
                        <>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                Found {places.length} restaurants within {formatDistance(radius)}
                            </Typography>
                            
                            <Stack spacing={2}>
                                {places.map((place) => (
                                    <Card
                                        key={place.id}
                                        sx={{
                                            borderRadius: 2,
                                            border: '1px solid',
                                            borderColor: 'divider',
                                            transition: 'all 0.2s ease',
                                            '&:hover': {
                                                transform: 'translateY(-1px)',
                                                boxShadow: theme.shadows[4],
                                                borderColor: 'primary.main',
                                            },
                                        }}
                                    >
                                        <CardContent sx={{ p: 2 }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <Box sx={{ flex: 1 }}>
                                                    {/* Restaurant name and link */}
                                                    <Typography
                                                        variant="h6"
                                                        component={place.url ? 'a' : 'div'}
                                                        href={place.url || '#'}
                                                        target={place.url ? '_blank' : undefined}
                                                        rel={place.url ? 'noopener noreferrer' : undefined}
                                                        sx={{
                                                            fontWeight: 'bold',
                                                            color: place.url ? 'primary.main' : 'text.primary',
                                                            textDecoration: 'none',
                                                            '&:hover': place.url ? { textDecoration: 'underline' } : {},
                                                            mb: 1,
                                                        }}
                                                    >
                                                        {place.name}
                                                    </Typography>

                                                    {/* Address */}
                                                    {place.address && (
                                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                                            {place.address}
                                                        </Typography>
                                                    )}

                                                    {/* Distance and details */}
                                                    <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                            <LocationOnIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                                            <Typography variant="body2" color="text.secondary">
                                                                {formatDistance(place.distance_m)}
                                                            </Typography>
                                                        </Box>

                                                        {place.rating && (
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                                <StarIcon sx={{ fontSize: 16, color: 'warning.main' }} />
                                                                <Typography variant="body2">
                                                                    {place.rating}
                                                                </Typography>
                                                            </Box>
                                                        )}

                                                        {place.price && (
                                                            <Typography variant="body2" color="success.main" fontWeight="bold">
                                                                {place.price}
                                                            </Typography>
                                                        )}

                                                        {place.open_now === true && (
                                                            <Chip
                                                                label="Open now"
                                                                size="small"
                                                                color="success"
                                                                variant="outlined"
                                                                icon={<AccessTimeIcon sx={{ fontSize: 14 }} />}
                                                            />
                                                        )}
                                                    </Stack>

                                                    {/* Categories */}
                                                    {place.categories && place.categories.length > 0 && (
                                                        <Box sx={{ mt: 1 }}>
                                                            <Stack direction="row" spacing={0.5} flexWrap="wrap">
                                                                {place.categories.slice(0, 3).map((category, index) => (
                                                                    <Chip
                                                                        key={index}
                                                                        label={category}
                                                                        size="small"
                                                                        variant="outlined"
                                                                        sx={{ fontSize: '0.75rem', height: 24 }}
                                                                    />
                                                                ))}
                                                            </Stack>
                                                        </Box>
                                                    )}

                                                    {/* Provider source */}
                                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                                                        Source: {place.provider}
                                                    </Typography>
                                                </Box>

                                                {/* Directions button */}
                                                <IconButton
                                                    onClick={() => handleDirections(place)}
                                                    sx={{
                                                        ml: 1,
                                                        backgroundColor: 'rgba(25, 118, 210, 0.1)',
                                                        '&:hover': {
                                                            backgroundColor: 'primary.main',
                                                            color: 'white',
                                                        },
                                                        transition: 'all 0.2s ease',
                                                    }}
                                                    title="Get directions"
                                                >
                                                    <DirectionsIcon sx={{ fontSize: 20 }} />
                                                </IconButton>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                ))}
                            </Stack>
                        </>
                    )}

                    {/* Attribution Footer */}
                    <Divider sx={{ my: 3 }} />
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center' }}>
                        Attribution: Data provided by Geoapify, Yelp, Foursquare, and OpenTripMap as applicable per provider terms.
                        Restaurant information is subject to provider availability and accuracy.
                    </Typography>
                </>
            )}
        </Paper>
    );
};

export default NearbyRestaurants;