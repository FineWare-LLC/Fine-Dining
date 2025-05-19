// theme/useCustomTheme.js
/**
 * @fileoverview A custom hook that manages Material UI theme (light/dark).
 */

import { useMemo } from 'react';
import { createTheme } from '@mui/material';
import lightThemeOptions from './lightTheme';
import darkThemeOptions from './darkTheme';
import { useThemePreference } from '../context/ThemePreferenceContext';

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
