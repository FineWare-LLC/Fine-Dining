/**
 * @fileoverview The login form section for FineDining landing page.
 * This component is over-engineered and hardened for security, accessibility, and maintainability.
 */

import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Box, TextField, Button, Link, Typography, CircularProgress } from '@mui/material';
import { gql, useMutation } from '@apollo/client';
import { useAuth } from '../context/AuthContext';

// Define the GraphQL mutation.
const LOGIN_MUTATION = gql`
    mutation LoginUser($email: String!, $password: String!) {
        loginUser(email: $email, password: $password) {
            token
            user {
                id
                name
                email
                role
            }
        }
    }
`;

// Basic email regex for client-side validation.
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * LoginForm - Renders the login form with enhanced input validation, error handling,
 * accessibility features, and loading states.
 * @returns {JSX.Element} The login form component.
 */
export default function LoginForm() {
    // Local state for inputs.
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    // Local state for error messages.
    const [errorMessage, setErrorMessage] = useState('');
    // Local state for success message.
    const [successMessage, setSuccessMessage] = useState('');

    const router = useRouter();
    const { login } = useAuth();

    // Setup the Apollo mutation.
    const [loginUserMutation, { loading }] = useMutation(LOGIN_MUTATION, {
        onCompleted: (data) => {
            // Clear any previous errors.
            setErrorMessage('');
            // Log the success data for debugging.
            console.info('Login successful:', data.loginUser);
            const { token, user } = data.loginUser;
            login(token, user); // Update AuthContext with token and user.
            setSuccessMessage(`Welcome, ${user.name}! Redirecting...`);
            // Redirect after a brief delay to allow users to see the success message.
            setTimeout(() => router.push('/dashboard'), 1000);
        },
        onError: (err) => {
            console.error('Login failed:', err);
            // Prefer graphQLErrors message if available.
            if (err.graphQLErrors && err.graphQLErrors.length > 0) {
                setErrorMessage(err.graphQLErrors[0].message);
            } else {
                setErrorMessage('An unexpected error occurred during login.');
            }
        }
    });

    /**
     * handleLogin - Handles the login form submission with enhanced validations.
     * @param {React.FormEvent} e - The form submission event.
     */
    const handleLogin = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        setSuccessMessage('');

        // Sanitize and trim inputs.
        const sanitizedEmail = email.trim().toLowerCase();
        const sanitizedPassword = password.trim();

        // Validate email format.
        if (!sanitizedEmail || !emailRegex.test(sanitizedEmail)) {
            setErrorMessage('Please enter a valid email address.');
            return;
        }
        // Validate password non-empty.
        if (!sanitizedPassword) {
            setErrorMessage('Please enter your password.');
            return;
        }

        try {
            await loginUserMutation({
                variables: {
                    email: sanitizedEmail,
                    password: sanitizedPassword,
                },
            });
        } catch (err) {
            // Error handling is already managed in onError.
        }
    };

    return (
        <Box
            component="form"
            onSubmit={handleLogin}
            sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
            }}
            noValidate
            autoComplete="off"
        >
            <TextField
                label="Email"
                variant="outlined"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
                required
                aria-required="true"
                error={Boolean(errorMessage)}
                helperText={errorMessage && !password && errorMessage}
            />
            <TextField
                label="Password"
                variant="outlined"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
                required
                aria-required="true"
                error={Boolean(errorMessage)}
            />

            {/* Display loading state */}
            {loading && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CircularProgress size={20} />
                    <Typography variant="body2">Logging in...</Typography>
                </Box>
            )}

            {/* Display error message */}
            {errorMessage && (
                <Typography color="error" variant="body2" role="alert">
                    {errorMessage}
                </Typography>
            )}

            {/* Display success message */}
            {successMessage && (
                <Typography variant="body2" color="success.main" role="status">
                    {successMessage}
                </Typography>
            )}

            <Button
                type="submit"
                variant="contained"
                disabled={loading}
                sx={{
                    backgroundColor: 'primary.main',
                    ':hover': {
                        backgroundColor: 'primary.dark',
                    },
                }}
            >
                Log In
            </Button>
            <Link
                href="/forgot-password"
                variant="body2"
                sx={{ textAlign: 'center', marginTop: '0.5rem' }}
            >
                Forgot Password?
            </Link>
            <Link
                href="/create-account"
                variant="body2"
                sx={{ textAlign: 'center', marginTop: '0.5rem' }}
            >
                Don't have an account? Create one!
            </Link>
        </Box>
    );
}
