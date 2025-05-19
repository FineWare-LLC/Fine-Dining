/**
 * Right‑aligned navigation drawer with brand links.
 */
import React from 'react';
import { useRouter } from 'next/router';
import { Drawer, List, ListItemButton, ListItemText } from '@mui/material';
import { useDashStore } from './store';
import { useAuth } from '../../context/AuthContext';

export default function NewNavigationDrawer() {
  const { drawerOpen, toggleDrawer } = useDashStore();
  const router = useRouter();
  const { logout } = useAuth();
  const links = [
    { label: 'Profile', path: '/profile' },
    { label: 'Settings', path: '/settings' },
    { label: 'Sign\u00a0Out', action: logout },
  ];
  return (
    <Drawer anchor="right" open={drawerOpen} onClose={toggleDrawer}>
      <List sx={{ width:220, mt:8 }}>
        {links.map(link => (
          <ListItemButton
            key={link.label}
            onClick={() => {
              if (link.action) {
                link.action();
              } else if (link.path) {
                router.push(link.path);
              }
              toggleDrawer();
            }}
          >
            <ListItemText primary={link.label} />
          </ListItemButton>
        ))}
      </List>
    </Drawer>
  );
}
