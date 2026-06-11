// @ts-nocheck
import { gql } from '@apollo/client';
import { useMutation } from '@apollo/client/react';
import PersonIcon from '@mui/icons-material/Person';
import ShieldIcon from '@mui/icons-material/Shield';
import { 
    Box, 
    Button, 
    TextField, 
    Typography, 
    Container, 
    Paper, 
    CircularProgress,
    Divider
} from '@mui/material';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { buildAuthFeedbackState } from '@/context/authUtils';

const LOGIN_MUTATION = gql`
  mutation LoginUser($email: String!, $password: String!) {
    loginUser(email: $email, password: $password) {
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

const isDev = process.env.NODE_ENV === 'development';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [devLoading, setDevLoading] = useState(false);
    const { login, isAuthenticated, user, loading: authLoading, sessionNotice } = useAuth();
    const router = useRouter();

    const [loginUserMutation, { loading: mutationLoading }] = useMutation(LOGIN_MUTATION, {
        onCompleted: (data) => {
            const { token, user } = data.loginUser;
            const sessionResult = login(token, user);
            if (!sessionResult?.ok) {
                setError(sessionResult?.error?.message || 'Unable to save your session. Please try again.');
                setSuccessMessage('');
                return;
            }
            setError('');
            setSuccessMessage(`Signed in. Redirecting to your ${user.role === 'ADMIN' ? 'admin' : 'dashboard'}...`);
        },
        onError: (err) => {
            setError(err.message || 'Login failed. Please check your credentials.');
            setSuccessMessage('');
        }
    });

    const feedback = buildAuthFeedbackState({
        isLoading: authLoading,
        errorMessage: error,
        sessionNotice,
        successMessage,
    });
    const isBusy = authLoading || mutationLoading || devLoading;

    useEffect(() => {
        if (isAuthenticated && user) {
            if (user.role === 'ADMIN') {
                router.push('/admin').catch(() => {});
            } else {
                router.push('/dashboard').catch(() => {});
            }
        }
    }, [isAuthenticated, user, router]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        try {
            await loginUserMutation({ variables: { email, password } });
        } catch (err) {
            // Error is handled by onError callback
        }
    };

    const handleDevLogin = async (role) => {
        setError('');
        setSuccessMessage('');
        setDevLoading(true);
        try {
            const res = await fetch('/api/dev-login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error || 'Dev login failed.');
                return;
            }
            const sessionResult = login(data.token, data.user);
            if (!sessionResult?.ok) {
                setError(sessionResult?.error?.message || 'Unable to save your session. Please try again.');
                return;
            }
            setSuccessMessage(`Signed in. Redirecting to your ${data.user.role === 'ADMIN' ? 'admin' : 'dashboard'}...`);
        } catch (err) {
            setError('Dev login request failed.');
        } finally {
            setDevLoading(false);
        }
    };

    return (
        <Container maxWidth="xs">
            <Head>
                <title>Login - Secure Access</title>
            </Head>
            <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Paper elevation={3} sx={{ p: 4, width: '100%', borderRadius: 2 }}>
                    <Typography component="h1" variant="h5" align="center" gutterBottom>
                        Secure Login
                    </Typography>
                    <Box
                        id="auth-feedback"
                        role={feedback.role}
                        aria-live={feedback.ariaLive}
                        aria-atomic="true"
                        sx={{
                            minHeight: feedback.minHeight,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                            mb: 2,
                            px: 1.5,
                            py: 1,
                            borderRadius: 1.5,
                            bgcolor: feedback.state === 'error' ? 'rgba(244, 67, 54, 0.08)' : 'transparent',
                            border: feedback.state === 'error' ? '1px solid rgba(244, 67, 54, 0.2)' : '1px solid transparent',
                        }}
                    >
                        {feedback.showSpinner && <CircularProgress size={18} />}
                        <Typography
                            variant="body2"
                            sx={{
                                color: feedback.state === 'error' ? 'error.main' : feedback.state === 'success' ? 'success.main' : 'text.secondary',
                                fontWeight: feedback.state === 'success' ? 700 : 400,
                            }}
                        >
                            {feedback.message}
                        </Typography>
                    </Box>
                    <Box component="form" onSubmit={handleSubmit} noValidate aria-busy={isBusy}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="email"
                            label="Email Address"
                            name="email"
                            autoComplete="email"
                            autoFocus
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={isBusy}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Password"
                            type="password"
                            id="password"
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={isBusy}
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2, py: 1.5 }}
                            disabled={isBusy}
                        >
                            {mutationLoading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
                        </Button>
                    </Box>
                    <Typography sx={{ color: 'text.secondary', mt: 2, textAlign: 'center' }}>
                        New to Fine Dining?{' '}
                        <Link href="/signup" style={{ color: '#F08E5D', fontWeight: 700 }}>
                            Create an account
                        </Link>
                    </Typography>

                    {isDev && (
                        <>
                            <Divider sx={{ my: 2 }}>Dev Quick Login</Divider>
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <Button
                                    fullWidth
                                    variant="outlined"
                                    color="error"
                                    startIcon={<ShieldIcon />}
                                    onClick={() => handleDevLogin('admin')}
                                    disabled={devLoading}
                                >
                                    Admin
                                </Button>
                                <Button
                                    fullWidth
                                    variant="outlined"
                                    color="info"
                                    startIcon={<PersonIcon />}
                                    onClick={() => handleDevLogin('user')}
                                    disabled={devLoading}
                                >
                                    User
                                </Button>
                            </Box>
                        </>
                    )}
                </Paper>
                <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 4 }}>
                    Fine Dining © {new Date().getFullYear()}
                </Typography>
            </Box>
        </Container>
    );
}
