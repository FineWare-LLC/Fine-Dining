// /pages/_app.js
/**
 * @fileoverview Custom App with ThemeProvider, ApolloProvider, Emotion Cache, and AuthProvider
 */

import React from 'react';
import PropTypes from 'prop-types';
import Head from 'next/head';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { ApolloProvider, ApolloClient, InMemoryCache } from '@apollo/client';
import createEmotionCache from '../utils/createEmotionCache'; // [cite: frontend/src/utils/createEmotionCache.js]
import { CacheProvider } from '@emotion/react';
import useCustomTheme from '../theme/useCustomTheme'; // [cite: frontend/src/theme/useCustomTheme.js]
import { AuthProvider } from '../context/AuthContext'; // Import AuthProvider

// Configure Apollo Client
const client = new ApolloClient({
    // Use the relative path to your Next.js API route for GraphQL
    uri: '/api/graphql', // [cite: frontend/src/pages/api/graphql.js]
    cache: new InMemoryCache()
});

// Create Emotion cache for client-side rendering
const clientSideEmotionCache = createEmotionCache(); // [cite: frontend/src/utils/createEmotionCache.js]

/**
 * MyApp - Root App with MUI theme, Apollo, Emotion Cache, and AuthProvider
 * @param {object} props
 * @param {React.ComponentType} props.Component The page component being rendered.
 * @param {object} props.pageProps Props passed to the page component.
 * @param {object} props.emotionCache Emotion cache instance.
 */
export default function MyApp(props) {
    // Destructure props, providing a default for emotionCache
    const { Component, pageProps, emotionCache = clientSideEmotionCache } = props;
    // Get the current theme (light or dark) using the custom hook
    const { theme } = useCustomTheme(); // [cite: frontend/src/theme/useCustomTheme.js]

    return (
        // Provide the Emotion cache to MUI components
        <CacheProvider value={emotionCache}>
            <Head>
                {/* Set viewport for responsive design */}
                <meta name="viewport" content="initial-scale=1, width=device-width" />
                {/* Set default page title */}
                <title>Fine Dining</title> {/* Corrected typo from FineDinning */}
            </Head>
            {/* Apply the MUI theme */}
            <ThemeProvider theme={theme}>
                {/* Apply baseline CSS reset */}
                <CssBaseline />
                {/* Provide the Apollo Client instance */}
                <ApolloProvider client={client}>
                    {/* Provide the Authentication context */}
                    <AuthProvider>
                        {/* Render the current page component */}
                        <Component {...pageProps} />
                    </AuthProvider>
                </ApolloProvider>
            </ThemeProvider>
        </CacheProvider>
    );
}

// Define prop types for MyApp component
MyApp.propTypes = {
    Component: PropTypes.elementType.isRequired,
    pageProps: PropTypes.object.isRequired,
    // emotionCache is optional, as it defaults to clientSideEmotionCache
    emotionCache: PropTypes.object
};