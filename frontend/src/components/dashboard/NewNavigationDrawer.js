/**
 * Right‑aligned navigation drawer with brand links.
 */
import React from 'react';
import { Drawer, List, ListItemButton, ListItemText } from '@mui/material';
import { useDashStore } from './store';

export default function NewNavigationDrawer() {
  const { drawerOpen, toggleDrawer } = useDashStore();
  const links = ['Profile','Settings','Sign Out'];
  return (
    <Drawer anchor="right" open={drawerOpen} onClose={toggleDrawer}>
      <List sx={{ width:220, mt:8 }}>
        {links.map(l=>(
          <ListItemButton key={l} onClick={toggleDrawer}>
            <ListItemText primary={l} />
          </ListItemButton>
        ))}
      </List>
    </Drawer>
  );
}
