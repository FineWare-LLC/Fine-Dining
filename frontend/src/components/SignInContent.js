/**
 * SignInContent - Login form content component
 * Client-side only (imported dynamically with ssr: false)
 */
import React, { useEffect } from 'react';
import { Box } from '@mui/material';
import { useRouter } from 'next/router';
import LoginForm from './LoginForm';
import { useAuth } from '@/context/AuthContext';
import AuthShell from './AuthShell';

export default function SignInContent() {
    const router = useRouter();
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        if (isAuthenticated) {
            router.replace('/dashboard');
        }
    }, [isAuthenticated, router]);

    return (
        <AuthShell>
            <Box sx={{ width: '100%' }}>
                <LoginForm />
            </Box>
        </AuthShell>
    );
}
