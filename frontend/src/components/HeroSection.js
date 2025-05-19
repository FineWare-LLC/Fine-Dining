/**
 * @fileoverview HeroSection component
 */
// components/HeroSection.js
/**
 * @fileoverview The hero section for FineDinning landing page
 */

import React from 'react';
import { Box, Typography } from '@mui/material';

/**
 * HeroSection - Displays the FineDinning logo & tagline
 * @returns {JSX.Element} The hero/branding portion of the page
 */
/**
 * HeroSection component
 * @param {object} props
 * @returns {JSX.Element}
 */
export default function HeroSection() {
    return (
        <Box
            sx={{
                textAlign: 'center',
                marginBottom: '2rem'
            }}
        >
            <Box
                component="img"
                src="/plate.svg"
                alt="Plate Logo"
                sx={{ width: '120px', marginBottom: '1rem' }}
            />
            <Typography variant="h4" gutterBottom>
                &lt; FW / &gt; FINE DINING
            </Typography>
            <Typography variant="subtitle1">
                Sign in to continue
            </Typography>
        </Box>
    );
}
