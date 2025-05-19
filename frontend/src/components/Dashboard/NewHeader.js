/**
 * Brand header — fixed top bar with avatar + burger.
 */
import React from 'react';
import { AppBar, Toolbar, IconButton, Avatar, Typography } from '@mui/material';
import { generateInitialsAvatar } from '@/utils/avatar';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import { useDashStore } from './store';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';

export default function NewHeader({ user }) {
  const toggleDrawer = useDashStore(s => s.toggleDrawer);
  const router = useRouter();
  let authUser = null;
  try {
    authUser = useAuth().user;
  } catch (e) {
    // Ignore if AuthProvider is not present
  }
  const currentUser = user || authUser;
  return (
    <AppBar elevation={0} sx={{ bgcolor:'primary.main', px:2 }}>
      <Toolbar disableGutters sx={{ justifyContent:'space-between' }}>
        <IconButton color="inherit" onClick={toggleDrawer}>
          <MenuRoundedIcon />
        </IconButton>
        <Typography variant="h6" fontWeight={600}>Fine Dining</Typography>
        <IconButton
          color="inherit"
          onClick={() => router.push('/profile')}
          title="Profile"
        >
          <Avatar
            alt={currentUser?.name}
            src={currentUser?.avatarUrl || generateInitialsAvatar(user?.name)}
            sx={{ width:36, height:36 }}
          />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
}