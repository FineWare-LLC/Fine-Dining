import { keyframes } from '@emotion/react';
import { alpha, Box, useTheme } from '@mui/material';
import React from 'react';
import HeroSection from './HeroSection';

const float = keyframes`
  0%, 100% { transform: translate3d(0, 0, 0); }
  50% { transform: translate3d(0, -12px, 0); }
`;

const drift = keyframes`
  0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
  50% { transform: translate3d(12px, -8px, 0) scale(1.02); }
`;

export default function AuthShell({ children, side }) {
    const theme = useTheme();

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', lg: '1.15fr 0.85fr' },
                position: 'relative',
                overflow: 'hidden',
                background: `radial-gradient(circle at 15% 20%, ${alpha(theme.palette.primary.main, 0.18)} 0%, transparent 45%),
                    radial-gradient(circle at 85% 5%, ${alpha(theme.palette.secondary.main, 0.16)} 0%, transparent 40%),
                    ${theme.palette.background.default}`,
            }}
        >
            <Box
                sx={{
                    position: 'absolute',
                    top: { xs: '-10%', lg: '6%' },
                    left: { xs: '-20%', lg: '6%' },
                    width: { xs: 280, lg: 360 },
                    height: { xs: 280, lg: 360 },
                    borderRadius: '50%',
                    background: alpha(theme.palette.primary.light, 0.3),
                    filter: 'blur(40px)',
                    animation: `${float} 12s ease-in-out infinite`,
                    zIndex: 0,
                }}
            />
            <Box
                sx={{
                    position: 'absolute',
                    bottom: { xs: '-12%', lg: '4%' },
                    right: { xs: '-18%', lg: '8%' },
                    width: { xs: 260, lg: 340 },
                    height: { xs: 260, lg: 340 },
                    borderRadius: '50%',
                    background: alpha(theme.palette.accent.main, 0.25),
                    filter: 'blur(44px)',
                    animation: `${drift} 16s ease-in-out infinite`,
                    zIndex: 0,
                }}
            />

            <Box
                sx={{
                    position: 'relative',
                    zIndex: 1,
                    px: { xs: 3, sm: 5, lg: 8 },
                    py: { xs: 5, lg: 8 },
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Box sx={{ width: '100%', maxWidth: 560 }}>
                    {side || <HeroSection align="left" compact />}
                </Box>
            </Box>

            <Box
                sx={{
                    position: 'relative',
                    zIndex: 1,
                    px: { xs: 3, sm: 5, lg: 7 },
                    py: { xs: 5, lg: 8 },
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: {
                        xs: 'transparent',
                        lg: alpha(theme.palette.background.paper, 0.78),
                    },
                    backdropFilter: { lg: 'blur(18px)' },
                    borderLeft: {
                        lg: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
                    },
                }}
            >
                <Box sx={{ width: '100%', maxWidth: 460 }}>{children}</Box>
            </Box>
        </Box>
    );
}
