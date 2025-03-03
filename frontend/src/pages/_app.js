// pages/_app.js
/**
 * @fileoverview Custom App component for Next.js, includes ThemeProvider for light/dark modes.
 */

import React from 'react';
import PropTypes from 'prop-types';
import Head from 'next/head';
import { ThemeProvider, CssBaseline } from '@mui/material';
import useCustomTheme from '../theme/useCustomTheme';

/**
 * MyApp - Root App component for Next.js with integrated theme
 * @param {object} props
 * @param {React.ComponentType} props.Component - Active page component
 * @param {object} props.pageProps - Props for the active page
 * @returns {JSX.Element} The wrapped application
 */
export default function MyApp({ Component, pageProps }) {
  const { theme } = useCustomTheme();

  return (
      <>
        <Head>
          <meta name="viewport" content="initial-scale=1, width=device-width" />
          <title>FineDinning</title>
        </Head>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Component {...pageProps} />
        </ThemeProvider>
      </>
  );
}

MyApp.propTypes = {
  Component: PropTypes.elementType.isRequired,
  pageProps: PropTypes.object.isRequired,
};
