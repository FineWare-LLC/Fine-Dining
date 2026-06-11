// @ts-nocheck
// src/context/AuthContext.js
import { useApolloClient } from '@apollo/client/react'; // Import only the hook we need
import { useRouter } from 'next/router';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import storage from '@/utils/storage';
import { persistLoginInfo, validateStoredAuthToken } from './authUtils';

// Create the context
const AuthContext = createContext(null);

// Define the provider component
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true); // Add loading state for initial check
    const [sessionNotice, setSessionNotice] = useState('');
    const router = useRouter();
    const client = useApolloClient(); // Get Apollo Client instance

    // Check localStorage for token on initial load
    useEffect(() => {
        if (typeof window === 'undefined') {
            setLoading(false);
            return;
        }

        const storedToken = storage.getItem('authToken');
        const storedUser = storage.getItem('userInfo'); // Basic user info if stored

        const tokenValidation = validateStoredAuthToken(storedToken);

        if (!storedToken) {
            storage.removeItem('authToken');
            storage.removeItem('userInfo');
            setToken(null);
            setUser(null);
            setSessionNotice(storedUser ? 'Your saved session could not be read. Please sign in again.' : '');
        } else if (tokenValidation.valid) {
            if (storedUser) {
                try {
                    setToken(storedToken);
                    setUser(JSON.parse(storedUser));
                    setSessionNotice('');
                } catch (e) {
                    console.error('Failed to parse stored user info', e);
                    // Clear potentially corrupted data
                    storage.removeItem('authToken');
                    storage.removeItem('userInfo');
                    setToken(null);
                    setUser(null);
                    setSessionNotice('Your saved session could not be read. Please sign in again.');
                }
            } else {
                storage.removeItem('authToken');
                storage.removeItem('userInfo');
                setToken(null);
                setUser(null);
                setSessionNotice('Your saved session could not be read. Please sign in again.');
            }
        } else {
            if (storedToken && tokenValidation.error) {
                console.warn('Stored auth token rejected:', tokenValidation.error);
            }
            storage.removeItem('authToken');
            storage.removeItem('userInfo');
            setToken(null);
            setUser(null);
            setSessionNotice(tokenValidation.error?.message || '');
        }

        setLoading(false); // Finished initial loading
    }, []);


    // Login function
    const login = useCallback((newToken, userData) => {
        const sessionResult = persistLoginInfo(newToken, userData);

        if (!sessionResult.ok) {
            setToken(null);
            setUser(null);
            return sessionResult;
        }

        setToken(newToken);
        setUser(sessionResult.user);
        setSessionNotice('');
        // No need to redirect here, LoginForm already does it
        return sessionResult;
    }, []);
    // Logout function
    const logout = useCallback(async () => {
        storage.removeItem('authToken');
        storage.removeItem('userInfo');
        setToken(null);
        setUser(null);
        setSessionNotice('');
        try {
            // Reset Apollo Client store on logout to clear cached data
            if (client?.resetStore) {
                await client.resetStore();
            }
        } catch (error) {
            console.error('Error resetting Apollo cache on logout:', error);
        }
        // Redirect to login page after logout
        router.push('/login').catch(() => {}); // Updated to /login
    }, [router, client]);

    // Value provided by the context
    const value = {
        user,
        token,
        isAuthenticated: !!token, // Simple check if token exists
        loading, // Provide loading state
        sessionNotice,
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
