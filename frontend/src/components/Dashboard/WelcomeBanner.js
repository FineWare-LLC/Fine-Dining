/**
 * @fileoverview WelcomeBanner component
 */
// src/components/Dashboard/WelcomeBanner.js
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Box, Typography } from '@mui/material';
// Removed useTheme and style constants/functions

/**
 * WelcomeBanner component
 * @param {object} props
 * @returns {JSX.Element}
 */
const WelcomeBanner = React.memo(({ userName }) => {
    // Removed theme = useTheme()
    const [greeting, setGreeting] = useState('Hello');

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting('Good Morning');
        else if (hour < 18) setGreeting('Good Afternoon');
        else setGreeting('Good Evening');
    }, []);

    return (
        // Apply Tailwind classes
        // Replicating the exact gradient might require config customization. Using placeholder colors.
        <Box className="p-4 sm:p-6 md:p-8 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white text-center mb-4 shadow-lg">
            <Typography component="h2" className="font-bold text-3xl sm:text-4xl mb-1">
                {greeting}, {userName}!
            </Typography>
            <Typography className="text-base sm:text-lg opacity-90">
                Ready for a delightful culinary experience?
            </Typography>
        </Box>
    );
});

WelcomeBanner.displayName = 'WelcomeBanner';

WelcomeBanner.propTypes = {
    userName: PropTypes.string.isRequired,
};

export default WelcomeBanner;