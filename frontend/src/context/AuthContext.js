// src/context/AuthContext.js
import { saveLoginInfo } from './authUtils.js';
import { useApolloClient } from '@apollo/client/react'; // Import only the hook we need
import { useRouter } from 'next/router';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// Create the context
const AuthContext = createContext(null);

// Define the provider component
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true); // Add loading state for initial check
    const router = useRouter();
    const client = useApolloClient(); // Get Apollo Client instance

    // Check localStorage for token on initial load
    useEffect(() => {
        // Auto-login with fake user in development mode (no Node-only libs on the client)
        if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
            const fakeUser = {
                id: 'dev-user-123',
                name: 'Dev User',
                email: 'dev@finedining.com',
                role: 'admin',
            };

            // Create a pseudo JWT-like token (header.payload.signature) without using jsonwebtoken
            const header = { alg: 'none', typ: 'JWT' };
            const payload = {
                userId: fakeUser.id,
                email: fakeUser.email,
                role: fakeUser.role,
                exp: Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60), // Expires in 1 year
            };
            const base64url = (obj) =>
                btoa(JSON.stringify(obj)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
            const fakeToken = `${base64url(header)}.${base64url(payload)}.`; // empty signature

            console.log('🚀 Development mode: Auto-logging in with fake user:', fakeUser);

            setToken(fakeToken);
            setUser(fakeUser);
            localStorage.setItem('authToken', fakeToken);
            localStorage.setItem('userInfo', JSON.stringify(fakeUser));
            setLoading(false);
            return;
        }

        if (typeof window === 'undefined') {
            setLoading(false);
            return;
        }

        const storedToken = localStorage.getItem('authToken');
        const storedUser = localStorage.getItem('userInfo'); // Basic user info if stored

        const isTokenValid = (token) => {
            try {
                const parts = token.split('.');
                if (parts.length < 2) return false;
                const payloadBase64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
                const payload = JSON.parse(atob(payloadBase64));
                const now = Math.floor(Date.now() / 1000); // Current time in seconds
                return payload.exp && payload.exp > now;
            } catch (e) {
                console.warn('Token validation failed', e);
                return false;
            }
        };

        if (storedToken && isTokenValid(storedToken)) {
            setToken(storedToken);

            if (storedUser) {
                try {
                    setUser(JSON.parse(storedUser));
                } catch (e) {
                    console.error('Failed to parse stored user info', e);
                    // Clear potentially corrupted data
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('userInfo');
                    setToken(null);
                    setUser(null);
                }
            }
        } else {
            localStorage.removeItem('authToken');
            localStorage.removeItem('userInfo');
            setToken(null);
            setUser(null);
        }

        setLoading(false); // Finished initial loading
    }, []);


    // Login function
    const login = useCallback((newToken, userData) => {
        const basicUserInfo = saveLoginInfo(newToken, userData);
        setToken(newToken);
        setUser(basicUserInfo);
        // No need to redirect here, LoginForm already does it
    }, []);
    // Logout function
    const logout = useCallback(async () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userInfo');
        setToken(null);
        setUser(null);
        try {
            // Reset Apollo Client store on logout to clear cached data
            if (client?.resetStore) {
                await client.resetStore();
            }
        } catch (error) {
            console.error('Error resetting Apollo cache on logout:', error);
        }
        // Redirect to login page after logout
        router.push('/signin'); // Or your login page route
    }, [router, client]); // Added client to dependency array

    // Value provided by the context
    const value = {
        user,
        token,
        isAuthenticated: !!token, // Simple check if token exists
        loading, // Provide loading state
        login,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the Auth Context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
