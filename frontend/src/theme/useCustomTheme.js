// theme/useCustomTheme.js
/**
 * @fileoverview A custom hook that manages Material UI theme (light/dark).
 */

import { createTheme } from '@mui/material';
import { useMemo } from 'react';
import { useThemePreference } from '../context/ThemePreferenceContext';
import darkThemeOptions from './darkTheme';
import lightThemeOptions from './lightTheme';

/**
 * useCustomTheme - Hook to choose between light or dark theme
 * @returns {object} theme - The Material UI theme
 */
export default function useCustomTheme() {
    const { mode } = useThemePreference();

    const theme = useMemo(() => {
        return createTheme(mode === 'dark' ? darkThemeOptions : lightThemeOptions);
    }, [mode]);

    return { theme };
}
