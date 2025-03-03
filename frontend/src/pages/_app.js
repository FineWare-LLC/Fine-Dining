// /pages/_app.js
/**
 * @fileoverview Custom App with ThemeProvider, ApolloProvider, and Emotion Cache
 */

import React from 'react';
import PropTypes from 'prop-types';
import Head from 'next/head';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { ApolloProvider, ApolloClient, InMemoryCache } from '@apollo/client';
import createEmotionCache from '../utils/createEmotionCache';
import { CacheProvider } from '@emotion/react';
import useCustomTheme from '../theme/useCustomTheme';

const client = new ApolloClient({
    uri: 'http://localhost:4000/graphql',
    cache: new InMemoryCache()
});

// If _document.js is set up to accept an emotionCache from here:
const clientSideEmotionCache = createEmotionCache();

/**
 * MyApp - Root App with MUI theme, Apollo, and Emotion Cache
 * @param {object} props
 * @param {React.ComponentType} props.Component
 * @param {object} props.pageProps
 * @param {object} props.emotionCache
 */
export default function MyApp(props) {
    const { Component, pageProps, emotionCache = clientSideEmotionCache } = props;
    const { theme } = useCustomTheme();

    return (
        <CacheProvider value={emotionCache}>
            <Head>
                <meta name="viewport" content="initial-scale=1, width=device-width" />
                <title>FineDinning</title>
            </Head>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <ApolloProvider client={client}>
                    <Component {...pageProps} />
                </ApolloProvider>
            </ThemeProvider>
        </CacheProvider>
    );
}

MyApp.propTypes = {
    Component: PropTypes.elementType.isRequired,
    pageProps: PropTypes.object.isRequired,
    emotionCache: PropTypes.object
};
