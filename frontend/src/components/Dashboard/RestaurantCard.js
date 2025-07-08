/**
 * Enhanced restaurant card with modern design and interactive elements
 */
import React from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  CardMedia, 
  Box, 
  Chip, 
  Rating,
  IconButton,
  useTheme
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import DirectionsIcon from '@mui/icons-material/Directions';
import StarIcon from '@mui/icons-material/Star';
import RestaurantIcon from '@mui/icons-material/Restaurant';

export default function RestaurantCard({ restaurant, source }) {
  const theme = useTheme();

  const handleDirections = () => {
    if (restaurant.location) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${restaurant.location.latitude},${restaurant.location.longitude}`;
      window.open(url, '_blank');
    }
  };

  return (
    <Card
      sx={{ 
        mt: 2,
        borderRadius: 3,
        overflow: 'hidden',
        background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
        }
      }}
    >
      {/* Image Section with Overlay */}
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          height="120"
          image={restaurant.imageUrl || `https://source.unsplash.com/400x300/?restaurant&sig=${restaurant.placeId || restaurant.name}`}
          alt={restaurant.name}
          sx={{
            transition: 'transform 0.3s ease',
            '&:hover': {
              transform: 'scale(1.02)',
            }
          }}
        />

        {/* Gradient Overlay */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.2) 100%)',
          }}
        />

        {/* Source Badge */}
        <Chip
          label={source === 'google' ? 'Google Places' : 'OpenStreetMap'}
          size="small"
          sx={{
            position: 'absolute',
            top: 8,
            left: 8,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            fontSize: '0.7rem',
            fontWeight: 600,
          }}
        />

        {/* Directions Button */}
        {restaurant.location && (
          <IconButton
            onClick={handleDirections}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              '&:hover': {
                backgroundColor: theme.palette.primary.main,
                color: 'white',
                transform: 'scale(1.1)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            <DirectionsIcon sx={{ fontSize: 18 }} />
          </IconButton>
        )}
      </Box>

      <CardContent sx={{ p: 2.5 }}>
        {/* Restaurant Name */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1.5 }}>
          <RestaurantIcon 
            sx={{ 
              color: theme.palette.primary.main, 
              fontSize: 20,
              mt: 0.2
            }} 
          />
          <Typography 
            variant="h6" 
            sx={{
              fontWeight: 700,
              lineHeight: 1.3,
              background: theme.palette.gradient?.hero || 'linear-gradient(135deg, #FF6B35 0%, #4CAF50 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {restaurant.name}
          </Typography>
        </Box>

        {/* Location */}
        {restaurant.vicinity && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1.5 }}>
            <LocationOnIcon 
              sx={{ 
                color: theme.palette.secondary.main, 
                fontSize: 16 
              }} 
            />
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ fontWeight: 500 }}
            >
              {restaurant.vicinity}
            </Typography>
          </Box>
        )}

        {/* Rating Section */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {restaurant.rating ? (
              <>
                <Rating
                  value={restaurant.rating}
                  precision={0.1}
                  readOnly
                  size="small"
                  sx={{
                    '& .MuiRating-iconFilled': {
                      color: theme.palette.accent?.main || '#FFC107',
                    },
                  }}
                />
                <Typography 
                  variant="body2" 
                  fontWeight={600}
                  color="text.primary"
                >
                  {restaurant.rating}
                </Typography>
              </>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <StarIcon 
                  sx={{ 
                    color: theme.palette.text.disabled, 
                    fontSize: 16 
                  }} 
                />
                <Typography 
                  variant="body2" 
                  color="text.disabled"
                  fontWeight={500}
                >
                  No rating
                </Typography>
              </Box>
            )}
          </Box>

          {/* Review Count */}
          {restaurant.userRatingsTotal && (
            <Typography 
              variant="caption" 
              color="text.secondary"
              sx={{ 
                backgroundColor: theme.palette.surface?.light || '#f5f5f5',
                px: 1,
                py: 0.5,
                borderRadius: 1,
                fontWeight: 500,
              }}
            >
              {restaurant.userRatingsTotal} reviews
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
