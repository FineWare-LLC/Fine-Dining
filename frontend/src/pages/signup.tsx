// @ts-nocheck
import { gql } from '@apollo/client';
import { useMutation } from '@apollo/client/react';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import RestaurantMenuRoundedIcon from '@mui/icons-material/RestaurantMenuRounded';
import {
    Alert,
    Box,
    Button,
    Container,
    Grid,
    Link,
    MenuItem,
    Paper,
    TextField,
    Typography,
} from '@mui/material';
import Head from 'next/head';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { completeSignupSession, validateSignupInput } from '@/context/authUtils';

const REGISTER_USER = gql`
    mutation RegisterUser($input: CreateUserInput!) {
        registerUser(input: $input) {
            token
            user {
                id
                name
                email
                role
                subscriptionPlan
                subscriptionStatus
            }
        }
    }
`;

export default function SignupPage() {
    const router = useRouter();
    const { login } = useAuth();
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        gender: 'OTHER',
        measurementSystem: 'IMPERIAL',
        weightGoal: 'MAINTAIN',
        dailyCalories: 2200,
    });
    const [error, setError] = useState('');
    const [registerUser, { loading }] = useMutation(REGISTER_USER, {
        onCompleted: (data) => {
            const sessionResult = login(data.registerUser.token, data.registerUser.user);
            const sessionCommitted = completeSignupSession(sessionResult, {
                onSuccess: () => {
                    router.push('/onboarding').catch(() => {});
                },
                onError: setError,
            });

            if (!sessionCommitted) {
                return;
            }
        },
        onError: (err) => setError(err.message),
    });

    const update = (key) => (event) => {
        const value = key === 'dailyCalories' ? Number(event.target.value) : event.target.value;
        setForm((current) => ({ ...current, [key]: value }));
    };

    const submit = async (event) => {
        event.preventDefault();
        setError('');
        const validation = validateSignupInput(form);
        if (!validation.valid) {
            setError(validation.error.message);
            return;
        }

        await registerUser({ variables: { input: validation.input } });
    };

    return (
        <>
            <Head><title>Create account - Fine Dining</title></Head>
            <Box sx={{ minHeight: '100vh', bgcolor: '#14110F', color: '#fff', py: { xs: 4, md: 8 } }}>
                <Container maxWidth="lg">
                    <Grid container spacing={5} alignItems="center">
                        <Grid item xs={12} md={6}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 5 }}>
                                <RestaurantMenuRoundedIcon sx={{ color: '#F08E5D' }} />
                                <Typography sx={{ color: '#F08E5D', fontWeight: 800, letterSpacing: '0.03em' }}>
                                    fine dining
                                </Typography>
                            </Box>
                            <Typography sx={{ fontSize: { xs: '2.4rem', md: '4.4rem' }, lineHeight: 1, fontWeight: 800, maxWidth: 620 }}>
                                Build a diet system around your real life.
                            </Typography>
                            <Typography sx={{ mt: 3, color: 'rgba(255,255,255,0.68)', fontSize: '1.12rem', maxWidth: 560, lineHeight: 1.7 }}>
                                Create your account, set nutrition goals, save recipes, generate plans, track macros, manage groceries, and upgrade when your needs grow.
                            </Typography>
                            <Grid container spacing={2} sx={{ mt: 4 }}>
                                {['Meal planning', 'Macro logs', 'Pantry tools', 'Tier limits'].map((item) => (
                                    <Grid item xs={6} key={item}>
                                        <Box sx={{ p: 2, border: '1px solid rgba(255,255,255,0.08)', borderRadius: 2, bgcolor: 'rgba(255,255,255,0.03)' }}>
                                            <Typography sx={{ fontWeight: 700 }}>{item}</Typography>
                                        </Box>
                                    </Grid>
                                ))}
                            </Grid>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Paper sx={{ p: { xs: 3, md: 4 }, bgcolor: '#1C1815', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 3 }}>
                                <Typography variant="h4" sx={{ color: '#fff', fontWeight: 800, mb: 1 }}>Create account</Typography>
                                <Typography sx={{ color: 'rgba(255,255,255,0.72)', mb: 3 }}>Free accounts start with basic planning limits.</Typography>
                                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                                <Box component="form" onSubmit={submit}>
                                    <TextField fullWidth required label="Name" value={form.name} onChange={update('name')} margin="normal" />
                                    <TextField fullWidth required label="Email" type="email" value={form.email} onChange={update('email')} margin="normal" />
                                    <TextField fullWidth required label="Password" type="password" value={form.password} onChange={update('password')} margin="normal" helperText="Use 8+ chars with uppercase, lowercase, number, and symbol." />
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} sm={6}>
                                            <TextField select fullWidth label="Goal" value={form.weightGoal} onChange={update('weightGoal')} margin="normal">
                                                <MenuItem value="LOSE">Lose weight</MenuItem>
                                                <MenuItem value="MAINTAIN">Maintain</MenuItem>
                                                <MenuItem value="GAIN">Gain weight</MenuItem>
                                            </TextField>
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField fullWidth label="Daily calories" type="number" value={form.dailyCalories} onChange={update('dailyCalories')} margin="normal" />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField select fullWidth label="Measurement" value={form.measurementSystem} onChange={update('measurementSystem')} margin="normal">
                                                <MenuItem value="IMPERIAL">Imperial</MenuItem>
                                                <MenuItem value="METRIC">Metric</MenuItem>
                                            </TextField>
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField select fullWidth label="Gender" value={form.gender} onChange={update('gender')} margin="normal">
                                                <MenuItem value="FEMALE">Female</MenuItem>
                                                <MenuItem value="MALE">Male</MenuItem>
                                                <MenuItem value="OTHER">Other</MenuItem>
                                            </TextField>
                                        </Grid>
                                    </Grid>
                                    <Button type="submit" fullWidth variant="contained" size="large" endIcon={<ArrowForwardRoundedIcon />} disabled={loading} sx={{ mt: 3, py: 1.4 }}>
                                        Create free account
                                    </Button>
                                </Box>
                                <Typography sx={{ mt: 3, color: 'rgba(255,255,255,0.72)' }}>
                                    Already have an account?{' '}
                                    <Link component={NextLink} href="/login" sx={{ color: '#F08E5D', fontWeight: 700 }}>Sign in</Link>
                                </Typography>
                            </Paper>
                        </Grid>
                    </Grid>
                </Container>
            </Box>
        </>
    );
}
