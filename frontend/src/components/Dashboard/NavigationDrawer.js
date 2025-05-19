/**
 * @fileoverview NavigationDrawer component
 */
// src/components/Dashboard/NavigationDrawer.js
import React from 'react';
import PropTypes from 'prop-types';
import {
    Drawer,
    Box,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Divider
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import SettingsIcon from '@mui/icons-material/Settings';
import FoodBankIcon from '@mui/icons-material/FoodBank';

// Drawer width is typically handled via sx or MUI props
const drawerWidth = 250;

/**
 * NavigationDrawer component
 * @param {object} props
 * @returns {JSX.Element}
 */
const NavigationDrawer = React.memo(({ open, onClose }) => {

    const handleNavigate = (page) => {
        console.log(`Navigate to ${page}`);
        onClose();
    };

    return (
        <Drawer
            anchor="left"
            open={open}
            onClose={onClose}
            // Using sx here might be simpler for drawer-specific overrides
            sx={{
                width: drawerWidth,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    width: drawerWidth,
                    boxSizing: 'border-box',
                },
            }}
            ModalProps={{ keepMounted: true }}
        >
            {/* Can add Tailwind classes to Box if needed, but sx might be easier here */}
            <Box
                role="presentation"
                // onClick={onClose} // Close on click inside? Optional.
            >
                <List>
                    <ListItem>
                        <ListItemIcon><FoodBankIcon color="primary" /></ListItemIcon>
                        {/* Use Tailwind for text styling if preferred */}
                        <ListItemText primary="Fine Dining" primaryTypographyProps={{ className: "font-bold" }} />
                    </ListItem>
                    <Divider />
                    {/* MUI ListItem button prop handles hover effects */}
                    <ListItem button onClick={() => handleNavigate('Dashboard')}>
                        <ListItemIcon><HomeIcon /></ListItemIcon>
                        <ListItemText primary="Dashboard" />
                    </ListItem>
                    <ListItem button onClick={() => handleNavigate('Restaurants')}>
                        <ListItemIcon><RestaurantMenuIcon /></ListItemIcon>
                        <ListItemText primary="Restaurants" />
                    </ListItem>
                    <ListItem button onClick={() => handleNavigate('Settings')}>
                        <ListItemIcon><SettingsIcon /></ListItemIcon>
                        <ListItemText primary="Settings" />
                    </ListItem>
                </List>
            </Box>
        </Drawer>
    );
});

NavigationDrawer.displayName = 'NavigationDrawer';

NavigationDrawer.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired
};

export default NavigationDrawer;