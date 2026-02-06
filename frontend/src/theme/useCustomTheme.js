// theme/useCustomTheme.js
/**
 * @fileoverview A custom hook that manages Material UI theme (light/dark).
 */

import { useMemo } from 'react';
import { useThemePreference } from '../context/ThemePreferenceContext';
import darkTheme from './darkTheme';
import lightTheme from './lightTheme';

/**
 * useCustomTheme - Hook to choose between light or dark theme
 * @returns {object} theme - The Material UI theme
 */
export default function useCustomTheme() {
    const { mode } = useThemePreference();

    const theme = useMemo(() => {
        return mode === 'dark' ? darkTheme : lightTheme;
    }, [mode]);

    return { theme };
}
