/**
 * Brand header — fixed top bar with avatar + burger.
 */
import React from 'react';
import { AppBar, Toolbar, IconButton, Avatar, Typography } from '@mui/material';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import { useDashStore } from './store';

export default function NewHeader({ user }) {
  const toggleDrawer = useDashStore(s => s.toggleDrawer);
  return (
    <AppBar elevation={0} sx={{ bgcolor:'primary.main', px:2 }}>
      <Toolbar disableGutters sx={{ justifyContent:'space-between' }}>
        <IconButton color="inherit" onClick={toggleDrawer}>
          <MenuRoundedIcon />
        </IconButton>
        <Typography variant="h6" fontWeight={600}>Fine Dining</Typography>
        <Avatar alt={user?.name} src={user?.avatarUrl} sx={{ width:36, height:36 }} />
      </Toolbar>
    </AppBar>
  );
}