// @ts-nocheck
// src/context/AuthContext.js
import { useApolloClient } from '@apollo/client/react'; // Import only the hook we need
import { useRouter } from 'next/router';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import storage from '@/utils/storage';
import { performAuthLogout, persistLoginInfo, resolveStoredAuthSession } from './authUtils';

const AUTH_CONTEXT_FALLBACK_SESSION_NOTICE = 'Your session could not be verified. Please sign in again.';

export const AUTH_CONTEXT_FALLBACK = {
    user: null,
    token: null,
    loading: false,
    isAuthenticated: false,
    sessionNotice: AUTH_CONTEXT_FALLBACK_SESSION_NOTICE,
    login: () => ({
        ok: false,
        user: null,
        error: new Error(AUTH_CONTEXT_FALLBACK_SESSION_NOTICE),
    }),
    logout: async () => {},
};

// Create the context
const AuthContext = createContext(AUTH_CONTEXT_FALLBACK);

export const resolveAuthContextValue = (context) => context ?? AUTH_CONTEXT_FALLBACK;

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

        const session = resolveStoredAuthSession(storedToken, storedUser);

        if (session.status === 'hydrated') {
            setToken(session.token);
            setUser(session.user);
            setSessionNotice('');
        } else {
            if (session.status === 'invalid-user') {
                console.error('Failed to parse stored user info', new Error('Stored auth user snapshot is invalid.'));
            } else if (storedToken && session.tokenValidation.error) {
                console.warn('Stored auth token rejected:', session.tokenValidation.error);
            }
            storage.removeItem('authToken');
            storage.removeItem('userInfo');
            setToken(null);
            setUser(null);
            setSessionNotice(session.sessionNotice);
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
        setToken(null);
        setUser(null);
        setSessionNotice('');
        await performAuthLogout({
            storageAdapter: storage,
            client,
            router,
        });
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
    return resolveAuthContextValue(context);
};
