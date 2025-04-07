/**
 * @file create-account.js
 * @description FineDining Create Account Page in Next.js & Material UI
 */

import React, { useState } from 'react';
import { Container, Box, TextField, Button, Typography, CircularProgress } from '@mui/material';
import { useMutation } from '@apollo/client';
// Make sure you import your actual GraphQL mutation from your queries
import { CREATE_ACCOUNT_MUTATION } from '../graphql/mutations';

// Regular expression for basic email validation.
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Minimum lengths for fields.
const MIN_USERNAME_LENGTH = 3;
const MIN_PASSWORD_LENGTH = 8;

/**
 * CreateAccountForm - Renders the form for creating a new user account.
 * Includes robust input validation, sanitization, and enhanced error handling.
 * @returns {JSX.Element} The form component.
 */
function CreateAccountForm() {
    // Local state for form inputs.
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Local state for error and success messages.
    const [formError, setFormError] = useState('');
    const [formSuccess, setFormSuccess] = useState('');

    // Set up GraphQL mutation hook.
    const [createAccount, { loading, error, data }] = useMutation(CREATE_ACCOUNT_MUTATION, {
        // Optional: refetchQueries, update cache, etc.
    });

    /**
     * handleSubmit - Handles form submission to create a new account.
     * Performs client-side validation before calling the mutation.
     * @param {React.FormEvent<HTMLFormElement>} e - The form submission event.
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError('');
        setFormSuccess('');

        // Trim and sanitize inputs.
        const trimmedUsername = username.trim();
        const trimmedEmail = email.trim().toLowerCase();
        const trimmedPassword = password.trim();
        const trimmedConfirmPassword = confirmPassword.trim();

        // Validate inputs.
        if (trimmedUsername.length < MIN_USERNAME_LENGTH) {
            setFormError(`Username must be at least ${MIN_USERNAME_LENGTH} characters long.`);
            return;
        }
        if (!emailRegex.test(trimmedEmail)) {
            setFormError('Please provide a valid email address.');
            return;
        }
        if (trimmedPassword.length < MIN_PASSWORD_LENGTH) {
            setFormError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`);
            return;
        }
        if (trimmedPassword !== trimmedConfirmPassword) {
            setFormError('Passwords do not match.');
            return;
        }

        // Optional: Further password strength validation can be added here.
        // Optional: Add rate limiting or debounce user submissions if needed.

        try {
            // Call the GraphQL mutation to create an account.
            const result = await createAccount({
                variables: {
                    username: trimmedUsername,
                    email: trimmedEmail,
                    password: trimmedPassword,
                },
            });
            if (result?.data?.createAccount) {
                setFormSuccess(`User ${result.data.createAccount.username} created successfully!`);
                // Optionally, clear form inputs after success.
                setUsername('');
                setEmail('');
                setPassword('');
                setConfirmPassword('');
            }
        } catch (err) {
            // Log error to console for debugging (avoid exposing details to users).
            console.error('Error creating account:', err);
            setFormError('An error occurred while creating your account. Please try again.');
        }
    };

    return (
        <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                marginTop: '1rem',
            }}
        >
            <TextField
                name="username"
                label="Username"
                variant="outlined"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                inputProps={{ minLength: MIN_USERNAME_LENGTH }}
            />
            <TextField
                name="email"
                label="Email"
                variant="outlined"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
            />
            <TextField
                name="password"
                label="Password"
                variant="outlined"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                inputProps={{ minLength: MIN_PASSWORD_LENGTH }}
            />
            <TextField
                name="confirmPassword"
                label="Confirm Password"
                variant="outlined"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
            />
            {/* Display error message if any */}
            {formError && (
                <Typography variant="body2" color="error">
                    {formError}
                </Typography>
            )}
            {/* Display success message if account is created */}
            {formSuccess && (
                <Typography variant="body2" color="success.main">
                    {formSuccess}
                </Typography>
            )}
            <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
                sx={{ position: 'relative' }}
            >
                {loading && (
                    <CircularProgress
                        size={24}
                        sx={{
                            color: 'white',
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            marginTop: '-12px',
                            marginLeft: '-12px',
                        }}
                    />
                )}
                CREATE ACCOUNT
            </Button>
        </Box>
    );
}

/**
 * CreateAccountPage - Main page component for user registration.
 * Engineered for extra clarity, responsiveness, and security.
 * @returns {JSX.Element} A Next.js page containing the sign-up form.
 */
export default function CreateAccountPage() {
    return (
        <Container
            maxWidth="xs"
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
                padding: '1rem',
                backgroundColor: '#f9f9f9', // Optional: Set a subtle background
            }}
        >
            <Typography variant="h4" component="h1" gutterBottom>
                Create Account
            </Typography>
            <CreateAccountForm />
        </Container>
    );
}
