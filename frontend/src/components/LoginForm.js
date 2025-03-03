// components/LoginForm.js
/**
 * @fileoverview The login form section for FineDinning landing page
 */

import React, { useState } from 'react';
import { Box, TextField, Button, Link } from '@mui/material';

/**
 * LoginForm - Renders the login form with Name, Password fields, and login actions
 * @returns {JSX.Element} The login form component
 */
export default function LoginForm() {
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');

    /**
     * handleLogin - Handles the login button click
     * @param {React.FormEvent} e - The event triggered by form submission
     */
    const handleLogin = (e) => {
        e.preventDefault();
        // TODO: Implement actual login logic (e.g., Apollo GraphQL mutation)
        console.log('Logging in with:', { name, password });
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
                label="Name"
                variant="outlined"
                value={name}
                onChange={(e) => setName(e.target.value)}
                fullWidth
                required
            />
            <TextField
                label="Password"
                variant="outlined"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
                required
            />
            <Button
                type="submit"
                variant="contained"
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
                href="#"
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
