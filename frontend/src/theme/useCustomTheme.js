// theme/useCustomTheme.js
/**
 * @fileoverview A custom hook that manages Material UI theme (light/dark).
 */

import { useMemo } from 'react';
import { createTheme, useMediaQuery } from '@mui/material';
import lightThemeOptions from './lightTheme';
import darkThemeOptions from './darkTheme';

/**
 * useCustomTheme - Hook to choose between light or dark theme
 * @returns {object} theme - The Material UI theme
 */
export default function useCustomTheme() {
    // Check system preference for dark mode
    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

    const theme = useMemo(() => {
        return createTheme(prefersDarkMode ? darkThemeOptions : lightThemeOptions);
    }, [prefersDarkMode]);

    return { theme };
}
