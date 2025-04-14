/**
 * @fileoverview Custom App with ThemeProvider, ApolloProvider, Emotion Cache, and AuthProvider.
 * The application is bootstrapped here. This file configures the Apollo Client to automatically attach
 * an Authorization header to every GraphQL request by using Apollo Link's setContext utility.
 *
 * Process Overview:
 * - Create an authLink that retrieves the auth token (from localStorage, for example) and attaches it to the request headers.
 * - Create an httpLink that targets your GraphQL API endpoint.
 * - Concatenate the authLink with the httpLink so that each outgoing request is authenticated.
 * - Wrap the application with providers for Emotion (for style caching), MUI theme, Apollo Client, and authentication.
 *
 * Note: For server-side environments, consider alternative token retrieval methods as localStorage is only available client-side.
 */

import React from 'react';
import PropTypes from 'prop-types';
import Head from 'next/head';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { ApolloProvider, ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

import createEmotionCache from '../utils/createEmotionCache'; // [cite: frontend/src/utils/createEmotionCache.js]
import { CacheProvider } from '@emotion/react';
import useCustomTheme from '../theme/useCustomTheme'; // [cite: frontend/src/theme/useCustomTheme.js]
import { AuthProvider } from '../context/AuthContext';

/**
 * Creates an authenticated Apollo Link that attaches the authorization token to every request.
 *
 * @function createAuthLink
 * @returns {ApolloLink} A link that adds an Authorization header to each GraphQL request.
 */
const createAuthLink = setContext((_, { headers }) => {
    // Retrieve the token from localStorage.
    // Note: This check ensures that token retrieval only happens in a client-side environment.
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

    return {
        headers: {
            ...headers,
            /**
             * Attach the Authorization header if the token exists.
             * Example format: "Bearer <token>"
             */
            authorization: token ? `Bearer ${token}` : "",
        },
    };
});

/**
 * HTTP Link for connecting to the GraphQL endpoint.
 *
 * @constant {HttpLink}
 */
const httpLink = new HttpLink({
    // Use the relative path for your Next.js API route serving GraphQL.
    uri: '/api/graphql', // [cite: frontend/src/pages/api/graphql.js]
});

// Combine the authentication link with the HTTP link.
// The auth link adds the header before the HTTP request is made.
const combinedLink = createAuthLink.concat(httpLink);

// Configure Apollo Client using the combined link and an in-memory cache.
const client = new ApolloClient({
    link: combinedLink,
    cache: new InMemoryCache(),
});

// Create an Emotion cache instance for client-side rendering.
const clientSideEmotionCache = createEmotionCache(); // [cite: frontend/src/utils/createEmotionCache.js]

/**
 * MyApp - The root component of the Next.js application.
 *
 * This component wraps the entire application with providers for Emotion (for CSS-in-JS caching),
 * Material UI theming, Apollo Client (GraphQL), and authentication context.
 *
 * @component
 * @param {Object} props - Component properties.
 * @param {React.ComponentType} props.Component - The active page component to be rendered.
 * @param {Object} props.pageProps - Props passed to the active page component.
 * @param {Object} [props.emotionCache] - Optional custom Emotion cache instance.
 * @returns {JSX.Element} The fully composed component tree.
 */
export default function MyApp(props) {
    // Destructure props with a default fallback for emotionCache.
    const { Component, pageProps, emotionCache = clientSideEmotionCache } = props;
    // Retrieve the custom Material UI theme (e.g., light/dark modes) using the custom hook.
    const { theme } = useCustomTheme(); // [cite: frontend/src/theme/useCustomTheme.js]

    return (
        // The CacheProvider makes the Emotion cache available throughout the component tree.
        <CacheProvider value={emotionCache}>
            <Head>
                {/* Set the viewport for responsive design */}
                <meta name="viewport" content="initial-scale=1, width=device-width" />
                {/* Set a default page title */}
                <title>Fine Dining</title> {/* Corrected typo from FineDinning */}
            </Head>
            {/* Apply the custom Material UI theme */}
            <ThemeProvider theme={theme}>
                {/* Apply global CSS reset using MUI's baseline */}
                <CssBaseline />
                {/* Provide the configured Apollo Client to the entire application */}
                <ApolloProvider client={client}>
                    {/* Provide the Authentication Context to manage user auth state */}
                    <AuthProvider>
                        {/* Render the active page component with its specific props */}
                        <Component {...pageProps} />
                    </AuthProvider>
                </ApolloProvider>
            </ThemeProvider>
        </CacheProvider>
    );
}

// Define prop types for runtime validation during development.
MyApp.propTypes = {
    Component: PropTypes.elementType.isRequired,
    pageProps: PropTypes.object.isRequired,
    // Optional Emotion cache instance; falls back to clientSideEmotionCache if not provided.
    emotionCache: PropTypes.object,
};
