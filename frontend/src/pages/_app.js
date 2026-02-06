import React from 'react';
import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';
import { ApolloProvider } from '@apollo/client/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CacheProvider } from '@emotion/react';
import { ThemeProvider } from '@mui/material/styles';
import App from 'next/app';
import Head from 'next/head';
import PropTypes from 'prop-types';
import { AuthProvider } from '../context/AuthContext';
import { ThemePreferenceProvider } from '../context/ThemePreferenceContext';
import useCustomTheme from '../theme/useCustomTheme';
import createEmotionCache from '../utils/createEmotionCache';

const httpLink = new HttpLink({
    uri: typeof window === 'undefined' 
        ? 'http://localhost:3000/api/graphql'
        : '/api/graphql',
});

const client = new ApolloClient({
    link: httpLink,
    cache: new InMemoryCache(),
});

const queryClient = new QueryClient();
const clientSideEmotionCache = createEmotionCache();

export default function MyApp(props) {
    const { Component, pageProps, emotionCache = clientSideEmotionCache } = props;

    return (
        <QueryClientProvider client={queryClient}>
            <CacheProvider value={emotionCache}>
                <Head>
                    <meta name="viewport" content="initial-scale=1, width=device-width" />
                    <title>Fine Dining</title>
                </Head>
                <ThemePreferenceProvider>
                    <ThemedApp Component={Component} pageProps={pageProps} />
                </ThemePreferenceProvider>
            </CacheProvider>
        </QueryClientProvider>
    );
}

function ThemedApp({ Component, pageProps }) {
    const { theme } = useCustomTheme();
    return (
        <ThemeProvider theme={theme}>
            <ApolloProvider client={client}>
                <AuthProvider>
                    <Component {...pageProps} />
                </AuthProvider>
            </ApolloProvider>
        </ThemeProvider>
    );
}

MyApp.propTypes = {
    Component: PropTypes.elementType.isRequired,
    pageProps: PropTypes.object.isRequired,
    emotionCache: PropTypes.object,
};

MyApp.getInitialProps = async (appContext) => {
    const appProps = await App.getInitialProps(appContext);
    return { ...appProps };
};
