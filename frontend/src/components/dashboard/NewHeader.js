/**
 * Brand header — fixed top bar with avatar + burger.
 */
import React from 'react';
import { AppBar, Toolbar, IconButton, Avatar, Typography } from '@mui/material';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import { useDashStore } from './store';
import { useAuth } from '../../context/AuthContext';

export default function NewHeader({ user }) {
  const toggleDrawer = useDashStore(s => s.toggleDrawer);
  let authUser = null;
  try {
    authUser = useAuth().user;
  } catch (e) {
  }
  const currentUser = user || authUser;
  return (
    <AppBar elevation={0} sx={{ bgcolor:'primary.main', px:2 }}>
      <Toolbar disableGutters sx={{ justifyContent:'space-between' }}>
        <IconButton color="inherit" onClick={toggleDrawer}>
          <MenuRoundedIcon />
        </IconButton>
        <Typography variant="h6" fontWeight={600}>Fine Dining</Typography>
        <Avatar alt={currentUser?.name} src={currentUser?.avatarUrl} sx={{ width:36, height:36 }} />
      </Toolbar>
    </AppBar>
  );
}
