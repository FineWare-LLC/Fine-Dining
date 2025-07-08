/**
 * @file create-account.js
 * @description FineDining Create Account Page in Next.js & Material UI using generated GraphQL hooks.
 */

import React, { useState } from 'react';
import {
    Container,
    Box,
    TextField,
    Button,
    Typography,
    CircularProgress,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Card,
    CardContent,
    useTheme,
    alpha,
} from '@mui/material';
import { useMutation } from '@apollo/client';
import { keyframes } from '@emotion/react';
// Import the generated mutation document from your codegen output.
import { CreateUserDocument} from "@/gql/graphql";

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

// Regular expression for basic email validation.
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Minimum lengths for fields.
const MIN_USERNAME_LENGTH = 3;
const MIN_PASSWORD_LENGTH = 8;

function CreateAccountForm() {
    // Local state for form inputs.
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Gender and measurement system selections.
    const [gender, setGender] = useState('OTHER');
    const [measurementSystem, setMeasurementSystem] = useState('METRIC');

    // Local state for error and success messages.
    const [formError, setFormError] = useState('');
    const [formSuccess, setFormSuccess] = useState('');

    const theme = useTheme();

    // Use Apollo's useMutation with the generated CreateUserDocument.
    const [createAccount, { loading }] = useMutation(CreateUserDocument, {
        onCompleted: (data) => {
            if (data?.createUser?.name) {
                setFormSuccess(`User ${data.createUser.name} created successfully!`);
                // Clear form inputs after success.
                setUsername('');
                setEmail('');
                setPassword('');
                setConfirmPassword('');
            } else {
                setFormError('Account created, but user details are missing.');
            }
        },
        onError: (err) => {
            console.error('Error creating account:', err);
            setFormError(err.message || 'An error occurred while creating your account. Please try again.');
        },
    });

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
        if (!gender) {
            setFormError('Please select a gender.');
            return;
        }
        if (!measurementSystem) {
            setFormError('Please select a measurement system.');
            return;
        }

        try {
            await createAccount({
                variables: {
                    input: {
                        name: trimmedUsername,
                        email: trimmedEmail,
                        password: trimmedPassword,
                        gender,
                        measurementSystem,
                    },
                },
            });
        } catch (err) {
            console.error("Error invoking createAccount mutation:", err);
            if (!formError) {
                setFormError('A submission error occurred. Please try again.');
            }
        }
    };

    return (
        <Card
            sx={{
                maxWidth: 500,
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
                    onSubmit={handleSubmit}
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 3,
                    }}
                    noValidate
                    autoComplete="off"
                >
                    <TextField
                        name="username"
                        label="Username"
                        placeholder="Username"
                        variant="outlined"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        inputProps={{ minLength: MIN_USERNAME_LENGTH }}
                        aria-label="Username"
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
                        name="email"
                        label="Email"
                        placeholder="Email"
                        variant="outlined"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        aria-label="Email Address"
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
                    <FormControl 
                        fullWidth
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
                    >
                        <InputLabel id="gender-label">Gender</InputLabel>
                        <Select
                            labelId="gender-label"
                            id="gender"
                            value={gender}
                            label="Gender"
                            onChange={(e) => setGender(e.target.value)}
                            name="gender"
                            data-testid="gender-select"
                        >
                            <MenuItem value="MALE">Male</MenuItem>
                            <MenuItem value="FEMALE">Female</MenuItem>
                            <MenuItem value="OTHER">Other</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControl 
                        fullWidth
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
                    >
                        <InputLabel id="measurement-label">Measurement System</InputLabel>
                        <Select
                            labelId="measurement-label"
                            id="measurementSystem"
                            value={measurementSystem}
                            label="Measurement System"
                            onChange={(e) => setMeasurementSystem(e.target.value)}
                            name="measurementSystem"
                            data-testid="measurement-system-select"
                        >
                            <MenuItem value="METRIC">Metric</MenuItem>
                            <MenuItem value="IMPERIAL">Imperial</MenuItem>
                        </Select>
                    </FormControl>
                    <TextField
                        name="password"
                        label="Password"
                        placeholder="Password"
                        variant="outlined"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        inputProps={{ minLength: MIN_PASSWORD_LENGTH }}
                        aria-label="Password"
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
                        name="confirmPassword"
                        label="Confirm Password"
                        placeholder="Confirm Password"
                        variant="outlined"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        aria-label="Confirm Password"
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
                            <Typography variant="body2" color="primary">Creating account...</Typography>
                        </Box>
                    )}

                    {formError && (
                        <Typography 
                            variant="body2" 
                            color="error" 
                            role="alert" 
                            className="error-message"
                            sx={{
                                textAlign: 'center',
                                p: 2,
                                borderRadius: 2,
                                backgroundColor: alpha(theme.palette.error.main, 0.1),
                                border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
                                animation: `${slideInUp} 0.3s ease-out`
                            }}
                        >
                            {formError}
                        </Typography>
                    )}

                    {formSuccess && (
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
                            {formSuccess}
                        </Typography>
                    )}

                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
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
                    >
                        {loading ? 'Creating Account...' : 'Create Account'}
                    </Button>
                </Box>
            </CardContent>
        </Card>
    );
}

export default function CreateAccountPage() {
    const theme = useTheme();

    return (
        <Container
            maxWidth="sm"
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                padding: '2rem 1rem',
                background: `linear-gradient(135deg, ${alpha(theme.palette.background.default, 0.8)} 0%, ${alpha(theme.palette.background.paper, 0.9)} 100%)`,
            }}
        >
            <Typography 
                variant="h3" 
                component="h1" 
                gutterBottom
                sx={{
                    background: theme.palette.gradient.hero,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontWeight: 700,
                    textAlign: 'center',
                    mb: 4,
                    animation: `${slideInUp} 0.8s ease-out`,
                }}
            >
                Create Account
            </Typography>
            <CreateAccountForm />
        </Container>
    );
}
