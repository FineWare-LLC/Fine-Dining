/**
 * Modern loading spinner component with food-themed animations
 */
import { keyframes } from '@emotion/react';
import { Box, Typography, useTheme } from '@mui/material';
import React from 'react';

// Animation keyframes
const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const bounce = keyframes`
  0%, 20%, 53%, 80%, 100% {
    transform: translate3d(0,0,0);
  }
  40%, 43% {
    transform: translate3d(0, -30px, 0);
  }
  70% {
    transform: translate3d(0, -15px, 0);
  }
  90% {
    transform: translate3d(0, -4px, 0);
  }
`;

const pulse = keyframes`
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.7;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
`;

const fadeInOut = keyframes`
  0%, 100% { opacity: 0.3; }
  50% { opacity: 1; }
`;

/**
 * LoadingSpinner - Modern loading component with multiple variants
 * @param {string} variant - Type of loading animation ('spinner', 'dots', 'pulse', 'food')
 * @param {string} size - Size of the loader ('small', 'medium', 'large')
 * @param {string} message - Optional loading message
 * @param {boolean} fullScreen - Whether to show as full screen overlay
 */
export default function LoadingSpinner({
    variant = 'spinner',
    size = 'medium',
    message = 'Loading...',
    fullScreen = false,
}) {
    const theme = useTheme();

    const sizeMap = {
        small: { width: 24, height: 24, fontSize: '0.875rem' },
        medium: { width: 40, height: 40, fontSize: '1rem' },
        large: { width: 60, height: 60, fontSize: '1.125rem' },
    };

    const currentSize = sizeMap[size];

    const renderSpinner = () => {
        switch (variant) {
            case 'dots':
                return (
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        {[0, 1, 2].map((index) => (
                            <Box
                                key={index}
                                sx={{
                                    width: currentSize.width / 3,
                                    height: currentSize.width / 3,
                                    borderRadius: '50%',
                                    background: theme.palette.gradient?.primary || theme.palette.primary.main,
                                    animation: `${bounce} 1.4s ease-in-out ${index * 0.16}s infinite both`,
                                }}
                            />
                        ))}
                    </Box>
                );

            case 'pulse':
                return (
                    <Box
                        sx={{
                            width: currentSize.width,
                            height: currentSize.height,
                            borderRadius: '50%',
                            background: theme.palette.gradient?.primary || theme.palette.primary.main,
                            animation: `${pulse} 1.5s ease-in-out infinite`,
                        }}
                    />
                );

            case 'food':
                return (
                    <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {/* Outer ring */}
                        <Box
                            sx={{
                                width: currentSize.width,
                                height: currentSize.height,
                                border: `3px solid ${theme.palette.primary.light}`,
                                borderTop: `3px solid ${theme.palette.primary.main}`,
                                borderRadius: '50%',
                                animation: `${spin} 1s linear infinite`,
                            }}
                        />
                        {/* Inner food icon */}
                        <Box
                            sx={{
                                position: 'absolute',
                                fontSize: currentSize.width / 2,
                                animation: `${fadeInOut} 2s ease-in-out infinite`,
                            }}
                        >
              🍽️
                        </Box>
                    </Box>
                );

            default: // spinner
                return (
                    <Box
                        sx={{
                            width: currentSize.width,
                            height: currentSize.height,
                            border: `4px solid ${theme.palette.primary.light}`,
                            borderTop: `4px solid ${theme.palette.primary.main}`,
                            borderRadius: '50%',
                            animation: `${spin} 1s linear infinite`,
                        }}
                    />
                );
        }
    };

    const content = (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
                p: 3,
            }}
        >
            {renderSpinner()}
            {message && (
                <Typography
                    variant="body2"
                    sx={{
                        fontSize: currentSize.fontSize,
                        fontWeight: 500,
                        color: theme.palette.text.secondary,
                        textAlign: 'center',
                        animation: `${fadeInOut} 2s ease-in-out infinite`,
                    }}
                >
                    {message}
                </Typography>
            )}
        </Box>
    );

    if (fullScreen) {
        return (
            <Box
                sx={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(10px)',
                    zIndex: 9999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Box
                    sx={{
                        background: theme.palette.background.paper,
                        borderRadius: 4,
                        boxShadow: theme.shadows[8],
                        p: 4,
                    }}
                >
                    {content}
                </Box>
            </Box>
        );
    }

    return content;
}