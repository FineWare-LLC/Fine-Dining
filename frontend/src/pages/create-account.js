/**
 * @file create-account.js
 * @description FineDining Create Account Page in Next.js & Material UI
 */

import React, { useState } from 'react';
import { Container, Box, TextField, Button, Typography } from '@mui/material';
import { useMutation } from '@apollo/client';


/**
 * CreateAccountForm - Renders the form for creating a new user account
 * @returns {JSX.Element} The form component
 */
function CreateAccountForm() {
    // Local state for form inputs
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Set up GraphQL mutation hook
    const [createAccount, { loading, error, data }] = useMutation(CREATE_ACCOUNT_MUTATION);

    /**
     * handleSubmit - Submits form data to create a new account
     * @param {React.FormEvent<HTMLFormElement>} e - The form submission event
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }
        try {
            await createAccount({
                variables: {
                    username,
                    email,
                    password
                }
            });
            alert('Account created successfully!');
        } catch (err) {
            console.error(err);
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
                marginTop: '1rem'
            }}
        >
            <TextField
                name="username"
                label="Username"
                variant="outlined"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
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
            {error && (
                <Typography variant="body2" color="error">
                    {error.message}
                </Typography>
            )}
            {data && (
                <Typography variant="body2" color="success.main">
                    User {data.createAccount.username} created!
                </Typography>
            )}
            <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
            >
                CREATE ACCOUNT
            </Button>
        </Box>
    );
}

/**
 * CreateAccountPage - Main page component for user registration
 * @returns {JSX.Element} A Next.js page containing the sign-up form
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
                padding: '1rem'
            }}
        >
            <Typography variant="h4" component="h1" gutterBottom>
                Create Account
            </Typography>
            <CreateAccountForm />
        </Container>
    );
}
