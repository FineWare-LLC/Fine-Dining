// src/components/Dashboard/Recommendations.js
import { Box, Grid, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';
import RestaurantCard from './RestaurantCard'; // Import the Tailwind-styled card
// Removed useTheme and style constants/functions

const Recommendations = React.memo(({ restaurants }) => {
    // Removed theme = useTheme()

    if (!restaurants || restaurants.length === 0) {
        return (
            // Apply Tailwind classes for empty state text
            <Typography className="mb-4 text-center text-gray-500 dark:text-gray-400">
                No restaurant recommendations available right now.
            </Typography>
        );
    }

    return (
        // Apply Tailwind margin
        <Box className="mb-8">
            <Typography component="h2" className="font-bold mb-3 text-2xl sm:text-3xl">
                Restaurants For You
            </Typography>
            {/* Keep MUI Grid for layout */}
            <Grid container spacing={3} className="mb-4">
                {restaurants.map((restaurant) => (
                    <Grid item xs={12} sm={6} md={4} key={restaurant.id}>
                        {/* Render the RestaurantCard which now uses Tailwind */}
                        <RestaurantCard restaurant={restaurant} />
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
});

Recommendations.displayName = 'Recommendations';

Recommendations.propTypes = {
    restaurants: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
            name: PropTypes.string.isRequired,
            description: PropTypes.string,
            imageUrl: PropTypes.string,
        }),
    ),
};

export default Recommendations;