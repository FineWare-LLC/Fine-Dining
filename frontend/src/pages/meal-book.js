import { Box, CssBaseline, useTheme } from '@mui/material';
import Head from 'next/head';
import React, { useEffect, useState } from 'react';
import MealBookFlow from '@/components/MealBook/MealBookFlow';
import NewHeader from '@/components/Dashboard/NewHeader';
import NewNavigationDrawer from '@/components/Dashboard/NewNavigationDrawer';
import { useAuth } from '@/context/AuthContext';

export default function MealBookPage() {
    const { user } = useAuth();
    const [currentUser, setCurrentUser] = useState(null);
    const [isClient, setIsClient] = useState(false);
    const theme = useTheme();

    useEffect(() => {
        setIsClient(true);
        setCurrentUser(user);
    }, [user]);

    return (
        <>
            <Head><title>Meal Book</title></Head>
            <CssBaseline />
            <NewHeader user={isClient ? currentUser : null} />
            <Box
                component="main"
                sx={{
                    pt: `calc(${theme.mixins.toolbar.minHeight}px + 8px)`,
                    pb: '90px',
                    px: { xs: 2, sm: 3, md: 4 },
                    maxWidth: '1200px',
                    mx: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: { xs: 2, sm: 3 },
                }}
            >
                <MealBookFlow />
            </Box>
            <NewNavigationDrawer />
        </>
    );
}
