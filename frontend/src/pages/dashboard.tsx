// @ts-nocheck
import { Box, Typography, Grid, Chip, LinearProgress, CircularProgress } from '@mui/material';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import {
    buildActiveMealPlanFeedbackContainerStyles,
    getActiveMealPlanRouteState,
} from '@/utils/activeMealPlan';

export default function UserDashboard() {
    const { logout, user } = useAuth();
    const router = useRouter();
    const activeMealPlanRouteState = getActiveMealPlanRouteState(router.query, {
        isLoading: !router.isReady,
    });
    const activeMealPlanFeedbackStyles = buildActiveMealPlanFeedbackContainerStyles(
        activeMealPlanRouteState.feedback.state,
    );

    const firstName = user?.name?.split(' ')[0] || 'there';
    const tier = user?.subscriptionPlan || 'FREE';
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

    const go = (href) => router.push(href).catch(() => {});

    return (
        <ProtectedRoute allowedRoles={['USER', 'PREMIUM', 'PRO', 'ADMIN']}>
            <Head><title>Fine Dining</title></Head>

            <MainLayout>
                {/* ─── Hero ─── */}
                <Box sx={{ py: { xs: 2, md: 4 } }}>
                    <Chip label={`${tier} plan`} sx={{ mb: 2, bgcolor: 'rgba(240,142,93,0.13)', color: '#F08E5D', fontWeight: 700 }} />
                    <Typography sx={{
                        fontFamily: '"Fraunces", serif',
                        fontWeight: 600,
                        fontSize: { xs: '1.75rem', md: '2.5rem' },
                        color: '#fff',
                        lineHeight: 1.2,
                        mb: 0.5,
                    }}>
                        {greeting}, {firstName}
                    </Typography>
                    <Typography sx={{
                        fontSize: '1rem',
                        color: 'rgba(255,255,255,0.72)',
                        fontWeight: 400,
                    }}>
                        Eat well, spend less.
                    </Typography>
                </Box>

                <Box
                    id="active-meal-plan-feedback"
                    role={activeMealPlanRouteState.feedback.role}
                    aria-live={activeMealPlanRouteState.feedback.ariaLive}
                    aria-atomic="true"
                    aria-busy={activeMealPlanRouteState.feedback.state === 'loading' ? 'true' : 'false'}
                    sx={{
                        mb: 3,
                        minHeight: activeMealPlanRouteState.feedback.minHeight,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        px: 1.5,
                        py: 1,
                        borderRadius: 1.5,
                        ...activeMealPlanFeedbackStyles,
                    }}
                >
                    {activeMealPlanRouteState.feedback.showSpinner && (
                        <CircularProgress size={18} />
                    )}
                    <Typography
                        variant="body2"
                        sx={{
                            color: activeMealPlanRouteState.feedback.state === 'error'
                                ? 'error.main'
                                : activeMealPlanRouteState.feedback.state === 'success'
                                    ? 'success.main'
                                    : 'text.secondary',
                            fontWeight: activeMealPlanRouteState.feedback.state === 'success' ? 700 : 400,
                        }}
                    >
                        {activeMealPlanRouteState.feedback.message}
                    </Typography>
                </Box>

                <Grid container spacing={2} sx={{ mb: 4 }}>
                    {[
                        { label: 'Calories', value: '1,620 / 2,200', progress: 74 },
                        { label: 'Protein', value: '146g / 170g', progress: 86 },
                        { label: 'Water', value: '5 / 8 cups', progress: 62 },
                        { label: 'Plan readiness', value: '4 days planned', progress: tier === 'FREE' ? 70 : 40 },
                    ].map((stat) => (
                        <Grid item xs={12} sm={6} md={3} key={stat.label}>
                            <Box sx={{ p: 2.5, borderRadius: '18px', bgcolor: '#1C1815', border: '1px solid rgba(255,255,255,0.06)' }}>
                                <Typography sx={{ color: 'rgba(255,255,255,0.72)', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase' }}>{stat.label}</Typography>
                                <Typography sx={{ color: '#fff', fontWeight: 800, mt: 1 }}>{stat.value}</Typography>
                                <LinearProgress variant="determinate" value={stat.progress} sx={{ mt: 2, height: 7, borderRadius: 4 }} />
                            </Box>
                        </Grid>
                    ))}
                </Grid>

                {/* ─── Primary Action: Browse Meals ─── */}
                <Box sx={{ mb: 4 }}>
                    <Box
                        onClick={() => go('/recipes')}
                        sx={{
                            position: 'relative',
                            borderRadius: '24px',
                            overflow: 'hidden',
                            cursor: 'pointer',
                            height: { xs: 180, md: 240 },
                            background: 'linear-gradient(135deg, #F08E5D 0%, #D86E3D 60%, #1C1815 100%)',
                            transition: 'all 0.3s ease',
                            '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 40px rgba(240,142,93,0.3)' },
                            '&:active': { transform: 'scale(0.98)' },
                        }}
                    >
                        {/* Decorative food circles */}
                        <Box sx={{
                            position: 'absolute', top: -20, right: -20,
                            width: 160, height: 160, borderRadius: '50%',
                            background: 'rgba(243,199,103,0.15)',
                        }} />
                        <Box sx={{
                            position: 'absolute', bottom: -30, right: 40,
                            width: 100, height: 100, borderRadius: '50%',
                            background: 'rgba(255,255,255,0.06)',
                        }} />
                        {/* Content */}
                        <Box sx={{
                            position: 'relative', zIndex: 1,
                            height: '100%', display: 'flex', flexDirection: 'column',
                            justifyContent: 'space-between', p: { xs: 3, md: 4 },
                        }}>
                            <Box>
                                <Typography sx={{
                                    fontSize: { xs: '2.5rem', md: '3.5rem' }, lineHeight: 1, mb: 0.5,
                                }}>
                                    🍽️
                                </Typography>
                            </Box>
                            <Box>
                                <Typography sx={{
                                    fontFamily: '"Fraunces", serif',
                                    fontWeight: 700,
                                    fontSize: { xs: '1.5rem', md: '2rem' },
                                    color: '#fff',
                                    mb: 0.5,
                                }}>
                                    Browse Meals
                                </Typography>
                                <Typography sx={{
                                    fontSize: '0.9rem',
                                    color: 'rgba(255,255,255,0.8)',
                                    fontWeight: 400,
                                }}>
                                    Discover recipes that fit your budget & dietary goals
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                </Box>

                {/* ─── Grid Row ─── */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    {/* My Cookbook */}
                    <Grid item xs={12} sm={6} md={4}>
                        <Box
                            onClick={() => go('/cookbook')}
                            sx={{
                                borderRadius: '20px',
                                height: 160,
                                background: 'linear-gradient(160deg, #1C1815 0%, #241F1B 100%)',
                                border: '1px solid rgba(255,255,255,0.06)',
                                cursor: 'pointer',
                                transition: 'all 0.25s ease',
                                '&:hover': { transform: 'translateY(-4px)', borderColor: 'rgba(127,175,124,0.3)', boxShadow: '0 8px 30px rgba(0,0,0,0.4)' },
                                '&:active': { transform: 'scale(0.97)' },
                                display: 'flex', flexDirection: 'column',
                                justifyContent: 'space-between', p: 3,
                            }}
                        >
                            <Typography sx={{ fontSize: '2rem', lineHeight: 1 }}>📖</Typography>
                            <Box>
                                <Typography sx={{
                                    fontWeight: 600, fontSize: '1rem', color: '#fff', mb: 0.15,
                                }}>
                                    My Cookbook
                                </Typography>
                                <Typography sx={{
                                    fontSize: '0.8rem', color: 'rgba(255,255,255,0.68)',
                                }}>
                                    Your saved favorites
                                </Typography>
                            </Box>
                        </Box>
                    </Grid>

                    {/* Meal Plan */}
                    <Grid item xs={12} sm={6} md={4}>
                        <Box
                            onClick={() => go(activeMealPlanRouteState.plannerHref)}
                            sx={{
                                borderRadius: '20px',
                                height: 160,
                                background: 'linear-gradient(160deg, #1C1815 0%, #241F1B 100%)',
                                border: '1px solid rgba(255,255,255,0.06)',
                                cursor: 'pointer',
                                transition: 'all 0.25s ease',
                                '&:hover': { transform: 'translateY(-4px)', borderColor: 'rgba(243,199,103,0.3)', boxShadow: '0 8px 30px rgba(0,0,0,0.4)' },
                                '&:active': { transform: 'scale(0.97)' },
                                display: 'flex', flexDirection: 'column',
                                justifyContent: 'space-between', p: 3,
                            }}
                        >
                            <Typography sx={{ fontSize: '2rem', lineHeight: 1 }}>📅</Typography>
                            <Box>
                                <Typography sx={{
                                    fontWeight: 600, fontSize: '1rem', color: '#fff', mb: 0.15,
                                }}>
                                    Meal Plan
                                </Typography>
                                <Typography sx={{
                                    fontSize: '0.8rem', color: 'rgba(255,255,255,0.68)',
                                }}>
                                    Plan your weekly meals
                                </Typography>
                            </Box>
                        </Box>
                    </Grid>

                    {/* Dietary Preferences */}
                    <Grid item xs={12} sm={12} md={4}>
                        <Box
                            onClick={() => go('/constraints')}
                            sx={{
                                borderRadius: '20px',
                                height: 160,
                                background: 'linear-gradient(135deg, rgba(127,175,124,0.1) 0%, rgba(243,199,103,0.05) 100%)',
                                border: '1px solid rgba(127,175,124,0.15)',
                                cursor: 'pointer',
                                transition: 'all 0.25s ease',
                                '&:hover': { transform: 'translateY(-4px)', borderColor: 'rgba(127,175,124,0.3)', bgcolor: 'rgba(127,175,124,0.15)' },
                                '&:active': { transform: 'scale(0.97)' },
                                display: 'flex', flexDirection: 'column',
                                justifyContent: 'space-between', p: 3,
                            }}
                        >
                            <Typography sx={{ fontSize: '2rem', lineHeight: 1 }}>⚙️</Typography>
                            <Box>
                                <Typography sx={{
                                    fontWeight: 600, fontSize: '1rem', color: '#fff', mb: 0.15,
                                }}>
                                    Preferences
                                </Typography>
                                <Typography sx={{
                                    fontSize: '0.8rem', color: 'rgba(255,255,255,0.68)',
                                }}>
                                    Allergies & nutrition goals
                                </Typography>
                            </Box>
                        </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <Box
                            onClick={() => go('/tools')}
                            sx={{
                                borderRadius: '20px',
                                height: 160,
                                background: 'linear-gradient(160deg, #1C1815 0%, #241F1B 100%)',
                                border: '1px solid rgba(255,255,255,0.06)',
                                cursor: 'pointer',
                                transition: 'all 0.25s ease',
                                '&:hover': { transform: 'translateY(-4px)', borderColor: 'rgba(240,142,93,0.3)', boxShadow: '0 8px 30px rgba(0,0,0,0.4)' },
                                display: 'flex', flexDirection: 'column',
                                justifyContent: 'space-between', p: 3,
                            }}
                        >
                            <Typography sx={{ fontSize: '2rem', lineHeight: 1 }}>📊</Typography>
                            <Box>
                                <Typography sx={{ fontWeight: 600, fontSize: '1rem', color: '#fff', mb: 0.15 }}>
                                    Diet Tools
                                </Typography>
                                <Typography sx={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.68)' }}>
                                    Water, weight, macros, pantry, groceries
                                </Typography>
                            </Box>
                        </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <Box
                            onClick={() => go('/account')}
                            sx={{
                                borderRadius: '20px',
                                height: 160,
                                background: 'linear-gradient(135deg, rgba(240,142,93,0.13) 0%, rgba(243,199,103,0.08) 100%)',
                                border: '1px solid rgba(240,142,93,0.2)',
                                cursor: 'pointer',
                                transition: 'all 0.25s ease',
                                '&:hover': { transform: 'translateY(-4px)', borderColor: 'rgba(240,142,93,0.42)' },
                                display: 'flex', flexDirection: 'column',
                                justifyContent: 'space-between', p: 3,
                            }}
                        >
                            <Typography sx={{ fontSize: '2rem', lineHeight: 1 }}>💳</Typography>
                            <Box>
                                <Typography sx={{ fontWeight: 600, fontSize: '1rem', color: '#fff', mb: 0.15 }}>
                                    Account
                                </Typography>
                                <Typography sx={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.68)' }}>
                                    Plan limits, upgrades, billing
                                </Typography>
                            </Box>
                        </Box>
                    </Grid>
                </Grid>

                {/* ─── Quick Tips ─── */}
                <Box sx={{ mb: 4, p: 3, borderRadius: '24px', bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                    <Typography sx={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: '#F08E5D',
                        textTransform: 'uppercase',
                        letterSpacing: '0.15em',
                        mb: 3,
                    }}>
                        Getting Started
                    </Typography>
                    <Grid container spacing={4}>
                        {[
                            { n: '1', title: 'Set Preferences', text: 'Define your diet, allergies, and budget constraints.' },
                            { n: '2', title: 'Explore Meals', text: 'Browse our catalog and save recipes to your cookbook.' },
                            { n: '3', title: 'Generate Plan', text: 'Let our optimizer create your perfect weekly meal schedule.' },
                        ].map((step) => (
                            <Grid item xs={12} md={4} key={step.n}>
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <Box sx={{
                                        width: 32, height: 32, borderRadius: '10px',
                                        background: 'rgba(240,142,93,0.12)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        flexShrink: 0, mt: 0.5
                                    }}>
                                        <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#F08E5D' }}>
                                            {step.n}
                                        </Typography>
                                    </Box>
                                    <Box>
                                        <Typography sx={{ color: '#fff', fontWeight: 600, fontSize: '0.95rem', mb: 0.5 }}>
                                            {step.title}
                                        </Typography>
                                        <Typography sx={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.68)', lineHeight: 1.5 }}>
                                            {step.text}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            </MainLayout>
        </ProtectedRoute>
    );
}
