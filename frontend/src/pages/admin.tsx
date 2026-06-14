// @ts-nocheck
import AssessmentIcon from '@mui/icons-material/Assessment';
import LogoutIcon from '@mui/icons-material/Logout';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';
import ShieldIcon from '@mui/icons-material/Shield';
import TravelExploreIcon from '@mui/icons-material/TravelExplore';
import {
    Box,
    Typography,
    Container,
    Grid,
    Paper,
    Button,
    AppBar,
    Toolbar,
    IconButton,
} from '@mui/material';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';

export default function AdminDashboard() {
    const { logout, user } = useAuth();
    const router = useRouter();

    return (
        <ProtectedRoute allowedRoles={['ADMIN']}>
            <Head>
                <title>Admin Dashboard - Control Center</title>
            </Head>
            <Box sx={{ flexGrow: 1 }}>
                <AppBar position="static" color="primary">
                    <Toolbar>
                        <ShieldIcon sx={{ mr: 2 }} />
                        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                            Admin Control Center
                        </Typography>
                        <Typography variant="body1" sx={{ mr: 3 }}>
                            Welcome, {user?.name}
                        </Typography>
                        <IconButton color="inherit" onClick={logout}>
                            <LogoutIcon />
                        </IconButton>
                    </Toolbar>
                </AppBar>

                <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={4}>
                            <Paper
                                onClick={() => router.push('/admin/users').catch(() => {})}
                                sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140, justifyContent: 'center', alignItems: 'center', cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                            >
                                <PeopleIcon color="primary" sx={{ fontSize: 40 }} />
                                <Typography variant="h6">User Management</Typography>
                                <Typography variant="body2" color="text.secondary">Manage system users and roles</Typography>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140, justifyContent: 'center', alignItems: 'center' }}>
                                <AssessmentIcon color="primary" sx={{ fontSize: 40 }} />
                                <Typography variant="h6">System Analytics</Typography>
                                <Typography variant="body2" color="text.secondary">Monitor platform performance</Typography>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140, justifyContent: 'center', alignItems: 'center' }}>
                                <SettingsIcon color="primary" sx={{ fontSize: 40 }} />
                                <Typography variant="h6">Global Settings</Typography>
                                <Typography variant="body2" color="text.secondary">Configure system-wide parameters</Typography>
                            </Paper>
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <Paper
                                onClick={() => router.push('/admin/crawler').catch(() => {})}
                                sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140, justifyContent: 'center', alignItems: 'center', cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                            >
                                <TravelExploreIcon color="primary" sx={{ fontSize: 40 }} />
                                <Typography variant="h6">Recipe Crawler</Typography>
                                <Typography variant="body2" color="text.secondary">Crawl the web for recipes</Typography>
                            </Paper>
                        </Grid>

                        <Grid item xs={12}>
                            <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column' }}>
                                <Typography variant="h6" gutterBottom>
                                    Recent Admin Logs
                                </Typography>
                                <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                                    <Typography variant="body2" component="pre">
                                        [INFO] 2026-05-04 01:45: Admin dashboard initialized.
                                        [INFO] 2026-05-04 01:40: Security audit completed. No issues found.
                                        [WARN] 2026-05-04 01:30: High traffic detected from unknown IP. Throttling applied.
                                    </Typography>
                                </Box>
                                <Button variant="outlined" sx={{ mt: 2, alignSelf: 'flex-start' }}>
                                    View Full Audit Log
                                </Button>
                            </Paper>
                        </Grid>
                    </Grid>
                </Container>
            </Box>
        </ProtectedRoute>
    );
}
