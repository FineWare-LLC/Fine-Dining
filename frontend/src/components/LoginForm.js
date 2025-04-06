// components/LoginForm.js
/**
 * @fileoverview The login form section for FineDinning landing page
 */

// Import necessary hooks from React and Next.js
import React, { useState } from 'react';
import { useRouter } from 'next/router'; // Import useRouter for redirection
import { Box, TextField, Button, Link, Typography } from '@mui/material';
import { gql, useMutation } from '@apollo/client';

// Import the useAuth hook from your context file
import { useAuth } from '../context/AuthContext'; // Make sure the path is correct

// Define the GraphQL Mutation
const LOGIN_MUTATION = gql`
    mutation LoginUser($email: String!, $password: String!) {
        loginUser(email: $email, password: $password) {
            token
            user {
                id
                name
                email
                role # Example: Include role if needed by AuthContext
            }
        }
    }
`;

/**
 * LoginForm - Renders the login form with Email, Password fields, and login actions
 * @returns {JSX.Element} The login form component
 */
export default function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const router = useRouter(); // Initialize the router

    // Get the login function from AuthContext
    const { login } = useAuth();

    // Apollo useMutation hook
    const [loginUserMutation, { loading }] = useMutation(LOGIN_MUTATION, {
        onCompleted: (data) => {
            // This function runs *after* the mutation is successful
            console.log('Login successful:', data.loginUser);
            const { token, user } = data.loginUser;

            // Use the login function from AuthContext to handle state and storage
            login(token, user); // <<< This now handles setting token/user state

            // Redirect to a dashboard or home page after successful login
            router.push('/dashboard'); // Adjust the target route as needed
        },
        onError: (err) => {
            // Handle errors specifically in onError callback
            console.error('Login failed:', err);
            if (err.graphQLErrors && err.graphQLErrors.length > 0) {
                setErrorMessage(err.graphQLErrors[0].message);
            } else {
                setErrorMessage('An unexpected error occurred during login.');
            }
        }
    });

    /**
     * handleLogin - Handles the login button click by calling the mutation
     * @param {React.FormEvent} e - The event triggered by form submission
     */
    const handleLogin = async (e) => {
        e.preventDefault();
        setErrorMessage(''); // Clear previous errors on new submission

        // Call the mutation function provided by useMutation
        await loginUserMutation({
            variables: {
                email: email,
                password: password,
            },
        });
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
                error={!!errorMessage}
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
                error={!!errorMessage}
            />

            {/* Display Loading State */}
            {loading && <Typography>Logging in...</Typography>}

            {/* Display Specific Error Message */}
            {errorMessage && (
                <Typography color="error" variant="body2" role="alert">
                    {errorMessage}
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
                href="/forgot-password" // Link to your forgot password page
                variant="body2"
                sx={{
                    textAlign: 'center',
                    marginTop: '0.5rem'
                }}
            >
                Forgot Password?
            </Link>
            <Link
                href="/create-account" // Link to your create account page
                variant="body2"
                sx={{
                    textAlign: 'center',
                    marginTop: '0.5rem'
                }}
            >
                Don't have an account? Create one!
            </Link>
        </Box>
    );
}