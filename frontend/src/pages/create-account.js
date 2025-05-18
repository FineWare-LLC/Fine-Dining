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
} from '@mui/material';
import { useMutation } from '@apollo/client';
// Import the generated mutation document from your codegen output.
import { CreateUserDocument} from "@/gql/graphql.js";

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
        <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                marginTop: '1rem',
            }}
            noValidate
            autoComplete="off"
        >
            <TextField
                name="username"
                label="Username"
                variant="outlined"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                inputProps={{ minLength: MIN_USERNAME_LENGTH }}
                aria-label="Username"
            />
            <TextField
                name="email"
                label="Email"
                variant="outlined"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                aria-label="Email Address"
            />
            <FormControl fullWidth>
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
            <FormControl fullWidth>
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
                variant="outlined"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                inputProps={{ minLength: MIN_PASSWORD_LENGTH }}
                aria-label="Password"
            />
            <TextField
                name="confirmPassword"
                label="Confirm Password"
                variant="outlined"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                aria-label="Confirm Password"
            />
            {formError && (
                <Typography variant="body2" color="error" role="alert">
                    {formError}
                </Typography>
            )}
            {formSuccess && (
                <Typography variant="body2" color="success.main" role="status">
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
                        aria-label="Creating account"
                    />
                )}
                {loading ? 'Creating...' : 'CREATE ACCOUNT'}
            </Button>
        </Box>
    );
}

export default function CreateAccountPage() {
    return (
        <Container
            maxWidth="xs"
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                padding: '1rem',
                backgroundColor: '#f9f9f9',
            }}
        >
            <Typography variant="h4" component="h1" gutterBottom>
                Create Account
            </Typography>
            <CreateAccountForm />
        </Container>
    );
}
