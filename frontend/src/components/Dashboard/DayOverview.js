// src/components/Dashboard/DayOverview.js
import React from 'react';
import PropTypes from 'prop-types';
import { Box, Card, CardMedia, Typography } from '@mui/material';
// Removed style constants/functions

const DayOverview = React.memo(({ meal }) => {
    if (!meal) return null;

    return (
        // Apply Tailwind classes to the Card component
        <Card className="mb-4 rounded-2xl shadow-lg overflow-hidden relative transition-all duration-300 ease-in-out hover:shadow-xl hover:scale-[1.02]">
            {meal.imageUrl && (
                <CardMedia
                    component="img"
                    image={meal.imageUrl}
                    alt={meal.title}
                    // Apply Tailwind classes for image styling
                    className="object-cover h-48 sm:h-60 md:h-72 w-full block"
                />
            )}
            {/* Overlay for text */}
            <Box className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent text-white p-4 sm:p-6">
                <Typography component="h3" className="font-bold text-xl sm:text-2xl mb-0.5">
                    Featured Meal
                </Typography>
                <Typography component="h4" className="text-base sm:text-lg opacity-90 mb-1">
                    {meal.title}
                </Typography>
                <Typography variant="body2" className="mb-2 opacity-95">
                    {meal.description}
                </Typography>
            </Box>
        </Card>
    );
});

DayOverview.displayName = 'DayOverview';

DayOverview.propTypes = {
    meal: PropTypes.shape({
        title: PropTypes.string.isRequired,
        description: PropTypes.string,
        imageUrl: PropTypes.string,
    }),
};

export default DayOverview;