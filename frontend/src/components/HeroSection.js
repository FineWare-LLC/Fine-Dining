// components/HeroSection.js
/**
 * @fileoverview Enhanced hero section for Fine Dining landing page with modern design
 */

import { keyframes } from '@emotion/react';
import { Box, Typography, Container, Chip, useTheme } from '@mui/material';
import React from 'react';

// Animation keyframes
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const float = keyframes`
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
`;

const shimmer = keyframes`
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
`;

/**
 * HeroSection - Enhanced hero section with modern design and animations
 * @returns {JSX.Element} The enhanced hero/branding portion of the page
 */
export default function HeroSection() {
    const theme = useTheme();

    return (
        <Container maxWidth="md">
            <Box
                sx={{
                    textAlign: 'center',
                    py: 8,
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: theme.palette.gradient.hero,
                        opacity: 0.05,
                        borderRadius: 4,
                        zIndex: -1,
                    },
                }}
            >
                {/* Floating Logo */}
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        mb: 4,
                        animation: `${float} 3s ease-in-out infinite`,
                    }}
                >
                    <Box
                        sx={{
                            width: 120,
                            height: 120,
                            borderRadius: '50%',
                            background: theme.palette.gradient.primary,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 20px 40px rgba(255, 107, 53, 0.3)',
                            position: 'relative',
                            '&::after': {
                                content: '""',
                                position: 'absolute',
                                top: -2,
                                left: -2,
                                right: -2,
                                bottom: -2,
                                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main}, ${theme.palette.accent.main})`,
                                borderRadius: '50%',
                                zIndex: -1,
                                animation: `${shimmer} 2s linear infinite`,
                                backgroundSize: '200px 100%',
                            },
                        }}
                    >
                        <Box
                            component="img"
                            src="/plate-logo.png"
                            alt="Fine Dining Logo"
                            sx={{
                                width: '60px',
                                height: '60px',
                                filter: 'brightness(0) invert(1)',
                            }}
                        />
                    </Box>
                </Box>

                {/* Main Title with Gradient Text */}
                <Typography
                    variant="h1"
                    sx={{
                        background: theme.palette.gradient.hero,
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        fontWeight: 800,
                        mb: 2,
                        animation: `${fadeInUp} 1s ease-out`,
                        textShadow: '0 4px 8px rgba(0,0,0,0.1)',
                    }}
                >
                    FINE DINING
                </Typography>

                {/* Subtitle with Animation */}
                <Typography
                    variant="h5"
                    sx={{
                        color: 'text.secondary',
                        mb: 3,
                        fontWeight: 400,
                        animation: `${fadeInUp} 1s ease-out 0.2s both`,
                        maxWidth: '600px',
                        mx: 'auto',
                        lineHeight: 1.6,
                    }}
                >
                    Optimize your meals with advanced algorithms for perfect nutrition and cost balance
                </Typography>

                {/* Feature Chips */}
                <Box
                    sx={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 1,
                        justifyContent: 'center',
                        mb: 4,
                        animation: `${fadeInUp} 1s ease-out 0.4s both`,
                    }}
                >
                    {['AI-Powered', 'Cost Optimized', 'Nutrition Focused', 'Personalized'].map((feature, index) => (
                        <Chip
                            key={feature}
                            label={feature}
                            sx={{
                                background: theme.palette.gradient.accent,
                                color: 'white',
                                fontWeight: 600,
                                px: 2,
                                py: 1,
                                '&:hover': {
                                    transform: 'scale(1.05)',
                                    transition: 'transform 0.2s ease',
                                },
                            }}
                        />
                    ))}
                </Box>

                {/* Call to Action Text */}
                <Typography
                    variant="body1"
                    sx={{
                        color: 'text.secondary',
                        animation: `${fadeInUp} 1s ease-out 0.6s both`,
                        fontSize: '1.1rem',
                    }}
                >
                    Sign in to start your personalized meal planning journey
                </Typography>

                {/* Decorative Elements */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: '20%',
                        left: '10%',
                        width: 60,
                        height: 60,
                        borderRadius: '50%',
                        background: `linear-gradient(135deg, ${theme.palette.secondary.main}40, ${theme.palette.accent.main}40)`,
                        animation: `${float} 4s ease-in-out infinite`,
                        zIndex: -1,
                    }}
                />
                <Box
                    sx={{
                        position: 'absolute',
                        bottom: '20%',
                        right: '15%',
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        background: `linear-gradient(135deg, ${theme.palette.primary.main}40, ${theme.palette.secondary.main}40)`,
                        animation: `${float} 3.5s ease-in-out infinite reverse`,
                        zIndex: -1,
                    }}
                />
            </Box>
        </Container>
    );
}
