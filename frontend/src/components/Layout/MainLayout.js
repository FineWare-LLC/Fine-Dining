import React, { useState, useEffect } from 'react';
import { Box, CssBaseline, CircularProgress } from '@mui/material';
import NewHeader from '../Dashboard/NewHeader';
import NewNavigationDrawer from '../Dashboard/NewNavigationDrawer';
import { useAuth } from '../../context/AuthContext';
import Head from 'next/head';

const MainLayout = ({ children, title = 'Fine Dining' }) => {
    const { user } = useAuth();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) {
        return null; // Or a loading spinner if preferred, but null avoids flash of unstyled content
    }

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
            <Head>
                <title>{title}</title>
            </Head>
            <CssBaseline />
            
            {/* Navigation Drawer */}
            <NewNavigationDrawer />

            {/* Main Content Area */}
            <Box component="main" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                {/* Header */}
                <NewHeader user={user} />

                {/* Page Content */}
                <Box sx={{ flexGrow: 1, p: 0 }}>
                    {children}
                </Box>
            </Box>
        </Box>
    );
};

export default MainLayout;
