/**
 * New Dashboard page implementing the meal planning canvas blueprint
 */
import { Box, CssBaseline, CircularProgress } from '@mui/material';
import Head from 'next/head';
import React, { useEffect, useState } from 'react';
import NewHeader from '@/components/Dashboard/NewHeader';
import NewNavigationDrawer from '@/components/Dashboard/NewNavigationDrawer';
import PlannerCanvas from '@/components/PlannerCanvas/PlannerCanvas';
import { useAuth } from '@/context/AuthContext';

export default function Dashboard() {
    const { user } = useAuth();
    const [currentUser, setCurrentUser] = useState(null);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        setCurrentUser(user);
    }, [user]);

    if (!isClient) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <>
            <Head>
                <title>Meal Planner - Fine Dining</title>
                <meta name="description" content="Your intelligent meal planning canvas" />
            </Head>

            <CssBaseline />
            <Box sx={{ display: 'flex', minHeight: '100vh' }}>
                {/* Navigation Drawer */}
                <NewNavigationDrawer />

                {/* Main Content - Planner Canvas */}
                <Box component="main" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    {/* Header */}
                    <NewHeader user={currentUser} />

                    {/* Planner Canvas */}
                    <PlannerCanvas />
                </Box>
            </Box>
        </>
    );
}