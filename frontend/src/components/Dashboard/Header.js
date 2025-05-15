// src/components/Dashboard/Header.js
import React from 'react';
import PropTypes from 'prop-types';
import { AppBar, Toolbar, Typography, IconButton, Avatar, Box } from '@mui/material';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import FoodBankIcon from '@mui/icons-material/FoodBank';
// Removed useTheme and style constants/functions

const Header = React.memo(({ user, onMenuClick }) => {
    // Removed theme = useTheme()

    return (
        // Apply Tailwind classes directly
        // Note: Replicating the exact linear gradient might require tailwind.config.js customization.
        // Using a simpler gradient example here. You might need to define 'primary-dark' and 'primary-main' colors in your config.
        <AppBar
            position="sticky"
            className="bg-gradient-to-r from-primary-dark to-primary-main shadow-md px-2 sm:px-4" // Example gradient/shadow
        >
            <Toolbar className="flex items-center justify-between min-h-[56px] sm:min-h-[64px]">
                <IconButton
                    edge="start"
                    color="inherit" // Keep MUI color prop for icon buttons on AppBar
                    aria-label="open navigation menu"
                    onClick={onMenuClick}
                    className="sm:mr-1" // Tailwind class for margin
                >
                    <MenuRoundedIcon />
                </IconButton>
                <Box className="flex flex-grow items-center justify-center gap-1">
                    {/* Assuming white icon color is inherited or set via AppBar */}
                    <FoodBankIcon className="text-white text-3xl" />
                    <Typography
                        variant="h6"
                        component="div"
                        className="font-bold text-white text-center text-xl sm:text-2xl"
                    >
                        Fine Dining
                    </Typography>
                </Box>
                {user ? (
                    <Avatar
                        alt={user.name || 'User'}
                        src={user.avatarUrl || '/images/default-avatar.png'}
                        // Apply Tailwind classes for border, shadow, size, cursor, transition, hover effect
                        className="border-2 border-white shadow-sm w-9 h-9 sm:w-10 sm:h-10 cursor-pointer transition-transform duration-300 ease-in-out hover:scale-110"
                    />
                ) : (
                    // Placeholder to maintain layout
                    <Box className="w-9 h-9 sm:w-10 sm:h-10" />
                )}
            </Toolbar>
        </AppBar>
    );
});

Header.displayName = 'Header';

Header.propTypes = {
    user: PropTypes.shape({
        name: PropTypes.string,
        avatarUrl: PropTypes.string,
    }),
    onMenuClick: PropTypes.func.isRequired,
};

export default Header;