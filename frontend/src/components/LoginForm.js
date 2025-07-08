import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { 
    Box, 
    TextField, 
    Button, 
    Link, 
    Typography, 
    CircularProgress, 
    Card,
    CardContent,
    InputAdornment,
    IconButton,
    Alert,
    useTheme,
    alpha
} from '@mui/material';
import { 
    Email as EmailIcon, 
    Lock as LockIcon, 
    Visibility, 
    VisibilityOff,
    Login as LoginIcon
} from '@mui/icons-material';
import { useMutation } from '@apollo/client';
import { gql } from 'graphql-tag';
import { useAuth } from '../context/AuthContext';
import { keyframes } from '@emotion/react';

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

// Animation keyframes
const slideInUp = keyframes`
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
`;

const pulse = keyframes`
    0% {
        box-shadow: 0 0 0 0 rgba(255, 107, 53, 0.4);
    }
    70% {
        box-shadow: 0 0 0 10px rgba(255, 107, 53, 0);
    }
    100% {
        box-shadow: 0 0 0 0 rgba(255, 107, 53, 0);
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
    const [showPassword, setShowPassword] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const router = useRouter();
    const { login } = useAuth();
    const theme = useTheme();

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
        <Card
            sx={{
                maxWidth: 400,
                width: '100%',
                mx: 'auto',
                animation: `${slideInUp} 0.6s ease-out`,
                background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)} 0%, ${alpha(theme.palette.background.paper, 0.95)} 100%)`,
                backdropFilter: 'blur(20px)',
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                boxShadow: `0 20px 40px ${alpha(theme.palette.primary.main, 0.1)}`,
                '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: `0 25px 50px ${alpha(theme.palette.primary.main, 0.15)}`,
                    transition: 'all 0.3s ease',
                }
            }}
        >
            <CardContent sx={{ p: 4 }}>
                <Box
                    component="form"
                    onSubmit={handleLogin}
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 3,
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
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    transform: 'translateY(-1px)',
                                    boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.15)}`,
                                },
                                '&.Mui-focused': {
                                    transform: 'translateY(-1px)',
                                    boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.25)}`,
                                }
                            }
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
                        error={Boolean(errorMessage) && password.trim() === ''}
                        helperText={(errorMessage && password.trim() === '') ? errorMessage : ''}
                        InputLabelProps={{
                            htmlFor: 'password'
                        }}
                        inputProps={{
                            'aria-invalid': (errorMessage && password.trim() === '') ? 'true' : 'false'
                        }}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    transform: 'translateY(-1px)',
                                    boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.15)}`,
                                },
                                '&.Mui-focused': {
                                    transform: 'translateY(-1px)',
                                    boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.25)}`,
                                }
                            }
                        }}
                    />

                    {loading && (
                        <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 2,
                            justifyContent: 'center',
                            py: 1,
                            animation: `${slideInUp} 0.3s ease-out`
                        }}>
                            <CircularProgress size={20} sx={{ color: theme.palette.primary.main }} />
                            <Typography variant="body2" color="primary">Logging in...</Typography>
                        </Box>
                    )}

                    {errorMessage && (
                        <Typography 
                            color="error" 
                            variant="body2" 
                            role="alert" 
                            id="form-error-message"
                            sx={{
                                textAlign: 'center',
                                p: 2,
                                borderRadius: 2,
                                backgroundColor: alpha(theme.palette.error.main, 0.1),
                                border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
                                animation: `${slideInUp} 0.3s ease-out`
                            }}
                        >
                            {errorMessage}
                        </Typography>
                    )}

                    {successMessage && (
                        <Typography 
                            variant="body2" 
                            color="success.main" 
                            role="status"
                            sx={{
                                textAlign: 'center',
                                p: 2,
                                borderRadius: 2,
                                backgroundColor: alpha(theme.palette.success.main, 0.1),
                                border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                                animation: `${slideInUp} 0.3s ease-out`
                            }}
                        >
                            {successMessage}
                        </Typography>
                    )}

                    <Button
                        type="submit"
                        variant="contained"
                        disabled={loading}
                        size="large"
                        sx={{
                            py: 1.5,
                            borderRadius: 3,
                            background: theme.palette.gradient.primary,
                            fontWeight: 600,
                            fontSize: '1rem',
                            textTransform: 'none',
                            boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.3)}`,
                            animation: loading ? `${pulse} 2s infinite` : 'none',
                            '&:hover': {
                                background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                                transform: 'translateY(-2px)',
                                boxShadow: `0 12px 32px ${alpha(theme.palette.primary.main, 0.4)}`,
                            },
                            '&:disabled': {
                                background: alpha(theme.palette.action.disabledBackground, 0.6),
                                color: theme.palette.action.disabled,
                            },
                        }}
                        aria-describedby={errorMessage ? "form-error-message" : undefined}
                    >
                        {loading ? 'Logging In...' : 'Log In'}
                    </Button>

                    <Box sx={{ textAlign: 'center', mt: 2 }}>
                        <Link
                            href="/forgot-password"
                            variant="body2"
                            sx={{ 
                                color: theme.palette.text.secondary,
                                textDecoration: 'none',
                                '&:hover': {
                                    color: theme.palette.primary.main,
                                    textDecoration: 'underline',
                                }
                            }}
                        >
                            Forgot Password?
                        </Link>
                    </Box>

                    <Box sx={{ textAlign: 'center' }}>
                        <Link
                            href="/create-account"
                            variant="body2"
                            sx={{ 
                                color: theme.palette.primary.main,
                                textDecoration: 'none',
                                fontWeight: 500,
                                '&:hover': {
                                    textDecoration: 'underline',
                                }
                            }}
                        >
                            Don&apos;t have an account? Create one!
                        </Link>
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
}
