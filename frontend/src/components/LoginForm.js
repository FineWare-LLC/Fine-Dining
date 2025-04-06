// components/LoginForm.js
/**
 * @fileoverview The login form section for FineDinning landing page
 */

import React, {useState} from 'react';
import {Box, TextField, Button, Link, Typography} from '@mui/material';
import {gql, useMutation} from '@apollo/client';

// Define the GraphQL Mutation
const LOGIN_MUTATION = gql`
    mutation LoginUser($email: String!, $password: String!) {
        loginUser(email: $email, password: $password) {
            token
            user {
                id
                name
                email
            }
        }
    }
`;

/**
 * LoginForm - Renders the login form with Name, Password fields, and login actions
 * @returns {JSX.Element} The login form component
 */
export default function LoginForm() {
    // Use email instead of name for login, based on the mutation definition
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [errorMessage, setErrorMessage] = useState('');

    // Apollo useMutation hook
    const [loginUser, {loading, error, data}] = useMutation(LOGIN_MUTATION);

    /**
     * handleLogin - Handles the login button click
     * @param {React.FormEvent} e - The event triggered by form submission
     */
    const handleLogin = async (e) => {
        e.preventDefault();
        setData(null);
        setErrorMessage('');
        try {
            const result = await loginUser({
                variables: {
                    email: email,
                    password: password,
                },
            });
            console.log('Login successful:', result.data.loginUser);
        } catch (err) {
            console.error('Login failed:', err);
            if (err.graphQLErrors && err.graphQLErrors.length > 0) {
                setErrorMessage(err.graphQLErrors[0].message);
            } else {
                setErrorMessage('An unexpected error occurred.');
            }
        }
    };

    return (
        <Box
            component="form"
            onSubmit={handleLogin}
            sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
            }}
        >
            {/* Changed label and field to Email */}
            <TextField
                label="Email"
                variant="outlined"
                name="email" // Added name attribute
                type="email" // Set type to email
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
                required
                aria-required="true" // Accessibility
            />
            <TextField
                label="Password"
                variant="outlined"
                name="password" // Added name attribute
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
                required
                aria-required="true" // Accessibility
            />
            {/* Display Loading and Error States */}
            {loading && <Typography>Logging in...</Typography>}
            {error && (
                <Typography color="error" variant="body2">
                    Login failed: {error.message}
                </Typography>
            )}

            {errorMessage && (
                <Typography color="error" variant="body2">
                    Login failed: {errorMessage}
                </Typography>
            )}


            {data && (
                <Typography color="success.main" variant="body2">
                    Login successful! Welcome {data.loginUser.user.name}.
                </Typography>
            )}
            <Button
                type="submit"
                variant="contained"
                disabled={loading} // Disable button while loading
                sx={{
                    backgroundColor: 'primary.main',
                    ':hover': {
                        backgroundColor: 'primary.dark'
                    }
                }}
            >
                Log In
            </Button>
            <Link
                href="/forgot-password"
                variant="body2"
                sx={{
                    textAlign: 'center',
                    marginTop: '0.5rem'
                }}
            >
                Forgot Password
            </Link>
        </Box>
    );
}