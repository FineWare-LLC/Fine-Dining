import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Box, TextField, Button, Link, Typography, CircularProgress } from '@mui/material';
import { gql, useMutation } from '@apollo/client';
import { useAuth } from '../context/AuthContext';

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

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * LoginForm - A component that renders the sign-in form.
 *
 * @component
 * @returns {JSX.Element} The rendered LoginForm component.
 */
export default function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const router = useRouter();
    const { login } = useAuth();

    // Use the login mutation with GraphQL.
    const [loginUserMutation, { loading }] = useMutation(LOGIN_MUTATION, {
        onCompleted: (data) => {
            setErrorMessage('');
            console.info('Login successful:', data.loginUser);
            const { token, user } = data.loginUser;
            login(token, user);
            setSuccessMessage(`Welcome, ${user.name}! Redirecting...`);
            setTimeout(() => router.push('/dashboard'), 1000);
        },
        onError: (err) => {
            console.error('Login failed:', err);
            if (err.graphQLErrors && err.graphQLErrors.length > 0) {
                setErrorMessage(err.graphQLErrors[0].message);
            } else {
                setErrorMessage('An unexpected error occurred during login.');
            }
        }
    });

    /**
     * Handles changes to the email input.
     * Clears the error message if the new email and current password are valid.
     *
     * @param {React.ChangeEvent<HTMLInputElement>} e - The email change event.
     */
    const handleEmailChange = (e) => {
        const newEmail = e.target.value;
        setEmail(newEmail);
        // Clear error if the new email is valid and the password is not empty.
        if (emailRegex.test(newEmail.trim().toLowerCase()) && password.trim() !== '') {
            setErrorMessage('');
        }
    };

    /**
     * Handles changes to the password input.
     * Clears the error message if the new password and current email are valid.
     *
     * @param {React.ChangeEvent<HTMLInputElement>} e - The password change event.
     */
    const handlePasswordChange = (e) => {
        const newPassword = e.target.value;
        setPassword(newPassword);
        // Clear error if the current email is valid and the new password is not empty.
        if (emailRegex.test(email.trim().toLowerCase()) && newPassword.trim() !== '') {
            setErrorMessage('');
        }
    };

    /**
     * Handles the form submission.
     * Validates input fields and triggers the login mutation.
     *
     * @param {React.FormEvent<HTMLFormElement>} e - The submit event.
     * @returns {Promise<void>}
     */
    const handleLogin = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        setSuccessMessage('');

        const sanitizedEmail = email.trim().toLowerCase();
        const sanitizedPassword = password.trim();

        if (!sanitizedEmail || !emailRegex.test(sanitizedEmail)) {
            setErrorMessage('Please enter a valid email address.');
            return;
        }
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
            // Error handling is managed in onError.
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
                id="email"
                label="Email"
                placeholder="Email"
                variant="outlined"
                name="email"
                type="email"
                value={email}
                onChange={handleEmailChange}
                fullWidth
                required
                aria-required="true"
                // Display error style only if email is empty or invalid.
                error={Boolean(errorMessage) && (!email || !emailRegex.test(email.trim().toLowerCase()))}
                helperText={
                    (errorMessage && (!email || !emailRegex.test(email.trim().toLowerCase()))) ? errorMessage : ''
                }
                InputLabelProps={{
                    htmlFor: 'email'
                }}
                inputProps={{
                    'aria-invalid': (errorMessage && (!email || !emailRegex.test(email.trim().toLowerCase()))) ? 'true' : 'false'
                }}
            />
            <TextField
                id="password"
                label="Password"
                placeholder="Password"
                variant="outlined"
                name="password"
                type="password"
                value={password}
                onChange={handlePasswordChange}
                fullWidth
                required
                aria-required="true"
                // Display error style if password is empty.
                error={Boolean(errorMessage) && password.trim() === ''}
                helperText={(errorMessage && password.trim() === '') ? errorMessage : ''}
                InputLabelProps={{
                    htmlFor: 'password'
                }}
                inputProps={{
                    'aria-invalid': (errorMessage && password.trim() === '') ? 'true' : 'false'
                }}
            />

            {loading && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CircularProgress size={20} />
                    <Typography variant="body2">Logging in...</Typography>
                </Box>
            )}

            {errorMessage && (
                <Typography color="error" variant="body2" role="alert" id="form-error-message">
                    {errorMessage}
                </Typography>
            )}

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
                    ':disabled': {
                        backgroundColor: 'action.disabledBackground',
                        color: 'action.disabled',
                    },
                }}
                aria-describedby={errorMessage ? "form-error-message" : undefined}
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
                Don&apos;t have an account? Create one!
            </Link>
        </Box>
    );
}
