// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { ApolloClient, InMemoryCache, ApolloProvider, gql, useApolloClient } from '@apollo/client'; // Import Apollo client related hooks/utils

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
        const storedToken = localStorage.getItem('authToken');
        const storedUser = localStorage.getItem('userInfo'); // Basic user info if stored

        const isTokenValid = (token) => {
            try {
                const [, payloadBase64] = token.split('.');
                const payload = JSON.parse(atob(payloadBase64));
                const now = Math.floor(Date.now() / 1000); // Current time in seconds
                return payload.exp && payload.exp > now;
            } catch (e) {
                console.warn("Token validation failed", e);
                return false;
            }
        };

        if (storedToken && isTokenValid(storedToken)) {
            setToken(storedToken);

            if (storedUser) {
                try {
                    setUser(JSON.parse(storedUser));
                } catch (e) {
                    console.error("Failed to parse stored user info", e);
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
        localStorage.setItem('authToken', newToken);
        // Store only essential, non-sensitive user data
        const basicUserInfo = { id: userData.id, name: userData.name, email: userData.email, role: userData.role };
        localStorage.setItem('userInfo', JSON.stringify(basicUserInfo));
        setToken(newToken);
        setUser(basicUserInfo);
        // No need to redirect here, LoginForm already does it
    }, []); // Removed router dependency as LoginForm handles redirect

    // Logout function
    const logout = useCallback(async () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userInfo');
        setToken(null);
        setUser(null);
        try {
            // Reset Apollo Client store on logout to clear cached data
            await client.resetStore();
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