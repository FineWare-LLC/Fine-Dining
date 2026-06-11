import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemePreferenceContext = createContext({ mode: 'light', setMode: () => {} });

export function ThemePreferenceProvider({ children }) {
    const [mode, setMode] = useState(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('themeMode');
            if (stored === 'light' || stored === 'dark') return stored;
            if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
        }
        return 'light';
    });

    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('themeMode', mode);
        }
    }, [mode]);

    return (
        <ThemePreferenceContext.Provider value={{ mode, setMode }}>
            {children}
        </ThemePreferenceContext.Provider>
    );
}

export const useThemePreference = () => useContext(ThemePreferenceContext);
