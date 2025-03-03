// pages/index.js
/**
 * @fileoverview FineDinning Landing Page using Next.js & Material UI
 */

import React from 'react';
import { Container, Box } from '@mui/material';
import HeroSection from '../components/HeroSection';
import LoginForm from '../components/LoginForm';

/**
 * FineDinningLandingPage - Renders the full landing page layout
 * @returns {JSX.Element} The landing page component
 */
export default function FineDinningLandingPage() {
    return (
        <Container
            maxWidth="xs"
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
                padding: '1rem'
            }}
        >
            <HeroSection />
            <Box sx={{ marginTop: '1rem', width: '100%' }}>
                <LoginForm />
            </Box>
        </Container>
    );
}
