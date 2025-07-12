import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import { ToggleButtonGroup, ToggleButton } from '@mui/material';
import React from 'react';
import { useThemePreference } from '../context/ThemePreferenceContext';

export default function ThemeToggle(props) {
    const { mode, setMode } = useThemePreference();

    const handleChange = (_, value) => {
        if (value) setMode(value);
    };

    return (
        <ToggleButtonGroup
            value={mode}
            exclusive
            onChange={handleChange}
            size="small"
            {...props}
        >
            <ToggleButton value="light" aria-label="light mode">
                <LightModeIcon fontSize="small" />
            </ToggleButton>
            <ToggleButton value="dark" aria-label="dark mode">
                <DarkModeIcon fontSize="small" />
            </ToggleButton>
        </ToggleButtonGroup>
    );
}
