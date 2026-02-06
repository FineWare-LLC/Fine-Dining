import { Box, CssBaseline, useTheme } from '@mui/material';
import { keyframes } from '@emotion/react';
import Head from 'next/head';
import React from 'react';
import HighsControlPanel from '@/components/Dashboard/HighsControlPanel';
import NewHeader from '@/components/Dashboard/NewHeader';
import NewNavigationDrawer from '@/components/Dashboard/NewNavigationDrawer';

const drift = keyframes`
    0% { transform: translate(-6%, -4%) scale(1); opacity: 0.35; }
    50% { transform: translate(4%, 6%) scale(1.05); opacity: 0.5; }
    100% { transform: translate(-6%, -4%) scale(1); opacity: 0.35; }
`;

const noiseData = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180' viewBox='0 0 180 180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2' stitchTiles='stitch'/></filter><rect width='180' height='180' filter='url(%23n)' opacity='0.5'/></svg>";

export default function OptimizerPage() {
    const theme = useTheme();

    return (
        <>
            <Head><title>Meal Optimizer</title></Head>
            <CssBaseline />
            <Box
                sx={{
                    minHeight: '100vh',
                    position: 'relative',
                    overflow: 'hidden',
                    background: [
                        'radial-gradient(circle at 10% 15%, rgba(120, 168, 255, 0.22), transparent 45%)',
                        'radial-gradient(circle at 85% 20%, rgba(255, 196, 140, 0.22), transparent 40%)',
                        'radial-gradient(circle at 40% 80%, rgba(140, 220, 200, 0.22), transparent 45%)',
                        'linear-gradient(180deg, #F7F8FB 0%, #EEF1F6 60%, #F5EFE8 100%)',
                    ].join(','),
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        inset: 0,
                        backgroundImage: `url(${noiseData})`,
                        opacity: 0.035,
                        mixBlendMode: 'soft-light',
                        pointerEvents: 'none',
                    },
                    '&::after': {
                        content: '""',
                        position: 'absolute',
                        inset: '-10%',
                        background: 'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.6), transparent 55%)',
                        filter: 'blur(40px)',
                        animation: `${drift} 22s ease-in-out infinite`,
                        pointerEvents: 'none',
                    },
                }}
            >
                <NewHeader appearance="glass" />
                <Box
                    component="main"
                    sx={{
                        pt: `calc(${theme.mixins.toolbar.minHeight}px + 16px)`,
                        pb: '90px',
                        px: { xs: 2, sm: 3, md: 4 },
                        maxWidth: '1300px',
                        mx: 'auto',
                        position: 'relative',
                        zIndex: 1,
                    }}
                >
                    <HighsControlPanel />
                </Box>
                <NewNavigationDrawer />
            </Box>
        </>
    );
}
